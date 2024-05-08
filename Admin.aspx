<%@ Page Title="" Language="C#" MasterPageFile="~/Site1.Master" AutoEventWireup="true" CodeBehind="Admin.aspx.cs" Inherits="SezwanPayroll.Admin" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
      
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">



    <h1>This is the Admin Page</h1>

    <div>
        <h1>Create a New Account</h1>
        <button class="btn-bg-dark">Create Account</button>
    </div>

     <form id="registrationForm">
        Username: <input type="text" id="username" name="username"><br>
        Password: <input type="password" id="password" name="password"><br>
        <input type="button" value="Create Account" id="submitBtn">
    </form>

    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js"></script>
    <script src="js/admin.js"></script>
</asp:Content>

