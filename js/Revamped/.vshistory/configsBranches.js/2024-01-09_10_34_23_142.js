var configsBranches = (function () {
    var select2handler = function () {
        // Get the company details and populate the Select2 dropdown
        $.ajax({
            type: "POST",
            url: "configs.aspx/loadCompanyDetails",
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (response) {
                var companies = response.d; // Assuming response.d is an array of company details
                var $select = $('#branchSelect');
                $select.empty(); // Clear any existing options
                $select.append($('<option>').val('').text('Select a branch...'));
                $.each(companies, function (index, company) {
                    $select.append($('<option>').val(company.ID).text(company.companyName)); // Use a unique identifier like ID for the value
                });
                $select.trigger('change'); // Update Select2
            },
            error: function (xhr, status, error) {
                console.error("An error occurred while loading company details:", error);
            }
        });

        // Initialize Select2
        $('#branchSelect').select2({
            placeholder: "Select a branch...",
            allowClear: true
        });

        // Handle Select2 change event
        $('#branchSelect').on('change', function () {
            var branchId = $(this).val();

            // Show the custom table container if a branch is selected
            if (branchId) {
                // Load the corresponding company details
                var selectedCompany = response.d.find(function (company) {
                    return company.ID.toString() === branchId;
                });
                if (selectedCompany) {
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
    },

    var loadCompDetails = function () {
        $(".settingsBtns").css("display", "none");
        $(".companyDetails").css("display", "table");

        //here we retrieve the company details from the database
        $.ajax({
            type: "POST",
            url: "configs.aspx/loadCompanyDetails", //It calls our web method  
            data: '{}',
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (msg) {
                $("#idCompName").val(msg.d.companyName);
                $("#idCompAddress").val(msg.d.compAddress);
                $("#idBRN").val(msg.d.BRN);
                $("#idVAT").val(msg.d.VAT);
                $("#idBPID").val(msg.d.bulkPaymentID);
                $("#idBPAcNo").val(msg.d.BPAcNumber);
                $("#idBPAcType").val(msg.d.BPAcType);
                $("#idBPdetails").val(msg.d.BPText);
                $("#idEmail").val(msg.d.email);
                $("#idCompTel").val(msg.d.telNum);
                $("#idFax").val(msg.d.faxNum);

            },
            failure: function (msg) {
                alert(msg);
            }
        });
    }

    return {
        select2handler: select2handler,
        loadCompDetails: loadCompDetails
    };
})();