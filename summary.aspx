﻿<%@ Page Title="Summary" Language="C#" MasterPageFile="~/Site1.Master" AutoEventWireup="true" CodeBehind="summary.aspx.cs" Inherits="SezwanPayroll.summary" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="css/summary.css" />
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="container">
        <h1 class="text-center">All Your Sales</h1>
        <div class="table-responsive">
            <table id="salesTable" class="table table-striped">
                <thead>
                    <tr>
                        <th>Sale Date</th>
                        <th>Client Name</th>
                        <th>Total Cost</th>
                        <th>Actions</th>
                        <th>Print</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Sales rows will be populated here -->
                </tbody>
            </table>
        </div>
    </div>
    <div id="saleDetailsTemplate" class="details text-center">
        <p>Sale Date: <span id="TimePrint">05/29/2024</span></p>
        <p>Client: <span id="clientValue">Sezwan Co Ltd</span></p>
        <p>Driver: <span id="driverNamePrint">Driver 2</span></p>
        <p>Car Registration: <span id="carRegNoPrint">XYZ789</span></p>
        <p>Mileage: <span id="mileagePrint"></span></p>
        <div class="table-responsive">
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Unit Price</th>
                        <th>Total Price</th>
                    </tr>
                </thead>
                <tbody id="SalesAndTotalCosts">
                    <tr>
                        <td class='item'>WATER CRYSTAL BIG CYLINDER</td>
                        <td class='quantity'>23424</td>
                        <td class='unitPrice'>200</td>
                        <td class='totalPriceInternal'>4684800</td>
                    </tr>
                    <tr class='totalPrice'>
                        <td colspan="3" class="text-end"><strong>Total</strong></td>
                        <td><strong>4684800</strong></td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <div id="totalCostContainer">
        <!-- Total cost will be displayed here -->
    </div>

    <div id='totalSalesContainer'></div>
    <div id="totalCashCostContainer"></div>
    <div class='printWindow text-center'>
        <!-- Print window content will be displayed here -->
    </div>
    <script src="js/summary.js"></script>
</asp:Content>
