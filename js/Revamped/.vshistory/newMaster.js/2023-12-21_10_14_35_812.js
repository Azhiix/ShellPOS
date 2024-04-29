$(document).ready(function () {
    var jwtToken = getCookie("jwttoken");

    jQuery.ajax({
        type: "GET",
        url: "RevampedMaster.Master/ValidateJwtToken", //It calls our web method  
        data: '{}',
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (isTokenValid) {
            if (isTokenValid == false) {
                alert('Please login again.');
                return;
            }
            else {
                hideUnauthorizedLinks();

                // Update the date and time upon loading
                updateDateTime();

                // Update the date and time every minute
                setInterval(updateDateTime, 60000);
            }
        },
        failure: function (msg) {
            alert(msg);
        }
    });
});

//document.addEventListener("DOMContentLoaded", (event) => {
//    console.log("DOM fully loaded and parsed");
//    // Update the date and time upon loading
//    updateDateTime();

//    // Update the date and time every minute
//    setInterval(updateDateTime, 60000);
//});

function hideUnauthorizedLinks() {
    let permissionArray = JSON.parse(document.cookie);
    console.log(permissionArray);
    if (permissionArray.addEmpBtn == 1) $(".addEmpBtn").show();
    if (permissionArray.empBtn == 1) $(".empBtn").show();
    if (permissionArray.timeBtn == 1) $(".timeBtn").show();
    if (permissionArray.payrollBtn == 1) $(".payrollBtn").show();
    if (permissionArray.advBtn == 1) $(".advBtn").show();
    if (permissionArray.reportBtn == 1) $(".reportBtn").show();
    if (permissionArray.bulkBtn == 1) $(".bulkBtn").show();
    if (permissionArray.settingsBtn == 1) $(".settingsBtn").show();

}

function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    document.getElementById('current-time').textContent = now.toLocaleTimeString(undefined, timeOptions);
    document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, dateOptions);
}


// ValidateToken

console.log("abcde");