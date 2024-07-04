<%@ Page Language="C#" AutoEventWireup="true" MasterPageFile="~/Site1.Master" CodeBehind="sales.aspx.cs" Inherits="SezwanPayroll.sales" %>

<asp:Content ID="ContentHead" ContentPlaceHolderID="head" runat="server">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/css/select2.min.css" rel="stylesheet" />
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.0.0/css/buttons.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" integrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />
</asp:Content>

<asp:Content ID="ContentBody" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <asp:ScriptManager ID="ScriptManager1" runat="server" EnablePageMethods="true" />
    <div class="container mx-auto">
        <h2>This is the content page</h2>
        <div class="container mt-4">
            <div class="row g-3 align-items-center">
                <div class="col-md-3">
                    <input type="text" class="form-control flatpickr-input" id="dateFrom" placeholder="Date From" readonly="readonly">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control flatpickr-input" id="dateTo" placeholder="Date To" readonly="readonly">
                </div>
                <div class="col-md-2">
                    <select class="form-select" id="clientSelect">
                        <option value="">Select Client</option>
                        <option value="1">CASH</option>
                        <option value="2">Sezwan Co Ltd</option>
                        <option value="3">Test User</option>
                        <option value="4">Keval</option>
                        <option value="5">Luke</option>
                        <option value="6">Jemma</option>
                        <option value="7">Luke Curtis</option>
                        <option value="8">Luke Curtis</option>
                        <option value="9">DHL</option>
                        <option value="10">Fedex</option>
                    </select>
                </div>
                <div class="col-md-2">
                    <input type="text" class="form-control" id="vehicleRegNo" placeholder="Vehicle Registration No">
                </div>
                <div class="col-md-2">
                    <select class="form-select" id="agentSelect">
                        <option value="0">All Agents</option>
                        <option value="1">lukeeeeeee</option>
                        <option value="2">admin</option>
                        <option value="3">Lucas</option>
                        <option value="4">admintest</option>
                        <option value="5">testadminnew</option>
                        <option value="6"></option>
                        <option value="7">test100</option>
                        <option value="8">lukecurtis</option>
                        <option value="9">LukeCurtis</option>
                        <option value="10">LukeCurtis</option>
                        <option value="11">dfjhtrj</option>
                        <option value="12">LukeCurtis</option>
                        <option value="13">test</option>
                        <option value="14">luke</option>
                        <option value="15">lukecurtie123</option>
                        <option value="16">test1000</option>
                        <option value="17">latestversion</option>
                        <option value="18">test</option>
                        <option value="19">Jsjssssj</option>
                        <option value="20">keval</option>
                        <option value="21">jemma123</option>
                        <option value="1012">lukecurtie</option>
                        <option value="1013">qwe</option>
                        <option value="1014">qe</option>
                        <option value="1015">Cameron123</option>
                        <option value="1016">Luke</option>
                    </select>
                </div>
            </div>
            <section class="d-flex justify-content-between">
                <button id="getSales" type="button" class="btn btn-primary mt-3">Search</button>
                <button id="downloadCSV" class="btn btn-success mt-3">Download CSV</button>
                <button id="generatePDF" class="btn btn-success mt-3 d-none">Download Invoice</button>
            </section>
        </div>
        <div class="ag-theme-quartz mt-4" style="height: 100vh;" id="salesGrid"></div>
    </div>
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script type="module" src="js/payments.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js" integrity="sha512-K/oyQtMXpxI4+K0W7H25UopjM8pzq0yrVdFdG21Fh5dBe91I40pDd9A4lzNlHPHBIP2cwZuoxaUSX0GJSObvGA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.min.js" integrity="sha512-ykZ1QQr0Jy/4ZkvKuqWn4iF3lqPZyij9iRv6sGqLRdTPkY69YX6+7wvVGmsdBbiIfN/8OdsI7HABjvEok6ZopQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.3.1/ag-grid-community.min.js" integrity="sha512-pyep0b8pFXiMbcaxISZ03VOCbUVoUal2G9uFWCrjAJsSO/koeng2k2/6oLOq+2DUbAER3uC/YVB5GSISuTWYLQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datepicker/1.0.10/datepicker.min.js" integrity="sha512-RCgrAvvoLpP7KVgTkTctrUdv7C6t7Un3p1iaoPr1++3pybCyCsCZZN7QEHMZTcJTmcJ7jzexTO+eFpHk4OCFAg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.min.js"></script>
</asp:Content>
