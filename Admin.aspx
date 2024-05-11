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
        <div class="dropdown-menu p-4" aria-labelledby="dropdownMenuButton">
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
        <button class="btn btn-primary view-users dropdown-toggle" type="button" id="userdropdownmenu" data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            View All Users<i class="fas fa-user-plus"></i>
        </button>


        <div class="form-group hidden">

            <select class="form-select" id="userSelect">
                <option disabled selected>Select User</option>
                <option value="Luke Curtis">Luke Curtis</option>
                <option value="Jemma Coetzee">Jemma Coetzee</option>
                <option value="Cameron Curtis">Cameron Curtis</option>
            </select>
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






        <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
        <script src="js/admin.js"></script>
</asp:Content>
