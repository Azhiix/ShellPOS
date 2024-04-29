$(document).ready(function () {

    loadEmployees();
    populateSelectElement();
    initEvents();

});

function initEvents() {
    $('#flexSwitchChecked').on('change', function () {
        if (this.checked) {
            // If the checkbox is checked, add 'selected' class to all employee buttons
            $('.employee-btn').addClass('selected');
        } else {
            // If the checkbox is unchecked, remove 'selected' class from all employee buttons
            $('.employee-btn').removeClass('selected');
        }
    });

    $('.multiAbsenceSelect2').select2();
    
    $('.datepk').datepicker({
        format: 'dd/mm/yyyy', // Set the format
        autoclose: true // Ensures the picker closes after a date is selected
    });

    $('#searchBox').on('keyup', function () {
        var searchText = $(this).val().toLowerCase(); // Get the current value and convert it to lowercase for case-insensitive comparison

        $('.employee-btn').each(function () {
            var employeeName = $(this).text().toLowerCase(); // Convert employee name to lowercase for case-insensitive comparison
            if (employeeName.includes(searchText)) {
                $(this).parent().css('display', ''); // Show the employee's parent container (to maintain layout)
            } else {
                $(this).parent().css('display', 'none'); // Hide the employee's parent container
            }
        });
    });

    $('.btnMultipleAbsenceSave').on('click', function () {
        var selectedEmployeeIds = [];
        var selectedPurposeId = $('.multiAbsenceSelect2').val(); // Get selected purpose ID
        var overtimeHour = $('#overtimeHour').val(); // Get the overtime hour, if applicable
        var datePickerValue = $('.datepk').val(); // Raw date value from date picker
        
        // Find all '.employee-btn' elements with class 'selected'
        $('.employee-btn.selected').each(function () {
            // Get the 'data-pin' attribute which stores the employee ID
            var employeeId = $(this).data('pin');
            selectedEmployeeIds.push(employeeId);
        });

         // Preparing data for AJAX call
        var dataToSend = JSON.stringify({
            emp_arr: selectedEmployeeIds,
            absenceType: parseInt(selectedPurposeId, 10),
            overtimeHour: overtimeHour,
            date: datePickerValue
        });

        // Validation check
        if (selectedEmployeeIds.length === 0 || !selectedPurposeId || !dataToSend || (selectedPurposeId === '20' && !overtimeHour)) {
            displayWarningMessage("Please check whether all inputs have been correctly filled");
            return; // Stop the function if validation fails
        }
        //If everything has been correctly filled, save the details
        // AJAX call to saveMultipleEntries
        jQuery.ajax({
            type: "POST",
            url: "multipleAbsence.aspx/saveMultipleEntries",
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            data: dataToSend,
            headers: {
                'Authorization': 'Bearer ' + getCookie("jwttoken")
            },
            success: function (response) {
                // Handle success
                if (response.d == 1)
                    displaySuccessMessage("Entries saved successfully.");
                else displayWarningMessage("Something went wrong, Please contact your service provider");
            },
            error: function (xhr, status, error) {
                // Handle failure
                displayErrorMessage("Failed to save entries: " + error);
            }
        });
    });
}

function loadEmployees() {
    jQuery.ajax({
        type: "POST",
        url: "multipleAbsence.aspx/loadEmployeesForTimesheet",
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        headers: {
            'Authorization': 'Bearer ' + getCookie("jwttoken")
        },
        success: function (lstEmp) {
            // Directly populate employees with all fetched data
            populateEmployees(lstEmp.d);
        },
        failure: function (msg) {
            alert("Failed to load employees: " + msg);
        }
    });
}

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

function retrieveAbsenceTypesFromDatabase(callback) {
    jQuery.ajax({
        type: "GET",
        url: "timesheet.aspx/loadAbsenceTypes",
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstAbsenceTypes) {
            var options = [];
            $.each(lstAbsenceTypes.d, function (index, item) {
                options.push({
                    id: item.absenceTypeID,
                    text: item.absenceName,
                    colour: item.colour
                });
            });
            options.push({
                id: 20,
                text: 'Overtime',
                colour: 'blue'
            });

            if (typeof callback === "function") {
                callback(options);
            }
        },
        error: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function populateSelectElement() {
    retrieveAbsenceTypesFromDatabase(function (absenceTypes) {
        var $select = $('.multiAbsenceSelect2');
        // Empty the select before adding new options
        $select.empty();
        // Add a placeholder
        $select.append(new Option("Purpose", ""));
        $.each(absenceTypes, function (index, item) {
            // Append each absence type as an option
            var option = new Option(item.text, item.id);
            // Optionally, add a data attribute for colour if you plan to use it
            $(option).data('colour', item.colour);
            $select.append(option);
        });
        // Initialize or reinitialize select2 plugin
        $select.select2({
            placeholder: "Purpose",
            allowClear: true
        });

        // Bind the select2:select event to the select element
        $('.multiAbsenceSelect2').on('select2:select', function (e) {
            var selectedOptionID = e.params.data.id; // Get the ID of the selected option

            // Check if the selected option's ID is '20'
            if (selectedOptionID === '20') {
                // Show the "Overtime Hour" input
                $('#overtimeHourContainer').show();
            } else {
                // Hide the "Overtime Hour" input
                $('#overtimeHourContainer').hide();
            }
        });
    });
}