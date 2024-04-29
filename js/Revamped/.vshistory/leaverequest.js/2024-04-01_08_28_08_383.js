$(document).ready(function () {

    initializeLeaveTypeSelect2();
    initializeEvents();
    //to force date type dd/MM/yyyy here for the datepicker
    $('.leaveDate').datepicker({
        format: 'dd/mm/yyyy'
    });

});

function initializeLeaveTypeSelect2() {

    jQuery.ajax({
        type: "GET",
        url: "leaverequest.aspx/loadAbsenceTypes", //It calls our web method  
        data: '{}',
        headers: {
            'Authorization': 'Bearer ' + getCookie("jwttoken")
        },
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstAbsenceTypes) {

            // Loop through each item in the returned data
            $.each(lstAbsenceTypes.d, function (index, item) {
                //Add the absence type to the select2 dropdown
                $('.leavetype').append('<option value="' + item.absenceTypeID + '">' + item.absenceName + '</option>');
            });

            $('.leavetype').select2({
                placeholder: "Select leave type",
                allowClear: true
            });
        },
        error: function (xhr, msg) {
            displayErrorMessage(msg, true);
        }
    });

}

function initializeEvents() {
    $('.leaveApplicationRequestBtn').click(function (event) {
        event.preventDefault(); // Prevent the default action of the <a> tag.

        //Now we get the values from the form and send them to the server
        var leaveDate = $('.leaveDate').val();
        var leavePurpose = $('.leavePurpose').val();
        var leaveType = $('.leavetype').val();
        var datePattern = /^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|1[012])\/(19|20)\d\d$/;
        //Check if date and leave type are not empty
        if (leaveDate == "" || leaveType == "") {
            displayWarningMessage("Please choose a date and a leave type.", true);
            return;
        }
        if (!datePattern.test(leaveDate)) {
            displayWarningMessage('Please enter a date in the format dd/mm/yyyy', true);
            return;
        }

        //Now we need to send the leave request to the server
        jQuery.ajax({
            type: "POST",
            url: "leaverequest.aspx/saveLeaveRequest", //It calls our web method  
            data: JSON.stringify({ date: leaveDate, comments: leavePurpose, absenceType: leaveType }),
            headers: {
                'Authorization': 'Bearer ' + getCookie("jwttoken")
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (nbRowsAffected) {
                if (nbRowsAffected.d == null || nbRowsAffected.d == false) {
                    displayWarningMessage("A leave has already been requested or approved for this date", true);
                }
                else {
                    displaySuccessMessage("Leave request submitted successfully");
                }
            },
            error: function (xhr, status, error) {
                console.error("Error occurred: ", status, error);
            }
        });
    });

    $('#leaveRequestsTable').on('change', '.clsActionAdmin', function () {
        // Get the primary key from the parent <tr> id
        var primaryKey = $(this).closest('tr').attr('id').replace('leaveReq', '');
        // Get the selected option value
        var selectedValue = $(this).val();

        //Here we are going to send the selected value and the primary key to the server
        jQuery.ajax({
            type: "POST",
            url: "leaverequest.aspx/updateLeaveRequest", //It calls our web method  
            data: JSON.stringify({ leaveRequestID: primaryKey, action: selectedValue }),
            headers: {
                'Authorization': 'Bearer ' + getCookie("jwttoken") //Check if user has the right to perform this action
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (nbRowsAffected) {
                if (nbRowsAffected.d == null || nbRowsAffected.d == false) {
                    displayWarningMessage("An error occurred while updating the leave request", true);
                }
                else {
                    displaySuccessMessage("Leave request updated successfully");
                }
            },
            error: function (xhr, status, error) {
                console.error("Error occurred: ", status, error);
            }
        });
    });
}
