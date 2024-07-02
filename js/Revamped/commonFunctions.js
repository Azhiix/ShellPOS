
function findDayFromDate(dateString) {
    var dateParts = dateString.split("/");
    var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]); // month is 0-indexed

    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayName = daysOfWeek[dateObject.getDay()];

    return dayName;
}

function formatDotNetJsonDate(jsonDate) {
    // Extract the timestamp from /Date(1567540800000)/
    var timestamp = parseInt(jsonDate.replace(/\/Date\((\d+)\)\//, '$1'));

    // Create a new Date object
    var date = new Date(timestamp);

    // Format the date
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    var day = ('0' + date.getDate()).slice(-2);

    return year + '-' + month + '-' + day;
}

function convertJsonDateToTime(jsonDate) {
    // Extract the number of milliseconds from the JSON date
    const milliseconds = parseInt(jsonDate.match(/\d+/)[0], 10);

    // Create a new Date object using the extracted milliseconds
    const date = new Date(milliseconds);

    // Format the time part
    const time = date.toTimeString().split(' ')[0]; // This will give you "HH:mm:ss"

    return time;
}

function formatDate(inputDate) {
    var parts = inputDate.split("/");
    var parsedDate = new Date(parts[2], parts[1] - 1, parts[0]); // Month is 0-indexed
    return parsedDate.getFullYear() + "-" + (parsedDate.getMonth() + 1).toString().padStart(2, '0') + "-" + parsedDate.getDate().toString().padStart(2, '0');
}

function formatDotNetJsonDateInAnotherFormat(jsonDate) {
    // Extract the timestamp from /Date(1567540800000)/
    var timestamp = parseInt(jsonDate.replace(/\/Date\((\d+)\)\//, '$1'));

    // Create a new Date object
    var date = new Date(timestamp);

    // Format the date
    var year = date.getFullYear();
    var month = ('0' + (date.getMonth() + 1)).slice(-2); // Months are zero-based
    var day = ('0' + date.getDate()).slice(-2);

    return day + '/' + month + '/' + year;
}

function convertIntegerMonthToString(month) {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const monthName = monthNames[month];
    return monthName;

}

function findDayFromInteger(day) {
    var daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var dayName = daysOfWeek[day];

    return dayName;
}

function formatDateToYYYYMMDD(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // Add 1 because months are zero-based
    var day = date.getDate();

    // Pad the month and day with leading zeros if necessary
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    var formattedDate = `${year}-${month}-${day}`;
    return formattedDate;
}

function getDayOfWeek(dateString) {
    // Split the date string into parts
    var parts = dateString.split('/');

    // Please note that months are 0-based in JavaScript, hence subtract 1 from the month
    var day = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10) - 1;
    var year = parseInt(parts[2], 10);

    // Create a new Date object
    var date = new Date(year, month, day);

    // Get the day of the week
    return date.getDay();
}

function convertJsonDateToHHMM(jsonDate) {
    // Extract the number of milliseconds from the JSON date
    const milliseconds = parseInt(jsonDate.match(/\d+/)[0], 10);

    // Create a new Date object using the extracted milliseconds
    const date = new Date(milliseconds);

    // Format the time part to "HH:mm"
    const hours = ('0' + date.getHours()).slice(-2);
    const minutes = ('0' + date.getMinutes()).slice(-2);
    const time = `${hours}:${minutes}`;

    return time;
}

function formatDateToDDMMYYYY(date) {
    var year = date.getFullYear();
    var month = date.getMonth() + 1; // Add 1 because months are zero-based
    var day = date.getDate();

    // Pad the month and day with leading zeros if necessary
    month = month < 10 ? '0' + month : month;
    day = day < 10 ? '0' + day : day;

    var formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
}

function displayErrorMessage(message, includeFooter = false) {
    Swal.fire({
        icon: "error",
        title: "Error",
        text: message,
        footer: includeFooter ? 'Please contact your administrator' : undefined
    });
}

function displayWarningMessage(message) {
    Swal.fire({
        icon: "warning",
        title: "Hold on!",
        text: message,
    });
}

function displayWarningHtml(htmlContent) {
    Swal.fire({
        icon: "warning",
        title: "Hold on!",
        html: htmlContent
    });
}

function displaySuccessMessage(message) {
    Swal.fire({
        icon: "success",
        title: "Success",
        text: message
    });
}

function findCompanyDefaults() {
    var jwtToken = getCookie("jwttoken");

    jQuery.ajax({
        type: "GET",
        url: "timesheet.aspx/getCompanyDefaults",
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {

            if (msg.d == null) {
                window.location.href = '/Login_New.aspx?discon=true';
            }

            localStorage.setItem('companyName', msg.d.companyName);
            localStorage.setItem('CompAddress', msg.d.compAddress);
            localStorage.setItem('BRN', msg.d.BRN);
            localStorage.setItem('VAT', msg.d.VAT);
            localStorage.setItem('bulkPaymentID', msg.d.bulkPaymentID);
            localStorage.setItem('BPAcNumber', msg.d.BPAcNumber);
            localStorage.setItem('BPAcType', msg.d.BPAcType);
            localStorage.setItem('BPText', msg.d.BPText);
            localStorage.setItem('email', msg.d.email);
            localStorage.setItem('telNum', msg.d.telNum);
            localStorage.setItem('faxNum', msg.d.faxNum);
            localStorage.setItem('startDate', msg.d.shiftDetails.startDate);
            localStorage.setItem('startMonth', msg.d.shiftDetails.startMonth);
            localStorage.setItem('endDate', msg.d.shiftDetails.endDate);

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function findLastDayOfMonth(year, month) {
    // JavaScript counts months from 0 to 11. January is 0, December is 11.
    // The day is set to 0 to get the last day of the previous month.
    var lastDayOfMonth = new Date(year, month + 1, 0);
    return lastDayOfMonth.getDate();
}

function getPreviousMonthYear(currentYear, currentMonth) {
    // JavaScript counts months from 0 to 11. January is 0, December is 11.
    // Subtract one from the month to get the previous month
    var previousMonth = currentMonth - 1;

    // If the current month is January (0), we need to roll back to December (11) of the previous year
    if (previousMonth < 0) {
        previousMonth = 11; // December
        currentYear -= 1;   // Previous year
    }

    return {
       previousYear: currentYear,
        previousMonth: previousMonth
    };
}

function isLockedPeriod(month, year) {
    var jwtToken = getCookie("jwttoken");
    var isLocked = null;

    jQuery.ajax({
        type: "POST",
        url: "bulkpay.aspx/isLocked",
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        async: false,
        data: JSON.stringify({ month: month, year: year }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            isLocked = msg.d;
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        },
        error: function (xhr, status, error) {
            displayErrorMessage(error, true);
        }
    });

    return isLocked;
}