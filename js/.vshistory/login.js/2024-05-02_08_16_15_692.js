



$(document).ready(function () {
    let submitCount = 0;
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var username = $('#exampleInputUsername').val();
        var password = $('#exampleInputPassword1').val();
       
       
        var valid = true;

        if (username.length === 0) {
            $('#exampleInputUsername').addClass('is-invalid'); 
        }

        if (password.length === 0) {
            $('#exampleInputPassword1').addClass('is-invalid');
            valid = false;
        } else {
            $('#exampleInputPassword1').removeClass('is-invalid');
        }

        if (valid) {
            if (email === demoEmail && password === demoPassword) {
                alert('Login successful!');
            } else {
                alert('Login failed: Invalid credentials.');
                submitCount++;
            }
        } else {
            submitCount++;
        }

        if (submitCount > 3) {
            $('#exampleInputEmail1').prop('disabled', true);
            $('#exampleInputPassword1').prop('disabled', true);
            alert('You have exceeded the maximum number of login attempts. Please try again later.');
        }
    });
});


