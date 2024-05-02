<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="reports.aspx.cs" Inherits="SezwanPayroll.reports" %>


<head runat="server">
    <title>Reports</title>
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-grid.css">
    <link rel="stylesheet" href="https://unpkg.com/ag-grid-community/dist/styles/ag-theme-alpine.css">
</head>
<body>
   <div class="ag-theme-quartz" style="height:500px; width:200px" id="myGrid"></div>




<script src="https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.3.1/ag-grid-community.min.js" integrity="sha512-pyep0b8pFXiMbcaxISZ03VOCbUVoUal2G9uFWCrjAJsSO/koeng2k2/6oLOq+2DUbAER3uC/YVB5GSISuTWYLQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="js/reports.js"></script>

</body>

