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

            // Add event listener to client select element
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
            dateFrom: dateFrom,
            dateTo: dateTo,
            clientId: clientId,
            vehicleRegNo: vehicleRegNo
        };

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
                salesGridOptions.rowData = [];

                data.d.forEach(sale => {
                    const formattedDate = parseDate(sale.SaleDate);
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
        doc.text("Invoice", 105, 20, { align: 'center' });

        // Company Logo
        const imgData = 'C:\Users\User 1\Desktop\ShellPOSLATEST\img\Revamped\ShellLogo.png';
        doc.addImage(imgData, 'PNG', 10, 10, 50, 20);

        // Invoice details
        doc.setFontSize(10);
        doc.text("To:", 10, 40);
        doc.text("Cash Customer", 10, 45);
        doc.text("BRN:", 10, 50);
        doc.text("Invoice Ref: INV0011", 150, 40);
        doc.text("Date: 30-Apr-24", 150, 45);
        doc.text("Payment Method: Bank Transfer", 150, 50);

        // Table header
        doc.setFontSize(10);
        doc.text("Item Code", 10, 70);
        doc.text("Item Description", 40, 70);
        doc.text("Quantity", 100, 70);
        doc.text("Price (Ex)", 120, 70);
        doc.text("Disc", 140, 70);
        doc.text("Total", 160, 70);

        // Table content
        let y = 80;
        doc.text("Sales->Service", 10, y);
        doc.text("Device Installation & Setup", 40, y);
        doc.text("1.00", 100, y);
        doc.text("8,000.00", 120, y);
        doc.text("0.00", 140, y);
        doc.text("8,000.00", 160, y);

        y += 10;
        doc.text("Total (Excl)", 150, y);
        doc.text("8,000.00", 160, y);

        y += 10;
        doc.text("Tax", 150, y);
        doc.text("0.00", 160, y);

        y += 10;
        doc.text("Total", 150, y);
        doc.text("8,000.00", 160, y);

        y += 10;
        doc.text("Discount", 150, y);
        doc.text("0.00", 160, y);

        y += 10;
        doc.text("Total (Incl)", 150, y);
        doc.text("8,000.00", 160, y);

        // Bank details
        y += 20;
        doc.setFontSize(10);
        doc.text("BANK DETAILS:", 10, y);
        y += 5;
        doc.text("Name: Sezwan Technologies Ltd", 10, y);
        y += 5;
        doc.text("BANK: Mauritius Commercial Bank", 10, y);
        y += 5;
        doc.text("A/C Num: 000449973549", 10, y);

        // Footer
        y += 20;
        doc.setFontSize(10);
        doc.text("SEZWAN TECHNOLOGIES LTD", 10, y);
        y += 5;
        doc.text("284, Avenue Ollier,", 10, y);
        y += 5;
        doc.text("Quatre Bornes, Mauritius", 10, y);
        y += 5;
        doc.text("T +230 427 4329", 10, y);
        y += 5;
        doc.text("E systems@sezwan.com", 10, y);
        y += 5;
        doc.text("BRN C21182656", 10, y);

        doc.save("invoice.pdf");
    });

});
