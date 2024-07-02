$(document).ready(function () {
    findDateAndTime();
});

function findDateAndTime() {
    const currentTime = new Date();
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const currentDate = new Date();
    const dayOfWeek = currentDate.getDay();
    const weekday = weekdays[dayOfWeek];
    const monthIndex = currentDate.getMonth();
    const monthName = months[monthIndex];

    $(".timeOfTheDay").html(currentTime.getHours() + ":" + currentTime.getMinutes());
    $(".dateOfTheDay").html(weekday + " " + currentDate.getDate() + " " + monthName+", "+currentDate.getFullYear());
}

// now we need to load the correct boxes that the user needs to view
