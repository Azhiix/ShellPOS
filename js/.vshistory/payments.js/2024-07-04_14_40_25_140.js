﻿document.addEventListener('DOMContentLoaded', function () {


    fetch('payments.aspx/displayClientInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            console.log('Received response:', response);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.d) {
                const clientSelect = document.getElementById('clientSelect');
                const optionEl = `<option value="">Select Client</option>
                ${data.d.map(client => `<option value="${client.ClientID}">${client.Name}</option>`).join('')}`;
                clientSelect.innerHTML = optionEl;
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

            


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