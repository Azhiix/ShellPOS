<%@ Page Language="C#" AutoEventWireup="true" MasterPageFile="~/Site1.Master" CodeBehind="sales.aspx.cs" Inherits="SezwanPayroll.sales" %>

<asp:Content ID="ContentHead" ContentPlaceHolderID="head" runat="server">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" integrity="sha512-nMNlpuaDPrqlEls3IX/Q56H36qvBASwb3ipuo3MxeWbsQB1881ox0cRv7UPTgBlriqoynt35KjEwgGUeUXIPnw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.0.0/css/buttons.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="css/sales.css">
    <title>Document</title>
</asp:Content>

<asp:Content ID="ContentBody" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="container full-height ">
        <!-- Client Information Section -->
        <div class="client-info border p-4 mb-2 mt-1">
            <div class="col-md-9">
                <div class="mt-4">
                    <select class="form-select" id="clientSelect">
                        <option value="disabled selected">Client</option>
                        <option value="Luke Curtis">Luke Curtis</option>
                        <option value="Jemma Coetzee">Jemma Coetzee</option>
                        <option value="Cameron Curtis">Cameron Curtis</option>
                    </select>
                </div>
            </div>
            <div class="col-12">
                <label for="inputDriversName" class="form-label">Drivers Name</label>
                <input type="text" class="form-control" id="inputDriversName" placeholder="John Doe">
            </div>
            <div class="col-12">
                <label for="Car Registration No." class="form-label mt-2">Car Registration No.</label>
                <input type="text" class="form-control" id="Car Registration No." placeholder="SL292">
            </div>
            <div class="col-md-6">
                <label for="inputMileage" class="form-label mt-2">Mileage</label>
                <div class="input-group">
                    <input type="number" class="form-control inputMileage" placeholder="100" min="0" aria-label="Amount">
                    <div class="input-group-append">
                        <span class="input-group-text">KM</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Sales Entries Section -->
        <div id="salesEntries"></div>

        <!-- Centered Total Sales Cost -->
        <div class="mt-3">
            <label for="totalSalesCosts" class="d-block text-center mt-3">The total cost is:</label>
            <input type="number" id="totalSalesCosts" class="form-control mx-auto text-center w-25" disabled placeholder="Total Cost" />
        </div>

        <!-- Add Another Item and Save Button -->
        <div class="mt-3 col-12">
            <button type="button" id="addItemButton" class="btn btn-info w-100">Add Another Item</button>
        </div>
        <div class="col-12 d-flex justify-content-center">
            <button type="submit" class="btn btn-primary w-50 mt-2 saveAndPrint">Save and Print</button>
        </div>

    </div>

    <!-- Receipt Section (Hidden for Printing) -->
    <div class="printWindow  d-none text-center">
        <div class="receipt">
            <h2>Barin Co. Ltd</h2>
            <h3>Shell Ebene</h3>
            <p>
                Reduit Road, Ebene<br>
                T: 424 1486 E: info@shell.com<br>
                BRN: 12345
            </p>
            <h4>INVOICE</h4>
            <hr />
            <table class="table table-borderless table-client">
             <tbody>
    <tr>
      <td>Date</td>
      <td id="TimePrint"></td>
    </tr>
    <tr>
      <td>Agent</td>
      <td id="usernameValue">KHALEEL</td>
    </tr>
    <tr>
      <td>Client</td>
      <td id="clientValue"></td>
    </tr>
    <tr>
      <td>Drivers Name</td>
      <td id="driverNamePrint"></td>
    </tr>
    <tr>
      <td colspan="2">
        <div class="inline-fields">
          <span>Car Registration No.: <span id="carRegNoPrint"></span></span>
          <span>Mileage: <span id="mileagePrint"></span></span>
        </div>
      </td>
    </tr>
    <tr>
      <td>Inv #</td>
      <td>1</td>
    </tr>
    <tr>
      <td>Till</td>
      <td>TILL-02</td>
    </tr>
  </tbody>
  

            </table>
            <hr />
            <table class="table">
                <thead>
                    <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody id="SalesAndTotalCosts">

                    <tr class="mt-2">
                        <td colspan="3">Total</td>
                        <td id="totalValue">190.00</td>
                    </tr>



                </tbody>
            </table>
            <p>
                ******Thank you for your visit. See you again******<br>
                Goods once sold cannot be exchanged nor returned.
            </p>
        </div>
    </div>

    <!-- Scripts -->
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js" integrity="sha512-2ImtlRlf2VVmiGZsjm9bEyhjGW4dU7B6TNwh/hx/iSByxNENtj3WVE6o/9Lj4TJeVXPi4bnOIMXFIJJAeufa0A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.min.js"></script>
    <script src="js/sales.js"></script>

</asp:Content>
