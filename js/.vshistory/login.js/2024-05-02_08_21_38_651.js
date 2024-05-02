$(document).ready(function () {
    let submitCount = 0;
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
            // Ensure these variables are defined or replace this check with your authentication logic
            if (username === demoEmail && password === demoPassword) {
                alert('Login successful!');
            } else {
                alert('Login failed: Invalid credentials.');
                submitCount++;
            }
        } else {
            submitCount++;
        }

        
    });
});
