// Define an array of messages
var loadingMessages = [
    "Crunching numbers with style... Please hold on!",
    "Our payroll elves are working hard... Just a moment!",
    "Making math magic happen... Your patience is appreciated!",
    "Calculating your figures with flair... Hang tight!",
    "Counting beans like a pro... Almost there!",
    "Sifting through spreadsheets... Stay tuned!",
    "On a payroll roll... Your data is coming up soon!",
    "Brewing the perfect payroll potion... Hold your horses!",
    "Tallying up with a twist... We'll be quick!",
    "Beaming up your payroll data... Stay with us!",
    "Juggling numbers like a circus... Your wait is almost over!",
    "In the midst of payroll wizardry... Thanks for your patience!",
    "Conducting a financial symphony... Please bear with us!",
    "Running the payroll marathon... Nearing the finish line!",
    "Crafting your payroll masterpiece... Just a little longer!",
    "Perfecting payroll calculations... Your patience is golden!",
    "Aligning the digits in harmony... Just a moment more!"
];
var currentPosition;

function startLoadingAnimation() {

    //THIS FUNCTION ISNT BEING CALLED FOR THE FIRST AJAX CALLS IN THE DOCUMENT.READY BECAUSE IT IS INITIALIZED LATE....
    // Randomly select a message
    var randomMessage = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];

    // Update the loading message
    document.getElementById('loadingMessage').innerText = randomMessage;


    document.getElementById('loadingOverlay').style.display = 'flex';
}

function stopLoadingAnimation() {
    setTimeout(function () {
        document.getElementById('loadingOverlay').style.display = 'none';
    }, 500);
}

$(document).ready(function () {
    $("#accountSettings").hide();
    $("#mobileClockFeature").hide();

    // Update the date and time upon loading
    updateDateTime();

    // Update the date and time every minute
    setInterval(updateDateTime, 60000);

    LoadEmployeeDetails();

});

$(document).ajaxStart(function () {
    startLoadingAnimation();
});

$(document).ajaxStop(function () {
    stopLoadingAnimation();
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

function updateDateTime() {
    const now = new Date();
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const timeOptions = { hour: '2-digit', minute: '2-digit' };

    document.getElementById('current-time').textContent = now.toLocaleTimeString(undefined, timeOptions);
    document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, dateOptions);
}

function LoadEmployeeDetails() {
    var userImage = localStorage.getItem('userImage');
    var fullName = localStorage.getItem('fullName');
    var email = localStorage.getItem('userEmail');
    var position = localStorage.getItem('position');
    if (userImage) {
        $(".userImage").attr("src", "data:image/png;base64," + userImage);
    }
    else {
        $(".userImage").attr("src", 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iMTYiIHdpZHRoPSIxNiIgdmlld0JveD0iMCAwIDUxMiA1MTIiPjwhLS0hRm9udCBBd2Vzb21lIEZyZWUgNi41LjEgYnkgQGZvbnRhd2Vzb21lIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20gTGljZW5zZSAtIGh0dHBzOi8vZm9udGF3ZXNvbWUuY29tL2xpY2Vuc2UvZnJlZSBDb3B5cmlnaHQgMjAyNCBGb250aWNvbnMsIEluYy4tLT48cGF0aCBvcGFjaXR5PSIxIiBmaWxsPSIjMUUzMDUwIiBkPSJNMjU2IDI4OGM3OS41IDAgMTQ0LTY0LjUgMTQ0LTE0NFMzMzUuNSAwIDI1NiAwIDExMiA2NC41IDExMiAxNDRzNjQuNSAxNDQgMTQ0IDE0NHptMTI4IDMyaC01NS4xYy0yMi4yIDEwLjItNDYuOSAxNi03Mi45IDE2cy01MC42LTUuOC03Mi45LTE2SDEyOEM1Ny4zIDMyMCAwIDM3Ny4zIDAgNDQ4djE2YzAgMjYuNSAyMS41IDQ4IDQ4IDQ4aDQxNmMyNi41IDAgNDgtMjEuNSA0OC00OHYtMTZjMC03MC43LTU3LjMtMTI4LTEyOC0xMjh6Ii8+PC9zdmc+' + userImage);
    }
    $(".usernametext").html(fullName);
    $(".emailtext").html(email);
    $(".depttext").html(position);


}

function openAccountSettings() {

    $("#mainPageContent").hide();
    $("#accountSettings").show();
    $("#mobileClockFeature").hide();

}

function updatePwdBtn() {

    //get cookie value(jwt token) to check the user's rights to update password. He can change only his own password.
    var jwtToken = getCookie("jwttoken");

    //get the old and new password values
    var oldPwd = $("#idOldPwd").val();
    var newPwd = $("#idNewPwd").val();
    var confirmPwd = $("#idNewPwdAgain").val();

    //check if the new password and confirm password are same
    if (newPwd != confirmPwd) {
        displayErrorMessage("New password and confirm password are not same", true);
        return;
    }
    else {
        //save the password in database using ajax
        $.ajax({
            url: "Login_New.aspx/UpdatePassword",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                "oldPwd": oldPwd,
                "newPwd": newPwd
            }),
            headers: {
                'Authorization': `Bearer ${jwtToken}`
            },
            success: function (data) {
                if (data.d == 1) displaySuccessMessage("Password updated successfully");
                else displayErrorMessage("Password update failed", false);
            },
            error: function (xhr, data) {
                displayErrorMessage("Update: " + xhr.responseText, true);
            }
        });
    }
}

function loadMyLocation() {
    if (navigator.geolocation) {
        var options = {
            enableHighAccuracy: true, // Request high accuracy
            timeout: 10000,           // Maximum time allowed to try to get the location
            maximumAge: 0             // Don't use cached location data
        };

        navigator.geolocation.getCurrentPosition(showPosition, showError, options);
    } else {
        displayErrorMessage("Geolocation is not supported by this browser.");
    }
}

function showPosition(position) {
    currentPosition = position; // Store the current position
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    // Display these coordinates on the map
    displayMap(latitude, longitude);
    
    $("#miniMap").data('Latitude', latitude);
    $("#miniMap").data('Longitude', longitude);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            displayErrorMessage("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            displayErrorMessage("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            displayErrorMessage("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            displayErrorMessage("An unknown error occurred.");
            break;
    }
}

function displayMap(lat, lng) {
    var mapOptions = {
        center: new google.maps.LatLng(lat, lng),
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var map = new google.maps.Map(document.getElementById('miniMap'), mapOptions);

    // Add a marker to show the location
    var marker = new google.maps.Marker({
        position: mapOptions.center,
        map: map
    });
}

function openGeolocationSettings() {
    $("#mainPageContent").hide();
    $("#accountSettings").hide();
    $("#mobileClockFeature").show();
}

function saveMyLocation() {
    var latitude = $("#miniMap").data('Latitude');
    var longitude = $("#miniMap").data('Longitude');
    var locationName = $("#locationName").val();
    //if either of these are empty then we need to show error message
    if (!latitude || !longitude || locationName == "") {
        displayWarningMessage("Please select a location on the map and enter a location name");
        return;
    }
    else {
        var jwtToken = getCookie("jwttoken");

        //save the location in database using ajax
        $.ajax({
            url: "Login_New.aspx/SaveLocationPunch",
            type: "POST",
            contentType: "application/json",
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            data: JSON.stringify({
                "latitude": latitude,
                "longitude": longitude,
                "locationName": locationName
            }),
            success: function (data) {
                if (data.d == 1) displaySuccessMessage("Location saved successfully");
                else if (data.d == -1) displayWarningMessage("Location already saved");
                else displayErrorMessage("Save failed",true);
            },
            error: function (xhr, data) {
                displayErrorMessage("Save failed " + xhr.responseText, true);
            }
        });
    }
}