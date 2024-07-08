﻿let totalCost = 0;
let totalCashCost = 0;

function determineCurrentDate() {
    const currentDate = new Date();
    return `${String(currentDate.getDate()).padStart(2, '0')}/${String(currentDate.getMonth() + 1).padStart(2, '0')}/${currentDate.getFullYear()}`;
}

async function fetchSalesData(token) {
    try {
        const response = await fetch('summary.aspx/GetSalesData', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, determineCurrentDate: determineCurrentDate() })
        });
        const data = await response.json();
        return data.d;
    } catch (error) {
        console.error('Error fetching sales data:', error);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const salesTable = document.getElementById('salesTable').querySelector('tbody');
    const saleDetailsTemplate = document.getElementById('saleDetailsTemplate');

    const token = document.cookie.split('; ').find(row => row.startsWith('Token='))?.split('=')[1];
    if (!token) {
        console.error('Token not found');
        return;
    }

    const salesData = await fetchSalesData(token);
    if (!salesData) return;

    salesData.forEach(sale => {
        totalCost += parseFloat(sale.TotalCost);
        if (sale.ClientName.toUpperCase() === 'CASH') {
            totalCashCost += parseFloat(sale.TotalCost);
        }

        const row = document.createElement('tr');
        row.dataset.saleId = sale.SaleId;
        row.innerHTML = `
            <td>${sale.SaleDate}</td>
            <td>${sale.ClientName}</td>
            <td class='totalCost'>${sale.TotalCost}</td>
            <td><button class="btn btn-secondary select-btn">Select</button></td>
        `;
        salesTable.appendChild(row);

        row.querySelector('.select-btn').addEventListener('click', (e) => {
            e.preventDefault();
            populateSaleDetails(saleDetailsTemplate, sale);
            saleDetailsTemplate.style.display = 'block';
        });
    });

    document.getElementById('totalCostContainer').textContent = `Total Cost: ${totalCost.toFixed(2)}`;
    console.log('Total Cost:', totalCost.toFixed(2));
    console.log('Total Cash Cost:', totalCashCost.toFixed(2));

    document.getElementById('printAllSalesBtn').addEventListener('click', async () => {
        console.log('Print All Sales Button Clicked');
        const token = document.cookie.split('; ').find(row => row.startsWith('Token='))?.split('=')[1];
        if (!token) {
            console.error('Token not found');
            return;
        }

        const salesData = await fetchSalesData(token);
        if (!salesData) return;

        printAllSales(salesData);
    });

    document.getElementById('printSaleBtn').addEventListener('click', () => {
        console.log('Print Sale Button Clicked');
        const saleDetails = document.getElementById('saleDetailsTemplate');
        printElement(saleDetails);
    });
});

function populateSaleDetails(saleDetails, selectedSale) {
    saleDetails.querySelector('#TimePrint').textContent = selectedSale.SaleDate;
    saleDetails.querySelector('#clientValue').textContent = selectedSale.ClientName;
    saleDetails.querySelector('#driverNamePrint').textContent = selectedSale.DriverName;
    saleDetails.querySelector('#carRegNoPrint').textContent = selectedSale.CarRegNo;

    let itemsHtml = selectedSale.SaleItems?.map(item => `
        <tr>
            <td>${item.ItemName}</td>
            <td>${item.Quantity}</td>
            <td>${item.UnitPrice}</td>
            <td>${item.TotalCost}</td>
        </tr>
    `).join('') || '<tr><td colspan="4">No items found for this sale</td></tr>';

    itemsHtml += `
        <tr class="mt-2">
            <td colspan="3" class="text-end"><strong>Total</strong></td>
            <td><strong>${selectedSale.TotalCost}</strong></td>
        </tr>
    `;
    saleDetails.querySelector('#SalesAndTotalCosts').innerHTML = itemsHtml;
}

function printElement(element) {
    const printWindow = window.open('');
    const content = element.outerHTML;

    const style = `<style>
                     .print-button, #printSaleBtn, #printAllSalesBtn { display: none !important; }
                     @media print {
                         .print-button, #printSaleBtn, #printAllSalesBtn { display: none !important; }
                     }
                   </style>`;

    printWindow.document.open();
    printWindow.document.write(`
        <html>
            <head>
                <title>Print</title>
                <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
                ${style}
            </head>
            <body>
                ${content}
            </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
    };
}

function printAllSales(salesData) {
    console.log('printAllSales function called'); // Debug log
    if (!salesData || salesData.length === 0) {
        console.error("No sales data available to print.");
        return;
    }

    const salesContent = document.createElement('div');

    salesData.forEach(sale => {
        console.log("Processing sale:", sale); // Debugging log
        if (!sale.SaleItems || sale.SaleItems.length === 0) {
            console.warn("No items found for sale ID:", sale.SaleId);
            return; // Skip to the next sale if there are no items
        }

        const saleElement = document.createElement('table');
        saleElement.className = 'table table-striped';
        let itemsHtml = `
            <thead>
                <tr>
                    <th>Sale Date</th>
                    <th>Client Name</th>
                    <th>Item Name</th>
                    <th>Quantity</th>
                    <th>Unit Price</th>
                    <th>Total Cost</th>
                </tr>
            </thead>
            <tbody>
        `;

        itemsHtml += sale.SaleItems.map(item => `
            <tr>
                <td>${sale.SaleDate}</td>
                <td>${sale.ClientName}</td>
                <td>${item.ItemName}</td>
                <td>${item.Quantity}</td>
                <td>${item.UnitPrice}</td>
                <td>${item.TotalCost}</td>
            </tr>
        `).join('');

        itemsHtml += `
            <tr class="table-info">
                <td colspan="5" class="text-end"><strong>Total for Sale</strong></td>
                <td><strong>${sale.TotalCost}</strong></td>
            </tr>
            </tbody>
        `;
        saleElement.innerHTML = itemsHtml;
        salesContent.appendChild(saleElement);
    });

    printElement(salesContent); // This will send the whole content for printing
}
