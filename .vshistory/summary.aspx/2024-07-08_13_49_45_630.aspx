<%@ Page Title="" Language="C#" MasterPageFile="~/Site1.Master" AutoEventWireup="true" CodeBehind="summary.aspx.cs" Inherits="SezwanPayroll.summary" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="css/summary.css" />
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
</asp:Content>

<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="container my-5">
        <h1 class="text-center mb-4">All Your Sales</h1>
        <div class="d-flex justify-content-center mb-3">
            <button id="printAllSalesBtn" class="btn btn-primary btnSale">Print All Sales</button>
        </div>
        <div class="table-responsive">
            <table id="salesTable" class="table table-striped table-bordered">
                <thead class="table">
                    <tr>
                        <th>Sale Date</th>
                        <th>Client Name</th>
                        <th>Total Cost</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <!-- Sales rows will be populated here -->
                </tbody>
            </table>
        </div>

        <div id="saleDetailsTemplate" class="details text-center mt-4" style="display: none;">
            <p>Sale Date: <span id="TimePrint">05/29/2024</span></p>
            <p>Client: <span id="clientValue">Sezwan Co Ltd</span></p>
            <p>Driver: <span id="driverNamePrint">Driver 2</span></p>
            <p>Car Registration: <span id="carRegNoPrint">XYZ789</span></p>
         <button id="printSaleBtn" class="btn btn-secondary my-3 print-button">Print This Sale</button>


            <div class="table-responsive">
                <table class="table table-striped table-bordered">
                    <thead class="table-dark">
                        <tr>
                            <th>Item</th>
                            <th>Quantity</th>
                            <th>Unit Price</th>
                            <th>Total Price</th>
                        </tr>
                    </thead>
                    <tbody id="SalesAndTotalCosts">
                        <tr>
                            <td>Small Ice</td>
                            <td>423423</td>
                            <td>135</td>
                            <td>57162105</td>
                        </tr>
                        <tr>
                            <td colspan="3" class="text-end"><strong>Total</strong></td>
                            <td><strong>57162105</strong></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <div id="totalCostContainer" class="my-4 text-center">
            <!-- Total cost will be displayed here -->
        </div>
    </div>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="js/summary.js"></script>
</asp:Content>
