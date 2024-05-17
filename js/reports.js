


//retreiving the username from the JWt Token, remember to add to a shared JS file later on

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function extractUsernameFromToken() {
    const cookieName = 'Token';
    const token = getCookie(cookieName);
    if (token) {
        try {
            const decodedToken = jwt_decode(token);
            const username = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
            console.log(`Username: ${username}`);

            return username;
           
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    } else {
        console.error('Token not found in the cookie.');
    }
}



document.addEventListener('DOMContentLoaded', function () {
    extractUsernameFromToken()
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
            {field: "Username", headerName: "Username"}
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

    document.getElementById('getSales').addEventListener('click', function (e) {
        e.preventDefault();

        // Capture input values
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const client = document.getElementById('clientSelect').value;
        const vehicleRegNo = document.getElementById('vehicleRegNo').value;
        const username = extractUsernameFromToken();
        console.log(username)

        // Create a payload with the captured values
        const payload = {
            dateFrom: dateFrom,
            dateTo: dateTo,
            client: client,
            vehicleRegNo: vehicleRegNo,


        };

        console.log(payload);

        // Make the fetch request with the payload
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

                // Clear the existing rowData
                salesGridOptions.rowData = [];

                // Loop through the data and add it to the grid
                // Loop through the data and add it to the grid
                data.d.forEach(sale => {
                    console.log('Sale is', sale)
                    // Extract the timestamp and convert it to an ISO string, then take the date part
                    const timestamp = parseInt(sale.SaleDate.match(/\d+/)[0]); // Get the timestamp from the /Date(...) format
                    const saleDate = new Date(timestamp).toISOString().split('T')[0]; // Convert to ISO string and split to get only the date part

                    const formattedSale = {
                        SaleDate: saleDate, // Already formatted as YYYY-MM-DD

                        ClientName: sale.ClientName,
                        DriverName: sale.DriverName,
                        VehicleRegNo: sale.CarRegNo,
                        TotalCost: sale.TotalCost,
                        SaleId: sale.SaleId,
                        Username: username
                        
                    };
                    salesGridOptions.rowData.push(formattedSale);
                    
                    console.log(formattedSale)

                });

                
                // Refresh the grid with new data
                gridApi.setRowData(salesGridOptions.rowData);
            })
            .catch(error => {
                console.error('There was a problem with the fetch operation:', error);
            });



    })

});
