'use strict';
var payslip2js = function () {
    return {

        init: function () {
            $(document).ready(function () {
                payslip2js.handleDatatable();
                initEvents();
                checkAndPopulateEmployeeList();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#idPs2Table"),

        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#idPs2Table")) {
                payslip2js.table.clear();
                payslip2js.table.destroy();
            }
            payslip2js.table = $("#idPs2Table").DataTable({
                // DataTables options
                paging: true, // Enable pagination
                searching: true, // Enable search filtering
                ordering: true, // Enable column ordering
                order: [[1, "asc"]], // Default ordering (e.g., based on 'Payslip Month')
                lengthChange: true, // Allow user to change number of rows displayed
                pageLength: 20, // Set default number of rows per page
                responsive: true, // Make table responsive
            });
        },

    };

}();

// Call main function init
payslip2js.init();

function initEvents() {

    $(".yearSelect").datepicker({
        format: "yyyy",
        viewMode: "years",
        minViewMode: "years"
    });

    $('.btn-month').click(function (e) {
        e.preventDefault(); // Prevent default anchor behavior
        $(this).toggleClass('btn-selected'); // Toggle the 'btn-selected' class
    });

    $('.searchButton').click(function () {
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

        // Get empSearch value
        var empPin = $('#empSearch').val();

        //we disable the search button to prevent multiple clicks
        $(".searchButton").prop("disabled", true);

        jQuery.ajax({
            type: "POST",
            url: "payslips.aspx/getPayslipsRequested",
            async: true,
            headers: {
                'Authorization': 'Bearer ' + getCookie("jwttoken")
            },
            data: JSON.stringify({ year: year, months: selectedMonths, emp_pin: empPin }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (msg) {
                if (msg.d == null) {
                    window.location.href = '/Login_New.aspx?discon=true';
                } else {
                    console.log(msg.d);
                    let allPayslipsHtml = "<html><head><title>Payslips</title></head><body>";


                    msg.d.forEach(payslip => {
                        allPayslipsHtml += generatePayslipHTML(payslip);
                    });
                    allPayslipsHtml+= "</body></html>";


                    // Clear existing data in DataTable
                    payslip2js.table.clear();

                    // Loop through the returned data and add to DataTable
                    for (var i = 0; i < msg.d.length; i++) {
                        var payslip = msg.d[i];

                        var row = [
                            payslip.emp_name,
                            convertIntegerMonthToString(payslip.month) + " " + payslip.year,
                            payslip.period,
                            `<a href="#" class="viewPayslip btn btn-thin btn-success" data-payslip-id="${payslip.PslipId}"><i class="bi bi-eye fs-4 me-2"></i>View</a>`,
                            `<a href="#" class="downloadPayslip btn btn-thin btn-bg-secondary" data-payslip-id="${payslip.PslipId}"><i class="bi bi-download fs-4 me-2"></i>Download</a>`
                        ];

                        // Add row to DataTable
                        payslip2js.table.row.add(row).draw(false).node().setAttribute('data-payslip-id', payslip.PslipId);
                    }

                    // Redraw the table with the new data
                    payslip2js.table.draw();
                }
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
                $(".searchButton").prop("disabled", false);
            }
        });



    });

    $('#idPs2Table').on('click', '.viewPayslip', function () {
        var payslipId = $(this).attr('data-payslip-id');

        var jwtToken = getCookie("jwttoken");
        jQuery.ajax({
            type: "POST",
            url: "payslips.aspx/loadPayslip", //It calls our web method
            data: JSON.stringify({ payslipId: payslipId }),
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (response) {
                var multiResult = response.d;
                const payslipData = multiResult.payslip;

                const doc = new jsPDF();

                var res = generatePayslipHTML(payslipData, multiResult);
                $('#payslipContainer').html(res);
                generatePDFA5(res);
                console.log(res);

            },
            error: function (xhr, status, error) {
                console.error("Error occurred: ", status, error);
                // Additional error handling
            }
        });

    });

    $('#idPs2Table').on('click', '.downloadPayslip', function () {
        var payslipId = $(this).attr('data-payslip-id');

        var jwtToken = getCookie("jwttoken");
        jQuery.ajax({
            type: "POST",
            url: "payslips.aspx/loadPayslip", //It calls our web method
            data: JSON.stringify({ payslipId: payslipId }),
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (response) {
                var multiResult = response.d;
                const payslipData = multiResult.payslip;

                const doc = new jsPDF();

                var res = generatePayslipHTML(payslipData, multiResult);
                $('#payslipContainer').html(res);
                DownloadPDFA5(res, payslipData.emp_name);

            },
            error: function (xhr, status, error) {
                console.error("Error occurred: ", status, error);
                // Additional error handling
            }
        });

    });
}

function generatePDFA5(htmlString) {
    // Convert HTML string to a temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    tempDiv.style.width = "148mm"; // A5 width
    document.body.appendChild(tempDiv); // Temporarily append to body to capture

    html2canvas(tempDiv, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        const contentStartY = 5; 
        pdf.addImage(imgData, 'PNG', contentStartY, contentStartY, pdf.internal.pageSize.getWidth() - 2 * contentStartY, canvas.height * ((pdf.internal.pageSize.getWidth() - 2 * contentStartY) / canvas.width));

        // Calculate the y-coordinate to position the disclaimer line on the bottom.
        const disclaimerY = pdf.internal.pageSize.getHeight() - 10; // 10mm from the bottom

        // Text settings
        const disclaimerText = "This is a computer-generated document and requires no signature";
        pdf.setFontSize(8); // Adjust font size as needed

        // Calculate text width for centering (note: this is a rough approximation)
        const textWidth = pdf.getStringUnitWidth(disclaimerText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
        // Calculate the starting point of the text so it's centered
        const textStartX = (pdf.internal.pageSize.getWidth() - textWidth) / 2;

        // Ensure the text doesn't need to be wrapped
        pdf.text(disclaimerText, textStartX, disclaimerY); // Centered text

        window.open(pdf.output('bloburl'), '_blank'); // Open the PDF in a new window

        document.body.removeChild(tempDiv); // Clean up temp element
    });
}



        




function DownloadPDFA5(htmlString, emp_name) {
    // Convert HTML string to a temporary element
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    tempDiv.style.width = "148mm"; // A5 width
    document.body.appendChild(tempDiv); // Temporarily append to body to capture

    html2canvas(tempDiv, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a5'
        });

        const contentStartY = 5; // Start content from 5mm from the top, adjust as needed
        pdf.addImage(imgData, 'PNG', contentStartY, contentStartY, pdf.internal.pageSize.getWidth() - 2 * contentStartY, canvas.height * ((pdf.internal.pageSize.getWidth() - 2 * contentStartY) / canvas.width));

        // Calculate the y-coordinate to position the disclaimer line on the bottom.
        const disclaimerY = pdf.internal.pageSize.getHeight() - 10; // 10mm from the bottom

        // Text settings
        const disclaimerText = "This is a computer-generated document and requires no signature";
        pdf.setFontSize(10); // Adjust font size as needed

        // Calculate text width for centering (note: this is a rough approximation)
        const textWidth = pdf.getStringUnitWidth(disclaimerText) * pdf.internal.getFontSize() / pdf.internal.scaleFactor;
        // Calculate the starting point of the text so it's centered
        const textStartX = (pdf.internal.pageSize.getWidth() - textWidth) / 2;

        // Ensure the text doesn't need to be wrapped
        pdf.text(disclaimerText, textStartX, disclaimerY); // Centered text

        // Trigger download
        pdf.save(`payslip_${emp_name}.pdf`); // This will prompt the user to save the PDF file with the name "payslip.pdf"

        document.body.removeChild(tempDiv); // Clean up temp element
    });
}

function checkAndPopulateEmployeeList() {
    //Disable the search button before the employee list is populated
    $(".searchButton").prop("disabled", true);
    var select = $('#empSearch');

    // Clear existing options, keeping the placeholder if necessary
    select.empty().append('<option></option>');

    jQuery.ajax({
        type: "POST",
        url: "payslips.aspx/populateEmployeeList",
        async: true,
        headers: {
            'Authorization': 'Bearer ' + getCookie("jwttoken")
        },
        data: JSON.stringify({}),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (response) {
            var lstEmp = response.d;

            //Populate the empSearch select2 with lstEmp
            lstEmp.forEach(function (item) {
                var option = new Option(item.emp_lastname + " " + item.emp_firstname, item.emp_pin, false, false);
                select.append(option); // Append the option
            });

            select.select2({
                placeholder: "Select an employee", // Optional: Add placeholder text
                minimumResultsForSearch: 0, // This option will display the search box
                allowClear: true
            });
            if (lstEmp.length === 1) {
                // Preselect the first employee
                select.val(lstEmp[0].emp_pin).trigger('change');

                $('.searchEmployee').hide();
            }


        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        },
        complete: function () {
            //we re enable the search button
            $(".searchButton").prop("disabled", false);
        }
    });
}

function generatePayslipHTML(payslipData, multires) {
    var logoSource = payslipData.company_logo;
    var initialHtml = "<div class='pagebreak'></div><div class='newpayslip' emp_pin='" + payslipData.emp_pin + "'>";
    let grossSalary = 0, totalDeductions = 0, netSalary = 0;
    let incomesHtml = '';
    let deductionsHtml = '';
    let absencesTaken = multires.absencesLeft;

    // Determine the length of the longer array
    var maxLength = Math.max(multires.salaryDetails.length, multires.lstTaxDetails.length);

    //multires.salaryDetails.sort((a, b) => b.salaryDetailAmount - a.salaryDetailAmount);
    //multires.lstTaxDetails.sort((a, b) => b.taxAmount - a.taxAmount);

    for (var i = 0; i < maxLength; i++) {
        var salaryDetailName = "", salaryDetailAmount = "", taxName = "", taxAmount = "", incomeExists = 0, deductionsExists = 0;

        if (i < multires.salaryDetails.length && multires.salaryDetails[i].salaryDetailAmount > 0) {
            salaryDetailName = multires.salaryDetails[i].salaryDetailName;
            salaryDetailAmount = multires.salaryDetails[i].salaryDetailAmount;
            //Another code
            if (salaryDetailName === "Gross Salary") {
                grossSalary = salaryDetailAmount;
                incomesHtml += `<div class='row'><div class='col-3'></div><div class='col-3'></div>`;
            } else if (salaryDetailName === "Net Salary") {
                incomesHtml += `<div class='row'><div class='col-3'></div><div class='col-3'></div>`;
                netSalary = salaryDetailAmount;
            } else {
                // Assuming other salary details are incomes
                incomesHtml += `<div class='row'><div class='col-3'>${salaryDetailName}</div><div class='col-3 d-flex justify-content-center'> ${salaryDetailAmount}</div>`;
                incomeExists = 1;
            }
        }
        else {
            incomesHtml += `<div class='row'><div class='col-3'></div><div class='col-3'></div>`;
        }

        if (i < multires.lstTaxDetails.length && multires.lstTaxDetails[i].taxAmount > 0) {
            taxName = multires.lstTaxDetails[i].taxName;
            taxAmount = multires.lstTaxDetails[i].taxAmount;
            if (taxName === "Total Deductions") {
                totalDeductions = taxAmount;
                incomesHtml += `<div class='col-3'></div><div class="col-3"></div>`;
            } else {
                // Assuming other taxDetails are normal deductions
                incomesHtml += `<div class='col-3'>${taxName}</div><div class="col-3 d-flex justify-content-center">${taxAmount}</div>`;
                deductionsExists = 1;
            }
        }
        else {
            incomesHtml += `<div class='col-3'></div><div class="col-3"></div>`;
        }
        if (!(incomeExists == 0 && deductionsExists == 0)) {
            incomesHtml += '<hr/>';
        }

        //Now we close the <div class=row> tag
        incomesHtml += '</div>';

    }

    // Additional HTML
    initialHtml += `<div class='row'><div class='col-12 d-flex justify-content-center'> <img src='${logoSource}' class='h-150px' /> </div></div>`
        + "<div class='row text-center'><div class='col-12'>" + payslipData.company_name + "</div></div>"
        + "<div class='row text-center'><div class='col-12'>" + payslipData.company_address + "</div></div>"
        + "<div class='row text-center'><div class='col-12'>VAT No.: " + payslipData.company_vat + "&nbsp &nbsp BRN:" + payslipData.company_brn + "</div></div>"
        + "<div class='row text-center'><div class='col-12'>Employer Registration No: " + payslipData.company_ern + "</div></div>"
        + `<br/><div class='row'><div class='col-12'><p id="payslipMonthDetails">PAYSLIP<br/>${convertIntegerMonthToString(payslipData.month)} ${payslipData.year}<br />${payslipData.period}</p><hr/></div></div>`
        + "<div class='row'><div class='col-4'>Name of employee:</div><div class='col-8'>" + payslipData.emp_name + "</div></div>"
        + "<div class='row'><div class='col-4'>Occupation:</div><div class='col-8'>" + payslipData.emp_position + "</div></div>"
        + "<div class='row'><div class='col-4'>Date of entry:</div><div class='col-8'>" + payslipData.emp_hireDate + "</div></div>"
        + "<div class='row'><div class='col-4'>National ID No.:</div><div class='col-8'>" + payslipData.emp_nid + "</div><hr/></div>"
        + "<strong><div class='row'><div class='col-3'>INCOME</div><div class='col-3 d-flex justify-content-center'> MUR </div><div class='col-3'>DEDUCTIONS</div><div class='col-3 d-flex justify-content-center'> MUR </div><hr/></div></strong>";

    // Combine income and deduction HTML
    initialHtml += incomesHtml + deductionsHtml;

    // Summary section for Gross Salary, Total Deductions, and Net Salary
    initialHtml += "<div class='row'><div class='col-3'>Gross Salary</div><div class='col-3 d-flex justify-content-center'>" + grossSalary + "</div>"
        + "<div class='col-3'>Total Deductions</div><div class='col-3 d-flex justify-content-center'>" + totalDeductions + "</div></div><hr/>"
        + "<div class='row'><div class='col-3'>Net Salary</div><div class='col-3 d-flex justify-content-center'>" + netSalary + "</div></div>"
        + '<div class="row text-center"><div class="col-12"><hr/></div></div>'
        + "</div>";

    // Add Absences taken in the bottom
    //local taken and sick taken should be in one div and flexbox
    initialHtml += `<div class='row'><div class='col-3'>Local Leaves</div><div class='col-3 d-flex justify-content-center'>${absencesTaken.localTaken}</div>`
        + `<div class='col-3'>Sick Leaves</div><div class='col-3 d-flex justify-content-center'>${absencesTaken.sickTaken}</div></div><hr/>`;

    initialHtml += `<div class='row'><div class='col-3'>Leaves Without Pay</div><div class='col-3 d-flex justify-content-center'>${absencesTaken.leavesWithoutPayTaken}</div>`
        + `<div class='col-3'>Paid Leaves</div><div class='col-3 d-flex justify-content-center'>${absencesTaken.paidLeavesTaken}</div></div><hr/>`;

    return initialHtml;
}


function printAllPayslips() {
    
    var iframe = document.createElement('iframe');
    iframe.style.position = "absolute";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

   
    var payslipsHtml = getAllPayslipHtml();

   
    var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(payslipsHtml);
    iframeDoc.close();

  
    iframe.contentWindow.focus();
    iframe.contentWindow.print();


    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 100);
}

function getAllPayslipHtml() {
   
    var allPayslipsHtml = "<html><head><title>Payslips</title></head><body>";
  
    allPayslipsHtml += "<div class='payslip'> Hello There </div>";
    
    allPayslipsHtml += "</body></html>";
    return allPayslipsHtml;
}
