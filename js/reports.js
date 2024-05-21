document.addEventListener('DOMContentLoaded', function () {
    $('#salesGrid').hide();

    // Initialize date pickers
    flatpickr("#dateFrom", {
        dateFormat: "Y-m-d",
        onChange: function (selectedDates, dateStr, instance) {
            flatpickr("#dateTo", {
                minDate: dateStr,
                dateFormat: "Y-m-d",
            });
        }
    });
    flatpickr("#dateTo", {
        dateFormat: "Y-m-d",
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
        const client = document.getElementById('clientSelect').value; // Ensure correct ID is used
        const vehicleRegNo = document.getElementById('vehicleRegNo').value;
        const clientId = document.getElementById('clientSelect').value;

        // Create a payload with the captured values
        const payload = {
            dateFrom: dateFrom,
            dateTo: dateTo,
            vehicleRegNo: vehicleRegNo,
            clientId: clientId
        };

        console.log('The Payload is', payload);

        function parseDate(dateString) {
            const jsonDateMatch = dateString.match(/\/Date\((\d+)\)\//);
            if (jsonDateMatch) {
                const timestamp = parseInt(jsonDateMatch[1], 10);
                const date = new Date(timestamp);
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }

            const date = new Date(dateString);
            if (!isNaN(date)) {
                const year = date.getUTCFullYear();
                const month = String(date.getUTCMonth() + 1).padStart(2, '0');
                const day = String(date.getUTCDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
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
                        const formattedSale = {
                            SaleDate: formattedDate,
                            ClientName: sale.ClientName,
                            DriverName: sale.DriverName,
                            VehicleRegNo: sale.CarRegNo,
                            TotalCost: sale.TotalCost,
                            SaleId: sale.SaleId,
                            Username: sale.Username,
                            ClientID: sale.ClientId

                        };
                        salesGridOptions.rowData.push(formattedSale);
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
});

const CSVDownloadButton = document.getElementById('downloadCSV');
CSVDownloadButton.addEventListener('click', function (e) {
    e.preventDefault();
    const params = {
        fileName: 'sales.csv',
        columnKeys: ['SaleDate', 'ClientName', 'DriverName', 'VehicleRegNo', 'TotalCost', 'SaleId', 'Username', ],
        processCellCallback: function (params) {
            return params.value;
        }
    };
    gridApi.exportDataAsCsv(params);
});

