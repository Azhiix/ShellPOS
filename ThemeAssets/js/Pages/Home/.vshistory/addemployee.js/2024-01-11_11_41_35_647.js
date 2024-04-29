'use strict';
var addempjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                findUninitializedEmployees();
                $(".datepk").datepicker();
            });
        },

        initDept: function () {
            jQuery.ajax({
                type: "GET",
                url: "addemployee.aspx/loadDepartments", //It calls our web method  
                data: '{}',
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (lstDept) {
                    if (lstDept.d == null)
                        window.location.href = '/Login_New.aspx'; // Update with your login page URL
                    else {
                        // Handle the response data
                        var select = $('.deptSelect');

                        // Clear existing options, keeping the placeholder if necessary
                        select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder

                        // Loop through each item in the returned data
                        $.each(lstDept.d, function (index, item) {
                            // Append new options
                            select.append(new Option(item.department_name, item.id));
                        });

                        // Refresh the Select2 widget
                        select.select2();
                    }
                },
                failure: function (msg) {
                    alert(msg);
                }
            });
        },

    };

}();

// Call main function init
addempjs.init();
addempjs.initDept();

function syncData() {

    jQuery.ajax({
        type: "POST",
        url: "addemployee.aspx/getAttendance", //It calls our web method
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        aync: false,
        success: function (msg) {

            alert(msg.d);
            findUninitializedEmployees();
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function findUninitializedEmployees() {

    document.getElementById('loadingOverlay').style.display = 'flex';
    jQuery.ajax({
        type: "GET",
        url: "addemployee.aspx/loadEmployeesUninitialized", //It calls our web method  
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstEmp) {
            $(".uninitEmps").empty(); // Clear existing content
            $.each(lstEmp.d, function (index, emp) {
                let firstNameDisplay = emp.firstName ? ` - ${emp.firstName}` : '';
                let employeeButton = `
                    <button class="btn btn-sm btn-flex btn-light btn-active-primary fw-bolder changeEmployeeBtn mt-2" onclick="displayInitializationPage('${emp.img}', '${emp.emp_pin}');">
                        <img id="empFaceImg" src="data:image/png;base64,${emp.img}" alt="Embedded Image" width="35" height="45">
                        &nbsp Employee ID: &nbsp ${emp.emp_pin}${firstNameDisplay}
                    </button><br/>`;

                $(".uninitEmps").append(employeeButton);
            });

        },
        failure: function (msg) {
            alert(msg);
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
    $(".addempImage").html('<img src="data: image / png; base64, ' + img + '" alt="Embedded Image" style="border-radius: 80px;">');
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
        resAddress: $(".empAddrNumberInput").val() + " " + $(".empAddrRoadInput").val() + " " + $(".empAddrCityInput").val() ,
        bankName: $(".bankSelect").val(),
        bankNum: $(".empAccNoInput").val(),
        comments: $(".empCommentInput").val(),
        img: $("#empFaceImg").attr('src').split('base64,')[1]
    };

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
        alert(`Please check whether all inputs have been filled. The field ${emptyFieldName} is empty.`);
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
                    alert("Successfully Saved the details");
                else alert("Employee has already been registered. Please check the existing employee list");
            },
            failure: function (msg) {
                alert(msg);
            }
        });
    }
}
