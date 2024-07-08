let totalCost = 0;
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

function printSale(sale) {
    const printWindow = window.open('', '', 'height=600,width=800');
    printWindow.document.write('<html><head><title>Sale Details</title>');
    printWindow.document.write('</head><body >');
    printWindow.document.write(`<p>Sale Date: ${sale.SaleDate}</p>`);
    printWindow.document.write(`<p>Client: ${sale.ClientName}</p>`);
    printWindow.document.write(`<p>Driver: ${sale.DriverName}</p>`);
    printWindow.document.write(`<p>Car Registration: ${sale.CarRegNo}</p>`);
    printWindow.document.write('<table border="1"><thead><tr><th>Item</th><th>Quantity</th><th>Unit Price</th><th>Total Price</th></tr></thead><tbody>');
    sale.SaleItems.forEach(item => {
        printWindow.document.write(`<tr><td>${item.ItemName}</td><td>${item.Quantity}</td><td>${item.UnitPrice}</td><td>${item.TotalCost}</td></tr>`);
    });
    printWindow.document.write(`<tr><td colspan="3"><strong>Total</strong></td><td><strong>${sale.TotalCost}</strong></td></tr>`);
    printWindow.document.write('</tbody></table>');
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

document.getElementById('printAllSalesBtn').addEventListener('click', () => {
    const salesTable = document.getElementById('salesTable').cloneNode(true);
    printElement(salesTable, 'All Sales');
});

document.getElementById('printSaleBtn').addEventListener('click', () => {
    const saleDetails = document.getElementById('saleDetailsTemplate').dataset.sale;
    printSale(JSON.parse(saleDetails));
});
