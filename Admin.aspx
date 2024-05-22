<%@ Page Title="Admin" Language="C#" MasterPageFile="~/Site1.Master" AutoEventWireup="true" CodeBehind="Admin.aspx.cs" Inherits="SezwanPayroll.Admin" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="dropdown mt-4">
        <button class="btn btn-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Add A User <i class="fas fa-user-plus"></i>
        </button>
        <div class="dropdown-menu p-4 w-100 min-h-100" aria-labelledby="dropdownMenuButton">
            <form id="registrationForm">
                <div class="form-group">
                    <label for="username">Username:</label>
                    <input type="text" class="form-control" id="username" name="username">
                </div>
                <div class="form-group">
                    <label for="password">Password:</label>
                    <input type="password" class="form-control" id="password" name="password">
                </div>
                <div class="form-group form-check">
                    <input type="checkbox" class="form-check-input" id="isAdmin" name="admin">
                    <label class="form-check-label" for="isAdmin">Is an Admin</label>
                </div>
                <button type="button" class="btn btn-success" id="submitBtn">Create An Account</button>
            </form>
        </div>
    </div>

    <div class="dropdown mt-4">
        <button class="btn btn-primary view-users dropdown-toggle w-50 mx-auto text-center" type="button" id="userdropdownmenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            View All Users <i class="fas fa-user-plus"></i>
        </button>
        <div class="form-group hidden">
            <select class="form-select" id="userSelect">
                <option disabled selected>Select User</option>
                <option value="Luke Curtis">Luke Curtis</option>
                <option value="Jemma Coetzee">Jemma Coetzee</option>
                <option value="Cameron Curtis">Cameron Curtis</option>
            </select>
        </div>
    </div>

    <div class="container mt-5 clsUserDetails">
        <div class="form-group">
            <input type="hidden" id="hiddenPermissionNames">
            <label for="usernameChange">Username:</label>
            <input type="text" class="form-control" id="usernameChange" placeholder="Enter username">
        </div>
        <div class="form-group">
            <label for="passwordChange">Password:</label>
            <input type="password" class="form-control" id="passwordChange" placeholder="Enter password">
        </div>
        <div class="form-group">
            <label for="roleId">Role:</label>
            <select class="form-control" id="roleId">
                <option value="1">User</option>
                <option value="2">Admin</option>
            </select>
        </div>
        <div class="form-group">
            <label for="fname">Full Name:</label>
            <input type="text" class="form-control" id="fname" placeholder="Enter full name">
        </div>
        <button type="button" class="btn btn-primary mt-3" id="editBtn">Edit User</button>
    </div>

    <button class="btn btn-primary dropdown-toggle mt-4" type="button" id="productDropdownMenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        View All Products <i class="fa-solid fa-money-bill"></i>
    </button>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js" integrity="sha512-v2CJ7UaYy4JwqLDIrZUI/4hqeoQieOmAZNXBeQyjo21dadnwR+8ZaIJVT8EE2iyI61OV8e6M8PP2/4hpQINQ/g==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="js/admin.js"></script>

    <script>
        $(document).ready(function () {
            $("#submitBtn").click(function () {
                var username = $("#username").val();
                var password = $("#password").val();
                var checkboxValue = $('#isAdmin').is(':checked');
                var roleid = $('#roleSelect').val();
                var valid = true;

                if (username.length === 0) {
                    $('#username').addClass('is-invalid');
                    valid = false;
                } else {
                    $('#username').removeClass('is-invalid');
                }

                if (password.length === 0) {
                    $('#password').addClass('is-invalid');
                    valid = false;
                } else {
                    $('#password').removeClass('is-invalid');
                }

                if (valid) {
                    $.ajax({
                        type: "POST",
                        url: "admin.aspx/validateCreateLogin",
                        contentType: "application/json; charset=utf-8",
                        dataType: "json",
                        data: JSON.stringify({ username: username, password: password, roleid: roleid }),
                        success: function (response) {
                            alert('Successfully created user');
                        },
                        error: function (xhr, textStatus, errorThrown) {
                            $("#result").text("Error: " + errorThrown);
                        }
                    });
                }
            });

            $('.view-users').on('click', function () {
                $('#userSelect').show();

                $.ajax({
                    type: "POST",
                    url: "admin.aspx/retrieveAllUserInfo",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    success: function (response) {
                        var users = response.d;
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
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $("#result").text("Error: " + errorThrown);
                    }
                });
            });

            $('#userSelect').change(function () {
                var selectedOption = $(this).find('option:selected');
                $('#roleId').val(selectedOption.data('roleid'));
                $('#hiddenPermissionNames').val(selectedOption.data('permissions'));
                $('#usernameChange').val(selectedOption.data('username'));
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
                        password: password,
                        RoleId: roleId,
                        PermissionNames: permissionNames,
                        fname: fname
                    }),
                    success: function (response) {
                        alert('User updated successfully');
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $("#result").text("Error: " + errorThrown);
                    }
                });
            });

            $(".clsUserDetails").hide();
            $('#userSelect').hide();
        });
    </script>
</asp:Content>
