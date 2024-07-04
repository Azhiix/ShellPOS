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
    <link rel="stylesheet" href="css/sales.css">
    <title>Document</title>
</asp:Content>

<asp:Content ID="ContentBody" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="container full-height">
        <!-- Client Information Section -->
        <div class="client-info border p-4 mb-3 shadow-sm rounded">
            <div class="row mb-3">
                <div class="col-12 col-md-4">
                    <label for="clientSelect" class="form-label">Company Name:</label>
                </div>
              
                <div class="col-12 col-md-8">
                    <select class="form-select" id="clientSelect">
                        <option value="" disabled selected>Choose...</option>
                    </select>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-4">
                    <label for="vehicleRegSelect" class="form-label car-registration">Car Registration No.:</label>
                </div>
                <div class="col-12 col-md-8">
                    <select class="form-select" id="vehicleRegSelect">
                        <option value="" disabled selected>Choose...</option>
                    </select>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-4">
                    <label for="driversNameSelect" class="form-label">Driver's Name:</label>
                </div>
                <div class="col-12 col-md-8">
                    <select class="form-select" id="driversNameSelect">
                        <option value="" disabled selected>Choose...</option>
                    </select>
                </div>
            </div>

            <div class="row mb-3">
                <div class="col-12 col-md-4">
                    <label for="inputMileage" class="form-label">Mileage:</label>
                </div>
                <div class="col-12 col-md-8">
                    <div class="input-group">
                        <input type="number" class="form-control inputMileage" placeholder="0" min="0" aria-label="Amount">
                        <span class="input-group-text">KM</span>
                    </div>
                    
                </div>
            </div>
        </div>


        <!-- Sales Entries Section -->
        <div id="salesEntries" class="mb-3"></div>

        <!-- Centered Total Sales Cost -->
        <div class="text-center mb-3">
            <label for="totalSalesCosts" class="form-label">The total cost is:</label>
            <input type="number" id="totalSalesCosts" class="form-control w-50 mx-auto" disabled placeholder="Total Cost">
        </div>

        <!-- Add Another Item and Save Button -->
        <div class="row">
            <div class="col-12 mb-2">
                <button type="button" id="addItemButton" class="btn btn-info w-100">Add Another Item</button>
            </div>
            <div class="col-12 text-center">
                <button type="button" class="btn btn-primary w-50 saveAndPrint">Save and Print</button>
            </div>
        </div>
    </div>



    <!-- Receipt Section (Hidden for Printing) -->
    <div class="printWindow text-center d-none">
        <div class="receipt p-3 shadow-sm rounded">
            <h2>Barin Co. Ltd</h2>
            <h3>Shell Ebene</h3>
            <p>
                Reduit Road, Ebene<br>
 
                T: 464 6765 E: Barin.ebene@gmail.com<br>
                BRN: C08078619

            </p>
            <h4>INVOICE No: 156</h4> 
            <div>Date: <span id="TimePrint"></span></div>
            <table class="table table-borderless table-client">
                <tbody>
                    <tr>
                        <td>Client</td>
                        <td id="clientValue"></td>
                    </tr>
                    <tr>
                        <td>Driver's Name</td>
                        <td id="driverNamePrint"></td>
                    </tr>
                    <tr>
                        <td colspan="2">
                            <span>Car Reg No:&nbsp &nbsp &nbsp &nbsp &nbsp;<span id="carRegNoPrint"></span></span>
                             <span>Mileage: <span id="mileagePrint"></span></span>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table class="table">
                <thead>
                    <tr class="text-2xl">
                        <th style="font-weight: bold;">Item</th>
                        <th style="font-weight: bold;">Qty</th>
                        <th style="font-weight: bold;">Unit</th>
                        <th style="font-weight: bold;">Total</th>
                    </tr>
                </thead>
                <tbody id="SalesAndTotalCosts">
                    <tr class="mt-2">
                        <td style="font-weight: bold;" colspan="3">Total</td>
                        <td style="font-weight: bold;" id="totalValue">190.00</td>
                    </tr>
                </tbody>
            </table>


            <%--<h4 class="mt-3 ">
                ******Thank you for your visit. See you again******<br/>
            </h4>--%>

        </div>
    </div>


    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/select2@4.1.0-rc.0/dist/js/select2.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/sweetalert2/11.11.0/sweetalert2.min.js" integrity="sha512-Wi5Ms24b10EBwWI9JxF03xaAXdwg9nF51qFUDND/Vhibyqbelri3QqLL+cXCgNYGEgokr+GA2zaoYaypaSDHLg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.min.js"></script>
    <script src="js/sales.js"></script>
</asp:Content>
