<%@ Page Language="C#" AutoEventWireup="true" MasterPageFile="~/Site1.Master" CodeBehind="sales.aspx.cs" Inherits="SezwanPayroll.sales" %>

<asp:Content ID="ContentHead" ContentPlaceHolderID="head" runat="server">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" integrity="sha512-nMNlpuaDPrqlEls3IX/Q56H36qvBASwb3ipuo3MxeWbsQB1881ox0cRv7UPTgBlriqoynt35KjEwgGUeUXIPnw==" crossorigin="anonymous" referrerpolicy="no-referrer" />
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css">
    <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.0.0/css/buttons.dataTables.min.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
    <link rel="stylesheet" href="css/admin.css">
    <title>Document</title>
</asp:Content>

<asp:Content ID="ContentBody" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="container full-height">
        <!-- Client Information Section -->
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
                <input type="number" class="form-control" placeholder="100" min="0" aria-label="Amount">
                <div class="input-group-append">
                    <span class="input-group-text">KM</span>
                </div>
            </div>
        </div>

        <!-- Sales Entries Section -->
        <div id="salesEntries"></div>

        <!-- Add Another Item and Save Button -->
        <div class="mt-3 col-12">
            <button type="button" id="addItemButton" class="btn btn-info w-100">Add Another Item</button>
        </div>
        <div class="col-12 d-flex justify-content-center">
            <button type="submit" class="btn btn-primary w-50 mt-2">Save and Print</button>
        </div>
    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js" integrity="sha512-2ImtlRlf2VVmiGZsjm9bEyhjGW4dU7B6TNwh/hx/iSByxNENtj3WVE6o/9Lj4TJeVXPi4bnOIMXFIJJAeufa0A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>
    <script src="js/sales.js"></script>

   
       
</asp:Content>
