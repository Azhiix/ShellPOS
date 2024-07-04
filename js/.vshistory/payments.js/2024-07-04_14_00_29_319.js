document.addEventListener('DOMContentLoaded', function () {


    fetch('payments.aspx/ShowClientInfo',
        {
            headers: {
                'Content-Type': 'application/json',
                
            }

        
           
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        
        }).then(data => {
            if (data && data.d) {
              console.log(data.d)
               
            } else {
                throw new Error('Unexpected response structure');
            }



        }
        )
        


    return fetch('sales.aspx/ShowClients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            console.log('Token:', token);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.d) {
                clientsAndVehicleReg = data.d;
                populateClientAndVehicleRegDropdown();
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => console.error('Error fetching clients and vehicle registration numbers:', error));


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