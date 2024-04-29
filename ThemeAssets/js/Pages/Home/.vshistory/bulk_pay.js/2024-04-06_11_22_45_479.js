'use strict';
var paymentList;
var bulk_pay = function () {
    return {

        init: function () {
            $(document).ready(function () {
                bulk_pay.handleDatatable();
                bulk_pay.autoLoadCurrentMonth();
                bulk_pay.preloadModal();
                bulk_pay.specifyDateFormat();
                bulk_pay.InitializeYesNoDropdown();
                bulk_pay.SetAllToYes();
                bulk_pay.preloadBranches();
                bulk_pay.initializePaymentTypeDropdown();

                $("#month, #year").change(function () {
                    checkAndToggleLockButtonState();
                    // bulk_pay.loadBulkDetails();
                });
                //$("#compBranch").change(function () {
                //  bulk_pay.loadBulkDetails();
                // })
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#bulkTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#bulkTable")) {
                bulk_pay.table.clear();
                bulk_pay.table.destroy();
            }
            bulk_pay.table = $("#bulkTable");
            bulk_pay.table = $("#bulkTable").DataTable({
                "paging": false
            });
        },

        initializePaymentTypeDropdown: function () { //initialize function for the bank or cash dropdown
            $('#type').on('change', function () {

                var selectedType = $(this).val();
                // we want to filter now by either cash or bank

                var table = $('#bulkTable').DataTable();


                if (selectedType !== 'all') {
                    // Apply search to the specific column that contains the data for type
                    // Here, it's assumed that the type is in the first column (index 0)
                    // You might need to adjust the index to target the correct column
                    table.column(2).search(selectedType).draw(); 
                } else {
                
                    table.draw();
                }


            })
        },
      




        //Load the current month's date onto the dropdowns
        autoLoadCurrentMonth: function () {
            var currentd = new Date();
            var currentm = currentd.getMonth();
            //since January=0 in this context
            var currenty = currentd.getFullYear();
            $('#month').val(currentm).trigger('change');
            $('#year').val(currenty).trigger('change');
            checkAndToggleLockButtonState();
        },

        specifyDateFormat: function () {
            $('.clsPmntDate').datepicker({
                format: 'yyyy/mm/dd'
            });
        },

        loadBulkDetails: function () {
            var selectedMonth = $("#month").val();
            var selectedYear = $("#year").val();
            var selectedCompany = $("#compBranch").val();

            $.ajax({
                type: "GET",
                url: "bulkpay.aspx/loadBulkDetails", // It calls our web method  
                data: { month: selectedMonth, year: selectedYear, compBranch: selectedCompany },
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (msg) {
                    var tableData = [];
                    paymentList = msg.d;
                    for (var i = 0; i < msg.d.length; i++) {
                        var record = msg.d[i];
                        var recNo = i + 1;
                        var includeRecDropdown = record.bank.includes("CASH")
                            ? `<div class="select-menu">
                                   <div class="select-btn">
                                       <span class="sBtn-text">No</span>
                                       <i class="fas fa-chevron-down"></i>
                                   </div>
                                   <ul class="options">
                                        <li class="option">
                                            <i class="fas fa-times-square" style="color: #E1306C;"></i>
                                            <span class="option-text">No</span>
                                        </li>
                                   </ul>
                               </div>`
                            : `<div class="select-menu">
                                   <div class="select-btn">
                                       <span class="sBtn-text">Yes</span>
                                       <i class="fas fa-chevron-down"></i>
                                   </div>
                                   <ul class="options">
                                        <li class="option"><i class="fas fa-check-circle" style="color: #50CD89;"></i>
                                            <span class="option-text">Yes</span>
                                        </li>
                                        <li class="option">
                                            <i class="fas fa-times-square" style="color: #E1306C;"></i>
                                            <span class="option-text">No</span>
                                        </li>
                                   </ul>
                               </div>`;

                        var currency = "MUR";
                        var transactionAmount = record.salary;
                        var accountNumber = record.acc_no;
                        var paymentDetails = record.emp_name;
                        var bankName = record.bank;

                        var rowData = [
                            recNo,
                            includeRecDropdown,
                            currency,
                            transactionAmount,
                            accountNumber,
                            paymentDetails,
                            bankName
                        ];
                        tableData.push(rowData);
                    }

                    bulk_pay.table.clear().rows.add(tableData).draw();

                    $(".btnGenerate").css("visibility", "visible");
                    bulk_pay.InitializeYesNoDropdown();
                },
                error: function (xhr, status, error) {
                    console.log("Error: " + error);
                }
            });
        },


        preloadModal: function () {

            const section = document.querySelector("section"),
                overlay = document.querySelector(".overlay"),
                showBtn = document.querySelector(".show-modal"),
                closeBtn = document.querySelector(".close-btn");
            showBtn.addEventListener("click", () => section.classList.add("active"));
            overlay.addEventListener("click", () =>
                section.classList.remove("active")
            );
            closeBtn.addEventListener("click", () =>
                section.classList.remove("active")
            );

        },

        finalisepayment: function () {

            // Get the DataTable instance
            const table = $('#bulkTable').DataTable();
            var bulkPmntAmt = 0;
            var nonBulkAmt = 0;
            var selectedOption = $('#compBranch').find(':selected');
            var selectedValue = selectedOption.val();

            if (selectedValue == '0') {
                displayWarningMessage('Cannot generate a single file for "All Companies"');
            }
            else {

                // Loop through all rows, regardless of pagination
                table.rows().every(function () {
                    const rowNode = this.node(); // Get the row node

                    // Get the selected value of the <select> element in the first cell of the current row
                    const selectValueText = $('td:eq(1) .sBtn-text', rowNode).text();
                    const currencyVal = $('td:eq(2)', rowNode).text();
                    const salaryVal = parseFloat($('td:eq(3)', rowNode).text());
                    const bankaccno = $('td:eq(4)', rowNode).text();
                    const descptn = $('td:eq(5)', rowNode).text();
                    const bankName = $('td:eq(6)', rowNode).text();

                    if (selectValueText.trim() === "Yes") {
                        bulkPmntAmt = bulkPmntAmt + salaryVal;
                    } else if (selectValueText.trim() === "No") {
                        nonBulkAmt = nonBulkAmt + salaryVal;
                    }

                    // You can continue processing each row as needed...
                });
                $("#totalBulkPmt").text(bulkPmntAmt.toFixed(2));
                $("#totalNonBulkPmt").text(nonBulkAmt.toFixed(2));

                var BPAcNumber = selectedOption.data('BPAcNumber');
                var BPText = selectedOption.data('BPText');

                $("#BPText").val(BPText);
                $("#BPAccNo").val(BPAcNumber);
            }
        },

        generateBulkFile: function () {

            var pmntDate = $(".clsPmntDate").val();
            var selectedOption = $('#compBranch').find(':selected');
            var selectedValue = selectedOption.val();

            if (pmntDate === "" || !pmntDate) {
                // No date is selected
                displayWarningMessage("Please select a date before proceeding.");
            }
            else {

                // Date is selected, you can proceed further
                var dateObject = new Date(pmntDate);
                var year = dateObject.getFullYear().toString();
                var month = (dateObject.getMonth() + 1).toString();
                if (month < 10) {
                    month = '0' + month;
                }
                var day = dateObject.getDate().toString();
                if (day < 10) {
                    day = '0' + day;
                }
                var date = year + month + day;
                var bulkPmntAmt = 0;
                var nonBulkAmt = 0;
                var BulkCounter = 0;
                var individualEmpLineDetailsMCB = "";
                var individualEmpLineDetailsNONMCB = "";

                //Now we find the selected company details
                var selectedOption = $('#compBranch').find(':selected');
                var selectedValue = selectedOption.val();

                var BulkID = selectedOption.data('bulkPaymentID');
                var bulkAcNo = $("#BPAccNo").val();
                var BPAcType = selectedOption.data('BPAcType');
                var bulkText = $("#BPText").val();
               

                // Get the DataTable instance
                const table = $('#bulkTable').DataTable();

                // Loop through all rows, regardless of pagination
                table.rows().every(function () {

                    const rowNode = this.node(); // Get the row node

                    // Get the selected value of the <select> element in the first cell of the current row
                    const selectValueText = $('td:eq(1) .sBtn-text', rowNode).text();
                    const currencyVal = $('td:eq(2)', rowNode).text();
                    const salaryVal = parseFloat($('td:eq(3)', rowNode).text());
                    const bankaccno = $('td:eq(4)', rowNode).text();
                    const descptn = $('td:eq(5)', rowNode).text();
                    const bankName = $('td:eq(6)', rowNode).text();

                    if (selectValueText.trim() === "Yes") {
                        bulkPmntAmt = bulkPmntAmt + salaryVal;
                        BulkCounter = BulkCounter + 1;
                        if (bankName == "MCB")
                            individualEmpLineDetailsMCB = individualEmpLineDetailsMCB + '1|' + salaryVal.toFixed(2) + '|' + bankaccno + '|' + descptn + '\r\n';
                        else if (bankName == "BOM")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "01" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "BARODA")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "02" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "ABSA")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "03" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "BANK ONE")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "05" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "HABIB BANK")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "06" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "HSBC")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "07" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "SBI")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "08" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "SBM")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "11" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "MAUBANK")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "12" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "BCP BANK")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "14" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "STANDARD BANK")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "22" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "STANDARD CHARTERED BANK")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "23" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "AFRASIA")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "25" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "ABC")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "27" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "CENTURY BANKING")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "31" + '|' + bankaccno + '|' + descptn + '||N\r\n';
                        else if (bankName == "BANYANTREE BANK")
                            individualEmpLineDetailsNONMCB = individualEmpLineDetailsNONMCB + '2|' + salaryVal.toFixed(2) + '|' + "32" + '|' + bankaccno + '|' + descptn + '||N\r\n';

                    } else if (selectValueText.trim() === "No") {
                        nonBulkAmt = nonBulkAmt + salaryVal;
                    }

                });

                //first line
                var paymentTxt = '0|BP-V2|' + date + '|02|1|' + bulkPmntAmt.toFixed(2) + '|' + BulkCounter + '|' + bulkPmntAmt.toFixed(2) + '|MUR|' + date + '095122\r\n';
                //second line
                paymentTxt = paymentTxt + '9|' + bulkPmntAmt.toFixed(2) + '|' + bulkAcNo + '|' + bulkText + '\r\n';

                //third line and below contains employee salary details
                paymentTxt = paymentTxt + individualEmpLineDetailsMCB + individualEmpLineDetailsNONMCB;
                paymentTxt = paymentTxt.slice(0, -2)
                var textFileAsBlob = new Blob([paymentTxt], { type: 'text / plain' });
                var downloadLink = document.createElement("a");
                downloadLink.download = 'BP-' + BulkID;
                downloadLink.innerHTML = "Download File";
                if (window.webkitURL != null) {
                    // Chrome allows the link to be clicked
                    // without actually adding it to the DOM.
                    downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
                }
                else {
                    // Firefox requires the link to be added to the DOM
                    // before it can be clicked.
                    downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
                    downloadLink.onclick = destroyClickedElement;
                    downloadLink.style.display = "none";
                    document.body.appendChild(downloadLink);
                }

                downloadLink.click();
            }
        },

        InitializeYesNoDropdown: function () {
            const optionMenus = document.querySelectorAll(".select-menu"); // Notice 'querySelectorAll' instead of 'querySelector'

            optionMenus.forEach(optionMenu => {
                const selectBtn = optionMenu.querySelector(".select-btn"),
                    options = optionMenu.querySelectorAll(".option"),
                    sBtn_text = optionMenu.querySelector(".sBtn-text");

                // Toggle the dropdown menu for this specific menu
                selectBtn.addEventListener("click", () => optionMenu.classList.toggle("active"));

                // Set the selected value for this specific menu
                options.forEach(option => {
                    option.addEventListener("click", () => {
                        let selectedOption = option.querySelector(".option-text").innerText;
                        sBtn_text.innerText = selectedOption;
                        optionMenu.classList.remove("active");
                    });
                });
            });
        },

        SetAllToYes: function () {
            const optionMenus = document.querySelectorAll(".select-menu");

            optionMenus.forEach(optionMenu => {
                const sBtn_text = optionMenu.querySelector(".sBtn-text");
                sBtn_text.innerText = "Yes";
            });
        },

        updateLockPeriod: function (lock) {
            var selectedMonth = $("#month").val();
            var selectedYear = $("#year").val();
            var jwtToken = getCookie("jwttoken");
           // var selectedPaymentType = $('#type').val;

            $.ajax({
                type: "POST",
                url: "bulkpay.aspx/updateLockPeriod",
                data: JSON.stringify({ month: selectedMonth, year: selectedYear, locked: lock }),
                contentType: "application/json; charset=utf-8",
                headers: {
                    'Authorization': 'Bearer ' + jwtToken
                },
                dataType: "JSON",
                async: false,
                success: function (msg) {
                    var status = lock ? "locked" : "unlocked"; // Determine the status based on the lock variable
                    if (msg.d == 1) {
                        displaySuccessMessage("Selected period successfully " + status);
                    }
                    else if (msg.d == -1) {
                        displayWarningMessage("Selected period was already locked");
                    }
                    else {
                        displayErrorMessage("Selected period could not be locked");
                    }
                    checkAndToggleLockButtonState();
                },
                error: function (xhr, status, error) {
                    console.log("Error: " + error);
                }
            });
        },

        preloadBranches: function () {

            //here we retrieve the company details from the database
            $.ajax({
                type: "POST",
                url: "configs.aspx/loadBranchesDetails",
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (response) {

                    var select = $('#compBranch');

                    // Loop through each item in the returned data
                    $.each(response.d, function (index, company) {
                        var option = new Option(company.companyName, company.id, false, false);
                        $(option).data('bulkPaymentID', company.bulkPaymentID);
                        $(option).data('BPAcNumber', company.BPAcNumber);
                        $(option).data('BPAcType', company.BPAcType);
                        $(option).data('BPText', company.BPText);
                        select.append(option);
                    });

                    select.select2();

                },
                error: function (xhr, status, error) {
                    console.error("An error occurred while loading company details:", error);
                }
            });
        }
    };
}();

// Call main function init
bulk_pay.init();


function checkAndToggleLockButtonState() {
    var selectedMonth = $("#month").val();
    var selectedYear = $("#year").val();

    // Ensure both month and year are selected
    if (selectedMonth && selectedYear) {
        var jwtToken = getCookie("jwttoken");

        $.ajax({
            type: "POST",
            url: "bulkpay.aspx/isLocked", // Ensure this URL points to your isLocked method
            data: JSON.stringify({ month: selectedMonth, year: selectedYear }),
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            dataType: "JSON",
            success: function (response) {
                var lockButton = $(".btn-warning, .btn-danger"); // Target both classes in case the button class has already been changed

                // Assuming your response directly returns 1 or 0 without needing to access a property
                if (response.d == 1) {
                    // Period is locked, change to unlock functionality
                    lockButton.text("Unlock Period").removeClass("btn-danger").addClass("btn-warning");
                    lockButton.attr("onclick", "bulk_pay.updateLockPeriod(false)");
                } else if (response.d == 0) {
                    // Period is not locked, revert to lock functionality
                    lockButton.text("Lock Period").removeClass("btn-warning").addClass("btn-danger");
                    lockButton.attr("onclick", "bulk_pay.updateLockPeriod(true)");
                }
            },
            error: function (xhr, status, error) {
                console.log("Error: " + error);
            }
        });
    }
}
