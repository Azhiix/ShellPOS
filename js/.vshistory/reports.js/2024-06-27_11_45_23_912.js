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
            { field: "ItemTotalCost", headerName: "Item Total Cost" }
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

    document.getElementById('getSales').addEventListener('click', function (e) {
        e.preventDefault();
        $('#salesGrid').show();

        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;
        const clientId = document.getElementById('clientSelect').value;
        const vehicleRegNo = document.getElementById('vehicleRegNo').value;

        const payload = {
            dateFrom: formatDateToDDMMYYYY(dateFrom),
            dateTo: formatDateToDDMMYYYY(dateTo),
            clientId: clientId,
            vehicleRegNo: vehicleRegNo
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

        // Set document properties
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text("Invoice", 105, 20, { align: 'center' });

        // Assuming you have elements or variables that hold these values
        const clientName = document.getElementById('clientSelect').selectedOptions[0].text;
        const clientId = document.getElementById('clientSelect').value;
        const vehicleRegNo = document.getElementById('vehicleRegNo').value;

        // Invoice details
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text("To:", 10, 40);
        doc.text(clientName, 10, 45);
        doc.text("BRN:" + "012882822828", 10, 50);


        const dateFrom = document.getElementById('dateFrom').value;
        const dateTo = document.getElementById('dateTo').value;

        // Format the dates to DD/MM/YYYY
        const formattedDateFrom = formatDateToDDMMYYYY(dateFrom);
        const formattedDateTo = formatDateToDDMMYYYY(dateTo);

        doc.text("Invoice Date From: " + formattedDateFrom, 150, 40);
        doc.text("Invoice Date To: " + formattedDateTo, 150, 45);
        doc.text("Payment Method: Bank Transfer", 150, 50);

        // Table header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text("Item Code", 10, 70);
        doc.text("Item Description", 40, 70);
        doc.text("Quantity", 100, 70);
        doc.text("Price (Ex)", 120, 70);
        doc.text("Disc", 140, 70);
        doc.text("Total", 160, 70);

        // Table content
        let y = 80;
        let totalExcl = 0; // Initialize total amount excluding tax

        gridApi.forEachNode(function (node) {
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');

            doc.text(node.data.ItemName, 40, y);
            doc.text(node.data.Quantity.toString(), 100, y);
            doc.text(node.data.UnitPrice.toFixed(2), 120, y);
            doc.text(node.data.ItemTotalCost.toFixed(2), 160, y);

            totalExcl += parseFloat(node.data.ItemTotalCost); // Sum up the total cost

            y += 10;
            if (y > 270) {
                doc.addPage();
                y = 10;
            }
        });

        // Add the total amount excluding tax to the PDF
        doc.setFont('helvetica', 'bold');
        doc.text("Total (Excl)", 150, y);
        doc.setFont('helvetica', 'normal');
        doc.text(totalExcl.toFixed(2), 180, y);

        doc.save("invoice.pdf");
    });

});

function formatDateToDDMMYYYY(dateString) {
    console.log("Original date string:", dateString);
    const [month, day, year] = dateString.split('-');
    console.log("Parsed month:", month, "Parsed day:", day, "Parsed year:", year);
    return `${day}/${month}/${year}`;
}



function convertDateTimeForFetch(dateString) {
    const [month, day, year] = dateString.split('/');
    return `${year}-${month}-${day}`;
}