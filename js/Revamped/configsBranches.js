var configsBranches = (function () {
    var select2handler = function () {

        // Handle Select2 change event
        $('#branchSelect').on('change', function () {
            var branchId = $(this).val();

            // Show the custom table container if a branch is selected
            if (branchId) {
                var selectedData = $('#branchSelect').select2('data').find(d => d.id === branchId);
                if (selectedData && selectedData.data) {
                    var selectedCompany = selectedData.data;
                    $("#idCompany").val(selectedCompany.id)
                    $("#idCompName").val(selectedCompany.companyName);
                    $("#idCompAddress").val(selectedCompany.compAddress);
                    $("#idBRN").val(selectedCompany.BRN);
                    $("#idERN").val(selectedCompany.ERN);
                    $("#idVAT").val(selectedCompany.VAT);
                    $("#idBPID").val(selectedCompany.bulkPaymentID);
                    $("#idBPAcNo").val(selectedCompany.BPAcNumber);
                    $("#idBPAcType").val(selectedCompany.BPAcType);
                    $("#idBPdetails").val(selectedCompany.BPText);
                    $("#idEmail").val(selectedCompany.email);
                    $("#idCompTel").val(selectedCompany.telNum);
                    $("#idFax").val(selectedCompany.faxNum);
                    $("#firstPayDay").val(selectedCompany.startDate);
                    $("#lastPayDay").val(selectedCompany.endDate);
                    $("#startMonth").val(selectedCompany.startMonth);
                    $("#companyLogo").attr("src", selectedCompany.logoPath).css("display", "block");
                    $('#branchDetailsContainer').show();
                }
            } else {
                $('#branchDetailsContainer').hide();
                $("#companyLogo").attr("src", "").css("display", "none");
            }
        });
    };

    var loadCompDetails = function () {
        $(".settingsBtns").css("display", "none");
        $(".companyDetails").css("display", "table");

        // Initialize Select2
        $('#branchSelect').select2({
            placeholder: "Select a branch...",
            allowClear: true
        });

        //here we retrieve the company details from the database
        $.ajax({
            type: "POST",
            url: "configs.aspx/loadBranchesDetails",
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (response) {
                var companies = response.d; // Assuming response.d is an array of company details

                var data = $.map(companies, function (company) {
                    return {
                        id: company.id,
                        text: company.companyName,
                        data: company // Store all company data here
                    };
                });

                $('#branchSelect').select2({
                    placeholder: "Select a branch...",
                    allowClear: true,
                    data: data // Provide the data directly to Select2
                });

                createDayPicker('firstPayDay');
                createDayPicker('lastPayDay');
                createMonthPicker();
            },
            error: function (xhr, status, error) {
                console.error("An error occurred while loading company details:", error);
            }
        });

    }

    var updateCompDetails = function () {
        var companyId = $("#idCompany").val();
        var companyName = $("#idCompName").val();
        var compAddress = $("#idCompAddress").val();
        var BRN = $("#idBRN").val();
        var ERN = $("#idERN").val();
        var VAT = $("#idVAT").val();
        var bulkPaymentID = $("#idBPID").val();
        var BPAcNumber = $("#idBPAcNo").val();
        var BPAcType = $("#idBPAcType").val();
        var BPText = $("#idBPdetails").val();
        var email = $("#idEmail").val();
        var Tel = $("#idCompTel").val();
        var Fax = $("#idFax").val();
        var startDate = $("#firstPayDay").val();
        var endDate = $("#lastPayDay").val();
        var startMonth = $("#startMonth").val();
        var boolCorrectData = 1;

        //check if only numbers have been entered in the numeric fields
        if (isNaN(parseFloat(bulkPaymentID))) {
            displayWarningHtml("Please ensure that all numeric fields contain <b>numbers</b> only.");
            boolCorrectData = 0;
        }
        //check if texts have been written in the textboxes
        if (companyName === "" || compAddress === "" || BRN === "" || BPAcNumber === "" || BPAcType === "" || BPText === "") {
            displayWarningHtml("Please ensure that <b>all text fields</b> are filled before submitting");
            boolCorrectData = 0;
        }
        if (boolCorrectData == 1) {

            jQuery.ajax({
                type: "POST",
                url: "configs.aspx/updateCompDetails", //It calls our web method  
                data: JSON.stringify({
                    companyId: companyId,
                    companyName: companyName,
                    compAddress: compAddress,
                    BRN: BRN,
                    ERN: ERN,
                    VAT: VAT,
                    bulkPaymentID: bulkPaymentID,
                    BPAcNumber: BPAcNumber,
                    BPAcType: BPAcType,
                    BPText: BPText,
                    email: email,
                    tel: Tel,
                    fax: Fax,
                    startDate: startDate,
                    endDate: endDate,
                    startMonth: startMonth
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (msg) {
                    if (msg.d == true) {
                        displaySuccessMessage("Company details successfully updated.");
                        configsBranches.loadCompDetails();

                        //window.location.href = "/configs.aspx";
                    }
                    else {
                        displayErrorMessage("There was a problem updating the details", true);
                    }

                },
                failure: function (msg) {
                    displayErrorMessage(msg, true);
                }
            });
        }
    }

    var createDayPicker = function (elementId) {
        var inputElement = document.getElementById(elementId);
        var originalValue = inputElement.value; // Store the original value
        var selectElement = document.createElement('select');
        selectElement.setAttribute('class', 'form-control');
        selectElement.setAttribute('id', elementId);

        var defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '--Please choose a day--';
        selectElement.appendChild(defaultOption);

        for (var i = 1; i <= 31; i++) {
            var option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            selectElement.appendChild(option);
            if (originalValue == i) {
                option.selected = true; // Set the original value as selected
            }
        }

        inputElement.parentNode.replaceChild(selectElement, inputElement);
    }

    var createMonthPicker = function (elementId) {
        var startMonthSelect = document.getElementById('startMonth');
        var firstPayDayRow = document.getElementById('firstPayDay').closest('tr');
        var lastPayDayRow = document.getElementById('lastPayDay').closest('tr');

        function togglePayDayRows() {
            if (startMonthSelect.value === 'Current') {
                firstPayDayRow.style.display = 'none';
                lastPayDayRow.style.display = 'none';
                document.getElementById('firstPayDay').value = 1;
                document.getElementById('lastPayDay').value = 31;
            } else if (startMonthSelect.value === 'Previous') {
                firstPayDayRow.style.display = '';
                lastPayDayRow.style.display = '';
            }
        }

        // Initialize the visibility based on the current selection
        togglePayDayRows();

        // Event listener for changes on the Start Month select element
        startMonthSelect.addEventListener('change', togglePayDayRows);
    }



    return {
        select2handler: select2handler,
        loadCompDetails: loadCompDetails,
        updateCompDetails: updateCompDetails
    };
})();