'use strict';

$(document).ready(function () {
    loadAdvances();
    onSingleDelete();
    onMultipleDelete();
    eventsInitialization();
});

function eventsInitialization() {

    $('#idAmtTaken').on('input', function () {
        AmountMonthsDeductChange();
    });

    $('#firstMonthDeductID').on('input', function () {
        AmountMonthsDeductChange();
    });

    $("#dateReceived").datepicker({
        dateFormat: "yy/mm/dd", // You can change the date format according to your preference
        changeMonth: true,
        changeYear: true,
    });
}

function onMultipleDelete() {
    $('#deleteSelected').on('click', function () {
        var ids = [];
        var table = $('#advanceTable').DataTable();
        var rowsToDelete = [];
        // Iterate over all checkboxes in the table
        table.$('input[type="checkbox"]').each(function () {
            // If checkbox is checked
            if (this.checked) {
                // Get the row data and push the ID into the array
                var row = $(this).closest('tr');
                var data = table.row(row).data();
                console.log(data);
                ids.push(data.id);
                rowsToDelete.push(row);
            }
        });

        if (rowsToDelete.length > 0) {
            // SweetAlert2 confirmation dialog
            Swal.fire({
                title: "Are you sure you want to delete these items?",
                showDenyButton: false,
                showCancelButton: true,
                confirmButtonText: "Delete",
            }).then((result) => {
                if (result.isConfirmed) {
                    // Looping through the array of ids
                    var deletedCount = 0;
                    for (var i = 0; i < ids.length; i++) {
                        var id = ids[i];
                        // Your logic here
                        jQuery.ajax({
                            type: "POST",
                            url: "advances.aspx/deleteAdvanceContract",
                            data: JSON.stringify({ id: id }),
                            async: false,
                            contentType: "application/json; charset=utf-8",
                            dataType: "JSON",
                            success: function (msg) {
                                if (msg.d == 0 || msg.d == 9) {
                                    displayErrorMessage("An error has occurred. Error code: 0x094F", true);
                                } else if (msg.d == 1) {
                                    deletedCount++;
                                }
                            },
                            failure: function (msg) {
                                displayErrorMessage(msg, true);
                            }
                        });
                        table.row(rowsToDelete[i]).remove().draw();
                    }
                    if (deletedCount > 0) {
                        displaySuccessMessage("Advances successfully deleted");
                        Swal.fire("Deleted!", "", "success");
                    }
                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                }
            });
        } else {
            // Show a message if no items are selected
            Swal.fire("No items selected", "Please select items to delete.", "warning");
        }
    });
}

function onSingleDelete() {
    $('#advanceTable tbody').on('click', 'button.delete-btn', function () {
        var table = $('#advanceTable').DataTable();
        var row = $(this).closest('tr');
        var data = table.row(row).data(); // Get the data for this row

        // SweetAlert2 confirmation dialog
        Swal.fire({
            title: "Do you want to delete this item?",
            showCancelButton: true,
            confirmButtonText: "Delete",
        }).then((result) => {
            if (result.isConfirmed) {
                // Add your logic to delete the row from the server
                var id = data.id;
                jQuery.ajax({
                    type: "POST",
                    url: "advances.aspx/deleteAdvanceContract",
                    data: JSON.stringify({ id: id }),
                    async: false,
                    contentType: "application/json; charset=utf-8",
                    dataType: "JSON",
                    success: function (msg) {
                        if (msg.d == 0 || msg.d == 9) {
                            displayErrorMessage("An error has occurred. Error code: 0x094F", true);
                        } else if (msg.d == 1) {
                            displaySuccessMessage("Advance successfully deleted");
                        }
                    },
                    failure: function (msg) {
                        displayErrorMessage(msg, true);
                    }
                });
                // If AJAX call is successful, remove the row from the table
                table.row(row).remove().draw();
                Swal.fire("Deleted!", "", "success");
            } else if (result.isDenied) {
                Swal.fire("Changes are not saved", "", "info");
            }
        });
    });
}

function loadAdvances() {
    if (!$.fn.dataTable.isDataTable('#advanceTable')) {
        var table = $('#advanceTable').DataTable({
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
        var table = $('#advanceTable').DataTable();
    }
    var deleteButtonHtml = '<button type="button" class="btn btn-icon btn-danger delete-btn"><i class="bi bi-trash""></i></button>';


    $.ajax({
        type: "GET",
        url: "advances.aspx/loadAdvanceContracts", //It calls our web method  
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (successmsg) {
            //clear existing data
            table.clear();

            //Add new Data
            $.each(successmsg.d, function (i, item) {
                var status = findAdvanceStatus(item);

                var rowData = {
                    "checkbox": '',
                    "emp_name": item.emp_name,
                    "amtTaken": item.amtTaken,
                    "dateReceived": ToJavaScriptDateTime(item.dateReceived).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
                    "installments": item.installments,
                    "firstMonthDeduct": ToJavaScriptDateTime(item.firstMonthDeduct).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                    "lastMonthDeduct": ToJavaScriptDateTime(item.lastMonthDeduct).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
                    "status": status,
                    "deleteButton": '<button type="button" class="btn btn-icon btn-danger delete-btn"><i class="bi bi-trash"></i></button>',
                    "id": item.id
                };
                table.row.add(rowData);
            });

            table.draw();
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function ToJavaScriptDateTime(value) {
    var pattern = /Date\(([^)]+)\)/;
    var results = pattern.exec(value);
    return new Date(parseFloat(results[1]));
}

function findAdvanceStatus(row) {
    /* Return a badge-success object if the advance is completed
     * Else, return a badge-danger object.
     */
    var months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var today = new Date();
    var currentMonth = today.getMonth();
    var currentYear = today.getFullYear();
    var rowMonth = ToJavaScriptDateTime(row.lastMonthDeduct).getMonth();
    var rowYear = ToJavaScriptDateTime(row.lastMonthDeduct).getFullYear();

    if (rowYear == currentYear) {
        //this means that the year is the same and we can compare the months only
        if (rowMonth < currentMonth) {
            //contract expired
            return "<span class='badge badge-success'>Completed</span>";
        }
        else {
            return "<span class='badge badge-danger'>Not completed yet</span>";
        }
    } if (rowYear < currentYear) {
        //this means that the year is older. Meaning that the contract has already expired.
        return "<span class='badge badge-success'>Completed</span>";
    }
    else {
        return "<span class='badge badge-danger'>Not completed yet</span>";
    }
}

function populateEmployeeList() {
    var select = $('#employeeList');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder

    $.ajax({
        type: "GET",
        url: "advances.aspx/loadEmployees", // It calls your web method
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (response) {
            var items = response.d;

            // Append options based on the response
            items.forEach(function (item) {
                var option = new Option(item.emp_lastname + " " + item.emp_firstname, item.emp_pin, false, false);
                select.append(option); // Append the option
            });
            // Initialize Select2 before the AJAX call
            select.select2({
                placeholder: "Select an employee", // Optional: Add placeholder text
                minimumResultsForSearch: 0 // This option will display the search box
            });
            // Update the Select2 control after appending all options
            //select.trigger('change');
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });

}

function AmountMonthsDeductChange() {
    //first we need to get the values of the other textboxes
    var amntTaken = $("#idAmtTaken").val();
    var firstMonthDeduct = $("#firstMonthDeductID").val();
    var AmountMonthsDeduct = $("#idAmountMonthsDeduct").val();

    //calculating the last month to deduct
    var firstMonth = new Date(firstMonthDeduct).getMonth();// remember that this function returns the month value 1 less than the actual one. January is month number 0.
    var firstMonthYear = new Date(firstMonthDeduct).getFullYear();
    var finalMonthOfDeduction = parseInt(AmountMonthsDeduct) + (parseInt(firstMonth));
    if (finalMonthOfDeduction > 12) {
        var lastMonth = finalMonthOfDeduction - 12;
        var lastYear = parseInt(firstMonthYear) + 1;
    }
    else {
        var lastMonth = finalMonthOfDeduction;
        var lastYear = firstMonthYear;
    }

    if (lastMonth > 12) {
        displayWarningMessage("This contract is too long. Please decrease the amount of months within which the advance will be deducted");
        $("#IDBtnSaveAdvance").hide();
    }
    else {
        var months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        var selectedMonthName = months[(lastMonth - 1)];

        $("#idLastMonthDeduct").val(selectedMonthName + " " + lastYear);
        $("#IDBtnSaveAdvance").show();

        var installmentsAmount = amntTaken / AmountMonthsDeduct;
        var test = selectedMonthName + " " + lastYear;
        $("#idLastMonthDeduct").val(selectedMonthName + " " + lastYear);
        $("#idInstallmentsTxtBox").val(installmentsAmount);
    }
}

function checkIfAdvanceExists() {
    return new Promise(function (resolve, reject) {
        var empPin = $("#employeeList").val();
        //need to convert the first month deduct variable to the same format as that of the final month deduct
        //why is this done even though we are not displaying the name of the first month?
        //this is done because we are sending the firstmonth to the database and the day should be 1 instead of the current day.
        //when we do not use any day and send only the month and year to the DB, the day initialised is automatically 1
        var firstMonthDeduct = $("#firstMonthDeductID").val();
        var firstMonth = new Date(firstMonthDeduct).getMonth();// remember that this function returns the month value 1 less than the actual one. January is month number 0.
        var firstMonthYear = new Date(firstMonthDeduct).getFullYear();
        var months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];

        var firstMonthSelectedMonthName = months[(firstMonth)];
        firstMonthDeduct = firstMonthSelectedMonthName + " " + firstMonthYear;
        var finalMonthDeduct = $("#idLastMonthDeduct").val();

        jQuery.ajax({
            type: "POST",
            url: "advances.aspx/checkForExistingAdvance",
            data: JSON.stringify({ emp_pin: empPin, firstMonthDeduct: firstMonthDeduct, finalMonthDeduct: finalMonthDeduct }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (msg) {
                if (msg.d > 0) {
                    resolve(false);
                } else if (msg.d == 0) {
                    resolve(true);
                } else {
                    reject("An error occurred while checking if advance exists.");
                }
            },
            failure: function (msg) {
                reject("An error occurred while checking if advance exists.");
            }
        });
    });
}
function initiateSaveAdvanceContract() {
    checkIfAdvanceExists().then(function (AdvanceNotExist) {
        if (AdvanceNotExist) {
            saveAdvanceContract();
        } else {
            Swal.fire({
                title: "Are you sure?",
                text: "You won't be able to revert this!",
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Yes, delete it!"
            }).then((result) => {
                if (result.isConfirmed) {
                    Swal.fire({
                        title: "Deleted!",
                        text: "Your file has been deleted.",
                        icon: "success"
                    });
                }
            });
            displayWarningMessage("Advance creation cancelled by user or due to existing advance.");
        }
    }).catch(function (error) {
        console.error("Error checking advance existence:", error);
       
    });
}
function saveAdvanceContract() {





    var empPin = $("#employeeList").val();
    var dateChosen = $("#dateReceived").val();
    var amntTaken = $("#idAmtTaken").val();
    var firstMonthDeduct = $("#firstMonthDeductID").val();
    // Conversion to expected format
    var firstMonth = new Date(firstMonthDeduct).getMonth();
    var firstMonthYear = new Date(firstMonthDeduct).getFullYear();
    var months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var firstMonthSelectedMonthName = months[firstMonth];
    firstMonthDeduct = firstMonthSelectedMonthName + " " + firstMonthYear;
    var finalMonthDeduct = $("#idLastMonthDeduct").val();
    var installmentsPerMonth = $("#idInstallmentsTxtBox").val();
    var AmountMonthsDeduct = $("#idAmountMonthsDeduct").val();

    jQuery.ajax({
        type: "POST",
        url: "advances.aspx/saveAdvanceContract",
        data: JSON.stringify({
            emp_pin: empPin,
            dateChosen: dateChosen,
            amntTaken: amntTaken,
            firstMonthDeduct: firstMonthDeduct,
            finalMonthDeduct: finalMonthDeduct,
            installmentsPerMonth: installmentsPerMonth,
            amtMonthsTaken: AmountMonthsDeduct
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            if (msg.d > 1) {
                Swal.fire('Success!', 'Advance contract successfully saved.', 'success')
                    .then(function () {
                        loadAdvances();
                    });

            } else if (msg.d == 0) {

                Swal.fire('Error!', 'An error has occurred.', 'error');

            }

          
              
          
             else if (msg.d == 9) {
                Swal.fire('Error!', 'An error has occurred.', 'error');
            }
        },
        failure: function (msg) {
            Swal.fire('Error!', 'An error has occurred.', 'error');
        }
    });
}



function deleteSingleAdvanceRow() {
    var test = 0;
}
