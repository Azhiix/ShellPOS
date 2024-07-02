class PayrollItem {
    constructor(emp_pin, salaryDetailName, salaryDetailAmount, calculationBasisID, calculationBasisValue, calculationBasisTime, detailID, isEmolument) {
        this.emp_pin = emp_pin;
        this.salaryDetailName = salaryDetailName;
        this.salaryDetailAmount = salaryDetailAmount;
        this.calculationBasisID = calculationBasisID;
        this.calculationBasisValue = calculationBasisValue;
        this.calculationBasisTime = calculationBasisTime;
        this.detailID = detailID;
        this.isEmolument = isEmolument;
    }
}
// Define a global variable to hold the DataTable instance
var empLandTable;

$(document).ready(function () {

    bindEvents();
    initEmpCtrlSelect2();
    initDeptCtrlSelect2();
    initDatatables();
    handleShifts();
    InitializeEventsForCreateAndEditButtons();

    configsBranches.select2handler();
    configsPermissionsTab.bindTogglerEvent();
    configsTaxes.handleTaxes();

    $('.clsEmpHireDate').datepicker({
        dateFormat: 'yy-mm-dd' // Adjust the format as per your requirement
        // other options
    });

});

function initFilter() {
    $('#apply-filter').on('click', function () {
        var employeeStatus = $('#employeeStatus').val();
        var employeeType = $('#employeeType').val();
        applyFilters(employeeStatus, employeeType);
    });
    // Show only hired people by default
    $('#employeeStatus').val('1').trigger('change');;
    $('#apply-filter').trigger('click');
    $('#reset-filter').on('click', function () {
        resetFilters();
    });
}

function retrieveImageFromDevice() {
    var emp_pin = $(".clsempid").val();

    jQuery.ajax({
        type: "GET",
        url: "configs.aspx/retrieveImageFromDevice?emp_pin=" + encodeURIComponent(emp_pin),
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            $(".empImageDiv").html('<img src="data:image/jpeg;base64,' + msg.d + '" alt="user" style="border-radius: 20px;height:140px; margin: 5px;">');
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function bindEvents() {
    $('#upload-btn').on('change', function (event) {
        event.preventDefault();
        var files = $(this).prop('files');
        var fileSizeLimit = 10971520; // 10MB

        for (var i = 0; i < files.length; i++) {
            if (files[i].size > fileSizeLimit) {
                displayWarningHtml('File size should not exceed </b>10 MB</b>.');
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
                displaySuccessMessage("Document successfully uploaded");
                $('#uploadForm').trigger('reset');
                refreshDocuments();
            },
            error: function (xhr) {
                displayErrorMessage("Upload failed: " + xhr.responseText, true);
            }
        });
    });

    $('#uploadLink').on('click', function (e) {
        e.preventDefault(); // Prevent the default anchor action
        $('#fileInput').click();
    });

    $('#fileInput').on('change', function () {
        var file = this.files[0];

        // Size limit in bytes (example: 5MB limit)
        var sizeLimit = 1 * 1024 * 1024; // 5 MB

        if (file) {
            // Check if the file exceeds the size limit
            if (file.size > sizeLimit) {
                displayWarningHtml('File size exceeds the limit of </b>1 MB</b>.');
                return; // Exit the function
            }

            var reader = new FileReader();
            reader.onload = function (e) {
                var base64String = e.target.result.split(',')[1];

                //now we proceed with sending this data to the server to save in DB
                jQuery.ajax({
                    type: "POST",
                    url: "configs.aspx/UploadImage", //It calls our web method  
                    data: JSON.stringify({ img: base64String, emp_pin: $(".clsempid").val() }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "JSON",
                    success: function (msg) {
                        $(".empImageDiv").html('<img src="data:image/jpeg;base64,' + + '" alt="user" style="border-radius: 20px;height:140px; margin: 5px;">');
                    },
                    failure: function (msg) {
                        displayErrorMessage(msg, true);
                    }
                });
            };
            reader.readAsDataURL(file);
        }
    });

    $('#openModalBtn').click(function () {

        var emp_pin = $(".clsempid").val();

        // Make the AJAX call
        $.ajax({
            url: "configs.aspx/loadTaxTypes", //It calls our web method  
            type: 'POST',
            data: JSON.stringify({ emp_pin: emp_pin }),
            dataType: 'JSON', // Assuming the response is in JSON format
            contentType: "application/json; charset=utf-8",
            async: true,
            success: function (response) {
                // Empty the form first
                $('#taxTypesForm').empty();

                let formContent = '';
                $.each(response.d, function (index, taxType) {
                    // Determine if the checkbox should be checked based on eligibility
                    let isChecked = taxType.eligibility === 1 ? 'checked' : '';

                    // Build the form content using template literals
                    formContent += `<div class="form-check mb-3">
                                        <input class="form-check-input" type="checkbox" value="${taxType.taxTypeID}" id="tax${taxType.taxTypeID}" ${isChecked}>
                                        <label class="form-check-label" for="tax${taxType.taxTypeID}">${taxType.taxName}</label>
                                    </div>`;
                });
                $('#taxTypesForm').append(formContent);
            },

            error: function (xhr, status, error) {
                console.log("An error occurred: " + error);
            }
        });
    });

    $('#saveTaxChanges').click(function (event) {
        event.preventDefault();

        var emp_pin = $(".clsempid").val();

        var taxTypesStatus = [];

        // Loop through all checkboxes (not just the checked ones)
        $('#taxTypesForm .form-check-input').each(function () {
            taxTypesStatus.push({
                taxTypeID: $(this).val(),
                eligibility: $(this).is(':checked') ? 1 : 0 // 1 if checked (eligible), 0 if not checked (ineligible)
            });
        });

        // AJAX call to post the data
        $.ajax({
            url: "configs.aspx/SaveEmployeeTaxEligibility", // Modify URL as needed
            type: 'POST',
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({ empPin: emp_pin, taxTypes: taxTypesStatus }),
            dataType: 'json',
            success: function (response) {
                if (response.d == 1) {
                    displaySuccessMessage("Tax eligibility saved successfully.");
                }
                else {
                    displayErrorMessage("An error occurred while saving tax eligibility.");
                }
            },
            error: function (error) {
                console.log(error);
                displayErrorMessage("A critical error occurred while saving tax eligibility.Contact your system Admin");
            }
        });
    });

    $(document).on('keydown', 'input[type="number"]', function (e) {
        if (e.key == "ArrowUp" || e.key == "ArrowDown") {
            e.preventDefault();
        }
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

    // Initialize your DataTable once and store the reference
    if (!$.fn.DataTable.isDataTable('#setEmpLandTable')) {
        empLandTable = $('#setEmpLandTable').DataTable({
            responsive: true, // Make table responsive
        });
    }
}

function initEmpCtrlSelect2() {
    $('.empctrl').on('change', function () {
        var selectedIds = $(this).val();

        empLandTable.columns().search('').draw();

        if (selectedIds.length === 0) {
            // Clear the filter if no employee is selected
            empLandTable.column(1).search('').draw();
        } else {
            // Create a regex pattern for selected employee names
            var searchPattern = selectedIds.map(function (id) {
                return $('.empctrl option[value="' + id + '"]').text();
            }).join('|');
            empLandTable.column(1).search(searchPattern, true, false).draw();
        }

        if ($('.deptctrl').val()) {
            $('.deptctrl').val(null).trigger('change.select2');
        }
    });
}

function applyFilters(employeeStatus, employeeType) {

    // Remove any existing custom search to avoid duplicates
    $.fn.dataTable.ext.search.pop();

    // Custom search function to filter based on the hidden values
    $.fn.dataTable.ext.search.push(function (settings, data, dataIndex) {
        if (settings.nTable.id !== 'setEmpLandTable') {
            return true;
        }

        var row = empLandTable.row(dataIndex).node();
        var includedInPayroll = $(row).find('.included-in-payroll').text().trim();
        var empType = $(row).find('.employeeType').text().trim();

        // Check if each filter is applied. If filter value is default (e.g., ''), consider it as match.
        var statusMatch = employeeStatus === '' || includedInPayroll === employeeStatus;
        var typeMatch = employeeType === '' || empType === employeeType;

        return statusMatch && typeMatch;
    });

    empLandTable.draw();
}

function resetFilters() {

    // Remove the custom search function
    $.fn.dataTable.ext.search.pop();

    // Reset the filter controls to their default or initial states
    $('#employeeStatus').val(''); // Set to default value, e.g., '', or whatever is appropriate
    $('#employeeType').val(''); // Set to default value

    // Trigger the change event on the controls if necessary
    $('#employeeStatus').trigger('change');
    $('#employeeType').trigger('change');

    // Redraw the table to apply the new search
    empLandTable.draw();
}

function initDeptCtrlSelect2() {
    $('.deptctrl').on('change', function () {

        var selectedDept = $(this).val();

        empLandTable.columns().search('').draw();

        if (selectedDept) {
            empLandTable.column(3).search(selectedDept).draw();
        } else {
            empLandTable.column(3).search('').draw();
        }

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
    $(".companyDetails").css("display", "none");
    $(".taxesDetails").css("display", "none");
    $(".hierarchyManagement").css("display", "none");
    $(".templateContainer").css("display", "none");
    emptyTaxesDetailsInputs();
}

function loadPersonalEmpDetails(selectedId) {

    // Clear the existing data in the form
    $(".basicSalaryInput").val("");
    $("#usernameField").val("");
    $("#passwordField").val("");

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
                window.location.href = '/Login_New.aspx?discon=true';
            } else {
                // Call these functions regardless of the error
                LoadPersonalDetails(msg);
                LoadEDFDetails(msg);
                LoadLeaves(msg);
                LoadSalaryDetails(msg.d.salaryDetails);
                configsPermissionsTab.loadEmployeePermissionSettings(msg);

                if (msg.d.documents.some(doc => doc.HasError)) {
                    // Handle the error case
                    displayErrorMessage(msg.d.documents.find(doc => doc.HasError).ErrorMessage, true);
                } else {
                    // No errors, load documents
                    LoadEmployeeDocumentsDetails(msg.d.documents);
                }
            }
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
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

function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
}

function LoadPersonalDetails(msg) {
    $(".clsempid").val(msg.d.employee.emp_pin);
    $(".clsempFirstName").val(msg.d.employee.emp_firstname).data('original-value', msg.d.employee.emp_firstname);
    $(".clsEmpLastName").val(msg.d.employee.emp_lastname).data('original-value', msg.d.employee.emp_lastname);

    //Preselecting the date here is different because its not mere javascript... it's using jquery's datepicker....
    $(".clsEmpHireDate").data('original-value', formatDotNetJsonDate(msg.d.employee.hiredate));
    //Therefore we need to use the predefined functions to set the date... The "setDate" is predefined in Jquery
    $(".clsEmpHireDate").datepicker("setDate", new Date(formatDotNetJsonDate(msg.d.employee.hiredate)));

    $(".clsEmpNID").val(msg.d.employee.nid).data('original-value', msg.d.employee.nid);
    $(".empImageDiv").html('<img src="data:image/jpeg;base64,' + msg.d.employee.img + '" alt="user" style="border-radius: 20px;max-height:140px; margin: 5px;">');
    $(".empFullNameTitle").html(msg.d.employee.emp_lastname + " " + msg.d.employee.emp_firstname);
    $(".clsEmpContact").val(msg.d.employee.telNum).data('original-value', msg.d.employee.telNum);
    $(".clsEmpAddress").val(msg.d.employee.resAddress).data('original-value', msg.d.employee.resAddress);
    $(".clsEmpPositionTitle").html(msg.d.employee.position);
    $(".clsEmpAddressTitle").html(msg.d.employee.resAddress);
    $(".clsEmpPhoneTitle").html(msg.d.employee.telephone);
    $('.clsBankSelection').val(msg.d.employee.bankName).data('original-value', msg.d.employee.bankName).trigger('change');
    // Assuming you have an input field with class '.clsBankNum' for the bank number
    $(document).ready(function () {
        $(".clsBankNum").on('input', function () {
            var currentValue = $(this).val();
            // Regular expression to match a numeric value (integer or decimal)
            var numericRegex = /^\d*\.?\d*$/;

            if (!numericRegex.test(currentValue)) {
                // If current value doesn't match the pattern, revert to the last known good value
                $(this).val($(this).data('original-value'));
                // Optionally, show an error message
            } else {
                // Update the stored 'original-value' with the current valid value
                $(this).data('original-value', currentValue);
            }
        });
    });


    
    $('.clsIncPayroll').val(msg.d.employee.includedInPayroll).data('original-value', msg.d.employee.includedInPayroll).trigger('change');
    $('input[type="radio"][name="dependents"][value="' + msg.d.employee.dependants + '"]').prop('checked', true);
    // For radio buttons, assuming 'msg.d.employee.dependants' holds the checked value
    $('input[type="radio"][name="dependents"]').each(function () {
        // Set the original value attribute to the value of the radio button itself
        $(this).data('original-value', msg.d.employee.dependants);
    });
    $(".clsPositionTitle").val(msg.d.employee.position).data('original-value', msg.d.employee.position);
    $('.deptctrlEmployee').val(msg.d.employee.department).data('original-value', msg.d.employee.department).trigger('change');
    $('.branchCtrlEmployee').val(msg.d.branch.id).data('original-value', msg.d.branch.id).trigger('change');
    $('.contractTypeCtrlEmployee').val(msg.d.employee.emp_type).data('original-value', msg.d.employee.emp_type).trigger('change');
    $('.workingHoursTempDropdown').val(msg.d.employee.workingHoursTemplate).data('original-value', msg.d.employee.workingHoursTemplate).trigger('change');
    $('.otherComments').val(msg.d.employee.comments).data('original-value', msg.d.employee.comments);

    $('#toggleCLEL').prop('checked', msg.d.employee.CLEL).data('original-checked', msg.d.employee.CLEL ? 1 : 0);
    $('#toggleCOLL').prop('checked', msg.d.employee.COLL).data('original-checked', msg.d.employee.COLL ? 1 : 0);
    $('#toggleCOAR').prop('checked', msg.d.employee.COAR).data('original-checked', msg.d.employee.COAR ? 1 : 0);

    //Now we need to initialize the "Remove from payroll button".If he is part of payroll, the button will remove him.
    //If he is not part of payroll,buttonn will add him
    updateAddOrRemoveFromPayrollButton(msg.d.employee.includedInPayroll);

    updateProfileCompletionPercentage();
}

function updateAddOrRemoveFromPayrollButton(includedInPayrollNewValue) {
    if (includedInPayrollNewValue == 1) {
        $("#idRemoveOrAddFromPayroll").html("Remove from payroll");
        $("#idRemoveOrAddFromPayroll").data('original-value', 1);
    }
    else {
        $("#idRemoveOrAddFromPayroll").html("Add to payroll");
        $("#idRemoveOrAddFromPayroll").data('original-value', 0);
    }
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

function LoadEDFDetails(msg) {
    $(".deductDetails").val(msg.d.deductions.deduction_details).data('original-value', msg.d.deductions.deduction_details);
    $(".deductAmount").val(msg.d.deductions.deduction_amount).data('original-value', msg.d.deductions.deduction_amount);
    $(".TANnumber").val(msg.d.employee.tannumber).data('original-value', msg.d.employee.tannumber);
    $(".emoDetails").val(msg.d.employee.emolument_details).data('original-value', msg.d.employee.emolument_details);
    $(".emoAmount").val(msg.d.employee.emolument_amount).data('original-value', msg.d.employee.emolument_amount);
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
                window.location.href = '/Login_New.aspx?discon=true'; // Update with your login page URL
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
        var fileIcon = getFileIcon(row['file_extension']);

        table.row.add([
            '<div>' + fileIcon + '</div>',
            row['uuid'],
            fileDescription,
            "<a onclick='downloadDocument(\"" + row['uuid'] + "\",\"" + row['file_extension'] + "\")' class='btn btn-bg-secondary'>Download</a> <a onclick='removeDocument(\"" + row['uuid'] + "\",\"" + row['file_extension'] + "\")' class='btn btn-bg-danger'>Remove</a>"
        ]).draw(false);
    });
}

function getFileIcon(fileExtension) {
    switch (fileExtension) {
        case '.pdf':
            return '<i class="fa-regular fa-file-pdf fa-2xl"></i>';
        case '.png':
        case '.jpg':
            return '<i class="fa-regular fa-file-image fa-2xl"></i>';
        case '.doc':
            return '<i class="fa-regular fa-file-word fa-2xl"></i>';
        default:
            return '<i class="fa-regular fa-file fa-2xl"></i>';
    }
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
            displaySuccessMessage('Document removed successfully.');
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
                window.location.href = '/Login_New.aspx?discon=true'; // Update with your login page URL
            else {
                // Handle the response data

                var lstEmp = lstEmpAndDept.d.listEmployees;
                var lstDept = lstEmpAndDept.d.listDepts;
                var lstWrkTemp = lstEmpAndDept.d.lstTemplates;
                var lstCalcBasis = lstEmpAndDept.d.calculationBasis;
                var lstPermissions = lstEmpAndDept.d.permissions;
                var lstBranches = lstEmpAndDept.d.lstBranches;
                var lstContractTypes = lstEmpAndDept.d.lstContractTypes;

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
                initSelect2BranchEmployee(lstBranches);
                initSelect2ContractTypeEmployee(lstContractTypes);
                initWorkingHoursTemplate(lstWrkTemp);
                initCalculationBasisLogic(lstCalcBasis);
                initDataTable(lstEmp, lstDept);
                configsPermissionsTab.loadAllPossiblePermissions(lstPermissions);
                initFilter();
            }
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
    $(".documentsContainer").css("display", "none");
    $(".settingsBtns").css("display", "none");
    $(".empConfig").css("display", "flex");

    //Its here that the datatable should have been initialized because the table is initially hidden
    // Check if DataTable is already initialized and just adjust its columns
    if ($.fn.DataTable.isDataTable('#setEmpLandTable')) {
        // The DataTable is already initialized, adjust its columns
        $('#setEmpLandTable').DataTable().columns.adjust().responsive.recalc();
    } else {
        // Initialize the DataTable here
        $('#setEmpLandTable').DataTable({
            // your DataTable options
            responsive: true
        });
    }
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
        select.append(new Option(item.department_name, item.department_name));
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

function initSelect2BranchEmployee(lstBranches) {
    var select = $('.branchCtrlEmployee');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder


    // Loop through each item in the returned data
    $.each(lstBranches, function (index, item) {
        // Append new options
        select.append(new Option(item.companyName, item.id));
    });

    // Refresh the Select2 widget
    select.select2();
}

function initSelect2ContractTypeEmployee(lstContractTypes) {
    var select = $('.contractTypeCtrlEmployee');
    var selectFilter = $('.contractTypeFilter');
    select.empty();
    selectFilter.empty();

    // Loop through each item in the returned data
    $.each(lstContractTypes, function (index, item) {
        // Append new options
        select.append(new Option(item.contractType, item.id));
        selectFilter.append(new Option(item.contractType, item.id));
    });

    // Refresh the Select2 widget
    select.select2();
    selectFilter.select2();
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

    empLandTable.clear();

    lstEmp.forEach(function (emp) {
        var includedInPayrollDiv = '<div class="included-in-payroll" style="display: none;">' + emp.includedInPayroll + '</div>';
        var employeeIdDiv = '<div class="employeeId" style="display: none;">' + emp.emp_pin + '</div>';
        var employeeTypeDiv = '<div class="employeeType" style="display: none;">' + emp.emp_type + '</div>';
        empLandTable.row.add([
            ' <div class="cursor-pointer symbol symbol-30px symbol-md-40px"><img src="data:image/jpeg;base64,' + emp.img + '" alt="user" style="border-radius: 20px; margin: 5px;object-fit:contain"></div>', // For the image, if you have a way to determine the image URL, add here
            emp.emp_lastname + ' ' + emp.emp_firstname,
            emp.position, // Position - if you have this data, add here
            emp.department, // Assuming department name is stored in emp.department,
            includedInPayrollDiv + employeeIdDiv + employeeTypeDiv + '<a href="#" class="btn btn-bg-secondary" onclick="loadPersonalEmpDetails(' + emp.emp_pin + ')">View</a>'
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
    // Empty the container first
    $(".addItemsInPayroll").empty();

    // Sort the salaryDetails array by detailID
    salaryDetails.sort(function (a, b) {
        return a.detailID - b.detailID;
    });

    var totalSalary = 0;

    // Now iterate through the sorted array
    $.each(salaryDetails, function (index, item) {

        if (item.salaryDetailName == "Basic Salary" && item.calculationBasisID == 0) {
            $(".basicSalaryInput").val(item.salaryDetailAmount);
            $(".basicSalaryInput").attr("data-row-id", item.detailID);
        }
        else {
            addSalaryItemBtnClick(item.detailID);

            $("." + item.detailID + "Name").val(item.salaryDetailName);
            $("." + item.detailID + "Amt").val(item.salaryDetailAmount);
            $("." + item.detailID + "RemPolicy").val(item.calculationBasisID).trigger('change');
            $("." + item.detailID + "PolicyValue").val(item.calculationBasisValue);
            $("." + item.detailID + "PolicyValueTime").val(convertJsonDateToTime(item.calculationBasisTime));
            $("#emolumentCheckbox" + item.detailID).prop('checked', item.isEmolument == 1);
            remPolicyChangedFnctn("." + item.detailID + "RemPolicy");
        }

        totalSalary += item.salaryDetailAmount;
    });

    $("#earningsAmount").text(totalSalary);

    var earningsAmountDiv = document.getElementById('earningsAmount');
    totalSalarySplit = splitNumber(totalSalary);
    earningsAmountDiv.setAttribute('data-kt-countup-value', totalSalarySplit.integerPart);
    if (totalSalarySplit.decimalPart != 0) {
        earningsAmountDiv.setAttribute('data-kt-countup-suffix', "." + totalSalarySplit.decimalPart);
    }
}

function addSalaryItemBtnClick(clsItemClassNames) {
    var newDetailIdToAdd = 0;

    var newItem = $(`
        <div class="row" data-row-id="${clsItemClassNames}" style="display:none;">
            <div class="col-md-3">
                <label class="fs-6 fw-bold advlabel row-month">Salary Item Name:</label>
                <input type="text" class="form-control advborderless row-month ${clsItemClassNames}Name">
            </div>
            <div class="col-md-3">
                <label class="fs-6 fw-bold advlabel row-month">Salary Item Amount:</label>
                <input type="number" class="form-control advborderless row-month ${clsItemClassNames}Amt" step="100">
            </div>
            <div class="col-md-2">
                <label class="fs-6 fw-bold advlabel row-month">Remuneration Policy</label>
                <select class="form-select datectrl row-month ${clsItemClassNames}RemPolicy" data-control="select2" data-placeholder="Select Remuneration Policy" onchange="remPolicyChangedFnctn(this);">
                    <option></option>
                </select>
            </div>
            <div class="col-md-2">
                <label class="fs-6 fw-bold advlabel row-month clsPolicyNameText" data-row-id="${clsItemClassNames}">Policy Value</label>
                <input type="number" class="form-control advborderless row-month clsPolicyInputValue ${clsItemClassNames}PolicyValue" data-row-id="${clsItemClassNames}">
            </div>
            <div class="col-md-1 mt-7">
                <div class="d-flex flex-column">
                    <label class="fs-6 fw-bold advlabel row-month">Is Emolument</label>
                    <div class="form-check mt-auto">
                        <input class="form-check-input" type="checkbox" id="emolumentCheckbox${clsItemClassNames}">
                    </div>
                </div>
            </div>
            <div class="col-md-1 mt-11">
            <button class="btn btn-sm btn-danger removeRowBtn" type="button" aria-label="Remove">
                <i class="bi bi-x-circle"></i>
            </button>
        </div>
        </div>
        <div class="separator my-2"></div>
    `);

    $(".addItemsInPayroll").append(newItem);
    newItem.slideDown();
    var newDropdown = newItem.find('.' + clsItemClassNames + 'RemPolicy');
    cloneDropdownOptions('.clsRemPolicyMain', newDropdown);
    newItem.find('.clsTimePolicyInputValue').timepicker({ timeFormat: 'HH:mm' });

    newItem.find('.removeRowBtn').on('click', function () {
        removeRow(this);
    });
}

function postChangesToEmployee() {
    //disable the button to prevent multiple clicks
    $("#postChangesBtn").prop("disabled", true);

    var allDataIsValid = true;
    allDataIsValid = inputValidationBeforeEmployeeChanges();

    if (allDataIsValid) {
        var changes = checkForChanges();
        var emp_pin = $(".clsempid").val();

        var payrollItems = []; // Array to hold all payroll item objects
        var permissions = []; // Array to hold all permission objects

        $('.addItemsInPayroll .row').each(function () {
            var divs = $(this).find('div');

            var salItemName = $(divs[0]).find('input').val();
            var salItemAmount = $(divs[1]).find('input').val();
            var remunPolicy = $(divs[2]).find('select').val();
            var policyVal = $(divs[3]).find('input').val();
            var isEmolument = $(divs[4]).find('input[type="checkbox"]').prop('checked') ? 1 : 0;;
            policyVal = policyVal == "" ? 0 : policyVal;
            var defaultDate = "2000-01-01 "; // Arbitrary date for passing to server
            var policyTimeVal = "07:00";
            var dateTimeValue = defaultDate + policyTimeVal;
            var dataRowId = $(divs[0].parentElement).attr('data-row-id');

            // Input Validation
            if (!salItemName || !salItemAmount || !remunPolicy) {
                let missingFields = [];
                if (!salItemName) missingFields.push('Salary Item Name');
                if (!salItemAmount) missingFields.push('Salary Item Amount');
                if (!remunPolicy) missingFields.push('Remuneration Policy');
                allDataIsValid = false;
                return false; // Skip the loop and stop here
            }

            if ((!(remunPolicy == '2' || remunPolicy == '1')) && (policyVal == null || policyVal == '' || policyVal == 0)) {
                let missingFields = [];
                if (!(remunPolicy == '2' || remunPolicy == '1')) missingFields.push('Remuneration Policy');
                if (policyVal == null || policyVal == '') missingFields.push('Policy Value');
                allDataIsValid = false;
                return false; // Skip the current iteration
            }
            // Create a new PayrollItem object
            var payrollItem = new PayrollItem(emp_pin, salItemName, salItemAmount, remunPolicy, policyVal, policyTimeVal, dataRowId, isEmolument);

            // Add the object to the array
            payrollItems.push(payrollItem);
        });

        if (allDataIsValid) {
            var basicSalary = $(".basicSalaryInput").val();
            var basicSalaryRowId = $(".basicSalaryInput").attr("data-row-id");
            //create one last payroll item object for the basic salary
            var payrollItem = new PayrollItem(emp_pin, "Basic Salary", basicSalary, 0, 0, "07:00", basicSalaryRowId, 1);
            payrollItems.push(payrollItem);

            permissions = configsPermissionsTab.getEmployeePermissions();
            var selectedAccessOption = $('input[name="accessOptions"]:checked').attr('accessID');
            var pw = $("#passwordField").val();
            var uname = $("#usernameField").val();
            $.ajax({
                type: "POST",
                url: "configs.aspx/updateEmployeeDetails", //It calls our web method
                data: JSON.stringify({
                    emp_pin: emp_pin,
                    personal: changes.personal,
                    deduction: changes.deduction,
                    leaves: changes.leaves,
                    salItems: payrollItems,
                    newAdminIndex: selectedAccessOption,
                    permissions: permissions,
                    pw: pw,
                    uname: uname
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
                    var salary = result.salary;
                    var permissions = result.permissions;

                    // If any of the values above is 0, display an error message. Specify what value is 0
                    var errorMessage = "";

                    if (personalValue == 0) {
                        errorMessage += "Issue with Personal Value. ";
                    }
                    if (deduction == 0) {
                        errorMessage += "Issue with Deduction. ";
                    }
                    if (leaves == 0) {
                        errorMessage += "Issue with Leaves. ";
                    }
                    if (salary == 0) {
                        errorMessage += "Issue with Salary. ";
                    }
                    if (permissions == 0) {
                        errorMessage += "Issue with Permissions. ";
                    }

                    if (errorMessage !== "") {
                        displayErrorMessage("Error occurred while updating employee details: " + errorMessage, true);
                    }
                    else {
                        displaySuccessMessage("Changes posted successfully");
                        //Hide the button right away to prevent multiple clicks
                        restoreEmpNames();
                    }
                    updateProfileCompletionPercentage();
                    // We update the leaves here so that the user can see the changes immediately
                    // In the future, we will need to update the salary too
                    updateLeaves(changes.leaves);
                    updateOriginalValues();
                },
                error: function (xhr, status, error) {
                    console.error("Error occurred: ", status, error);
                }
            });
        }
        else {
            displayWarningMessage(`Please ensure all salary details are correctly filled before submitting the details.`);
        }
    }
    //enable the button again
    $("#postChangesBtn").prop("disabled", false);
}

function inputValidationBeforeEmployeeChanges() {
    //After addding all custom salary details we will add the value of the basic salary
    var basicSalary = $(".basicSalaryInput").val();

    if (basicSalary == null || basicSalary == "") {
        allDataIsValid = false;
        displayWarningMessage("Basic salary cannot be null");
        return false;
    }

    // Check whether working hours template is valid
    var workingHoursTemplate = $('.workingHoursTempDropdown').val();
    if (workingHoursTemplate == null || workingHoursTemplate == '') {
        allDataIsValid = false;
        displayWarningHtml("Please select a Working hours template in the 'Payroll Group' tab");
        return false;
    }

    // Check whether department is valid
    var department = $('.deptctrlEmployee').val();
    if (department == null || department == '') {
        allDataIsValid = false;
        displayWarningMessage("Please select a Department in the 'Payroll Group' tab");
        return false;
    }

    // Check whether the name contains a valid character (No special characters allowed)
    var fullName = $(".clsempFirstName").val() + $(".clsEmpLastName").val();
    var regex = /^[A-Za-z\s]+$/;

    if (!(regex.test(fullName))) {
        // The name contains special characters or numbers.
        allDataIsValid = false;
        displayWarningMessage("Only alphabets are allowed in the name");
        return false;
    }

    return true;
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
    if ($('.branchCtrlEmployee').val().toString() !== $('.branchCtrlEmployee').data('original-value').toString()) {
        personalChanges.branch = $('.branchCtrlEmployee').val();
    }
    if ($('.contractTypeCtrlEmployee').val().toString() !== $('.contractTypeCtrlEmployee').data('original-value').toString()) {
        personalChanges.emp_type = $('.contractTypeCtrlEmployee').val();
    }
    if ($('.workingHoursTempDropdown').val().toString() !== $('.workingHoursTempDropdown').data('original-value').toString()) {
        personalChanges.working_hours_template = $('.workingHoursTempDropdown').val();
    }
    if ($('input[type="radio"][name="dependents"]:checked').val().toString() !== $('input[type="radio"][name="dependents"]').data('original-value').toString()) {
        personalChanges.dependants = $('input[type="radio"][name="dependents"]:checked').val();
    }
    if ($(".otherComments").val().toString() !== $(".otherComments").data('original-value').toString()) {
        personalChanges.comments = $(".otherComments").val();
    }
    if ($(".localLeft").val().toString() !== $(".localLeft").data('original-value').toString()) {
        leavesChanges.localLeft = $(".localLeft").val();
    }
    if ($(".sickLeft").val().toString() !== $(".sickLeft").data('original-value').toString()) {
        leavesChanges.sickLeft = $(".sickLeft").val();
    }
    if ($('#toggleCLEL').prop('checked') != $('#toggleCLEL').data('original-checked')) {
        personalChanges.CLEL = $('#toggleCLEL').prop('checked') ? 1 : 0;
    }
    if ($('#toggleCOLL').prop('checked') != $('#toggleCOLL').data('original-checked')) {
        personalChanges.COLL = $('#toggleCOLL').prop('checked') ? 1 : 0;
    }
    if ($('#toggleCOAR').prop('checked') != $('#toggleCOAR').data('original-checked')) {
        personalChanges.COAR = $('#toggleCOAR').prop('checked') ? 1 : 0;
    }
    if ($(".TANnumber").val() !== $(".TANnumber").data('original-value')) {
        personalChanges.tannumber = $(".TANnumber").val();
    }
    if ($(".emoDetails").val() !== $(".emoDetails").data('original-value')) {
        personalChanges.emolument_details = $(".emoDetails").val();
    }
    if ($(".emoAmount").val() !== $(".emoAmount").data('original-value')) {
        personalChanges.emolument_amount = $(".emoAmount").val();
    }
    return {
        personal: personalChanges,
        deduction: deductionChanges,
        leaves: leavesChanges
    };
}

function updateOriginalValues() {
    $(".clsempFirstName").data('original-value', $(".clsempFirstName").val());
    $(".clsEmpLastName").data('original-value', $(".clsEmpLastName").val());
    $(".clsEmpHireDate").data('original-value', $(".clsEmpHireDate").val());
    $(".clsEmpNID").data('original-value', $(".clsEmpNID").val());
    $(".clsEmpAddress").data('original-value', $(".clsEmpAddress").val());
    $(".clsEmpContact").data('original-value', $(".clsEmpContact").val());
    $('.clsBankSelection').data('original-value', $('.clsBankSelection').val());
    $(".clsBankNum").data('original-value', $(".clsBankNum").val());
    $('.clsIncPayroll').data('original-value', $('.clsIncPayroll').val());
    $(".deductDetails").data('original-value', $(".deductDetails").val());
    $(".deductAmount").data('original-value', $(".deductAmount").val());
    $(".clsPositionTitle").data('original-value', $(".clsPositionTitle").val());
    $('.deptctrlEmployee').data('original-value', $('.deptctrlEmployee').val());
    $('.branchCtrlEmployee').data('original-value', $('.branchCtrlEmployee').val());
    $('.contractTypeCtrlEmployee').data('original-value', $('.contractTypeCtrlEmployee').val());
    $('.workingHoursTempDropdown').data('original-value', $('.workingHoursTempDropdown').val());
    $('input[type="radio"][name="dependents"]:checked').data('original-value', $('input[type="radio"][name="dependents"]:checked').val());
    $(".otherComments").data('original-value', $(".otherComments").val());
    $(".localLeft").data('original-value', $(".localLeft").val());
    $(".sickLeft").data('original-value', $(".sickLeft").val());
    $('#toggleCLEL').data('original-checked', $('#toggleCLEL').prop('checked'));
    $('#toggleCOLL').data('original-checked', $('#toggleCOLL').prop('checked'));
    $('#toggleCOAR').data('original-checked', $('#toggleCOAR').prop('checked'));
    $('.TANnumber').data('original-value', $(".TANnumber").val());
    $(".emoDetails").data('original-value', $(".emoDetails").val());
    $(".emoAmount").data('original-value', $(".emoAmount").val());
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
    }
}

function removeOrAddFromPayroll() {
    var emp_pin = $('.clsempid').val();
    var jwtToken = getCookie("jwttoken");
    var originalValueOfHireStatus = $("#idRemoveOrAddFromPayroll").data('original-value');

    jQuery.ajax({
        type: "POST",
        url: "configs.aspx/RemoveOrAddFromPayroll",
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        async: false,
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({
            emp_pin: emp_pin,
            oldStatus: originalValueOfHireStatus
        }),
        dataType: "JSON",
        success: function (msg) {
            if (msg.d == 0) {
                displayErrorMessage("Could not update employee hire status.Please try again later");
            }
            else {
                displaySuccessMessage("Employee hire status updated successfully.");
                var newValueOfHireStatus = originalValueOfHireStatus == 1 ? 0 : 1;
                updateAddOrRemoveFromPayrollButton(newValueOfHireStatus);
                loadEmpInfos(); // This code is very fishy here...
                //Because this called is being called when it shouldnt really be called here. This may introduce tons of bugs, most of which
                //have just been fixed together with the commit where this comment is being written.
                //To think of something else later if ever this code introduces bugs again
            }
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function handleShifts() {
    $(document).on('click', '#saveChangesShiftCreation', function (e) {
        e.preventDefault(); // Prevent the default form submission
        createShift();
    });

    $('#addShiftTemplate').click(function () {
        $('#saveChangesShiftCreation').data('templateKey', ''); // Reset the templateKey to an empty string or the desired default value
        $('#saveChangesShiftCreation').data('mode', '')
        clearCachedShiftData();
    });

    $('#shiftTable').on('click', '.edit-btn', function () {
        var rowData = $('#shiftTable').DataTable().row($(this).parents('tr')).data();
        loadShiftDataFromRow(rowData);
    });

    $('#copyPreviousShiftValues').on('click', function () {
        var shiftTemplateWrapper = getShiftTemplateWrapper();
        // If shift template data is found, load it into the form
        if (shiftTemplateWrapper) {
            loadShiftDataFromWrapper(shiftTemplateWrapper.shiftTemplateWrapper);
        }
    });

}

function getShiftTemplateWrapper() {
    var shiftTemplateWrapperString = sessionStorage.getItem('shiftTemplateWrapper');
    if (shiftTemplateWrapperString) {
        return JSON.parse(shiftTemplateWrapperString);
    } else {
        console.error('No shift template data found in local storage.');
        return null;
    }
}

function clearCachedShiftData() {
    // Reset fields for each day of the week
    var daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    daysOfWeek.forEach(function (day) {
        $('#' + day + 'StartTime').val('');
        $('#' + day + 'EndTime').val('');
        $('#' + day + 'WorkingDay').prop('checked', false);
        $('#' + day + 'LatenessTolerance').val('');
    });

    // Clear additional fields
    $('#shiftDescription').val('');
    $('#overtimeRate').val('');
    $('#extraOvertimeRate').val('');
    $('#exceptionalOvertimeRate').val('');
    $('#exceptionalOvertimeHours').val('');
    $('#mealAllowanceAmount').val('');
    $('#hoursPerMonth').val('');
    $('#numberDaysWorked').val('');


    // Reset the save button behavior and template key
    $('#saveChangesShiftCreation').data('mode', '');
    $('#saveChangesShiftCreation').data('templateKey', '');
}

function loadShiftDataFromRow(data) {
    // Array of days of the week
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    // Iterate over each day and populate the fields
    daysOfWeek.forEach(day => {
        $(`#${day}StartTime`).val(data[`${day}StartTime`]);
        $(`#${day}EndTime`).val(data[`${day}EndTime`]);
        $(`#${day}MealAllowanceTime`).val(data[`${day}MealAllowanceTime`]);
        $(`#${day}WorkingDay`).prop('checked', data[`${day}WorkingDay`] === 1);
        $(`#${day}LatenessTolerance`).val(data[`${day}LatenessTolerance`]);
    });

    // Populate additional fields
    $('#shiftDescription').val(data.description);
    $('#overtimeRate').val(data.overtimeRate);
    $('#extraOvertimeRate').val(data.extraOvertimeRate);
    $('#exceptionalOvertimeRate').val(data.exceptionalOvertimeRate);
    $('#exceptionalOvertimeHours').val(data.exceptionalOvertimeHours);
    $('#mealAllowanceAmount').val(data.mealAllowanceAmount);
    $('#hoursPerMonth').val(data.hoursPerMonth);
    $('#numberDaysWorked').val(data.daysPerMonth);

    // Change the behavior of the save button to 'Update' mode
    $('#saveChangesShiftCreation').data('mode', 'update');
    $('#saveChangesShiftCreation').data('templateKey', data.templateKey); // Unique identifier for the shift
}

function loadShiftDataFromWrapper(shiftTemplateWrapper) {
    var templates = shiftTemplateWrapper.Templates;

    // Function to get template data by day of the week
    function getTemplate(dayOfTheWeek) {
        return templates.find(template => template.dayOfTheWeek === dayOfTheWeek) || {};
    }

    // Populate fields for each day of the week
    ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'].forEach((day, index) => {
        var dayTemplate = getTemplate(index);
        $('#' + day + 'StartTime').val(dayTemplate.shiftStart || '');
        $('#' + day + 'EndTime').val(dayTemplate.shiftEnd || '');
        $('#' + day + 'WorkingDay').prop('checked', dayTemplate.workingDay === 1);
        $('#' + day + 'LatenessTolerance').val(dayTemplate.latenessToleranceMinutes || 0);
    });

    // Populate additional fields
    $('#shiftDescription').val(shiftTemplateWrapper.ShiftDescription || '');
    $('#overtimeRate').val(shiftTemplateWrapper.OvertimeRate || 0);
    $('#extraOvertimeRate').val(shiftTemplateWrapper.ExtraOvertimeRate || 0);
    $('#exceptionalOvertimeRate').val(shiftTemplateWrapper.ExceptionalOvertimeRate || 0);
    $('#exceptionalOvertimeHours').val(shiftTemplateWrapper.ExceptionalOvertimeHours || 0);


    // Change the behavior of the save button to 'Update' mode
    $('#saveChangesShiftCreation').data('mode', '');
    $('#saveChangesShiftCreation').data('templateKey', shiftTemplateWrapper.templateKey); // Unique identifier for the shift
}

function loadShift() {
    $(".settingsBtns").css("display", "none");
    $(".workShifts").css("display", "flex");

    if (!$.fn.dataTable.isDataTable('#shiftTable')) {
        var columns = [
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
            { title: "Template key", data: 'templateKey', visible: false },
            { title: "Description", data: 'description' },
            { title: "Day(s)", data: 'day' },
            { title: "Start time", data: 'shiftStart' },
            { title: "End time", data: 'shiftEnd' },
            { title: "Meal Allowance Time", data: 'mealAllowanceTime' },
            { title: "Working day", data: 'workingDay' },
            { title: "latenessTolerance", data: 'latenessTolerance' },
            { title: "Overtime Rate", data: 'overtimeRate', visible: true },
            { title: "Extra Overtime Rate", data: 'extraOvertimeRate', visible: true },
            { title: "Action", data: 'actionButtons', orderable: false, searchable: false },
            { title: "Exceptional Overtime Rate", data: 'exceptionalOvertimeRate', visible: false },
            { title: "Exceptional Overtime Hours", data: 'exceptionalOvertimeHours', visible: false },
            { title: "Working Hours Per Month", data: "hoursPerMonth", visible: false },
            { title: "No. Of Days Per Month", data: "daysPerMonth", visible: false },
        ]
        // Days of the week
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

        daysOfWeek.forEach(day => {
            columns.push(
                { title: `${day} Start Time`, data: `${day.toLowerCase()}StartTime`, visible: false },
                { title: `${day} End Time`, data: `${day.toLowerCase()}EndTime`, visible: false },
                { title: `${day} Meal Allowance Time`, data: `${day.toLowerCase()}MealAllowanceTime`, visible: false },
                { title: `${day} Working Day`, data: `${day.toLowerCase()}WorkingDay`, visible: false },
                { title: `${day} Lateness Tolerance`, data: `${day.toLowerCase()}LatenessTolerance`, visible: false }
            );
        });

        $('#shiftTable').DataTable({
            columns: columns
        });
    }
    reloadShiftTable();
}

function reloadShiftTable() {
    var table = $('#shiftTable').DataTable();

    $.ajax({
        type: "POST",
        url: "configs.aspx/loadWorkShifts", //It calls our web method  
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (successmsg) {
            table.clear();

            var aggregatedData = {};

            $.each(successmsg.d, function (i, wrapper) {
                $.each(wrapper.Templates, function (j, item) {
                    var key = item.templateID;
                    if (!aggregatedData[key]) {
                        aggregatedData[key] = {
                            "templateKey": key,
                            "description": wrapper.ShiftDescription,
                            "overtimeRate": wrapper.OvertimeRate,
                            "extraOvertimeRate": wrapper.ExtraOvertimeRate,
                            "exceptionalOvertimeRate": wrapper.ExceptionalOvertimeRate,
                            "exceptionalOvertimeHours": wrapper.ExceptionalOvertimeHours,
                            "mealAllowanceAmount": wrapper.MealAllowanceAmount,
                            "day": findDayFromInteger(item.dayOfTheWeek),
                            "shiftStart": item.workingDay ? formatTimeSpan(item.shiftStart) : '-',
                            "shiftEnd": item.workingDay ? formatTimeSpan(item.shiftEnd) : '-',
                            "mealAllowanceTime": item.workingDay ? formatTimeSpan(item.mealAllowanceTime) : '-',
                            "workingDay": item.workingDay ? 'Yes' : 'No',
                            "latenessTolerance": item.workingDay ? item.latenessToleranceMinutes + ' min' : '-',
                            "hoursPerMonth": wrapper.hoursPerMonth,
                            "daysPerMonth": wrapper.daysPerMonth,
                            "actionButtons": '<button type="button" class="btn btn-icon btn-primary edit-btn" data-toggle="modal" data-target="#scheduleModal"><i class="bi bi-pencil"></i></button>'
                        };
                    } else {
                        aggregatedData[key].day += '<br>' + findDayFromInteger(item.dayOfTheWeek);
                        if (item.workingDay) {
                            aggregatedData[key].shiftStart += '<br>' + formatTimeSpan(item.shiftStart);
                            aggregatedData[key].shiftEnd += '<br>' + formatTimeSpan(item.shiftEnd);
                            aggregatedData[key].mealAllowanceTime += '<br>' + formatTimeSpan(item.mealAllowanceTime);
                            aggregatedData[key].latenessTolerance += '<br>' + item.latenessToleranceMinutes + ' min';
                        }
                        else {
                            aggregatedData[key].shiftStart += '<br>' + '-';
                            aggregatedData[key].shiftEnd += '<br>' + '-';
                            aggregatedData[key].mealAllowanceTime += '<br>' + '-';
                            aggregatedData[key].latenessTolerance += '<br>' + '-';
                        }
                        aggregatedData[key].workingDay += '<br>' + (item.workingDay ? 'Yes' : 'No');
                    }
                    // Populate based on the day of the week
                    var dayOfWeek = findDayFromInteger(item.dayOfTheWeek);
                    var dayPrefix = dayOfWeek.toLowerCase(); // e.g., 'sunday', 'monday', etc.
                    aggregatedData[key][dayPrefix + "StartTime"] = item.workingDay ? formatTimeSpan(item.shiftStart) : '';
                    aggregatedData[key][dayPrefix + "EndTime"] = item.workingDay ? formatTimeSpan(item.shiftEnd) : '';
                    aggregatedData[key][dayPrefix + "MealAllowanceTime"] = item.workingDay ? formatTimeSpan(item.mealAllowanceTime) : '';
                    aggregatedData[key][dayPrefix + "WorkingDay"] = item.workingDay;
                    aggregatedData[key][dayPrefix + "LatenessTolerance"] = item.workingDay ? item.latenessToleranceMinutes : '';
                });
            });

            $.each(aggregatedData, function (i, aggregatedRow) {
                table.row.add(aggregatedRow);
            });

            table.draw();
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        },
        error: function (xhr, status, error) {
            console.log(error);
            console.log(status);
        }
    });
}

function formatTimeSpan(timeSpan) {
    // Ensure hours and minutes are always two digits
    var hours = timeSpan.Hours.toString().padStart(2, '0');
    var minutes = timeSpan.Minutes.toString().padStart(2, '0');

    // For hh:mm format
    var formattedTime = hours + ':' + minutes;


    return formattedTime;
}

function createShift() {
    var mode = $('#saveChangesShiftCreation').data('mode');
    var endpoint = mode === 'update' ? 'configs.aspx/updateShift' : 'configs.aspx/createShift';
    var templateKey = mode === 'update' ? $('#saveChangesShiftCreation').data('templateKey') : null;

    var formData = {
        Templates: [],
        ShiftDescription: $('#shiftDescription').val(),
        OvertimeRate: parseFloat($('#overtimeRate').val()) || 1,
        ExtraOvertimeRate: parseFloat($('#extraOvertimeRate').val()) || 1,
        ExceptionalOvertimeRate: parseFloat($('#exceptionalOvertimeRate').val()) || 1,
        ExceptionalOvertimeHours: parseFloat($('#exceptionalOvertimeHours').val()) || 999,
        MealAllowanceAmount: parseFloat($('#mealAllowanceAmount').val()) || 0,
        hoursPerMonth: parseFloat($('#hoursPerMonth').val()) || 0,
        daysPerMonth: parseFloat($('#numberDaysWorked').val()) || 0
    };

    var daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    for (var i = 0; i < daysOfWeek.length; i++) {
        var day = daysOfWeek[i];
        var isWorkingDay = $('#' + day + 'WorkingDay').is(':checked');
        var shiftStart = isWorkingDay ? $('#' + day + 'StartTime').val() : 0;
        var shiftEnd = isWorkingDay ? $('#' + day + 'EndTime').val() : 0;
        var mealAllowanceTime = isWorkingDay ? $('#' + day + 'MealAllowanceTime').val() : 0;

        if (isWorkingDay && (shiftStart === '' || shiftEnd === '')) {
            displayWarningHtml('Both start and end times must be specified for <b>' + day.charAt(0).toUpperCase() + day.slice(1) + '</b>.');
            return; // Stop the function execution if either time is missing
        }

        // Input validation on meal allowance time
        if (isWorkingDay && mealAllowanceTime === '') {
            displayWarningHtml('Meal allowance time must be specified for <b>' + day.charAt(0).toUpperCase() + day.slice(1) + '</b>.');
            return; // Stop the function execution if meal allowance time is missing
        }

        formData.Templates.push({
            dayOfTheWeek: i,
            shiftStart: shiftStart,
            shiftEnd: shiftEnd,
            mealAllowanceTime: mealAllowanceTime,
            workingDay: $('#' + day + 'WorkingDay').is(':checked') ? 1 : 0,
            latenessToleranceMinutes: parseInt($('#' + day + 'LatenessTolerance').val(), 10) || 0
        });
    }

    var dataToSend = { shiftTemplateWrapper: formData };
    sessionStorage.setItem('shiftTemplateWrapper', JSON.stringify(dataToSend));

    if (mode === 'update') {
        var dataToSend = {
            shiftTemplateWrapper: formData,
            templateKey: templateKey
        };
    }

    $.ajax({
        url: endpoint,
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify(dataToSend),
        success: function (response) {
            // Handle success
            displaySuccessMessage('Schedule saved successfully!');
            reloadShiftTable();
        },
        error: function (xhr, status, error) {
            console.log(error);
            console.log(status);
        }
    });
}

function loadTimesheetDefaults() {
    var emp_pin = $('.clsempid').val();
    var jwtToken = getCookie("jwttoken");

    jQuery.ajax({
        type: "POST",
        url: "configs.aspx/GetTimesheetDefaults",
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify({ emp_pin: emp_pin }),
        dataType: "JSON",
        success: function (response) {
            var statusData = JSON.parse(response.d);
            setToggleStatus(statusData);
        },
        error: function (xhr, status, error) {
            console.error("Error occurred: ", status, error);
        }
    });
}

function removeRow(btn) {
    $(btn).closest('.row').slideUp(function () {
        $(this).remove();
    });
}


