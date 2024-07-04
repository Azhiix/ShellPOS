document.addEventListener('DOMContentLoaded', function () {


    fetch('payments.aspx/ShowClientInfo',
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            }

        
           
        })




})

flatpickr("#dateFrom", {
    
    dateFormat: "m-d-Y",
    onChange: function (selectedDates, dateStr, instance) {
        flatpickr("#dateTo", {
            minDate: dateStr,
            dateFormat: "m-d-Y",
        });
    }
});
flatpickr("#dateTo", {
 
    dateFormat: "m-d-Y",
});


const salesGridOptions = {
    domLayout: 'autoHeight',
    columnDefs: [
        { field: "SaleId", headerName: "SaleId", width: '50px', resizeable: true },
        { field: "SaleDate", headerName: "Date" },
        { field: "ClientName", headerName: "Client Name" },
        { field: "DriverName", headerName: "Driver" },
        { field: "VehicleRegNo", headerName: "Vehicle Reg No" },
        { field: "TotalCost", headerName: "Amount" },
        { field: "Agent", headerName: "Agent" },
        { field: "ItemName", headerName: "Item Name" },
        { field: "Quantity", headerName: "Quantity" },
        { field: "UnitPrice", headerName: "Unit Price" },
        { field: "ItemTotalCost", headerName: "Item Total Cost" },


        {
            headerName: "Actions",
            cellRenderer: function (params) {
                var button = document.createElement('button');
                button.innerText = 'Delete';
                button.addEventListener('click', function () {
                    deleteRow(params.data);
                });
                return button;
            }
        }
    ],
    rowData: [],
    onGridReady: function (params) {
        gridApi = params.api;
        params.api.sizeColumnsToFit();
    }
}