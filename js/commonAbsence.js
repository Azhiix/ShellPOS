
function loadCommonAbsenceEmployee() {

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/loadEmployees", //It calls our web method  
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstEmp) {

            for (i = 0; i < lstEmp.d.length; i++) {

                $("#employeeList").append('<div class="ck-button"><label><input type="checkbox" name="employeecbx" value="' + lstEmp.d[i].emp_pin + '"><span>' + lstEmp.d[i].emp_firstname + " " +lstEmp.d[i].emp_lastname + '</span></label></div>');
            }
            $("#employeeList").append('<div class="ck-button" onclick="selectall();">Toggle All</div>');
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function selectall() {
    checkboxes = document.getElementsByName('employeecbx');
    for (i = 0; i < checkboxes.length; i++) {
        if (checkboxes[i].checked == true) {
            checkboxes[i].checked = false;
        }
        else {
            checkboxes[i].checked = true;
        }

    }
}

function validateBtn() {
    //get selected employees
    var checkboxes = $('input[name="employeecbx"]:checked');
    //get selected date
    var selectedDate = $("#datepicker").val();
    //get absence type
    var absType = $("#idAbsType option:selected").val();
    //initialise overtime textbox value
    var ovrTimeTbxVal = "";

    if (absType == 7) {
        //get overtime textbox value(if the absence type is 7, that is overtime)
        ovrTimeTbxVal = $('input[name="ovrtimeTbx"]').val();
    }

    if (checkboxes[0] == undefined || selectedDate == "" || absType == 0 || (absType == 7 && ovrTimeTbxVal == "")) { alert("Please make sure that all mandatory fields are filled"); }

    else {
        var employeePinArray = [];

        for (var x = 0; x < checkboxes.length; x++) {
            employeePinArray[x] = checkboxes[x].value;
        }

        // record the requested information in the database
        jQuery.ajax({
            type: "POST",
            url: "commonAbsence.aspx/recordApprovals", //It calls our web method  
            data: JSON.stringify({ emp_arr: employeePinArray, date: selectedDate, absenceType: absType, overtimeTxtBoxVal: ovrTimeTbxVal }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (returnedValue) {
                if (returnedValue.d == 0) {
                    alert("Details successfully saved.");
                }
            },
            failure: function (msg) {
                alert(msg);
            }
        });
    }

}

$(function () {
    $("#datepicker").datepicker({ dateFormat: 'd/mm/yy' });
});

function checkForOvertime(event) {
    var selectElement = event.target;
    var value = selectElement.value;
    // do whatever you want with value
    if (value == 7)
        $("#idapprovedTbxOT").show();
    else $("#idapprovedTbxOT").hide();
}
