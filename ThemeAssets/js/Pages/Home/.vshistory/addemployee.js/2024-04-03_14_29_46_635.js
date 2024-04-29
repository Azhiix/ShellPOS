'use strict';

const EmployeeManager = (function () {
    const selectors = {
        loadingDiv: '#loadingDiv',
        deptSelect: '.deptSelect',
        contractSelect: '.contractSelect',
        branchSelect: '.branchSelect',
        changeEmployeeBtn: '.changeEmployeeBtn',
        uninitEmps: '.uninitEmps',
        addempImage: '.addempImage',
        empPinNoInput: '.empPinNoInput',
        empFNameInput: '.empFNameInput',
        newEmployeesNotInitialized: '.newEmployeesNotInitialized',
        clsAddEmployeePage: '.clsAddEmployeePage',
        empNIDInput: '.empNIDInput',
        empLNameInput: '.empLNameInput',
        empEmailInput: '.empEmailInput',
        empTelInput: '.empTelInput',
        datepk: '.datepk',
        empPositionInput: '.empPositionInput',
        empAddrNumberInput: '.empAddrNumberInput',
        empAddrRoadInput: '.empAddrRoadInput',
        empAddrCityInput: '.empAddrCityInput',
        bankSelect: '.bankSelect',
        empAccNoInput: '.empAccNoInput',
        empCommentInput: '.empCommentInput',
        empDependantsInput: '.empDependantsInput'
    };

    function init() {
        $(document).ready(function () {
            $(selectors.loadingDiv).hide();
            findUninitializedEmployees();
        });
    }

    function initDeptBranchesContracts() {
        ajaxCall("GET", "addemployee.aspx/loadDepartmentsBranchesContracts", '{}', processDeptBranchesContracts, redirectToLogin);
    }

    function syncData() {
        changeButtonState(selectors.changeEmployeeBtn, true, 'Loading...');
        ajaxCall("POST", "addemployee.aspx/getAttendance", '{}', processAttendanceSync, null, function () {
            changeButtonState(selectors.changeEmployeeBtn, false, 'Sync Device Data');
        });
    }

    function findUninitializedEmployees() {
        $(selectors.loadingDiv).show();
        ajaxCall("GET", "addemployee.aspx/loadEmployeesUninitialized", '{}', displayUninitializedEmployees);
    }

    function handleRefresh() {
        const employeeId = $(selectors.empPinNoInput).val();
        ajaxCall("GET", "addemployee.aspx/loadEmployeeImage", { emp_pin: employeeId }, updateEmployeeImage);
    }

    function saveInitDetails() {
        const employeeData = collectEmployeeData();
        if (validateEmployeeData(employeeData)) {
            ajaxCall("POST", "addemployee.aspx/saveInitDetails", JSON.stringify({ employee: employeeData }), confirmSave);
        }
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
            async: false,
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
