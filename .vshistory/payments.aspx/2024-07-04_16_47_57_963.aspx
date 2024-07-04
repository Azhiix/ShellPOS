<%@ Page Language="C#" AutoEventWireup="true" MasterPageFile="~/Site1.Master" CodeBehind="payments.aspx.cs" Inherits="SezwanPayroll.payments" %>

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
    <div class="container mt-5">
        <div class="card p-4 mb-4">
            <div class="row g-3 align-items-center">
                <div class="col-md-4">
                    <label for="dateFrom" class="form-label">Date From</label>
                    <input type="text" class="form-control flatpickr-input" id="dateFrom" placeholder="Date From" readonly="readonly">
                </div>
                <div class="col-md-4">
                    <label for="dateTo" class="form-label">Date To</label>
                    <input type="text" class="form-control flatpickr-input" id="dateTo" placeholder="Date To" readonly="readonly">
                </div>
                <div class="col-md-4">
                    <label for="clientSelect" class="form-label">Select Client</label>
                    <select class="form-select" id="clientSelect">
                        <option value="">Select Client</option>
                    </select>
                </div>
           <%--     <div class="col-md-3">
                    <label for="agentSelect" class="form-label">Payment Type</label>
                    <select class="form-select" id="agentSelect">
                        <option value="0">Payment Type</option>
                    </select>
                </div>--%>
            </div>
            <div class="d-flex justify-content-end mt-4">
                <button id="getSales" type="button" class="btn btn-primary">Search</button>
            </div>
        </div>

        <div class="mt-5">
            <div class="row">
                <div class="col-md-4 totalOwed " style="display:">
                    <div class="card text-white bg-info mb-3">
                        <div class="card-body ">
                            <h5 class="card-title">Total Amount Owed</h5>
                            <p class="card-text" id="totalAmountOwed"></p>
                        </div>
                    </div>
                </div>

            </div>
        </div>



      <div class="card p-4 mt-5 shadow-sm" style="border-radius: 10px; border: 1px solid #ddd; background-color: #f9f9f9;">
    <h5 class="card-title mb-4">Pay Amount</h5>
    <form id="paymentForm">
        <div class="form-check mb-3">
            <input class="form-check-input" type="checkbox" id="useSearchPeriod">
            <label class="form-check-label" for="useSearchPeriod">
                Use same period as searched
            </label>
        </div>
        <div class="row g-3 align-items-center">
            <div class="col-md-6 col-lg-4" id="paymentDateFromContainer">
                <label for="paymentDateFrom" class="form-label">Payment Date From</label>
                <input type="text" class="form-control flatpickr-input" id="paymentDateFrom" placeholder="Payment Date From" readonly="readonly">
            </div>
            <div class="col-md-6 col-lg-4" id="paymentDateToContainer">
                <label for="paymentDateTo" class="form-label">Payment Date To</label>
                <input type="text" class="form-control flatpickr-input" id="paymentDateTo" placeholder="Payment Date To" readonly="readonly">
            </div>
        </div>
        <div class="row g-3 align-items-center mt-3">
            <div class="col-md-6 col-lg-4">
                <label for="paymentAmount" class="form-label">Amount</label>
                <input type="number" class="form-control" id="paymentAmount" placeholder="Amount">
            </div>
            <div class="col-md-6 col-lg-4">
                <label for="paymentReference" class="form-label">Payment Reference</label>
                <input type="text" class="form-control" id="paymentReference" placeholder="Payment Reference">
            </div>
            <div class="col-12">
                <label for="paymentComments" class="form-label">Additional Comments</label>
                <textarea class="form-control" id="paymentComments" rows="3" placeholder="Additional Comments"></textarea>
            </div>
        </div>
        <div class="d-flex justify-content-end mt-4">
            <button type="submit" class="btn btn-primary btn-lg">Submit Payment</button>
        </div>
    </form>
</div>

    </div>

    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/flatpickr/4.6.13/flatpickr.min.js" integrity="sha512-K/oyQtMXpxI4+K0W7H25UopjM8pzq0yrVdFdG21Fh5dBe91I40pDd9A4lzNlHPHBIP2cwZuoxaUSX0GJSObvGA==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.3/js/bootstrap.min.js" integrity="sha512-ykZ1QQr0Jy/4ZkvKuqWn4iF3lqPZyij9iRv6sGqLRdTPkY69YX6+7wvVGmsdBbiIfN/8OdsI7HABjvEok6ZopQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/ag-grid/31.3.1/ag-grid-community.min.js" integrity="sha512-pyep0b8pFXiMbcaxISZ03VOCbUVoUal2G9uFWCrjAJsSO/koeng2k2/6oLOq+2DUbAER3uC/YVB5GSISuTWYLQ==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/datepicker/1.0.10/datepicker.min.js" integrity="sha512-RCgrAvvoLpP7KVgTkTctrUdv7C6t7Un3p1iaoPr1++3pybCyCsCZZN7QEHMZTcJTmcJ7jzexTO+eFpHk4OCFAg==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>
    <script src="https://cdn.jsdelivr.net/npm/jwt-decode/build/jwt-decode.min.js"></script>
    <script type="module" src="js/payments.js"></script>
</asp:Content>
