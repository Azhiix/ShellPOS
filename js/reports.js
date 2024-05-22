document.addEventListener('DOMContentLoaded', function () {
    $('#salesGrid').hide();

    // Initialize date pickers
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

    // Define the column definitions and grid options
    const salesGridOptions = {
        columnDefs: [
            { field: "SaleDate", headerName: "Date" },
            { field: "ClientName", headerName: "Client Name" },
            { field: "DriverName", headerName: "Driver" },
            { field: "VehicleRegNo", headerName: "Vehicle Reg No" },
            { field: "TotalCost", headerName: "Amount" },
            { field: "SaleId", headerName: "SaleId" },
            { field: "Username", headerName: "Username" },
            { field: "SaleItemId", headerName: "Sale Item Id" },
            { field: "ItemId", headerName: "Item Id" },
            { field: "Quantity", headerName: "Quantity" },
            { field: "UnitPrice", headerName: "Unit Price" },
            { field: "ItemTotalCost", headerName: "Item Total Cost" }
        ],
        rowData: [],
        onGridReady: function (params) {
            gridApi = params.api;
            params.api.sizeColumnsToFit(); // Ensure columns fit the grid width
        }
    };

    // Initialize the grid once the DOM is fully loaded
    const salesGridElement = document.querySelector('#salesGrid');
    if (salesGridElement) {
        agGrid.createGrid(salesGridElement, salesGridOptions);
    } else {
        console.error('salesGrid element not found in the DOM.');
        return;
    }

    // Fetch and populate the client dropdown
    fetch('reports.aspx/ShowClients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }).then(response => response.json())
        .then(data => {
            console.log('The data is', data);
            const clientSelect = document.getElementById('clientSelect');
            const optionEl = `<option value="">Select Client</option>
            ${data.d.map(client => `<option value="${client.ClientID}">${client.Name}</option>`).join('')}`;
            clientSelect.innerHTML = optionEl;
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    document.getElementById('getSales').addEventListener('click', function (e) {
        e.preventDefault();
        $('#salesGrid').show();

        // Capture input values
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const clientId = document.getElementById('clientSelect').value; // Ensure correct ID is used
        const vehicleRegNo = document.getElementById('vehicleRegNo').value;

        // Create a payload with the captured values
        const payload = {
            dateFrom: dateFrom,
            dateTo: dateTo,
            clientId: clientId,
            vehicleRegNo: vehicleRegNo
        };

        console.log('The Payload is', payload);

        function parseDate(dateString) {
            const date = new Date(dateString);
            if (!isNaN(date)) {
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                const year = date.getFullYear();
                return `${month}-${day}-${year}`;
            } else {
                console.error('Invalid date format', dateString);
                return null;
            }
        }

        fetch('reports.aspx/ShowSales', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(payload)
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.json();
            })
            .then(data => {
                console.log("The data is", data);

                salesGridOptions.rowData = [];

                data.d.forEach(sale => {
                    const formattedDate = parseDate(sale.SaleDate);
                    if (formattedDate) {
                        sale.SaleItems.forEach(item => {
                            const formattedSale = {
                                SaleDate: formattedDate,
                                ClientName: sale.ClientName,
                                DriverName: sale.DriverName,
                                VehicleRegNo: sale.CarRegNo,
                                TotalCost: sale.TotalCost,
                                SaleId: sale.SaleId,
                                Username: sale.Username,
                                SaleItemId: item.SaleItemId,
                                ItemId: item.ItemId,
                                Quantity: item.Quantity,
                                UnitPrice: item.UnitPrice,
                                ItemTotalCost: item.TotalCost
                            };
                            salesGridOptions.rowData.push(formattedSale);
                        });
                    } else {
                        console.error('Invalid date format', sale.SaleDate);
                    }
                });

                gridApi.setRowData(salesGridOptions.rowData);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });
    });

    const CSVDownloadButton = document.getElementById('downloadCSV');
    CSVDownloadButton.addEventListener('click', function (e) {
        e.preventDefault();
        const params = {
            fileName: 'sales.csv',
            columnKeys: ['SaleDate', 'ClientName', 'DriverName', 'VehicleRegNo', 'TotalCost', 'SaleId', 'Username', 'SaleItemId', 'ItemId', 'Quantity', 'UnitPrice', 'ItemTotalCost'], // Include SaleItemId and other item fields
            processCellCallback: function (params) {
                return params.value;
            }
        };
        gridApi.exportDataAsCsv(params);
    });
});
