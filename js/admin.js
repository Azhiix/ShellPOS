$(document).ready(function () {
    // Handler for clicking on the "Create An Account" button
    $("#submitBtn").click(function () {
        var username = $("#username").val();
        var password = $("#password").val();
        var checkboxValue = $('#isAdmin').is(':checked');
        var roleid = $('#roleSelect').val(); 
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

        

        $.ajax({
            type: "POST",
            url: "admin.aspx/validateCreateLogin",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ username: username, password: password, roleid }),
            success: function (response) {
                console.log(response);
                alert('Successfully created user');
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });

    // Handler for the "View All Users" button
    $('.view-users').on('click', function () {
        $('#userSelect').show()

        $.ajax({
            type: "POST",
            url: "admin.aspx/retrieveAllUserInfo",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                var users = response.d; // Assuming each user's info is an object in an array
                var select = $('#userSelect');
                select.empty();
                select.append($('<option>', { value: '', text: 'Select User', selected: true, disabled: true }));
                users.forEach(function (user) {
                    select.append($('<option>', {
                        value: user.UserId,
                        text: user.Fname,
                        'data-roleid': user.RoleId,
                        'data-permissions': user.PermissionNames,
                        'data-fullname': user.Fname,
                        'data-username': user.Username
                    }));
                });
                select.closest('.form-group').show();
                console.log(users)
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });

    // Change event handler for user selection
    $('#userSelect').change(function () {
        var selectedOption = $(this).find('option:selected');
        $('#roleId').val(selectedOption.data('roleid'))
        var permissionNames = $('#permissionNames').val(selectedOption.data('permissions'));
        var username = $('#usernameChange').val(selectedOption.data('username'));
        console.log(username.val())
         
        console.log(permissionNames.val());
        $('#fname').val(selectedOption.data('fullname'));
        $(".clsUserDetails").show();
    });

   
    $('#editBtn').click(function () {
        var username = $('#usernameChange').val();
        var password = $('#passwordChange').val(); 
        var roleId = $('#roleId').val();
        var fname = $('#fname').val();
        var permissionNames = $('#hiddenPermissionNames').val(); 
        var userId = $("#userSelect").find('option:selected').val();

        $.ajax({
            type: "POST",
            url: "admin.aspx/updateUser",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                userId: userId,
                username: username,
                password: password, // Handling password securely is important, ensure backend handles this safely
                RoleId: roleId,
                PermissionNames: permissionNames,
                fname: fname
            }),
            success: function (response) {
                alert('User updated successfully');
            },
            error: function (xhr, textStatus, errorThrown) {
                console.error("Error: " + errorThrown);
                $("#result").text("Error: " + errorThrown);
            }
        });
    });

    $(".clsUserDetails").hide();
    $('#userSelect').hide()
   
});
