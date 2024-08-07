﻿import './style.css'





$(document).ready(function () {
    let submitCount = 0;
    $('#loginForm').on('submit', function (e) {
        e.preventDefault();

        var email = $('#exampleInputEmail1').val();
        var password = $('#exampleInputPassword1').val();
        var demoEmail = 'demo@example.com';
        var demoPassword = 'password123';
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        var valid = true;

        if (!emailRegex.test(email)) {
            $('#exampleInputEmail1').addClass('is-invalid');
            valid = false;
        } else {
            $('#exampleInputEmail1').removeClass('is-invalid');
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


$(document).ready(function () {
    var table = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'excel',
                text: 'Export to Excel',
                title: 'Data_Export',
                className: 'btnExcel'
            }
        ]
    });

    $('#exportButton').on('click', function () {
        $('.btnExcel').click();
    });
});
