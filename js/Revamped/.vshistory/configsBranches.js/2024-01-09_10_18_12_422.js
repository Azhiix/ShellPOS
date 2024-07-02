var configsBranches = (function () {
    var select2handler = function () {
        $('#branchSelect').select2({
            placeholder: "Select a branch...",
            allowClear: true
        });

        // Handle Select2 change event
        $('#branchSelect').on('change', function () {
            var branchId = $(this).val();

            // Show the custom table container if a branch is selected
            if (branchId) {
                // Load the branch details into the container.
                // This is where you would insert your AJAX call or similar to get the branch data.
                // For this example, we're just showing the container.
                $('#branchDetailsContainer').show();
            } else {
                $('#branchDetailsContainer').hide();
            }
        });
    };

    var loadCompDetails = function () {
        $(".settingsBtns").css("display", "none");
        $(".companyDetails").css("display", "table");

        //here we retrieve the company details from the database
        $.ajax({
            type: "POST",
            url: "settings.aspx/loadCompanyDetails", //It calls our web method  
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