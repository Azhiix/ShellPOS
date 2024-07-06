document.addEventListener('DOMContentLoaded', function () {
    $('#salesGrid').hide();
    let gridApi;

    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    let yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    flatpickr("#dateFrom", {
        defaultDate: today,
        dateFormat: "m-d-Y",
        onChange: function (selectedDates, dateStr, instance) {
            flatpickr("#dateTo", {
                minDate: dateStr,
                dateFormat: "m-d-Y",
            });
        }
    });
    flatpickr("#dateTo", {
        defaultDate: today,
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
    };

    const salesGridElement = document.querySelector('#salesGrid');
    if (salesGridElement) {
        agGrid.createGrid(salesGridElement, salesGridOptions);
    } else {
        console.error('salesGrid element not found in the DOM.');
        return;
    }

    fetch('reports.aspx/ShowClients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8'
        }
    }).then(response => response.json())
        .then(data => {
            const clientSelect = document.getElementById('clientSelect');
            const optionEl = `<option value="">Select Client</option>
                ${data.d.map(client => `<option value="${client.ClientID}">${client.Name}</option>`).join('')}`;
            clientSelect.innerHTML = optionEl;

            clientSelect.addEventListener('change', function () {
                const generatePDFButton = document.getElementById('generatePDF');
                if (this.value) {
                    generatePDFButton.classList.remove('d-none');
                } else {
                    generatePDFButton.classList.add('d-none');
                }
            });
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });

    fetch('reports.aspx/DisplayUserAgent', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({})
    })
        .then(response => response.json())
        .then(data => {
            if (data.d) { // Assuming the response is wrapped in the "d" property
                // Create and append the "All Agents" option
                const allAgentsOption = document.createElement('option');
                allAgentsOption.value = 0;
                allAgentsOption.text = 'All Agents';
                agentSelect.appendChild(allAgentsOption);

                // Append options for each agent
                data.d.forEach(agent => {
                    const option = document.createElement('option');
                    option.value = agent.UserID;
                    option.text = agent.Username;
                    agentSelect.appendChild(option);
                });
            } else {
                console.log('No data returned or incorrect format.');
            }
        })
        .catch(error => {
            console.error('Error fetching agent data:', error);
        });

    document.getElementById('getSales').addEventListener('click', function (e) {
        e.preventDefault();
        $('#salesGrid').show();

        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const clientId = document.getElementById('clientSelect').value;
        const vehicleRegNo = document.getElementById('vehicleRegNo').value;
        const agentId = document.getElementById('agentSelect').value;

        const payload = {
            dateFrom: formatDateToDDMMYYYY(dateFrom),
            dateTo: formatDateToDDMMYYYY(dateTo),
            clientId: clientId,
            vehicleRegNo: vehicleRegNo,
            agentId: agentId
        };

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
                console.log('Raw data received:', data);
                salesGridOptions.rowData = [];

                data.d.forEach(sale => {
                    console.log('Processing sale:', sale);
                    const formattedDate = (sale.SaleDate);
                    if (formattedDate) {
                        sale.SaleItems.forEach(item => {
                            const formattedSale = {
                                SaleId: sale.SaleId,
                                SaleDate: formattedDate,
                                ClientName: sale.ClientName,
                                DriverName: sale.DriverName,
                                VehicleRegNo: sale.CarRegNo,
                                TotalCost: sale.TotalCost,
                                Agent: sale.Username,
                                ItemName: item.ItemName,
                                Quantity: item.Quantity,
                                UnitPrice: item.UnitPrice,
                                ItemTotalCost: item.TotalCost,

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
            columnKeys: ['SaleDate', 'ClientName', 'DriverName', 'VehicleRegNo', 'TotalCost', 'SaleId', 'Username', 'ItemName', 'Quantity', 'UnitPrice', 'ItemTotalCost'],
            processCellCallback: function (params) {
                return params.value;
            }
        };
        gridApi.exportDataAsCsv(params);
    });

    const { jsPDF } = window.jspdf;

    if (typeof jsPDF === 'undefined') {
        console.error('jsPDF library is not loaded.');
        return;
    }

    document.getElementById('generatePDF').addEventListener('click', function () {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();


     
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');

        // Title
        doc.text("Barin Co Ltd", 10, 20);
        doc.setFontSize(10);
        doc.text("Telephone & Fax: +2304646765", 140, 20);
        doc.text("Email: barin.ebene@gmail.com", 140, 25);
        doc.text("BRN: C08078619", 140, 30);

        // Client details
        const clientName = document.getElementById('clientSelect').selectedOptions[0].text;
        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        // Format the dates to get the month and year
        const formatDate = date => {
            const d = new Date(date);
            const month = d.toLocaleString('default', { month: 'long' });
            const year = d.getFullYear();
            return `${month} ${year}`;
        };

        const period = dateFrom === dateTo ? formatDate(dateFrom) : `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;

        // Add a space between the title and the table
        doc.setFontSize(12);
        doc.text(clientName, 105, 50, { align: 'center' });
        doc.text(period, 105, 60, { align: 'center' });

        // Table Header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Date", 10, 80);
        doc.text("Invoice Num", 50, 80);
        doc.text("Details", 100, 80);
        doc.text("AMT (RS)", 150, 80);

        // Table Content
        let y = 90;
        let totalAmt = 0; // Initialize total amount

        gridApi.forEachNode(function (node) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(node.data.SaleDate, 10, y);
            doc.text(node.data.SaleId.toString(), 50, y);
            doc.text(node.data.VehicleRegNo, 100, y);
            doc.text(node.data.TotalCost.toFixed(2), 150, y);

            totalAmt += parseFloat(node.data.TotalCost); // Sum up the total cost

            y += 10;
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        });

        // Add the total amount to the PDF
        y += 10; // Add some space before the total
        doc.setFont('helvetica', 'bold');
        doc.text("TOTAL", 100, y);
        doc.setFont('helvetica', 'normal');
        doc.text(totalAmt.toFixed(2), 150, y);

        doc.save("invoice.pdf");
    });





    // Function to format date to DD/MM/YYYY
    function formatDateToDDMMYYYY(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return `${day}/${month}/${year}`;
    }


});

function formatDateToDDMMYYYY(dateString) {
    console.log("Original date string:", dateString);
    const [month, day, year] = dateString.split('-');
    console.log("Parsed month:", month, "Parsed day:", day, "Parsed year:", year);
    return `${day}/${month}/${year}`;
}

function deleteRow(rowData) {
    console.log('Row Data is', rowData);

    // Prepare the payload
    const payload = {
        saleId: rowData.SaleId
    };

    // Make the API call to delete the row
    fetch('reports.aspx/DeleteSale', {
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
            if (data.success) {
                console.log('Row deleted successfully');

                // Remove the deleted row from the grid
                const updatedRowData = salesGridOptions.rowData.filter(sale => sale.SaleId !== rowData.SaleId);
                salesGridOptions.rowData = updatedRowData;
                gridApi.setRowData(updatedRowData);
            } else {
                console.error('Failed to delete row:', data.message);
            }
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

function convertDateTimeForFetch(dateString) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}
