'use strict';
var addempjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                $('#loadingDiv').hide();
                findUninitializedEmployees();
            });
        },

        initDeptBranchesContracts: function () {
            jQuery.ajax({
                type: "GET",
                url: "addemployee.aspx/loadDepartmentsBranchesContracts", //It calls our web method  
                data: '{}',
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (lstDeptBranchesContracts) {
                    if (lstDeptBranchesContracts.d == null)
                        window.location.href = '/Login_New.aspx?discon=true'; // Update with your login page URL
                    else {
                        // Handle the response data
                        var deptSelect = $('.deptSelect');
                        var contractSelect = $('.contractSelect');
                        var branchSelect = $('.branchSelect');

                        var listDepartments = lstDeptBranchesContracts.d.listDepts
                        var listContractTypes = lstDeptBranchesContracts.d.lstContractTypes
                        var listBranches = lstDeptBranchesContracts.d.lstBranches

                        // Loop through each item in the returned data
                        $.each(listDepartments, function (index, item) {
                            // Append new options
                            deptSelect.append(new Option(item.department_name, item.id));
                        });

                        $.each(listContractTypes, function (index, item) {
                            contractSelect.append(new Option(item.contractType, item.id))
                        })

                        $.each(listBranches, function (index, item) {
                            branchSelect.append(new Option(item.companyName, item.id))
                        })

                        // Refresh the Select2 widget
                        deptSelect.select2();
                        contractSelect.select2();
                        branchSelect.select2();
                    }
                },
                failure: function (msg) {
                    displayErrorMessage(msg, true);
                }
            });
        },

    };

}();

// Call main function init
addempjs.init();
addempjs.initDeptBranchesContracts();

function syncData() {

    // Disable the button and change text to 'Loading'
    $('.changeEmployeeBtn').prop('disabled', true).text('Loading...');

    jQuery.ajax({
        type: "POST",
        url: "addemployee.aspx/getAttendance",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: true,
        success: function (response) {
            if (response.d != null) {

                var data = response.d;

                if (fpConnect == 1) { // Assuming fpConnect >= 0 is success
                    displaySuccessMessage("Device(s) Successfully Synced");
                } else {
                    displayErrorMessage("Device(s) Could not be synced. Please contact your system admin");
                }
                findUninitializedEmployees();
            }
            else displayErrorMessage("This feature is not compatible with your device", true);

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        },
        complete: function () {
            // Re-enable the button and reset its text after AJAX is complete
            $('.changeEmployeeBtn').prop('disabled', false).text('Sync Device Data');
        },
    });
}

function findUninitializedEmployees() {

    $('#loadingDiv').show();
    jQuery.ajax({
        type: "GET",
        url: "addemployee.aspx/loadEmployeesUninitialized", //It calls our web method  
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstEmp) {
            $(".uninitEmps").empty(); // Clear existing content
            $.each(lstEmp.d, function (index, emp) {
                let firstNameDisplay = emp.emp_firstname ? ` - ${emp.emp_firstname}` : '';
                let employeeButton = `
                    <button class="btn btn-sm btn-flex btn-light btn-active-primary fw-bolder changeEmployeeBtn mt-2" onclick="displayInitializationPage('${emp.img}', '${emp.emp_pin}');">
                        <img id="empFaceImg" src="data:image/png;base64,${emp.img}" alt="Embedded Image" width="35" height="45">
                        
                        &nbsp Employee ID: &nbsp ${emp.emp_pin}${firstNameDisplay}
                    </button><br/>`;

                $(".uninitEmps").append(employeeButton);

            });

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });

    //alert("The page should now find unintialized employees");
}

function displayInitializationPage(img, empPin) {
    // Hide the element with a fade-out effect, duration set to 300 milliseconds
    $(".newEmployeesNotInitialized").fadeOut(300, function () {
        // This callback function will be executed after the fadeOut is complete
        // Now, you can display the other element with a fadeIn effect
        $(".clsAddEmployeePage").fadeIn(300).removeClass("clsAddEmployeePage");
    });

   

    //Now displaying the image in bigger size

    $(".addempImage").html(`<img src="data: image / png; base64, ${img}  "  class='add-emp-image' alt="Embedded Image" style="border-radius: 80px; "> 

   

    <div>
 <i class="fas fa-sync-alt refresh-icon" onclick="refreshEmpImage()" ></i>

  ></i>
  
    
    </div>
        
    `);
    $(".empPinNoInput").val(empPin);
}



function saveInitDetails() {

    var clsEmployee = {
        emp_pin: $(".empPinNoInput").val(),
        nid: $(".empNIDInput").val(),
        emp_firstname: $(".empFNameInput").val(),
        dependants: $(".empDependantsInput").val(),
        emp_lastname: $(".empLNameInput").val(),
        email: $(".empEmailInput").val(),
        telNum: $(".empTelInput").val(),
        hireDateString: $(".datepk").val(),
        department: $(".deptSelect").val(),
        position: $(".empPositionInput").val(),
        resAddress: $(".empAddrNumberInput").val() + " " + $(".empAddrRoadInput").val() + " " + $(".empAddrCityInput").val(),
        bankName: $(".bankSelect").val(),
        bankNum: $(".empAccNoInput").val(),
        comments: $(".empCommentInput").val(),
        img: $("#empFaceImg").attr('src').split('base64,')[1],
        emp_type: $(".contractSelect").val(),

        branchId: $(".branchSelect").val()

    };

    function refreshEmpImage() {
        $('.refresh-icon').click(function () {
            console.log('Hello');
        });
    }
    


    var isAnyFieldEmpty = false;
    var emptyFieldName = "";
    for (var key in clsEmployee) {
        // Skip the check for the "comments" field
        if (key === "comments") {
            continue;
        }

        // Check if any other field is empty
        if (clsEmployee[key] === "" || clsEmployee[key] == null) {
            emptyFieldName = key;
            isAnyFieldEmpty = true;
            break;
        }
    }

    if (isAnyFieldEmpty) {
        displayWarningHtml(`Please check whether all inputs have been filled. The field <b>${emptyFieldName}</b> is empty.`);
    }

    else {
        jQuery.ajax({
            type: "POST",
            url: "addemployee.aspx/saveInitDetails", //It calls our web method
            data: JSON.stringify({
                employee: clsEmployee
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            aync: false,
            success: function (msg) {
                if (msg.d == true)
                    displaySuccessMessage("Successfully Saved the details");
                else displayErrorMessage("An error has occured. Please check the existing employee list to ensure employee has not been created");
            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            }
        });
    }
}
