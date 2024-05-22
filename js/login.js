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
            fetch('login.aspx/ValidateLogin', {
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
                    let parsedData = JSON.parse(data.d);
                    if (parsedData.Error) {
                        alert('Login failed: ' + parsedData.Error);
                    } else {
                        document.cookie = "Token=" + parsedData.Token + "; path=/";  // Store the token in a cookie
                     
                       window.location.href = 'sales.aspx';
                    }
                })

                .catch(error => {
                    console.error('There has been a problem with your fetch operation:', error);
                    alert('Unable to login due to a network error. Please try again.');
                });
        }
    });
});





