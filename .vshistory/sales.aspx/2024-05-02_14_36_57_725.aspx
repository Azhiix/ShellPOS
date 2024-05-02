<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="sales.aspx.cs" Inherits="SezwanPayroll.sales" %>



<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">


 
   <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/css/bootstrap.min.css" rel="stylesheet">
 <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/css/select2.min.css" integrity="sha512-nMNlpuaDPrqlEls3IX/Q56H36qvBASwb3ipuo3MxeWbsQB1881ox0cRv7UPTgBlriqoynt35KjEwgGUeUXIPnw==" crossorigin="anonymous" referrerpolicy="no-referrer" />

  <link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.11.3/css/jquery.dataTables.min.css">
<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/buttons/2.0.0/css/buttons.dataTables.min.css">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">




  <title>Document</title>
</head>
<body>
<div class=" container full-height">
      <form class="row g-3">
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
      <div class="row">
        <div class="col-md-6 col-12">
            <div class="mt-4 mb-2" id="mainDropdown">
                <select class="js-example-basic-single form-control">
                  <option value="" disabled selected>Item Type</option>
                    <option value="fuel">Fuel</option>
                    <option value="gas">Gas</option>
                    <option value="water">Water</option>
                    <option value="parking">Parking Coupons</option>
                    <option value="regulators">Regulators</option>
                    <option value="cords">Cords</option>
                    <option value="gasStand">Gas Stand</option>
                    <option value="oil">Oil</option>
                    <option value="gasRefill">Gas Refill</option>
                    <option value="gasCylinder">Gas Cylinder</option>
                    <option value="fireExtinguisher">Fire Extinguisher</option>
                </select>
            </div>
        </div>
        <div class="col-md-6 col-12">
            <div class="mt-4 mb-2" id="subDropdown" style="display: none;">
                <select class="js-example-basic-single form-control" id="subCategory">

                    <!-- Options for fuel types will be dynamically loaded here -->
                </select>
            </div>
        </div>

        <div class="row align-items-center">
          <div class="col-md-6 col-12">
              <div class="mt-4 mb-2" id="fuelQuantityInput" style="display: none;">
                  <input type="number" class="form-control" id="fuelQuantity" placeholder="Enter quantity in liters">
              </div>
          </div>
          <div class="col-md-6 col-12">
              <div id="totalCostContainer" style="display: none;"
              class="input-group mb-3">
              <laebl for="totalCost" class="form-label mt-2">Total Cost</laebl>
                  <span class="input-group-text">Rs</span>
                  <input type="text" id="fuelAmount" class="form-control" aria-label="Total cost" readonly>
              </div>
          </div>


          <div class="col-md-6 col-12">
            <div id="waterQuantityInput" style="display: none;">
                <label for="waterQuantity" class="form-label">Enter quantity in gallons</label>
                <input type="number" class="form-control" id="waterQuantity" placeholder="Number of gallons">
            </div>
        </div>
        <div class="col-md-6 col-12">
            <div id="waterTotalCostContainer" style="display: none;" class="input-group mb-3">
                <span class="input-group-text">Total Cost: Rs</span>
                <input type="text" id="waterTotalAmount" class="form-control" aria-label="Total cost" readonly>
            </div>
            <div id="perGallonCostContainer" style="display: none;" class="input-group mb-3">
                <span class="input-group-text">Price per Gallon: Rs</span>
                <input type="text" id="perGallonPrice" class="form-control" aria-label="Per gallon price" readonly>
            </div>
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
                  <input type="number" class="form-control" aria-label="Amount (to the nearest dollar)">
                  <div class="input-group-append">
                      <span class="input-group-text">KM</span>

                  </div>
              </div>
          </div>


          <div class="col-12 mt-2">
              <div class="form-check">
                <button>Add Another Item</button>

                  
              </div>
          </div>
          <div class="col-12 d-flex justify-content-center">
              <button type="submit" class="btn btn-primary w-50 mt-2">Save and Print</button>
          </div>

      </form>
  </div>


<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/select2/4.0.13/js/select2.min.js" integrity="sha512-2ImtlRlf2VVmiGZsjm9bEyhjGW4dU7B6TNwh/hx/iSByxNENtj3WVE6o/9Lj4TJeVXPi4bnOIMXFIJJAeufa0A==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>


<script src="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/5.3.2/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.11.8/dist/umd/popper.min.js" integrity="sha384-I7E8VVD/ismYTF4hNIPjVp/Zjvgyol6VFvRkX/vR+Vc4jQkC+hVqc2pM8ODewa9r" crossorigin="anonymous"></script>


<%--<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.3/jszip.min.js"></script>--%>



  <script src="js/sales.js"></script>

</body>
</html>
