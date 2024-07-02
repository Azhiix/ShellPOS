
//counter for the number of salary rows with the exception of Basic Salary
var rowCounter = 0;

class PayrollItem {
    constructor(emp_pin, salaryDetailName, salaryDetailAmount, calculationBasisID, calculationBasisValue, calculationBasisTime, orderID) {
        this.emp_pin = emp_pin;
        this.salaryDetailName = salaryDetailName;
        this.salaryDetailAmount = salaryDetailAmount;
        this.calculationBasisID = calculationBasisID;
        this.calculationBasisValue = calculationBasisValue;
        this.calculationBasisTime = calculationBasisTime;
        this.orderID = orderID;
    }
}

$(document).ready(function () {

    bindUploadButtonEvent();
    initEmpCtrlSelect2();
    initDeptCtrlSelect2();
    initDatatables();

    $('#apply-filter').on('click', function () {
        var statusValue = $('#employeeStatus').val();
        if (['0', '1'].includes(statusValue)) {
            filterPayroll(statusValue);
        } else {
            alert("Please select a valid option.");
        }
    });

    $('#reset-filter').on('click', function () {
        var table = $('#setEmpLandTable').DataTable();
        table.columns().search('').draw(); // Clear all search filters
    });

    //$("#workShifts").css("display", "none");
    //$("#workShiftsContainer").css("display", "flex");

});

function bindUploadButtonEvent() {
    $('#upload-btn').on('change', function (event) {
        event.preventDefault();
        var files = $(this).prop('files');
        var fileSizeLimit = 10971520; // 10MB

        for (var i = 0; i < files.length; i++) {
            if (files[i].size > fileSizeLimit) {
                alert('File size should not exceed 10MB');
                return;
            }
        }

        $(`#${documentTypeClientId}`).val($('#docTypeSelect').val());
        $(`#${employeeIdUploadClientId}`).val($('.clsempid').val());

        // Trigger the form submission
        $('#uploadForm').trigger('submit');
    });

    $('#uploadForm').on('submit', function (e) {
        e.preventDefault();

        var formData = new FormData(this);

        $.ajax({
            url: this.action,
            type: this.method,
            data: formData,
            processData: false,
            contentType: false,
            success: function () {
                alert("Document successfully uploaded");
                $('#uploadForm').trigger('reset');
                refreshDocuments();
            },
            error: function (xhr) {
                alert("Upload failed: " + xhr.responseText);
            }
        });
    });

};

function initDatatables() {
    $('#doc_downTB').DataTable({
        "columnDefs": [
            {
                "targets": [1], // We hide UUID column as it is irrelevant to the user
                "visible": false
            }
        ]
    });

    var table = $('#setEmpLandTable').DataTable(); // Reference to your initialized DataTable

    $('.clsEmpHireDate').datepicker({
        format: 'yyyy-mm-dd' // You can change the format as needed
    });
}

function initEmpCtrlSelect2() {
    $('.empctrl').on('change', function () {
        //Now we load the datatable with these values
        //We reference the existing datatable instance
        var table = $('#setEmpLandTable').DataTable();
        $('#setEmpLandTable').DataTable().clear();

        var selectedIds = $(this).val();

        if (selectedIds.length == 0) {
            // Retrieve all ids from the employee dropdown
            selectedIds = $('.empctrl option').map(function () {
                return $(this).val();
            }).get();
        }


        selectedIds.forEach(function (selectedId) {
            var selectedOption = $('.empctrl').find('option[value="' + selectedId + '"]');

            // Retrieve the text (name) and data attributes from the selected option
            var selectedName = selectedOption.text();
            var position = selectedOption.data('position');
            var department = selectedOption.data('department');
            var image = selectedOption.data('image');
            var includedInPayroll = selectedOption.data('includedInPayroll');


            table.row.add([
                ' <div class="cursor-pointer symbol symbol-30px symbol-md-40px"><img src="data:image/jpeg;base64,' + image + '" alt="user" style="border-radius: 20px; margin: 5px;object-fit:contain"></div>',
                selectedName,
                position,
                department,
                '<a href="#" class="btn btn-bg-secondary" onclick="loadPersonalEmpDetails(' + selectedId + ')">View</a>'
            ]).draw(false);
        })

        // Find the selected option based on the value


        if ($('.deptctrl').val()) {
            $('.deptctrl').val(null).trigger('change.select2');
        }
    });
}

function filterPayroll(employeeStatus) {
    var table = $('#setEmpLandTable').DataTable();

    table.columns(4).search('').draw(); // Clear the current search

    table.columns(4).search(employeeStatus).draw(); // Filter rows with employeeStatus
}



function initDeptCtrlSelect2() {
    $('.deptctrl').on('change', function () {
        var selectedDeptName = $(this).find("option:selected").text();
        var employeesInDept = [];

        // Iterate over each option in the employee dropdown
        $('.empctrl option').each(function () {
            var empDeptName = $(this).data('department');

            // Check if the employee's department name matches the selected department name
            if (empDeptName === selectedDeptName) {
                var empName = $(this).text();
                var empId = $(this).val();
                var empPosition = $(this).data('position');
                var empImage = $(this).data('image');
                var empDept = $(this).data('department');

                // Add the employee details to the array
                employeesInDept.push({
                    id: empId,
                    name: empName,
                    position: empPosition,
                    image: empImage,
                    department: empDept
                });
            }
        });

        //Now we populate the datatable with this data
        var table = $('#setEmpLandTable').DataTable();
        $('#setEmpLandTable').DataTable().clear();

        employeesInDept.forEach(function (emp) {

            table.row.add([
                ' <div class="cursor-pointer symbol symbol-30px symbol-md-40px"><img src="data:image/jpeg;base64,' + emp.image + '" alt="user" style="border-radius: 20px; margin: 5px;object-fit:contain"></div>', // For the image, if you have a way to determine the image URL, add here
                emp.name,
                emp.position, // Position - if you have this data, add here
                emp.department, // Assuming department name is stored in emp.department
                '<a href="#" class="btn btn-bg-secondary" onclick="loadPersonalEmpDetails(event)">View</a>'
            ]).draw(false);
        });

        if ($('.empctrl').val()) {
            $('.empctrl').val(null).trigger('change.select2');
        }
    });
}

function toggleDivVisibility(e) {
    e.preventDefault(); // Prevent the default anchor action
    $(".settingsBtns").css("display", "inherit");
    $(".empConfig").css("display", "none");
    $(".empDetailsSection").css("display", "none");
    $(".workShifts").css("display", "none");
}

function loadPersonalEmpDetails(selectedId) {

    var jwtToken = getCookie("jwttoken");

    //Starting to find the employee's details
    jQuery.ajax({
        type: "GET",
        url: "configs.aspx/LoadEmpDetailsFull?emp_pin=" + encodeURIComponent(selectedId),
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {

            if (msg.d == null) {
                window.location.href = '/Login_New.aspx';
            } else {
                // Call these functions regardless of the error
                LoadPersonalDetails(msg);
                LoadDeductions(msg);
                LoadLeaves(msg);
                LoadSalaryDetails(msg.d.salaryDetails);

                if (msg.d.documents.some(doc => doc.HasError)) {
                    // Handle the error case
                    alert(msg.d.documents.find(doc => doc.HasError).ErrorMessage);
                } else {
                    // No errors, load documents
                    LoadEmployeeDocumentsDetails(msg.d.documents);
                }
            }
        },
        failure: function (msg) {
            alert(msg);
        }
    });
    //End of the find employee details AJAX

    var empConfig = document.querySelector('.empConfig');
    var empDetailsSection = document.querySelector('.empDetailsSection');
    var changeEmployeeBtn = document.querySelector('.changeEmployeeBtn');

    // Start minimizing empConfig
    empConfig.classList.add('minimized');

    // Ensure empDetailsSection is set to be visible when the transition ends
    setTimeout(function () {
        empDetailsSection.style.display = 'block'; // Add this line
        empDetailsSection.classList.add('visible');
    }, 500); // Adjust the delay to match the CSS transition

    // Start showing the Change Employee button slightly before empConfig finishes minimizing
    setTimeout(function () {
        changeEmployeeBtn.classList.add('visible');
    }, 300); // Start the button appearance slightly earlier than the div minimization ends
}

function LoadPersonalDetails(msg) {
    $(".clsempid").val(msg.d.employee.emp_pin);
    $(".clsempFirstName").val(msg.d.employee.emp_firstname).data('original-value', msg.d.employee.emp_firstname);
    $(".clsEmpLastName").val(msg.d.employee.emp_lastname).data('original-value', msg.d.employee.emp_lastname);

    //Preselecting the date here is different because its not mere javascript... it's using jquery's datepicker....
    $(".clsEmpHireDate").data('original-value', formatDotNetJsonDate(msg.d.employee.hiredate));
    //Therefore we need to use the predefined functions to set the date... The "setDate" is predefined in Jquery
    $(".clsEmpHireDate").datepicker().datepicker("setDate", formatDotNetJsonDate(msg.d.employee.hiredate));

    $(".clsEmpNID").val(msg.d.employee.nid).data('original-value', msg.d.employee.nid);
    $(".empImageDiv").html('<img src="data:image/jpeg;base64,' + msg.d.employee.img + '" alt="user" style="border-radius: 20px; margin: 5px;">');
    $(".empFullNameTitle").html(msg.d.employee.emp_lastname + " " + msg.d.employee.emp_firstname);
    $(".clsEmpContact").val(msg.d.employee.telephone).data('original-value', msg.d.employee.telephone);
    $(".clsEmpAddress").val(msg.d.employee.resAddress).data('original-value', msg.d.employee.resAddress);
    $(".clsEmpPositionTitle").html(msg.d.employee.position);
    $(".clsEmpAddressTitle").html(msg.d.employee.resAddress);
    $(".clsEmpPhoneTitle").html(msg.d.employee.telephone);
    $('.clsBankSelection').val(msg.d.employee.bankName).data('original-value', msg.d.employee.bankName).trigger('change');
    $(".clsBankNum").val(msg.d.employee.bankNum).data('original-value', msg.d.employee.bankNum);
    $('.clsIncPayroll').val(msg.d.employee.includedInPayroll).data('original-value', msg.d.employee.includedInPayroll).trigger('change');
    $('input[type="radio"][name="dependents"][value="' + msg.d.employee.dependants + '"]').prop('checked', true);
    // For radio buttons, assuming 'msg.d.employee.dependants' holds the checked value
    $('input[type="radio"][name="dependents"]').each(function () {
        // Set the original value attribute to the value of the radio button itself
        $(this).data('original-value', msg.d.employee.dependants);
    });
    $(".clsPositionTitle").val(msg.d.employee.position).data('original-value', msg.d.employee.position);
    $('.deptctrlEmployee').val(msg.d.employee.department).data('original-value', msg.d.employee.department).trigger('change');
    $('.workingHoursTempDropdown').val(msg.d.employee.workingHoursTemplate).data('original-value', msg.d.employee.workingHoursTemplate).trigger('change');

    if (msg.d.employee.csgeligible === 1) {
        document.getElementById('csgCheckbox').checked = true;
    } else {
        document.getElementById('csgCheckbox').checked = false;
    }

    var checkbox = document.getElementById('csgCheckbox');
    checkbox.setAttribute('original-value', checkbox.checked ? 1 : 0);

    updateProfileCompletionPercentage();
}

function updateProfileCompletionPercentage() {
    var totalAttributes = 0;
    var nonEmptyAttributes = 0;

    // Count the number of attributes and check if they are non-empty
    function countAttribute(attrValue) {
        totalAttributes++;
        if (attrValue !== null && attrValue !== undefined && attrValue !== '') {
            nonEmptyAttributes++;
        }
    }

    // Count attributes for personal details
    countAttribute($(".clsempid").val());
    countAttribute($(".clsempFirstName").val());
    countAttribute($(".clsEmpLastName").val());
    countAttribute($(".clsEmpHireDate").val());
    countAttribute($(".clsEmpNID").val());
    countAttribute($(".clsEmpAddress").val());
    countAttribute($(".clsEmpContact").val());
    countAttribute($(".clsBankSelection").val());
    countAttribute($(".clsBankNum").val());
    countAttribute($(".clsIncPayroll").val());
    countAttribute($('input[type="radio"][name="dependents"]:checked').val());
    countAttribute($(".clsPositionTitle").val());
    countAttribute($(".deptctrlEmployee").val());
    countAttribute($(".workingHoursTempDropdown").val());
    countAttribute($('.empImageDiv img').attr('src'));


    // Calculate the percentage of non-empty attributes
    var percentage = (nonEmptyAttributes / totalAttributes) * 100;

    // Update the progress bar
    $("#profileCompletionPercentage").text(percentage.toFixed(2) + '%');
    $(".bg-success").css("width", percentage + '%').attr("aria-valuenow", percentage);
}


function LoadDeductions(msg) {
    $(".deductDetails").val(msg.d.deductions.deduction_details).data('original-value', msg.d.deductions.deduction_details);
    $(".deductAmount").val(msg.d.deductions.deduction_amount).data('original-value', msg.d.deductions.deduction_amount);
}

function splitNumber(num) {
    var integerPart = num >= 0 ? Math.floor(num) : Math.ceil(num);
    var decimalPart = num.toString().includes('.') ? '.' + num.toString().split('.')[1] : '';
    return { integerPart, decimalPart };
}

function LoadLeaves(msg) {
    var localLeaves = msg.d.absLeft.localLeft;
    var sickLeaves = msg.d.absLeft.sickLeft;
    $(".localLeft").val(localLeaves).data('original-value', localLeaves);
    $(".sickLeft").val(sickLeaves).data('original-value', sickLeaves);
    $("#localLeavesValue").text(localLeaves);
    $("#sickLeavesValue").text(sickLeaves);

    var localLeavesDiv = document.getElementById('localLeavesValue');
    localLeavesSplit = splitNumber(localLeaves);
    localLeavesDiv.setAttribute('data-kt-countup-value', localLeavesSplit.integerPart);
    if (localLeavesSplit.decimalPart != 0) {
        localLeavesDiv.setAttribute('data-kt-countup-suffix', localLeavesSplit.decimalPart);
    }

    var sickLeavesDiv = document.getElementById('sickLeavesValue');
    sickLeavesSplit = splitNumber(sickLeaves);
    sickLeavesDiv.setAttribute('data-kt-countup-value', sickLeavesSplit.integerPart);
    if (sickLeavesSplit.decimalPart != 0) {
        sickLeavesDiv.setAttribute('data-kt-countup-suffix', sickLeavesSplit.decimalPart);
    }
}

function loadDocuments() {
    $(".documentsContainer").css("display", "flex");
}

function refreshDocuments() {
    var jwtToken = getCookie("jwttoken");

    var employeeId = document.querySelector('.clsempid').value;
    jQuery.ajax({
        type: "POST",
        url: "configs.aspx/loadDocuments", //It calls our web method  
        data: JSON.stringify({ employeeIdUpload: employeeId }),
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstDocs) {
            if (lstDocs.d == null)
                window.location.href = '/Login_New.aspx'; // Update with your login page URL
            else {
                LoadEmployeeDocumentsDetails(lstDocs.d);
            }
        },
        error: function (xhr, status, error) {
            console.log(error);
            console.log(status);
        }
    });
}

function LoadEmployeeDocumentsDetails(rows) {
    var table = $('#doc_downTB').DataTable();
    table.clear().draw();
    rows.forEach(row => {
        var fileDescription = row['document_type'] == "" ? "Not specified" : row['document_type'];
        table.row.add([
            '<div class="cursor-pointer symbol symbol-30px symbol-md-40px"> <img src="ThemeAssets/dist/assets/media/svg/files/doc.svg" alt="user" style="margin:5px;"> </div>',
            row['uuid'],
            fileDescription,

            /*"<a onclick='downloadDocument(\"" + row['uuid'] + "\",\"" + row['file_extension'] + "\")' class='btn btn-bg-secondary'>Download</a> <a class='btn btn-bg-primary'>View</a>" // Column with view button, commented for now until we implement document viewer.*/
            "<a onclick='downloadDocument(\"" + row['uuid'] + "\",\"" + row['file_extension'] + "\")' class='btn btn-bg-secondary'>Download</a> <a onclick='removeDocument(\"" + row['uuid'] + "\",\"" + row['file_extension'] + "\")' class='btn btn-bg-danger'>Remove</a>" // Fourth Column HTML
        ]).draw(false);
    }
    );
}

function downloadDocument(uuid, fileExtension) {
    window.location.href = 'DownloadHandler.ashx?uuid=' + encodeURIComponent(uuid) + '&fileExtension=' + encodeURIComponent(fileExtension);
}

function removeDocument(uuid, fileExtension) {
    var employeeId = document.querySelector('.clsempid').value; // You need to get the employeeId from somewhere

    $.ajax({
        type: "POST",
        url: "configs.aspx/RemoveEmployeeDocument", // Replace with the actual path to your ASPX page
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ employeeId: employeeId, uuid: uuid, fileExtension: fileExtension }),
        success: function (response) {
            // Handle success - maybe refresh part of your page or show a message
            alert('Document removed successfully.');
            var table = $('#doc_downTB').DataTable();
            table.rows().every(function () {
                var data = this.data();
                if (data && data[1] === uuid) {
                    this.remove();
                }
            });
            table.draw();
        },
        error: function (error) {
            // Handle errors here
            console.error("Error in AJAX request: ", error);
        }
    });
}

function loadEmpInfos() {
    var jwtToken = getCookie("jwttoken");

    //the first Ajax is to retrieve the employee datas
    jQuery.ajax({
        type: "GET",
        url: "configs.aspx/loadEmployeesAndDeptsInitialization", //It calls our web method  
        data: '{}',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstEmpAndDept) {
            if (lstEmpAndDept.d == null)
                window.location.href = '/Login_New.aspx'; // Update with your login page URL
            else {
                // Handle the response data

                var lstEmp = lstEmpAndDept.d.listEmployees;
                var lstDept = lstEmpAndDept.d.listDepts;
                var lstWrkTemp = lstEmpAndDept.d.lstTemplates;
                var lstCalcBasis = lstEmpAndDept.d.calculationBasis;

                // Select the employee select2 element
                lstEmp.forEach(emp => {
                    let dept = lstDept.find(d => d.id === emp.department);
                    if (dept) {
                        emp.department = dept.department_name;
                    } else {
                        emp.department = "Unknown"; // or any default value you prefer
                    }
                });
                initSelect2Emp(lstEmp);
                initSelect2Dept(lstDept);
                initSelect2DeptEmployee(lstDept);
                initWorkingHoursTemplate(lstWrkTemp);
                initCalculationBasisLogic(lstCalcBasis);
                initDataTable(lstEmp, lstDept);
            }
        },
        failure: function (msg) {
            alert(msg);
        }
    });
    $(".documentsContainer").css("display", "none");
    $(".settingsBtns").css("display", "none");
    $(".empConfig").css("display", "flex");
    event.preventDefault();
}

function initSelect2Emp(lstEmp) {
    var select = $('.empctrl');

    // Clear existing options, keeping the placeholder if necessary
    select.empty(); // Keep this line if you want to retain the placeholder

    //var option = new Option("All", 0, false, false);
    //$('#employeeSelect').append(option);
    // Append new options
    //select.append(option);


    // Loop through each item in the returned data
    $.each(lstEmp, function (index, item) {
        var option = new Option(item.emp_lastname + " " + item.emp_firstname, item.emp_pin, false, false);
        $(option).data('position', item.position);
        $(option).data('department', item.department);
        $(option).data('image', item.img);
        $(option).data('includedInPayroll', item.includedInPayroll);
        $('#employeeSelect').append(option);
        // Append new options
        select.append(option);

    });

    // Refresh the Select2 widget
    select.select2();
}

function initSelect2Dept(lstDept) {
    var select = $('.deptctrl');

    // Clear existing options, keeping the placeholder if necessary
    select.empty(); // Keep this line if you want to retain the placeholder

    // Loop through each item in the returned data
    $.each(lstDept, function (index, item) {
        // Append new options
        select.append(new Option(item.department_name, item.id));
    });

    // Refresh the Select2 widget
    select.select2({
        maximumSelectionLength: 1
    });
}

function initSelect2DeptEmployee(lstDept) {
    var select = $('.deptctrlEmployee');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder


    // Loop through each item in the returned data
    $.each(lstDept, function (index, item) {
        // Append new options
        select.append(new Option(item.department_name, item.id));
    });

    // Refresh the Select2 widget
    select.select2();
}

function initWorkingHoursTemplate(lstWrkTemp) {
    var select = $('.workingHoursTempDropdown');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder


    // Loop through each item in the returned data
    $.each(lstWrkTemp, function (index, item) {
        // Append new options
        select.append(new Option(item.templateDetails, item.templateID));
    });

    // Refresh the Select2 widget
    select.select2();
}

function initCalculationBasisLogic(lstCalcLogic) {
    var select = $('.clsRemPolicyMain');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder

    // Counter to keep track of the index below
    var index = 1;

    $.each(lstCalcLogic, function (key, value) {
        // Append new options
        var option = new Option(key, index.toString()); // Here, the display text and value are both set to 'key'

        // Append the new option element to the select element
        select.append(option);
        index++;
    });

    // Refresh the Select2 widget
    select.select2();
}

function initDataTable(lstEmp, lstDept) {

    //Datatable is first being initialized here. Any reinitialization will simply be referencing this Datatable
    var table = $('#setEmpLandTable').DataTable();
    $('#setEmpLandTable').DataTable().clear();

    lstEmp.forEach(function (emp) {
        var includedInPayrollDiv = '<div class="included-in-payroll" style="display: none;">' + emp.includedInPayroll + '</div>';
        table.row.add([
            ' <div class="cursor-pointer symbol symbol-30px symbol-md-40px"><img src="data:image/jpeg;base64,' + emp.img + '" alt="user" style="border-radius: 20px; margin: 5px;object-fit:contain"></div>', // For the image, if you have a way to determine the image URL, add here
            emp.emp_lastname + ' ' + emp.emp_firstname,
            emp.position, // Position - if you have this data, add here
            emp.department, // Assuming department name is stored in emp.department,
            includedInPayrollDiv + '<a href="#" class="btn btn-bg-secondary" onclick="loadPersonalEmpDetails(' + emp.emp_pin + ')">View</a>'
        ]).draw(false);
    });

}

function restoreEmpNames() {
    var empConfig = document.querySelector('.empConfig');
    var changeEmployeeBtn = document.querySelector('.changeEmployeeBtn');

    // Reverse the minimization of empConfig
    empConfig.classList.remove('minimized');

    // Hide the Change Employee button
    changeEmployeeBtn.classList.remove('visible');

    // Hide the Employee details
    var empDetailsSection = document.querySelector('.empDetailsSection');
    empDetailsSection.classList.remove('visible');

    // Ensure empConfig is set to be visible when the transition ends
    setTimeout(function () {
        empDetailsSection.style.display = 'none'; // Add this line
    }, 500); // Adjust the delay to match the CSS transition


}

function LoadSalaryDetails(salaryDetails) {
    //empty it first
    $(".addItemsInPayroll").empty();

    var totalSalary = 0;
    $.each(salaryDetails, function (index, item) {
        addSalaryItemBtnClick(index);

        $("." + index + "Name").val(item.salaryDetailName);
        $("." + index + "Amt").val(item.salaryDetailAmount);
        $("." + index + "RemPolicy").val(item.calculationBasisID).trigger('change');
        $("." + index + "PolicyValue").val(item.calculationBasisValue);
        $("." + index + "PolicyValueTime").val(convertJsonDateToTime(item.calculationBasisTime));
        remPolicyChangedFnctn("." + index + "RemPolicy");
        totalSalary += item.salaryDetailAmount;
    });

    $("#earningsAmount").text(totalSalary);

    var earningsAmountDiv = document.getElementById('earningsAmount');
    totalSalarySplit = splitNumber(totalSalary);
    earningsAmountDiv.setAttribute('data-kt-countup-value', totalSalarySplit.integerPart);
    if (totalSalarySplit.decimalPart != 0) {
        earningsAmountDiv.setAttribute('data-kt-countup-suffix', totalSalarySplit.decimalPart);
    }
}

function addSalaryItemBtnClick(clsItemClassNames) {
    rowCounter++;


    var newItem = $(`
        <div class="row" data-row-id="${rowCounter}" style="display:none;">
            <div class="col-md-3">
                <label class="fs-6 fw-bold advlabel row-month">Salary Item Name:</label>
                <input type="text" class="form-control advborderless row-month ${clsItemClassNames}Name">
            </div>
            <div class="col-md-3">
                <label class="fs-6 fw-bold advlabel row-month">Salary Item Amount:</label>
                <input type="number" class="form-control advborderless row-month ${clsItemClassNames}Amt">
            </div>
            <div class="col-md-2">
                <label class="fs-6 fw-bold advlabel row-month">Remuneration Policy</label>
                <select class="form-select datectrl row-month ${clsItemClassNames}RemPolicy" data-control="select2" data-placeholder="Select Remuneration Policy" onchange="remPolicyChangedFnctn(this);">
                    <option></option>
                </select>
            </div>
            <div class="col-md-2">    
                <label class="fs-6 fw-bold advlabel row-month clsPolicyNameText" data-row-id="${rowCounter}">Policy Value</label>
                <input type="number" class="form-control advborderless row-month clsPolicyInputValue ${clsItemClassNames}PolicyValue" data-row-id="${rowCounter}">
            </div>
            <div class="col-md-2 clsStyleDispNoneToBeRemoved" data-row-id="${rowCounter}" style="display:none;">
                <label class="fs-6 fw-bold advlabel row-month clsTimePolicyName" data-row-id="${rowCounter}">Start Time</label>
                <input type="text" class="form-control advborderless row-month clsTimePolicyInputValue ${clsItemClassNames}PolicyValueTime" data-row-id="${rowCounter}">
            </div>
        </div>
    `);

    $(".addItemsInPayroll").append(newItem);
    newItem.slideDown();
    var newDropdown = newItem.find('.' + clsItemClassNames + 'RemPolicy');
    cloneDropdownOptions('.clsRemPolicyMain', newDropdown);
    newItem.find('.clsTimePolicyInputValue').timepicker({ timeFormat: 'HH:mm' });
}

function postChangesToEmployee() {
    var changes = checkForChanges();
    var emp_pin = $(".clsempid").val();

    var payrollItems = []; // Array to hold all payroll item objects

    $('.addItemsInPayroll .row').each(function () {
        var divs = $(this).find('div');

        var salItemName = $(divs[0]).find('input').val();
        var salItemAmount = $(divs[1]).find('input').val();
        var remunPolicy = $(divs[2]).find('select').val();
        var policyVal = $(divs[3]).find('input').val();
        policyVal = policyVal == "" ? 0 : policyVal;
        var defaultDate = "2000-01-01 "; // Arbitrary date for passing to server
        var policyTimeVal = "07:00";
        var dateTimeValue = defaultDate + policyTimeVal;
        var dataRowId = $(divs[0].parentElement).attr('data-row-id');

        // If Remuneration Policy is 6 or 7, then time value is relevant
        if (remunPolicy == 6 || remunPolicy == 7) {
            policyTimeVal = $(divs[4]).find('input').val();
        }

        // Create a new PayrollItem object
        var payrollItem = new PayrollItem(emp_pin, salItemName, salItemAmount, remunPolicy, policyVal, policyTimeVal, dataRowId);

        // Add the object to the array
        payrollItems.push(payrollItem);
    });

    $.ajax({
        type: "POST",
        url: "configs.aspx/updateEmployeeDetails", //It calls our web method
        data: JSON.stringify({
            emp_pin: emp_pin,
            personal: changes.personal,
            deduction: changes.deduction,
            leaves: changes.leaves,
            salItems: payrollItems
        }),
        dataType: "json",
        contentType: "application/json;",
        success: function (response) {
            var result = response.d ? JSON.parse(response.d) : response;

            // Now result is a JavaScript object that you can use
            // Access your data like this
            var personalValue = result.personal;
            var deduction = result.deduction;
            var leaves = result.leaves;
            alert("Changes posted successfully")
            updateProfileCompletionPercentage();
            // We update the leaves here so that the user can see the changes immediately
            // In the future, we will need to update the salary too
            updateLeaves(changes.leaves);
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function updateLeaves(changeLeaves) {
    //changeLeaves can have two attributes: localLeft and sickLeft
    //If any of these attributes is non-null, then we update the leaves using $("#localLeavesValue") and $("#sickLeavesValue") directly

    if (changeLeaves.localLeft !== null && changeLeaves.localLeft !== undefined) {
        $(".localLeft").val(changeLeaves.localLeft).data('original-value', changeLeaves.localLeft);
        $("#localLeavesValue").text(changeLeaves.localLeft);
    }
    if (changeLeaves.sickLeft !== null && changeLeaves.sickLeft !== undefined) {
        $(".sickLeft").val(changeLeaves.sickLeft).data('original-value', changeLeaves.sickLeft);
        $("#sickLeavesValue").text(changeLeaves.sickLeft);
    }
}

function checkForChanges() {
    var personalChanges = {};
    var deductionChanges = {};
    var leavesChanges = {};

    if ($(".clsempFirstName").val() !== $(".clsempFirstName").data('original-value')) {
        personalChanges.emp_firstname = $(".clsempFirstName").val();
    }
    if ($(".clsEmpLastName").val() !== $(".clsEmpLastName").data('original-value')) {
        personalChanges.emp_lastname = $(".clsEmpLastName").val();
    }
    if ($(".clsEmpHireDate").val() !== $(".clsEmpHireDate").data('original-value')) {
        personalChanges.hire_date = $(".clsEmpHireDate").val();
    }
    if ($(".clsEmpNID").val() !== $(".clsEmpNID").data('original-value')) {
        personalChanges.nid = $(".clsEmpNID").val();
    }
    if ($(".clsEmpAddress").val() !== $(".clsEmpAddress").data('original-value')) {
        personalChanges.res_address = $(".clsEmpAddress").val();
    }
    if ($(".clsEmpContact").val() !== $(".clsEmpContact").data('original-value')) {
        personalChanges.contact_no = $(".clsEmpContact").val();
    }
    if ($('.clsBankSelection').val() !== $('.clsBankSelection').data('original-value')) {
        personalChanges.bankName = $('.clsBankSelection').val();
    }
    if ($(".clsBankNum").val() !== $(".clsBankNum").data('original-value')) {
        personalChanges.bank_account_no = $(".clsBankNum").val();
    }
    if ($('.clsIncPayroll').val().toString() !== $('.clsIncPayroll').data('original-value').toString()) {
        personalChanges.include_in_payroll = $('.clsIncPayroll').val();
    }
    if ($(".deductDetails").val() !== $(".deductDetails").data('original-value')) {
        deductionChanges.deduction_details = $(".deductDetails").val();
    }
    if ($(".deductAmount").val().toString() !== $(".deductAmount").data('original-value').toString()) {
        deductionChanges.deduction_amount = $(".deductAmount").val();
    }
    if ($(".clsPositionTitle").val() !== $(".clsPositionTitle").data('original-value')) {
        personalChanges.position = $(".clsPositionTitle").val();
    }
    if ($('.deptctrlEmployee').val().toString() !== $('.deptctrlEmployee').data('original-value').toString()) {
        personalChanges.department = $('.deptctrlEmployee').val();
    }
    if ($('.workingHoursTempDropdown').val().toString() !== $('.workingHoursTempDropdown').data('original-value').toString()) {
        personalChanges.working_hours_template = $('.workingHoursTempDropdown').val();
    }
    if ($('input[type="radio"][name="dependents"]:checked').val().toString() !== $('input[type="radio"][name="dependents"]').data('original-value').toString()) {
        personalChanges.dependants = $('input[type="radio"][name="dependents"]:checked').val();
    }
    if ($(".localLeft").val().toString() !== $(".localLeft").data('original-value').toString()) {
        leavesChanges.localLeft = $(".localLeft").val();
    }
    if ($(".sickLeft").val().toString() !== $(".sickLeft").data('original-value').toString()) {
        leavesChanges.sickLeft = $(".sickLeft").val();
    }
    var checkbox = document.getElementById('csgCheckbox');
    var checkedCheckbox = checkbox.checked ? 1 : 0;
    if (checkedCheckbox !== checkbox.getAttribute('original-value'))
        personalChanges.csgeligible = checkedCheckbox;

    return {
        personal: personalChanges,
        deduction: deductionChanges,
        leaves: leavesChanges
    };
}

//Function to clone the options from one dropdown to another
function cloneDropdownOptions(sourceClass, targetDropdown) {
    var sourceDropdown = $(sourceClass);

    // Clear the target dropdown and copy the options from the source
    targetDropdown.empty().append(sourceDropdown.html());

    // Refresh the Select2 widget for the target dropdown
    targetDropdown.select2();
}

function remPolicyChangedFnctn(element) {
    var selectedValue = $(element).val();
    var parentRow = $(element).closest('.row');
    var rowId = parentRow.data('row-id');
    //Values normally in the database are fixed as follows:
    //1=Fixed Allowance
    //2=daily Allowance
    //3=Deduct on any absence
    //4=Deduct on local leave
    //5=Deduct on sick Leave
    //6=Overtime Rate
    //7=Extra Duty Rate
    if (selectedValue == 1 || selectedValue == 2) {
        parentRow.find(`.clsPolicyInputValue[data-row-id="${rowId}"]`).prop('disabled', true);
        parentRow.find(`.clsStyleDispNoneToBeRemoved[data-row-id="${rowId}"]`).css('display', 'none');
    } else if (selectedValue == 3 || selectedValue == 4 || selectedValue == 5) {
        parentRow.find(`.clsPolicyInputValue[data-row-id="${rowId}"]`).prop('disabled', false);
        parentRow.find(`.clsPolicyNameText[data-row-id="${rowId}"]`).html("No. of absences before deducting full amount");
        parentRow.find(`.clsStyleDispNoneToBeRemoved[data-row-id="${rowId}"]`).css('display', 'none');
    } else if (selectedValue == 6) {
        parentRow.find(`.clsPolicyInputValue[data-row-id="${rowId}"]`).prop('disabled', false);
        parentRow.find(`.clsPolicyNameText[data-row-id="${rowId}"]`).html("Overtime Rate");
        parentRow.find(`.clsStyleDispNoneToBeRemoved[data-row-id="${rowId}"]`).css('display', '');
    } else if (selectedValue == 7) {
        parentRow.find(`.clsPolicyInputValue[data-row-id="${rowId}"]`).prop('disabled', false);
        parentRow.find(`.clsPolicyNameText[data-row-id="${rowId}"]`).html("Extra Duty Rate");
        parentRow.find(`.clsStyleDispNoneToBeRemoved[data-row-id="${rowId}"]`).css('display', '');
    }
}

function removeFromPayroll() {
    var emp_pin = $('.clsempid').val();
    var jwtToken = getCookie("jwttoken");

    jQuery.ajax({
        type: "POST",
        url: "configs.aspx/RemoveFromPayroll",
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        async: false,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            emp_pin: emp_pin
        }),
        dataType: "JSON",
        success: function (msg) {

            if (msg.d == null) {
                window.location.href = '/Login_New.aspx';
            }

            //fill with employee Personal Details
            alert("Employee removed from payroll");
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function loadShift() {
    $(".settingsBtns").css("display", "none");
    $(".workShifts").css("display", "flex");

    if (!$.fn.dataTable.isDataTable('#shiftTable')) {
        var table = $('#shiftTable').DataTable({
            columns: [
                {
                    title: "Select",
                    data: null,
                    orderable: false,
                    searchable: false,
                    render: function (data, type, full, meta) {
                        return '<input type="checkbox" class="dt-checkboxes">';
                    },
                    className: 'dt-body-center'
                },
                { title: "Employee Name", data: 'emp_name' },
                { title: "Amount Taken", data: 'amtTaken' },
                { title: "Date Received", data: 'dateReceived' },
                { title: "Installments", data: 'installments' },
                { title: "Start Month", data: 'firstMonthDeduct' },
                { title: "End Month", data: 'lastMonthDeduct' },
                { title: "Status", data: 'status' },
                { title: "Action", data: 'deleteButton', orderable: false, searchable: false }
            ]
        });
    } else {
        var table = $('#shiftTable').DataTable();
    }
    jQuery.ajax({
        type: "POST",
        url: "configs.aspx/loadWorkShifts", //It calls our web method  
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (successmsg) {
            //clear existing data
            table.clear();

            //Add new Data
            $.each(successmsg.d, function (i, item) {
                var rowData = {
                    "day": findDayFromInteger(successmsg.d[x].dayOfTheWeek),
                    "shiftStart": successmsg.d[x].shiftStart,
                    "shiftEnd": successmsg.d[x].shiftEnd,
                    "workingDay": successmsg.d[x].workingDay,
                    "latenessTolerance": successmsg.d[x].latenessToleranceMinutes
                };
                table.row.add(rowData);
            });

            table.draw();
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}