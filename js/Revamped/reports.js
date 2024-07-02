'use strict';
let gridApi = null;

const gridOptions = {
    columnDefs: [
        { field: "LastName", headerName: "Last Name" },
        { field: "FirstName", headerName: "First Name" },
        { field: "NIDNumber", headerName: "NID Number" },
        { field: "PositionTitle", headerName: "Position Title" },
        { field: "empHireDate", headerName: "Hire Date" },
        // Additional fields based on the salary details
        { field: "basicSalary", headerName: "Basic Salary" },
        { field: "OtherEmoluments", headerName: "Other Emoluments" },
        { field: "OtherNonEmoluments", headerName: "Other Non-Emoluments" },
        { field: "Deductions", headerName: "Deductions" },
        { field: "CSGEmployee", headerName: "CSG Employee" },
        { field: "CSGEmployer", headerName: "CSG Employer" },
        { field: "NSFEmployee", headerName: "NSF Employee" },
        { field: "NSFEmployer", headerName: "NSF Employer" },
        { field: "PAYE", headerName: "PAYE" },
        { field: "LEVYEmployee", headerName: "LEVY Employee" },
        { field: "PRGFEmployer", headerName: "PRGF Employer" },
        { field: "GrossSalary", headerName: "Gross Salary" },
        { field: "NetSalary", headerName: "Net Salary" },
        { field: "TotalDeductions", headerName: "Total Deductions" },
        { field: "CostToEmployer", headerName: "Cost To Employer" },
        { field: "Lateness", headerName: "Lateness" },
        { field: "Advance", headerName: "Advance" },
        { field: "LeavesWithoutPay", headerName: "Leaves Without Pay" },
        { field: "OtherDeductions", headerName: "Other Deductions" }
    ],
    rowData: [],
    onGridReady: function (params) {
        gridApi = params.api;
    }
};

var reportsjs = function () {
    return {

        init: function () {
            $(document).ready(function () {

                $(".yearSelect").datepicker({
                    format: "yyyy",
                    viewMode: "years",
                    minViewMode: "years"
                });
                reportsjs.initEvents();
            });
        },
        loadReportDetails: function () {
            var year = $('.yearSelect').val();
            var selectedMonths = [];

            $('.btn-month.btn-selected').each(function () {
                selectedMonths.push($(this).data('month')); // Use .data() to get the value of the data-month attribute
            });

            // Validation check
            if (!year || selectedMonths.length === 0) {
                displayWarningMessage("Please select a year and at least one month");
                return; // Exit the function early if validation fails
            }

            //we disable the search button to prevent multiple clicks
            $(".findReport").prop("disabled", true);

            jQuery.ajax({
                type: "POST",
                url: "reports.aspx/LoadMainReport",
                async: true,
                headers: {
                    'Authorization': 'Bearer ' + getCookie("jwttoken")
                },
                data: JSON.stringify({ year: year, months: selectedMonths }),
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (msg) {
                    var payslips = msg.d;
                    console.log(payslips);

                    var totalEmployeeCost = 0;
                    // Loop through the payslips array
                    payslips.forEach(payslip => {
                        let basicSalary = 0;
                        let OtherEmoluments = 0;
                        let OtherNonEmoluments = 0;
                        let Deductions = 0;
                        let CSGEmployee = 0;
                        let CSGEmployer = 0;
                        let NSFEmployee = 0;
                        let NSFEmployer = 0;
                        let PAYE = 0;
                        let LEVYEmployee = 0;
                        let PRGFEmployer = 0;
                        let GrossSalary = 0;
                        let NetSalary = 0;
                        let TotalDeductions = 0;
                        let CostToEmployer = 0;
                        let Lateness = 0;
                        let Advance = 0;
                        let LeavesWithoutPay = 0;
                        let OtherDeductions = 0;
                        let empLastName = payslip.EmpLastName;
                        let empFirstName = payslip.EmpFirstName;
                        let empNIDNumber = payslip.NID;
                        let empPositionTitle = payslip.position;
                        let empHireDate = payslip.HireDate;
                        if (empHireDate.split(' ')[1] == '') empHireDate = empHireDate.split(' ')[0] + ' ' + empHireDate.split(' ')[2] + ' ' + empHireDate.split(' ')[3];
                        else empHireDate = empHireDate.split(' ')[0] + ' ' + empHireDate.split(' ')[1] + ' ' + empHireDate.split(' ')[2];

                        //Here we are going to save the details of the individual payslip inside the respective arrays

                        // Loop through the items of each payslip
                        payslip.Items.forEach(item => {
                            if (item.ItemID == 1) {
                                if (item.ItemName == "Basic Salary") {
                                    basicSalary = item.ItemAmount;
                                    CostToEmployer += item.ItemAmount;
                                }
                                else if (item.IsEmolument == 1) {
                                    OtherEmoluments += item.ItemAmount;
                                    CostToEmployer += item.ItemAmount;
                                }
                                else if (item.IsEmolument == 0) {
                                    OtherNonEmoluments += item.ItemAmount;
                                    CostToEmployer += item.ItemAmount;
                                }
                            }
                            if (item.ItemID == 2) {
                                var deductionName = item.ItemName;
                                if (deductionName == "CSG") {
                                    CSGEmployee = item.ItemAmount;
                                    CSGEmployer = item.EmployerAmount;
                                    CostToEmployer += item.ItemAmount;
                                    CostToEmployer += item.EmployerAmount;
                                }
                                else if (deductionName == "NSF") {
                                    NSFEmployee = item.ItemAmount;
                                    NSFEmployer = item.EmployerAmount;
                                    CostToEmployer += item.ItemAmount;
                                    CostToEmployer += item.EmployerAmount;
                                }
                                else if (deductionName == "PAYE") {
                                    PAYE = item.ItemAmount;
                                    CostToEmployer += item.ItemAmount;
                                }
                                else if (deductionName == "LEVY") {
                                    LEVYEmployee = item.EmployerAmount;
                                    CostToEmployer += item.EmployerAmount;
                                }
                                else if (deductionName == "PRGF") {
                                    PRGFEmployer = item.EmployerAmount;
                                    CostToEmployer += item.EmployerAmount;
                                }
                                else {
                                    //it can be one of the following:
                                    //lateness (minutes)
                                    //Advance
                                    //Absences without pay
                                    //we split with brackets to remove the (minutes)
                                    var nameBeforeBracket = deductionName.split(" (")[0];
                                    if (nameBeforeBracket == "Lateness") {
                                        Lateness = item.ItemAmount;
                                        CostToEmployer -= item.ItemAmount;
                                    }
                                    else if (nameBeforeBracket == "Advance") {
                                        Advance = item.ItemAmount;
                                    }
                                    else if (nameBeforeBracket == "Leaves without pay") {
                                        LeavesWithoutPay = item.ItemAmount;
                                        CostToEmployer -= item.ItemAmount;
                                    }
                                    else {
                                        OtherDeductions += item.ItemAmount;
                                    }
                                }
                            }
                            if (item.ItemID == 3) {
                                GrossSalary = item.ItemAmount;
                            }
                            if (item.ItemID == 4) {
                                TotalDeductions = item.ItemAmount;
                            }
                            if (item.ItemID == 5) {
                                NetSalary = item.ItemAmount;
                            }
                        });

                        //now we need to save these details in a row to be displayed.
                        let salaryDetail = {
                            LastName: empLastName,
                            FirstName: empFirstName,
                            NIDNumber: empNIDNumber,
                            PositionTitle: empPositionTitle,
                            empHireDate: empHireDate,
                            basicSalary: basicSalary,
                            OtherEmoluments: OtherEmoluments,
                            OtherNonEmoluments: OtherNonEmoluments,
                            Deductions: Deductions,
                            CSGEmployee: CSGEmployee,
                            CSGEmployer: CSGEmployer,
                            NSFEmployee: NSFEmployee,
                            NSFEmployer: NSFEmployer,
                            PAYE: PAYE,
                            LEVYEmployee: LEVYEmployee,
                            PRGFEmployer: PRGFEmployer,
                            GrossSalary: GrossSalary,
                            NetSalary: NetSalary,
                            TotalDeductions: TotalDeductions,
                            CostToEmployer: CostToEmployer,
                            Lateness: Lateness,
                            Advance: Advance,
                            LeavesWithoutPay: LeavesWithoutPay,
                            OtherDeductions: OtherDeductions
                        };
                        gridOptions.rowData.push(salaryDetail); // Add the new row data
                        totalEmployeeCost += CostToEmployer;
                    });
                    const myGridElement = document.querySelector('#myGrid');
                    agGrid.createGrid(myGridElement, gridOptions);
                    $("#totEmpCost").html(totalEmployeeCost);

                    $(".exporthidden").show();
                },
                failure: function (msg) {
                    displayErrorMessage(msg, true);
                },
                error: function (xhr, status, error) {
                    console.error("Error occurred: ", status, error);
                    // Additional error handling
                },

                complete: function () {
                    //we re enable the button
                    $(".findReport").prop("disabled", false);
                }
            });

        },

        initEvents: function () {
            $('.btn-month').click(function (e) {
                e.preventDefault(); // Prevent default anchor behavior
                $(this).toggleClass('btn-selected'); // Toggle the 'btn-selected' class
            });
        }
    };

}();

// Call main function init
reportsjs.init();

function exportGridToExcel() {

    gridApi.exportDataAsCsv({
        fileName: 'StatutoryReport.csv',
    });

}