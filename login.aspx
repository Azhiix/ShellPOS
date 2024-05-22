<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="Login.aspx.cs" Inherits="SezwanPayroll.Login" %>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <link rel="stylesheet" href="css/login.css"/>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.0.0/css/buttons.dataTables.min.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vite App</title>
</head>
<body>
    <div id="app" class="container">
        <div class="row justify-content-center">
            <div class="col-9 col-lg-6">
                <div class="text-center mb-3">
                    <img src="img\Revamped\Shell.svg" alt="Random Unsplash Image" width="250" height="185" class="text-center bg-white">
                </div>
                <form id="loginForm">
                    <div class="form-group">
                        <input type="text" class="form-control" id="exampleInputUsername1" placeholder="Enter Username">
                        <div class="invalid-feedback">Please enter a valid username.</div>
                    </div>
                    <div class="form-group">
                        <input type="password" class="form-control" id="exampleInputPassword1" placeholder="Password">
                        <div class="invalid-feedback">Password cannot be empty.</div>
                    </div>
                    <button type="submit" class="btn btn-primary">Sign In</button>
                </form>
            </div>
        </div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    <script src="js/login.js"></script>
</body>

   
</html>
