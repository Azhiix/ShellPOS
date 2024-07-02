$(document).ready(function () {
    hideUnauthorizedLinks();
});

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