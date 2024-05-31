$(document).ready(function() {
    // Handle dropdown menu toggle
    $('#navbarDropdownMenuLink').on('click', function(event) {
        event.preventDefault();
        console.log("Dropdown clicked");
        $('#navbarDropdownMenu').toggle();
    });

    // Handle user logout
    $('.logUserOut').on('click', function(event) {
        event.preventDefault();
        console.log("Logout clicked");
        if (confirm('Are you sure you want to logout?')) {
            console.log("Logging out");
            // Invalidate the JWT token cookie
            document.cookie = "Token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=localhost;";
            // Redirect to login page
            window.location.href = "login.aspx";
        }

        //lets also reload the page
        location.reload();
    });
});
