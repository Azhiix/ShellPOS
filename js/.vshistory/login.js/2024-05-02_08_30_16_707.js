$(document).ready(function () {
    var submitCount = 0; // Initialize submitCount
    const demoEmail = "user@example.com"; // Placeholder email
    const demoPassword = "password123"; // Placeholder password

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var username = $('#exampleInputUsername1').val();
        var password = $('#exampleInputPassword1').val();

        var valid = true;

        if (username.length === 0) {
            $('#exampleInputUsername1').addClass('is-invalid');
            valid = false;
        } else {
            $('#exampleInputUsername1').removeClass('is-invalid');
        }

        if (password.length === 0) {
            $('#exampleInputPassword1').addClass('is-invalid');
            valid = false;
        } else {
            $('#exampleInputPassword1').removeClass('is-invalid');
        }

        if (valid) {
            if (username === demoEmail && password === demoPassword) {
                alert('Login successful!');
            } else {
                alert('Login failed: Invalid credentials.');
                submitCount++;
                if (submitCount > 3) { // Disable the form after 3 failed attempts
                    $('#exampleInputUsername1').prop('disabled', true);
                    $('#exampleInputPassword1').prop('disabled', true);
                    alert('You have exceeded the maximum number of login attempts. Please try again later.');
                }
            }
        }
    });
});
