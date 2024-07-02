﻿var configsBranches = (function () {
    var select2handler = function () {

        // Handle Select2 change event
        $('#branchSelect').on('change', function () {
            var branchId = $(this).val();

            // Show the custom table container if a branch is selected
            if (branchId) {
                // Load the corresponding company details
                var companiesData = sessionStorage.getItem('companies');
                var companies = companiesData ? JSON.parse(companiesData) : [];

                var selectedCompany = companies.find(function (company) {
                    return company.id.toString() === branchId;
                });
                if (selectedCompany) {
                    $("#idCompany").val(selectedCompany.id)
                    $("#idCompName").val(selectedCompany.companyName);
                    $("#idCompAddress").val(selectedCompany.compAddress);
                    $("#idBRN").val(selectedCompany.BRN);
                    $("#idVAT").val(selectedCompany.VAT);
                    $("#idBPID").val(selectedCompany.bulkPaymentID);
                    $("#idBPAcNo").val(selectedCompany.BPAcNumber);
                    $("#idBPAcType").val(selectedCompany.BPAcType);
                    $("#idBPdetails").val(selectedCompany.BPText);
                    $("#idEmail").val(selectedCompany.email);
                    $("#idCompTel").val(selectedCompany.telNum);
                    $("#idFax").val(selectedCompany.faxNum);
                    // ... Set the rest of the input fields ...
                    $('#branchDetailsContainer').show();
                }
            } else {
                $('#branchDetailsContainer').hide();
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
            },
            error: function (xhr, status, error) {
                console.error("An error occurred while loading company details:", error);
            }
        });

    }

    return {
        select2handler: select2handler,
        loadCompDetails: loadCompDetails
    };
})();