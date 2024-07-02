//this function is called in the document ready in the configs.js
function InitializeEventsForCreateAndEditButtons() {
    // Event for Create button
    $(".createBtn").click(function (event) {
        event.preventDefault();

        //We pass template ID as 0 to indicate that we are creating a new template. The server automatically handles this
        SaveOrEditTemplate(0);
    });

    // Event for Edit button
    $(".editBtn").click(function (event) {
        event.preventDefault();

        // Retrieve the template ID from the hidden input field
        var templateId = $('#templateId').val();
        SaveOrEditTemplate(templateId);
    });
}

function showEmptyTemplateContain() {
    $(".templateContainer").show()
    loadRelevantEmployees();
    $(".CreateModifyTemplateBtn").hide();
    $(".createBtnDiv").show();
    $(".editBtnDiv").hide();
    $(".templateListContainer").hide();

    //clear all input fields
    $('#templateName').val('');
    $('#templateId').val('');
    $('#leavesCheckbox').prop('checked', false);
    $('#advancesCheckbox').prop('checked', false);
    //clear the select2 dropdowns
    $('.initialApproval').val(null).trigger('change');
    $('.departmentalApproval').val(null).trigger('change');
    $('.seniorManagementApproval').val(null).trigger('change');
    $('.finalApproval').val(null).trigger('change');
    //clear the employee list
    $('.employee-btn').removeClass('selected');
}

function DisplayTemplateModificationButtons() {
    $(".settingsBtns").css("display", "none");
    $(".hierarchyManagement").css("display", "block");
    $(".CreateModifyTemplateBtn").css("display", "block");
    $(".templateListContainer").hide();
}

function showModificationTemplateCont() {

    loadRelevantEmployees();
    $(".CreateModifyTemplateBtn").hide()
    $(".createBtnDiv").hide();
    $(".editBtnDiv").show();

    // AJAX call to fetch all templates
    $.ajax({
        type: "POST",
        url: "configs.aspx/GetAllTemplates",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        headers: {
            'Authorization': 'Bearer ' + getCookie("jwttoken")
        },
        success: function (response) {
            // The response.d contains the array of templates
            var templates = response.d;

            var templatesDiv = $(".templateListContainer").empty().show();

            // Append the header as its own row
            var headerRow = $('<div class="row justify-content-center"></div>');
            var headerCol = $('<div class="col-md-12 text-center mb-3"></div>').text('Existing Templates:');
            headerRow.append(headerCol);
            templatesDiv.append(headerRow);

            templates.forEach(function (template) {
                var buttonRow = $('<div class="row justify-content-center"></div>');
                var buttonCol = $('<div class="col-md-12 text-center mb-2"></div>');

                var templateBtn = $("<a href='#' class='btn btn-sm btn-flex btn-light btn-active-primary fw-bolder templateBtn'></a>")
                    .data({
                        "template-id": template.TempID,
                        "template-name": template.TempName,
                        "first-approval": template.FirstApproval,
                        "departmental-approval": template.DepartmentalApproval,
                        "senior-management-approval": template.SeniorManagementApproval,
                        "final-approval": template.FinalApproval,
                        "for-leave-requests": template.ForLeaveRequests,
                        "for-advance-requests": template.ForAdvanceRequests,
                        "emp-list": JSON.stringify(template.empList) // Storing the employee list as a JSON string
                    })
                    .text(template.TempName);

                // Attach the click event handler to load the template details
                templateBtn.click(function (event) {
                    event.preventDefault(); // Prevent the default action

                    var templateData = {
                        templateId: $(this).data('template-id'),
                        templateName: $(this).data('template-name'),
                        firstApproval: $(this).data('first-approval'),
                        departmentalApproval: $(this).data('departmental-approval'),
                        seniorManagementApproval: $(this).data('senior-management-approval'),
                        finalApproval: $(this).data('final-approval'),
                        forLeaveRequests: $(this).data('for-leave-requests'),
                        forAdvanceRequests: $(this).data('for-advance-requests'),
                        empList: JSON.parse($(this).data('emp-list'))
                    };

                    loadTemplateDetails(templateData);
                    $(".templateContainer").show();
                });

                // Append the button to the column, and the column to the row
                buttonCol.append(templateBtn);
                buttonRow.append(buttonCol);

                // Append the row to the main container
                templatesDiv.append(buttonRow);
            });
        },
        error: function (xhr, status, error) {
            console.error("Failed to load templates: " + error);
        }
    });
}

function loadRelevantEmployees() {
    $.ajax({
        type: "GET",
        url: "configs.aspx/loadEmployees", // It calls your web method
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (response) {

            var lstEmp = response.d;

            var select2Initial = $('.initialApproval');
            var select2Departmental = $('.departmentalApproval');
            var select2SeniorManagement = $('.seniorManagementApproval');
            var select2Final = $('.finalApproval');

            select2Initial.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder
            select2Departmental.empty().append('<option></option>');
            select2SeniorManagement.empty().append('<option></option>');
            select2Final.empty().append('<option></option>');
            var NoOption = new Option("No Approval needed", 0, false, false);
            select2Initial.append(NoOption);
            select2Departmental.append(NoOption);
            select2SeniorManagement.append(NoOption);
            select2Final.append(NoOption);

            // Loop through each item in the returned data
            $.each(lstEmp, function (index, item) {
                var option = new Option(item.emp_lastname + " " + item.emp_firstname, item.emp_pin, false, false);
                // Append new options
                select2Initial.append(option);
                select2Departmental.append(option);
                select2SeniorManagement.append(option);
                select2Final.append(option);
            });

            // Refresh the Select2 widget
            select2Initial.select2();
            select2Departmental.select2();
            select2SeniorManagement.select2();
            select2Final.select2();

            populateEmployees(lstEmp);

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

//This function only creates the small boxes where all company employees are displayed
function populateEmployees(employees) {
    var $employeeList = $("#employeeList");
    $employeeList.empty();

    // Initialize the first row. Do not append it immediately to allow the first employee to be added.
    var $row = $('<div>').addClass('row');

    $.each(employees, function (index, employee) {
        // Append a new row for every 6 elements, including the very first iteration
        if (index % 6 === 0) {
            if ($row.children().length) {
                // Append the current row if it has children already, i.e., not the first iteration
                $employeeList.append($row);
            }
            // Start a new row whether it’s the first iteration or subsequent ones
            $row = $('<div>').addClass('row');
        }

        var $col = $('<div>').addClass('col-md-2 col-sm-4');
        var $btn = $('<button>').attr('type', 'button')
            .addClass('btn employee-btn btn-outline btn-monthps btn-active-secondary')
            .text(employee.emp_firstname + " " + employee.emp_lastname)
            .attr('title', employee.emp_firstname + " " + employee.emp_lastname) // Tooltip for the full name on hover
            .attr('data-pin', employee.emp_pin)
            .on('click', function () {
                $(this).toggleClass('selected'); // Manage selection state
            });

        $col.append($btn);
        $row.append($col);

        // After populating the last employee, ensure the current row gets appended
        if (index === employees.length - 1) {
            $employeeList.append($row);
        }
    });
}

function SaveOrEditTemplate(templateId) {

    var templateName = $('#templateName').val();
    var initialApprovalSelected = $('.initialApproval').val() || '0';
    var departmentalApprovalSelected = $('.departmentalApproval').val() || '0';
    var seniorManagementApprovalSelected = $('.seniorManagementApproval').val() || '0';
    var finalApprovalSelected = $('.finalApproval').val() || '0';
    // Check the state of each checkbox
    var leavesCheckboxChecked = $('#leavesCheckbox').is(':checked') ? '1' : '0';
    var advancesCheckboxChecked = $('#advancesCheckbox').is(':checked') ? '1' : '0';
    var selectedEmployeeIds = [];

    // Find all '.employee-btn' elements with class 'selected'
    $('.employee-btn.selected').each(function () {
        // Get the 'data-pin' attribute which stores the employee ID
        var employeeId = $(this).data('pin');
        selectedEmployeeIds.push(employeeId);
    });

    //Validation Check for the templateToBeSaved. We ensure that all data is correctly filled otherwise we return and do not proceed
    if (!templateName || !initialApprovalSelected || !departmentalApprovalSelected || !seniorManagementApprovalSelected || !finalApprovalSelected || selectedEmployeeIds.length === 0) {
        displayWarningMessage("Please check whether all inputs have been correctly filled");
        return; // Stop the function if validation fails
    }

    // Preparing data for AJAX call
    var templateToBeSaved = JSON.stringify({
        templateId: templateId,
        templateName: templateName,
        initialApproval: parseInt(initialApprovalSelected, 10),
        departmentalApproval: parseInt(departmentalApprovalSelected, 10),
        seniorManagementApproval: parseInt(seniorManagementApprovalSelected, 10),
        finalApproval: parseInt(finalApprovalSelected, 10),
        leavesCheckbox: leavesCheckboxChecked,
        advancesCheckbox: advancesCheckboxChecked,
        emp_arr: selectedEmployeeIds
    });

    jQuery.ajax({
        type: "POST",
        url: "configs.aspx/saveTemplate",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        data: templateToBeSaved,
        headers: {
            'Authorization': 'Bearer ' + getCookie("jwttoken")
        },
        success: function(response) {
            // Handle success
            if (response.d == 1)
                displaySuccessMessage("Template saved successfully.");
            else displayWarningMessage("Something went wrong, Please contact your service provider");
        },
        error: function(xhr, status, error) {
            // Handle failure
            displayErrorMessage("Failed to save Template: " + error);
        }
    });
}

function loadTemplateDetails(templateData) {
    // Set the value of the hidden templateId input
    $('#templateId').val(templateData.templateId);

    // Set the template name
    $('#templateName').val(templateData.templateName);

    // Set the Select2 dropdowns for approvals
    $('.initialApproval').val(templateData.firstApproval.toString()).trigger('change');
    $('.departmentalApproval').val(templateData.departmentalApproval.toString()).trigger('change');
    $('.seniorManagementApproval').val(templateData.seniorManagementApproval.toString()).trigger('change');
    $('.finalApproval').val(templateData.finalApproval.toString()).trigger('change');

    // Set the checkbox states, assuming 1 for checked and 0 for unchecked
    $('#leavesCheckbox').prop('checked', templateData.forLeaveRequests === 1);
    $('#advancesCheckbox').prop('checked', templateData.forAdvanceRequests === 1);

    // Clear previously selected employees in the multiple boxes 
    $('.employee-btn').removeClass('selected');

    // Select the employees associated with this template
    templateData.empList.forEach(function (empId) {
        $('.employee-btn[data-pin="' + empId + '"]').addClass('selected');
    });
}

