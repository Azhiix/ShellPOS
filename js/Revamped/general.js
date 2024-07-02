"use strict";

// Class definition
var KTSigninGeneral = function() {
    // Elements
    var form;
    var submitButton;
    var validator;

    // Handle form
    var handleForm = function(e) {
        // Init form validation rules. For more info check the FormValidation plugin's official documentation:https://formvalidation.io/
        validator = FormValidation.formValidation(
			form,
			{
				fields: {					
					'email': {
                        validators: {
							notEmpty: {
								message: 'Email address is required'
							}
						}
					},
                    'password': {
                        validators: {
                            notEmpty: {
                                message: 'The password is required'
                            }
                        }
                    } 
				},
				plugins: {
					trigger: new FormValidation.plugins.Trigger(),
					bootstrap: new FormValidation.plugins.Bootstrap5({
                        rowSelector: '.fv-row'
                    })
				}
			}
		);		

        // Handle form submit
        submitButton.addEventListener('click', function (e) {
            // Prevent button default action
            e.preventDefault();

            // Show loading indication
            submitButton.setAttribute('data-kt-indicator', 'on');

            // Disable button to avoid multiple click 
            submitButton.disabled = true;

            // Check if "Remember Me" is selected and store the username
            var rememberMeChecked = $('#remember_me').is(':checked');
            var username = $('input[name="uname"]').val();
            if (rememberMeChecked) {
                localStorage.setItem('remember_me', 'true');
                localStorage.setItem('uname', username);
            } else {
                localStorage.removeItem('remember_me');
                localStorage.removeItem('uname');
            }

            // Validate form
            validator.validate().then(function (status) {
                if (status == 'Valid') {
                    //adding the ajax request
                    jQuery.ajax({
                        type: "POST",
                        url: "Login_New.aspx/Login", //It calls our web method  
                        data: JSON.stringify({
                            uname: form.querySelector('[name="uname"]').value,
                            password: form.querySelector('[name="password"]').value,
                            rememberMe: $('#remember_me').is(':checked') // Get the state of the "Remember Me" checkbox
                        }),
                        contentType: "application/json; charset=utf-8",
                        dataType: "JSON",
                        async: false,
                        success: function (retVal) {
                            if (retVal.d != null) {
                                var expiryDate = new Date();
                                if ($('#remember_me').is(':checked')) {

                                    expiryDate.setTime(expiryDate.getTime() + (300 * 60 * 1000)); // 6hours in milliseconds
                                }
                                else {
                                    expiryDate.setTime(expiryDate.getTime() + (120 * 60 * 1000)); // 2hours in milliseconds
                                }
                                document.cookie = "jwttoken=" + retVal.d.Token + "; expires=" + expiryDate.toUTCString() + "; path=/";
                                localStorage.setItem('userImage', retVal.d.ImageData);
                                localStorage.setItem('fullName', retVal.d.fullName);
                                localStorage.setItem('userEmail', retVal.d.email);
                                localStorage.setItem('position', retVal.d.position);

                                //changing button color to make it more attractive
                                submitButton.setAttribute('style', 'background-color:green !important')
                                window.location.replace("/attendance_New.aspx");
                            }
                            else {
                                Swal.fire({
                                    text: "Invalid Username or Password. Please try again.",
                                    icon: "error",
                                    buttonsStyling: false,
                                    confirmButtonText: "Ok",
                                    customClass: {
                                        confirmButton: "btn btn-primary"
                                    }
                                });
                                // Hide loading indication
                                submitButton.removeAttribute('data-kt-indicator');

                                // Enable button
                                submitButton.disabled = false;
                            }

                        },
                        failure: function (msg) {
                            alert(msg);
                        },
                        error: function (xhr, status, error) {
                            console.log(xhr.responseText);
                        }
                    });

                    
                } else {
                    
                    Swal.fire({
                        text: "Please check your entries and try again.",
                        icon: "error",
                        buttonsStyling: false,
                        confirmButtonText: "Ok, got it!",
                        customClass: {
                            confirmButton: "btn btn-primary"
                        }
                    });
                    
                    submitButton.removeAttribute('data-kt-indicator');
                    
                    submitButton.disabled = false;
                }
            });

            // Autofill the username if "Remember Me" was selected
            if (localStorage.getItem('remember_me') === 'true') {
                $('input[name="uname"]').val(localStorage.getItem('uname'));
                $('#remember_me').prop('checked', true);
            }
        });

    }

    // Public functions
    return {
        // Initialization
        init: function() {
            form = document.querySelector('#kt_sign_in_form');
            submitButton = document.querySelector('#kt_sign_in_submit');
            
            handleForm();
        }
    };
}();

// On document ready
KTUtil.onDOMContentLoaded(function() {
    KTSigninGeneral.init();
    checkDisconStatus();
});

function checkDisconStatus() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    if (urlParams.get('discon') == 'true') {
        $("#disconMsg").show();
    }
}

function getCookie(name) {
    var cookieArr = document.cookie.split(";");

    for (var i = 0; i < cookieArr.length; i++) {
        var cookiePair = cookieArr[i].split("=");
        if (name == cookiePair[0].trim()) {
            // Decode the cookie value and return
            return decodeURIComponent(cookiePair[1]);
        }
    }
    // Return null if not found
    return null;
}

function logout() {
    // Clear JWT token from the cookie
    document.cookie = 'jwttoken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';

    // Clear local storage
    localStorage.removeItem('userImage');
    localStorage.removeItem('fullName');
    localStorage.removeItem('email');
    localStorage.removeItem('position');

    // Optional: Make an AJAX call to server-side logout WebMethod
    $.ajax({
        type: 'POST',
        url: 'Login_New.aspx/Logout', // Replace with your server-side URL
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function (response) {
            window.location.href = '/Login_New.aspx?discon=true'; // Redirect to login page on successful logout
        },
        error: function (err) {
            console.error('Logout failed:', err);
        }
    });
}

