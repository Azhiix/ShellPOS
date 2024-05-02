$(document).ready(function () {
    var submitCount = 0;

    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var username = $('#exampleInputUsername1').val();
        var password = $('#exampleInputPassword1').val();

        var valid = true;

        // Check if username is empty
        if (username.length === 0) {
            $('#exampleInputUsername1').addClass('is-invalid');
            valid = false;
        } else {
            $('#exampleInputUsername1').removeClass('is-invalid');
        }

        // Check if password is empty
        if (password.length === 0) {
            $('#exampleInputPassword1').addClass('is-invalid');
            valid = false;
        } else {
            $('#exampleInputPassword1').removeClass('is-invalid');
        }

        // Only proceed with fetch if the form is valid
        if (valid) {
            fetch('login.aspx/ValidateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }).then(response => {
                console.log(response);
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
                .then(data => {
                    if (data.valid) {
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
                }).catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                });
        }
    });
});
