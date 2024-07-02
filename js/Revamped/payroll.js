var taxRatesArray;
var totalPAYEDeductions = 0;
var otherTaxableEmoluments = 0;

$(document).ready(function () {
    readFirstUnlockedPeriod();
    findCompanyDefaults();
    loadPeriodDetails();
    populateEmployeeList();
    initEvents();
    BeingCalledByEvents.initDataTablePayroll();
});

const BeingCalledByEvents = {

    // Function to select the next employee
    selectNextEmployee: function () {
        var $current = $('.selectEmpPayroll').find(':selected');
        var $next = $current.next('option');
        if ($next.length) {
            $('.selectEmpPayroll').val($next.val()).trigger('change');
            return $next.val();
        }
        else {
            displayWarningMessage("You are at the last employee.");
            return null;
        }
    },

    // Function to select the previous employee
    selectPreviousEmployee: function () {
        var $current = $('.selectEmpPayroll').find(':selected');
        var $prev = $current.prev('option');

        // Check if the previous option is not the placeholder (assumed to be empty)
        if ($prev.length && $prev.val() !== '') {
            $('.selectEmpPayroll').val($prev.val()).trigger('change');
            return $prev.val();
        } else {
            // Alert the user that there is no previous employee option
            displayWarningHtml("You are already at the first employee.");
            return null;
        }
    },

    initDataTablePayroll: function () {
        var psTable = $('#psTable').DataTable({
            "columnDefs": [
                { "orderable": false, "targets": 0 }, // Make the first column non-orderable if needed
                { "orderable": false, "targets": 1 }, // Adjust as needed for your table
                { "orderable": false, "targets": 2 }, // ...
                { "orderable": false, "targets": 3 }  // ...
            ],
            "order": [], // Prevent automatic ordering on initialization if desired
            "searching": false, // Disable searching if it doesn't make sense for this table
            "paging": false, // Disable paging if it doesn't make sense for this table
            "info": false // Disable info ("Showing 1 to n of n entries") if not needed
        });
    },

    addTableRow: function (context) {
        var $buttonRow = $(context).closest('tr');

        // Make sure you call the destroy() method before making any changes to the table
        var psTable = $('#psTable').DataTable();
        psTable.destroy();

        // Then, insert your new row directly into the HTML table before the "+" button row
        var $newRow = $('<tr><td><input class="form-control" type="text" placeholder="Income Name"></td>' +
            '<td><input class="form-control salary-detail-amount" type="text" placeholder="Income Value"></td>' +
            '<td><input class="form-control" type="text" placeholder="Deduction Name"></td>' +
            '<td><input class="form-control deduction-amount" type="text" placeholder="Deduction Value"></td></tr>');
        $buttonRow.before($newRow);

        // Reinitialize the DataTable
        BeingCalledByEvents.initDataTablePayroll();
    }
}

function initEvents() {
    //When a user selects an employee from the select2
    $('.selectEmpPayroll').on('change', function () {

        var selectedId = $(this).val();

        // Find the selected option based on the value
        var selectedOption = $(this).find('option[value="' + selectedId + '"]');

        //Now we retrieve the month and year from the .selectPeriod div
        var currentMonth = $(".selectPeriod").attr("month");
        var currentYear = $(".selectPeriod").attr("year");

        // Retrieve the text (name) and data attributes from the selected option
        var selectedName = selectedOption.text();
        var position = selectedOption.data('position');
        var hireDate = selectedOption.data('hiredate');
        var image = selectedOption.data('image');

        $("#empNameTimesheet").html(selectedName);

        $("#empPositionTimesheet").html(position);

        $("#empImageTimesheet").attr("src", 'data:image/jpeg;base64,' + image);

        $(".empDateInf").html(formatDotNetJsonDateInAnotherFormat(hireDate));

        var jwtToken = getCookie("jwttoken");

        jQuery.ajax({
            type: "POST",
            url: "payroll.aspx/loadTimesheetSummary", //It calls our web method  
            data: JSON.stringify({ emp_pin: selectedId, month: currentMonth, year: currentYear }),
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (response) {
                if (response.d == null) {
                    window.location.href = '/Login_New.aspx?discon=true';
                }
                else {
                    var finalTimesheetDetails = response.d;
                    $("#idWorkingDays").html(finalTimesheetDetails.workingDays);
                    $("#idPresentDays").html(finalTimesheetDetails.presentDays);
                    $("#idSickLeaves").html(finalTimesheetDetails.sickLeaves);
                    $("#idLocalLeaves").html(finalTimesheetDetails.localLeaves);
                    $("#idUnapprovedLeaves").html(finalTimesheetDetails.leavesWithoutPay);
                    $("#idFreeHoliday").html(finalTimesheetDetails.freeHolidays);
                    $("#idOvertime").html(finalTimesheetDetails.overtimeDurationHours);
                    $("#idLateness").html(finalTimesheetDetails.totalLateness);
                    $("#idNetAdjustment").val(finalTimesheetDetails.totalNetAdjust);
                    $("#idMealAllowance").html(finalTimesheetDetails.mealAllowanceAmount);
                    $("#idHolidayExtraPay").val(finalTimesheetDetails.holidayExtraPayHours);
                    $("#idExceptionalOvertimeHours").val(finalTimesheetDetails.exceptionalOvertimeHours);
                    $("#idAvancesTaken").html(finalTimesheetDetails.advancesTaken);
                    $("#idComments").html(finalTimesheetDetails.comments);

                    if (finalTimesheetDetails.workingDays != 0) { //it means this employee does have a timesheet.
                        //Now we fill the details in the timesheet summary
                        $("#TimesheetZero").css("display", "none");
                        $("#timesheetExists").css("display", "block");
                    }
                    else {
                        //This employee does not have a timesheet.
                        $("#timesheetExists").css("display", "none");
                        $("#TimesheetZero").css("display", "block");
                    }
                }

            },
            error: function (xhr, status, error) {
                console.error("Error occurred: ", status, error);
                // Additional error handling
            }
        });

    });

    // Event handler for your Next button (Employee)
    $('#btnNext').on('click', function () {
        var empPin = BeingCalledByEvents.selectNextEmployee();
    });

    // Event handler for your Previous button(employee)
    $('#btnPrevious').on('click', function () {
        var empPin = BeingCalledByEvents.selectPreviousEmployee();
    });

    $('#psTable').on('click', '.cssPlusBtn', function () {
        // Find the row containing the "+" button
        BeingCalledByEvents.addTableRow(this);
    });

    $('#psTable').on('input', '.salary-detail-amount, .deduction-amount', function () {
        var grossSalary = 0;
        var basicSalary = 0;
        var emolumentsTotal = 0;

        // Iterate over each salary detail amount and add them to calculate the gross salary
        $('.salary-detail-amount').each(function () {

            var isEmolument = $(this).hasClass('isEmolument');
            var amount = 0;

            if ($(this).is('input')) {
                // If the element is an input field
                amount = parseFloat($(this).val());
                if (isEmolument) {
                    emolumentsTotal += amount;
                }
            } else if ($(this).is('span')) {
                // If the element is a span (its the basic salary that is here)
                amount = parseFloat($(this).text());
                basicSalary = parseFloat($(this).text());
            }
            if (!isNaN(amount)) {
                grossSalary += amount;
            }
        });

        //Here we need to recalculate and display the new PAYE as well before cumulating the deductions.
        //Therefore we are passing a dummy value of 0 as the shift details(number of days per month and hours per month) as we dont need them here.
        var taxCalculations = PayrollRelatedFunctions.calculateTaxes(basicSalary, emolumentsTotal, taxRatesArray, totalPAYEDeductions, otherTaxableEmoluments,0,0);

        //Now we just need to redisplay the new tax rates. (We will be displaying only the new PAYE amount,and the PRGF amount will change if the emoluments have changed)
        //When recalculating the deductions when adding/changing anything, we are assuming that the Absences and lateness are not changing and wont need recalculation and redisplay.
        taxCalculations.forEach((taxRate, index) => {
            //if we find PAYE we will display the new amount of PAYE
            if (taxRate.taxName == "PAYE") {
                $(".PAYE").html(Math.round(taxRate.taxAmountEmployee));
            }
            if (taxRate.taxName == "PRGF") {
                $(".PRGF").attr("data-employer-tax-amount", taxRate.taxAmountEmployer);
            }
        });

        var totalDeductions = 0;

        $('.deduction-amount').each(function () {
            var Deductionamount = 0;

            if ($(this).is('input')) {
                // If the element is an input field
                Deductionamount = parseFloat($(this).val());
            } else if ($(this).is('span')) {
                // If the element is a span
                Deductionamount = parseFloat($(this).text());
            }

            if (!isNaN(Deductionamount)) {
                totalDeductions += Deductionamount;
            }

        });

        var netSalary = grossSalary - totalDeductions;

        // Update the display elements
        $("#idGrossSalary").html(Math.round(grossSalary));
        $("#idTotalDeductions").html(Math.round(totalDeductions));
        $("#idNetSalary").html(Math.round(netSalary));

    });

    $('#savePayslipBtn').on('click', function () {
        savePayslip();
    });

    $('body').on('input', '.salary-detail-amount, .deduction-amount', function () {
        var value = $(this).val().replace(/[^0-9]/g, '');
        $(this).val(value);
    });
}

function getCellContent(cell) {
    // Adjust the following lines based on your logic for retrieving cell content
    var input = cell.querySelector('input:not([type="hidden"])');
    var hasIsEmolumentClass = cell.querySelector('.isEmolument') !== null ? 1 : 0;

    if (input) {
        // If a visible input element is found, use its value
        return {
            value: input.value,
            isEmolument: hasIsEmolumentClass
        };
    } else {
        // If no visible input element, use the textContent of the cell, removing @ and after
        var textValue = cell.textContent.trim();
        var valueWithoutRate = textValue.includes('@') ? textValue.split('@')[0].trim() : textValue; //we remove the @ in the tax name
        return {
            value: valueWithoutRate,
            isEmolument: hasIsEmolumentClass
        };
    }
}

function savePayslip() {
    var emp_details = PayrollRelatedFunctions.retrieveAndDisplayEmployeeDetails();
    var emp_pin = emp_details.emp_pin;
    var companyName = $("#companyName").html();
    var companyAddress = $("#companyAddress").html();
    var companyBRN = $("#companyBRN").html();
    var companyERN = $("#companyERN").html();
    var companyVAT = $("#companyVAT").html();
    var companyLogo = $('#companyLogoPerEmployee').attr('src');
    var currentMonth = $(".selectPeriod").attr("month");
    var currentYear = $(".selectPeriod").attr("year");
    var empName = $(".emp_name").html();
    var empPosition = $(".emp_position").html();
    var empHireDate = $(".emp_hireDate").html();
    var empNID = $(".emp_nid").html();

    var period = $(".clsPeriodLength").text();

    var salaryDetails = [];
    var taxCalculations = [];
    var table = document.getElementById("psTable");
    var rows = table.rows;
    for (var i = 1; i < rows.length; i++) {
        var cells = rows[i].cells;
        var salaryDetailNameObj = getCellContent(cells[0]);
        var salaryDetailAmountObj = getCellContent(cells[1]);
        var taxNameObj = getCellContent(cells[2]);
        var taxAmountObj = getCellContent(cells[3]);

        // Access the value and isEmolument properties
        var salaryDetailName = salaryDetailNameObj.value;
        var salaryDetailAmount = salaryDetailAmountObj.value;
        var taxName = taxNameObj.value;
        var taxAmount = taxAmountObj.value;

        // If salaryDetailAmount is not empty string, push
        if (salaryDetailAmount !== "") {
            salaryDetails.push({
                salaryDetailName: salaryDetailName,
                salaryDetailAmount: salaryDetailAmount,
                isEmolument: salaryDetailAmountObj.isEmolument
            });
        }
        if (taxAmount !== "") {
            var $row = $(cells[3]).closest('tr');
            var taxAmountEmployer = $row.find('.tax-details').attr("data-employer-tax-amount");

            taxCalculations.push({
                taxName: taxName,
                taxRateEmployer: 0,
                taxAmountEmployee: taxAmount,
                taxAmountEmployer: taxAmountEmployer
            });
        }
    }

    // Filter grossSalary from salaryDetails
    var grossSalary = salaryDetails.find(detail => detail.salaryDetailName === "Gross Salary").salaryDetailAmount;
    // Filter totalDeductions from taxCalculations
    var totalDeductions = taxCalculations.find(detail => detail.taxName === "Total Deductions").taxAmount;
    // Filter netSalary from salaryDetails
    var netSalary = salaryDetails.find(detail => detail.salaryDetailName === "Net Salary").salaryDetailAmount;

    var jwtToken = getCookie("jwttoken");

    var payslip = {
        emp_pin: emp_pin,
        emp_name: empName,
        emp_position: empPosition,
        emp_hireDate: empHireDate,
        emp_nid: empNID,
        company_name: companyName,
        company_address: companyAddress,
        company_brn: companyBRN,
        company_ern: companyERN,
        company_vat: companyVAT,
        company_logo: companyLogo,
        month: currentMonth,
        year: currentYear,
        period: period,
        salaryDetails: salaryDetails,
        allDeductions: taxCalculations,
        grossSalary: grossSalary,
        totalDeductions: totalDeductions,
        netSalary: netSalary
    }

    jQuery.ajax({
        type: "POST",
        url: "payroll.aspx/savePayslip", //It calls our web method  
        data: JSON.stringify({ payslip: payslip }),
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (response) {
            displaySuccessMessage("Payslip saved successfully.");
        },
        error: function (xhr, status, error) {
            console.error("Error occurred: ", status, error);
            // Additional error handling
        }
    });
}

function loadPeriodDetails() {

    const payrollMonth = localStorage.getItem('startMonth');
    if (payrollMonth != null) {
        const payrollStartDate = localStorage.getItem('startDate');
        const payrollEndDate = localStorage.getItem('endDate');

        var currentYear = parseInt(localStorage.getItem('firstUnlockedYear'), 10);
        var currentMonth = parseInt(localStorage.getItem('firstUnlockedMonth'), 10);
        var previousMonthYear = getPreviousMonthYear(currentYear, currentMonth);
        var CurreentMonthAsString = convertIntegerMonthToString(currentMonth);
        if (payrollMonth == "Current") {
            var startDate = 1;
            var endDate = findLastDayOfMonth(currentYear, currentMonth);
            var optionString = `${startDate} ${CurreentMonthAsString} to ${endDate} ${CurreentMonthAsString} ${currentYear} `;
        }
        else {
            var startDate = payrollStartDate;
            var endDate = payrollEndDate;
            if (previousMonthYear.previousYear == currentYear) {
                //this means we didnt change years
                var PreviousMonthAsString = convertIntegerMonthToString(previousMonthYear.previousMonth);
                var optionString = `${startDate} ${PreviousMonthAsString} to ${endDate} ${CurreentMonthAsString} ${currentYear} `;
            }
            else {
                //this means we have changed years
                var PreviousMonthAsString = convertIntegerMonthToString(previousMonthYear.previousMonth);
                var CurreentMonthAsString = convertIntegerMonthToString(currentMonth);
                var optionString = `${startDate} ${PreviousMonthAsString} ${previousMonthYear.previousYear} to ${endDate} ${CurreentMonthAsString} ${currentYear} `;
            }
        }

        //now we populate the .selectPeriod div with the option values (startDate and endDate)) and month
        $(".selectPeriod").html(`<option value="2">${optionString}</option>`);

        //lastly, we need to save the month and year in the .selectPeriod div as hidden attributes
        $(".selectPeriod").attr("month", currentMonth);
        $(".selectPeriod").attr("year", currentYear);

    }
}

function populateEmployeeList() {
    var select = $('#employeeList');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>'); // Keep this line if you want to retain the placeholder

    $.ajax({
        type: "GET",
        url: "payroll.aspx/loadEmployees", // It calls your web method
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (response) {

            var lstEmp = response.d;

            // Loop through each item in the returned data
            $.each(lstEmp, function (index, item) {
                var option = new Option(item.emp_lastname + " " + item.emp_firstname, item.emp_pin, false, false);
                $(option).data('position', item.position);
                $(option).data('image', item.img);
                $(option).data('hiredate', item.hiredate);
                $(option).data('branchId', item.branchId);
                $(option).data('workingHoursTemplate', item.workingHoursTemplate);
                $(option).data('NID', item.nid);
                $(option).data('dependants', item.dependants);
                $(option).data('otherEmoluments', item.emolument_amount);

                // Append new options
                select.append(option); // Append the option
            });

            // Refresh the Select2 widget
            select.select2({
                placeholder: "Select an employee", // Optional: Add placeholder text
                minimumResultsForSearch: 0 // This option will display the search box
            });

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function readFirstUnlockedPeriod() {

    jQuery.ajax({
        type: "GET",
        url: "timesheet.aspx/readFirstUnlockedPeriod", //It calls our web method  
        data: '{}',
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {

            localStorage.setItem('firstUnlockedMonth', msg.d.month);
            localStorage.setItem('firstUnlockedYear', msg.d.year);

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });

}

function generatePayslip() {

    PayrollRelatedFunctions.retrieveAndDisplayPayrollPeriod();
    var emp_details = PayrollRelatedFunctions.retrieveAndDisplayEmployeeDetails();

    PayrollRelatedFunctions.checkIfPayslipExists(emp_details.emp_pin, $(".selectPeriod").attr("month"), $(".selectPeriod").attr("year"))
        .then((payslipExists) => {
            if (payslipExists) {
                Swal.fire({
                    title: "Are you sure?",
                    text: "Payslip already generated for this user.Do you want to overwrite it?",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Yes, erase the previous one!"
                }).then((result) => {
                    if (result.isConfirmed) {
                        // Only call CreatePayslip if the user confirmed
                        PayrollRelatedFunctions.CreatePayslip(emp_details);
                    }
                });
            } else {
                PayrollRelatedFunctions.CreatePayslip(emp_details);
            }
        })
        .catch((error) => {
            // Handle error
            displayErrorMessage("Error while checking for existing payslip:", error);
        });

}

const PayrollRelatedFunctions = {

    retrieveAndDisplayPayrollPeriod: function () {
        var month = $(".selectPeriod").attr("month");
        var year = $(".selectPeriod").attr("year");
        var periodLength = $(".selectPeriod").find('option:selected').text();

        var currentYear = parseInt(localStorage.getItem('firstUnlockedYear'), 10);
        var currentMonth = parseInt(localStorage.getItem('firstUnlockedMonth'), 10);
        var CurrentMonthAsString = convertIntegerMonthToString(currentMonth);

        //Now we display this data in the payslip as follows:
        //Month and Year in the in the clsPeriodName
        $(".clsPeriodName").html(CurrentMonthAsString + " " + currentYear);
        $(".clsPeriodLength").html(periodLength);

    },

    retrieveAndDisplayEmployeeDetails: function () {

        var selectedOption = $('#employeeList').find('option:selected');

        var emp_pin = selectedOption.val();
        var selectedName = selectedOption.text();
        var position = selectedOption.data('position');
        var hireDate = selectedOption.data('hiredate');
        var NID = selectedOption.data('NID');
        var workingHoursTemplate = selectedOption.data('workingHoursTemplate');
        var branchId = selectedOption.data('branchId');
        var dependants = selectedOption.data('dependants');
        var otherEmoluments = selectedOption.data('otherEmoluments');

        $(".emp_name").html(selectedName);
        $(".emp_position").html(position);
        $(".emp_hireDate").html(formatDotNetJsonDateInAnotherFormat(hireDate));
        $(".emp_nid").html(NID);

        return {
            emp_pin: emp_pin,
            workingHoursTemplate: workingHoursTemplate,
            branchId: branchId,
            selectedName: selectedName,
            position: position,
            hireDate: hireDate,
            NID: NID,
            dependants: dependants,
            otherEmoluments: otherEmoluments
        }
    },

    processSalaryDetails: function (salaryDetails, clsShiftDetails) {
        var overtimeAmount = 0;
        var ExtraOvertimeAmount = 0;
        var exceptionalOvertimeAmount = 0;
        var overtimeRate = clsShiftDetails.OvertimeRate;
        var extraOvertimeRate = clsShiftDetails.ExtraOvertimeRate;
        var mealAllowanceRate = clsShiftDetails.MealAllowanceAmount;
        var exceptionalOvertimeRate = clsShiftDetails.ExceptionalOvertimeRate;
        var hoursPerMonth = clsShiftDetails.hoursPerMonth;
        var daysPerMonth = clsShiftDetails.daysPerMonth;

        var basicSalaryAmount = 0;
        for (var i = 0; i < salaryDetails.length; i++) {
            var calculationBasisValue = salaryDetails[i].calculationBasisValue;
            var calculationBasisTime = salaryDetails[i].calculationBasisTime;
            var calculationBasisID = salaryDetails[i].calculationBasisID;
            var salaryDetailAmount = salaryDetails[i].salaryDetailAmount;
            var isEmolument = salaryDetails[i].isEmolument;
            var salaryDetailName = salaryDetails[i].salaryDetailName;
            var emp_pin = salaryDetails[i].emp_pin;
            var totalAbsences = parseFloat($("#idUnapprovedLeaves").html()) +
                parseFloat($("#idSickLeaves").html()) +
                parseFloat($("#idLocalLeaves").html());
            var totalLocalAbsences = parseFloat($("#idLocalLeaves").html()) + parseFloat($("#idUnapprovedLeaves").html());
            var totalSickAbsences = parseFloat($("#idSickLeaves").html()) + parseFloat($("#idUnapprovedLeaves").html());
            if (calculationBasisID == 0) {
                basicSalaryAmount = salaryDetails[i].salaryDetailAmount;
            }
            else if (calculationBasisID == 2) {
                //we need to find the number of days worked
                var daysWorked = parseFloat($("#idPresentDays").html());
                salaryDetails[i].salaryDetailAmount = Math.round(salaryDetailAmount * daysWorked);
            }
            else if (calculationBasisID == 3 && totalAbsences != 0) {
                var maxAbsencesAllowed = calculationBasisValue;

                if (totalAbsences > maxAbsencesAllowed) {
                    salaryDetails[i].salaryDetailAmount = 0;
                } else {
                    var absenceProportion = 1 - (totalAbsences / maxAbsencesAllowed);
                    salaryDetails[i].salaryDetailAmount = Math.round(absenceProportion * salaryDetailAmount);
                }
            }
            else if (calculationBasisID == 4 && totalLocalAbsences != 0) {

                var maxAbsencesAllowed = calculationBasisValue;

                if (totalLocalAbsences > maxAbsencesAllowed) {
                    salaryDetails[i].salaryDetailAmount = 0;
                } else {
                    var absenceProportion = 1 - (totalLocalAbsences / maxAbsencesAllowed);
                    salaryDetails[i].salaryDetailAmount = Math.round(absenceProportion * salaryDetailAmount);
                }
            }
            else if (calculationBasisID == 5 && totalSickAbsences != 0) {
                var maxAbsencesAllowed = calculationBasisValue;

                if (totalSickAbsences > maxAbsencesAllowed) {
                    salaryDetails[i].salaryDetailAmount = 0;
                } else {
                    var absenceProportion = 1 - (totalSickAbsences / maxAbsencesAllowed);
                    salaryDetails[i].salaryDetailAmount = Math.round(absenceProportion * salaryDetailAmount);
                }
            }
        }

        //The last salary Details are for the overtime and Extra Overtime additions...
        var overtimeHours = parseFloat($("#idNetAdjustment").val());
        var holidayExtraPayHours = parseFloat($("#idHolidayExtraPay").val());
        var exceptionalOvertimeHours = parseFloat($("#idExceptionalOvertimeHours").val());
        var workingDaysMax = parseFloat($("#idWorkingDays").html());
        var mealAllowanceDays = parseFloat($("#idMealAllowance").html());
        if (workingDaysMax != 0) {//if workingDaysMax==0 it means there is no timesheet for this person. We dont need to add overtime/lateness
            if (overtimeHours > 0) {
                overtimeAmount = (basicSalaryAmount / hoursPerMonth) * overtimeHours * overtimeRate;
                salaryDetails.push({
                    salaryDetailName: `Overtime x${overtimeRate} (${overtimeHours}) Hrs`,
                    salaryDetailAmount: overtimeAmount,
                    isEmolument: 1
                });
            }
            if (holidayExtraPayHours > 0) {
                ExtraOvertimeAmount = (basicSalaryAmount / hoursPerMonth) * holidayExtraPayHours * extraOvertimeRate;
                salaryDetails.push({
                    salaryDetailName: `Extra Overtime x${extraOvertimeRate} (${holidayExtraPayHours}) Hrs`,
                    salaryDetailAmount: ExtraOvertimeAmount,
                    isEmolument: 1
                });
            }
            if (exceptionalOvertimeHours > 0) {
                exceptionalOvertimeAmount = (basicSalaryAmount / hoursPerMonth) * exceptionalOvertimeHours * exceptionalOvertimeRate;
                salaryDetails.push({
                    salaryDetailName: `Exceptional Overtime x${exceptionalOvertimeRate} (${exceptionalOvertimeHours}) Hrs`,
                    salaryDetailAmount: exceptionalOvertimeAmount,
                    isEmolument: 1
                });
            }
            //Now we add meal allowance amount
            if (mealAllowanceDays > 0) {
                salaryDetails.push({
                    salaryDetailName: `Meal Allowance ${mealAllowanceDays} days`,
                    salaryDetailAmount: mealAllowanceRate * mealAllowanceDays,
                    isEmolument: 0
                });
            }
        }
        return salaryDetails;
    },

    calculateTaxes: function (salary, emoluments, taxRatesArray, totalPAYEDeductions, otherEmolumentsForPAYE,hoursPerMonth,daysPerMonth) {
        var allDeductions = [];
        var workingDaysMax = parseFloat($("#idWorkingDays").html()); //used for lateness determination
        var overtimeHours = parseFloat($("#idNetAdjustment").val()); //also used for lateness calculation if its negative

        let applicableSalaryForPAYE = salary + emoluments + otherEmolumentsForPAYE - totalPAYEDeductions; // Combine salary and emoluments for PAYE calculation

        // Separate the PAYE tax rates from other taxes for special processing
        let payeTaxRates = taxRatesArray.filter(taxRate => taxRate.taxName === 'PAYE');
        let otherTaxRates = taxRatesArray.filter(taxRate => taxRate.taxName !== 'PAYE');
        var totalPAYE = 0;

        //First we calculate and add the leaves without pay
        var leavesWithoutPay = parseFloat($("#idUnapprovedLeaves").html());
        var BasicPayPerDay = salary / daysPerMonth;
        if (leavesWithoutPay > 0) {
            allDeductions.push({
                taxName: 'Leaves Without Pay',
                taxRateEmployer: 0,
                taxRateEmployee: 0,
                taxAmountEmployer: 0,
                taxAmountEmployee: leavesWithoutPay * BasicPayPerDay
            });
            leavesWithoutPay = leavesWithoutPay * BasicPayPerDay;
        }
        else {
            leavesWithoutPay = 0;
        }

        // First calculate PAYE tax in a progressive manner
        if (payeTaxRates.length > 0) {
            let remainingSalary = applicableSalaryForPAYE;

            // Sort PAYE tax rates by lowerBound for proper progressive calculation
            payeTaxRates.sort((a, b) => a.lowerBound - b.lowerBound);

            payeTaxRates.forEach((taxRate, index) => {
                if (remainingSalary > 0) {
                    let maxTaxableAmount = index < payeTaxRates.length - 1 ? payeTaxRates[index + 1].lowerBound - taxRate.lowerBound : remainingSalary;
                    let taxableAmount = Math.min(remainingSalary, maxTaxableAmount);

                    let taxAmountEmployer = taxableAmount * taxRate.taxRateEmployer / 100;
                    let taxAmountEmployee = taxableAmount * taxRate.taxRateEmployee / 100;
                    totalPAYE += taxAmountEmployee;

                    remainingSalary -= taxableAmount;


                }
            });
            //check if the eligibility for PAYE is 1 before adding it as a deduction
            if (payeTaxRates[0].eligibility == 1) {
                allDeductions.push({
                    taxName: 'PAYE',
                    taxRateEmployer: 0,
                    taxRateEmployee: 0,
                    taxAmountEmployer: 0,
                    taxAmountEmployee: totalPAYE
                });
            }
        }

        // Calculate taxes for other types if applicable
        otherTaxRates.forEach(taxRate => {
            let applicableSalary = salary - leavesWithoutPay;
            //for the case of NSF, there is a salary cap
            if (applicableSalary > taxRate.salaryCap) {
                applicableSalary = taxRate.salaryCap;
            }
            //for the case of PRGF, the applicable salary becomes the basic salary+all emoluments
            if (taxRate.taxName == "PRGF") {
                applicableSalary += emoluments;
            }
            if (applicableSalary >= taxRate.lowerBound && applicableSalary <= taxRate.upperBound) {
                let taxAmountEmployer = applicableSalary * taxRate.taxRateEmployer / 100;
                let taxAmountEmployee = applicableSalary * taxRate.taxRateEmployee / 100;
                if (taxRate.eligibility == 1) {
                    //All taxes 
                    allDeductions.push({
                        taxName: taxRate.taxName,
                        taxRateEmployer: taxRate.taxRateEmployer,
                        taxRateEmployee: taxRate.taxRateEmployee,
                        taxAmountEmployer: taxAmountEmployer,
                        taxAmountEmployee: taxAmountEmployee
                    });
                }

            }
        });

        //the last deduction details are for the lateness and advances deductions
        if (workingDaysMax != 0) //if workingDaysMax==0 it means there is no timesheet for this person. We dont need to add lateness
        {
            if (overtimeHours < 0) { //negative overtime means a lateness
                var latenessAmount = (salary / hoursPerMonth) * (overtimeHours * -1);
                allDeductions.push({
                    taxName: `Lateness (${overtimeHours * -1}) Hrs`,
                    taxRateEmployer: 0,
                    taxRateEmployee: 0,
                    taxAmountEmployer: 0,
                    taxAmountEmployee: latenessAmount
                });
            }
        }

        //Now we add advances
        //Add the advances details
        var advanceTaken = parseFloat($("#idAvancesTaken").html());
        if (advanceTaken > 0) {
            allDeductions.push({
                taxName: 'Advance',
                taxRateEmployer: 0,
                taxRateEmployee: 0,
                taxAmountEmployer: 0,
                taxAmountEmployee: advanceTaken
            });
        }

       

        return allDeductions;
    },

    loadBranchDetails: function (branchDetails) {
        $("#companyLogoPerEmployee").attr('src', branchDetails.logoPath);
        $("#companyName").html(branchDetails.companyName);
        $("#companyAddress").html(branchDetails.compAddress);
        $("#companyBRN").html(branchDetails.BRN);
        $("#companyERN").html(branchDetails.ERN);
        $("#companyVAT").html(branchDetails.VAT);
        $("#companyEmail").html(branchDetails.email);
        $("#companyTelNum").html(branchDetails.telNum);
        $("#companyFaxNum").html(branchDetails.faxNum);
        $("#companyLogo").attr("src", 'data:image/jpeg;base64,' + branchDetails.logoPath);
    },

    checkIfPayslipExists: function (emp_pin, month, year) {

        return new Promise((resolve, reject) => {
            var jwtToken = getCookie("jwttoken");

            jQuery.ajax({
                type: "POST",
                url: "payroll.aspx/checkIfPayslipExists",
                data: JSON.stringify({ emp_pin: emp_pin, month: month, year: year }),
                headers: {
                    'Authorization': 'Bearer ' + jwtToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (msg) {
                    resolve(msg.d);
                },
                error: function (xhr, status, error) {
                    reject(xhr);
                },
            });
        });
    },

    CreatePayslip: function (emp_details) {

        $.ajax({
            url: "payroll.aspx/generatePayslipData",
            type: "POST",
            async: false,
            data: JSON.stringify({ emp_pin: emp_details.emp_pin, dependants: emp_details.dependants, branchId: emp_details.branchId }),
            headers: {
                'Authorization': 'Bearer ' + getCookie("jwttoken")
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (response) {
                var multiRes = response.d;
                if (multiRes == null) {
                    displayWarningMessage("Salary details for this person are incorrect.");
                }
                else {
                    // Open the modal if the payslip doesn't exist and you're ready to create a new one
                    $('#kt_modal_1').modal('show');
                    //Functions affecting salary details (sensitive functions)
                    var lstSalaryDetails = PayrollRelatedFunctions.processSalaryDetails(multiRes.lstSalaryDetails, multiRes.clsShift);

                    //saving the list of government taxes in a global variable
                    taxRatesArray = multiRes.lstTaxRates;

                    //saving the PAYE deductions(dependants and other deductions) in a global variable)
                    //And also the "Other taxable emoluments" like car benefits etc
                    totalPAYEDeductions = multiRes.totalDeductions;
                    otherTaxableEmoluments = emp_details.otherEmoluments;

                    let result = calculateBasicSalaryAndEmoluments(lstSalaryDetails);
                    var allDeductions = PayrollRelatedFunctions.calculateTaxes(result.basicSalaryValue, result.emolumentsSum, taxRatesArray, totalPAYEDeductions, otherTaxableEmoluments, multiRes.clsShift.hoursPerMonth, multiRes.clsShift.daysPerMonth);

                    //Functions not affecting salary details (non sensitive functions)
                    var branchDetails = multiRes.branch;
                    PayrollRelatedFunctions.loadBranchDetails(branchDetails);

                    var grossSalary = 0;
                    var totalDeductions = 0;

                    // Destroy the DataTable before making changes
                    var psTable = $('#psTable').DataTable();
                    psTable.destroy();

                    // Clear existing table body, except for the last row which contains the button we use to add more rows
                    $('#psTable tbody').find('tr:not(:last)').remove();

                    // Determine the length of the longer array
                    var maxLength = Math.max(lstSalaryDetails.length, allDeductions.length);

                    lstSalaryDetails.sort(function (a, b) {
                        return parseFloat(b.salaryDetailAmount) - parseFloat(a.salaryDetailAmount);
                    });

                    for (var i = 0; i < maxLength; i++) {
                        var salaryDetailName = "", salaryDetailAmountInput = "", taxName = "", taxAmount = "", taxAmountToDisplay = "";

                        if (i < lstSalaryDetails.length) {
                            //Create the Name
                            salaryDetailName = "<strong>" + lstSalaryDetails[i].salaryDetailName + "</strong>";
                            //Check whether its the basic salary (Non Modifiable) or if its any other salary detail (Modifiable)
                            if (lstSalaryDetails[i].calculationBasisID != 0) {
                                salaryDetailAmountInput = lstSalaryDetails[i].isEmolument == 1 ?
                                    `<input type="text" class="salary-detail-amount isEmolument form-control" value="${Math.round(lstSalaryDetails[i].salaryDetailAmount)}" />` :
                                    `<input type="text" class="salary-detail-amount form-control" value="${Math.round(lstSalaryDetails[i].salaryDetailAmount)}" />`;
                            }
                            else {
                                salaryDetailAmountInput = `<span class="salary-detail-amount isEmolument">${Math.round(lstSalaryDetails[i].salaryDetailAmount)}</span>`;
                            }
                            grossSalary += Math.round(lstSalaryDetails[i].salaryDetailAmount); // Calculate gross salary
                        }

                        if (i < allDeductions.length && allDeductions[i].taxAmountEmployee >= 0) {
                            taxName = `<strong>${allDeductions[i].taxName}${allDeductions[i].taxRateEmployee != 0 ? "<span>@ " + allDeductions[i].taxRateEmployee + "%</span>" : ""}</strong>`;
                            taxAmount = allDeductions[i].taxAmountEmployee;

                            // Apply the .PAYE class to the span specifically for PAYE deductions
                            if (allDeductions[i].taxName === "PAYE") {
                                taxAmountToDisplay = `<span class="deduction-amount PAYE">${Math.round(taxAmount)}</span>
                              <input type="hidden" class="tax-details" data-employer-tax-amount="${allDeductions[i].taxAmountEmployer}">`;
                            } else {
                                taxAmountToDisplay = `<span class="deduction-amount">${Math.round(taxAmount)}</span>
                              <input type="hidden" class="tax-details ${allDeductions[i].taxName}" data-employer-tax-amount="${allDeductions[i].taxAmountEmployer}">`;
                            }
                            totalDeductions += Math.round(taxAmount); // Calculate total deductions
                        }

                        if (!(salaryDetailAmountInput === "" && taxAmount === "")) {
                            var newRowContent = `<tr><td>${salaryDetailName}</td><td>${salaryDetailAmountInput}</td><td>${taxName}</td><td>${taxAmountToDisplay}</td></tr>`;
                            $(newRowContent).insertBefore('#psTable tbody tr:last');
                        }
                    }

                    var netSalary = grossSalary - totalDeductions;
                    $("#idGrossSalary").html(grossSalary);
                    $("#idTotalDeductions").html(totalDeductions);
                    $("#idNetSalary").html(netSalary);

                    // Reinitialize the DataTable
                    BeingCalledByEvents.initDataTablePayroll();
                }

            },
            error: function (xhr, error) {
                // Handle error
                displayErrorMessage("Error while generating payslip:", xhr);
            }
        });
    },

}

function calculateBasicSalaryAndEmoluments(salaryDetails) {
    // Find the basic salary
    let basicSalary = salaryDetails.find(detail => detail.salaryDetailName === "Basic Salary");
    if (!basicSalary) return null;

    // Get the basic salary value
    let basicSalaryValue = parseInt(basicSalary.salaryDetailAmount);

    // Filter and sum emoluments, excluding 'Basic Salary'
    let emolumentsSum = salaryDetails
        .filter(detail => detail.isEmolument === 1 && detail.salaryDetailName !== "Basic Salary")
        .reduce((sum, current) => sum + parseInt(current.salaryDetailAmount), 0);

    return {
        basicSalaryValue,
        emolumentsSum
    };
}
