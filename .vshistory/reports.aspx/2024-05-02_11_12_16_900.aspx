﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="reports.aspx.cs" Inherits="SezwanPayroll.reports" %>


<head runat="server">
    <title>Reports</title>
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.css" integrity="sha512-MQXduO8IQnJVq1qmySpN87QQkiR1bZHtorbJBD0tzy7/0U9+YIC93QWHeGTEoojMVHWWNkoCp8V6OzVSYrX0oQ==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</head>
<body>

    <div>
        <input type="text" id="dateFrom" placeholder="Date From">
<input type="text" id="dateTo" placeholder="Date To">
<select id="clientSelect">
    <option value="Client1">Client 1</option>
    <option value="Client2">Client 2</option>
</select>
<input type="text" id="vehicleRegNo" placeholder="Vehicle Registration No">
    </div>
    <div class="ag-theme-quartz" style="height: 500px; width: 500px" id="myGrid"></div>



    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
   <script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js" integrity="sha512-K/oyQtMXpxI4+K0W7H25UopjM8pzq0yrVdFdG21Fh5dBe91I40pDd9A4lzNlHPHBIP2cwZuoxaUSX0GJSObvGA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>


    <script src="https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.3.1/ag-grid-community.min.js" integrity="sha512-pyep0b8pFXiMbcaxISZ03VOCbUVoUal2G9uFWCrjAJsSO/koeng2k2/6oLOq+2DUbAER3uC/YVB5GSISuTWYLQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datepicker/1.0.10/datepicker.min.js" integrity="sha512-RCgrAvvoLpP7KVgTkTctrUdv7C6t7Un3p1iaoPr1++3pybCyCsCZZN7QEHMZTcJTmcJ7jzexTO+eFpHk4OCFAg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="js/reports.js"></script>

</body>

