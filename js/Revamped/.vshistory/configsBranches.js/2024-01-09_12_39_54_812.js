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
                    $("#idVAT").val(selectedCompany.VAT);
                    $("#idBPID").val(selectedCompany.bulkPaymentID);
                    $("#idBPAcNo").val(selectedCompany.BPAcNumber);
                    $("#idBPAcType").val(selectedCompany.BPAcType);
                    $("#idBPdetails").val(selectedCompany.BPText);
                    $("#idEmail").val(selectedCompany.email);
                    $("#idCompTel").val(selectedCompany.telNum);
                    $("#idFax").val(selectedCompany.faxNum);
                    // ... Set the rest of the input fields ...
                    $("#companyLogo").attr("src", selectedCompany.logoPath)
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
        var VAT = $("#idVAT").val();
        var bulkPaymentID = $("#idBPID").val();
        var BPAcNumber = $("#idBPAcNo").val();
        var BPAcType = $("#idBPAcType").val();
        var BPText = $("#idBPdetails").val();
        var email = $("#idEmail").val();
        var Tel = $("#idCompTel").val();
        var Fax = $("#idFax").val();
        var boolCorrectData = 1;

        //check if only numbers have been entered in the numeric fields
        if (isNaN(parseFloat(bulkPaymentID))) {
            alert("Please ensure that all numeric fields contain numbers only.");
            boolCorrectData = 0;
        }
        //check if texts have been written in the textboxes
        if (companyName === "" || compAddress === "" || BRN === "" || BPAcNumber === "" || BPAcType === "" || BPText === "") {
            alert("Please ensure that all text fields are filled before submitting");
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
                    VAT: VAT,
                    bulkPaymentID: bulkPaymentID,
                    BPAcNumber: BPAcNumber,
                    BPAcType: BPAcType,
                    BPText: BPText,
                    email: email,
                    tel: Tel,
                    fax: Fax
                }),
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (msg) {
                    if (msg.d == true) {
                        alert("Company details successfully updated.Page will now be refreshed");
                        configsBranches.loadCompDetails();
                        //window.location.href = "/configs.aspx";
                    }
                    else {
                        alert("There was a problem updating the details. Please check your entries/Contact your system Admin");
                    }

                },
                failure: function (msg) {
                    alert(msg);
                }
            });
        }
    }

    return {
        select2handler: select2handler,
        loadCompDetails: loadCompDetails,
        updateCompDetails: updateCompDetails
    };
})();