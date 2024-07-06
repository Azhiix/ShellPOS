let totalCost = 0; // Variable to store the total cost of all sales
let totalCashCost = 0;

function determineCurrentDate() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();
    const formattedDate = `${currentDay < 10 ? '0' + currentDay : currentDay}/${currentMonth < 10 ? '0' + currentMonth : currentMonth}/${currentYear}`; // Outputs in DD/MM/YYYY format
    return formattedDate;
}

function determineTotalNumberOfSalesItems(salesData) {
    let totalItems = 0;
    salesData.forEach(sale => {
        if (sale.SaleItems) {
            totalItems += sale.SaleItems.length;
        }
    });
    return totalItems;
}

function determineNumberofSales() {
    const numberOfRows = document.querySelectorAll('#salesTable tbody tr').length;
    return numberOfRows;
}

function printContent(element) {
    const printWindow = window.open('', '', 'width=800,height=600');
    printWindow.document.write('<html><head><title>Print</title>');
    printWindow.document.write('<link rel="stylesheet" href="css/summary.css">'); // Include the link to your stylesheet
    printWindow.document.write('</head><body>');
    printWindow.document.write(element.innerHTML);
    printWindow.document.write('</body></html>');
    printWindow.document.close();
    printWindow.print();
}

document.addEventListener('DOMContentLoaded', () => {
    const salesTable = document.getElementById('salesTable').querySelector('tbody');
    const saleDetails = document.getElementById('saleDetailsTemplate').cloneNode(true);
    saleDetails.style.display = 'none';
    document.body.appendChild(saleDetails);

    const printAllSalesBtn = document.getElementById('printAllSalesBtn');
    const printSaleBtn = document.getElementById('printSaleBtn');

    printAllSalesBtn.addEventListener('click', () => {
        printContent(salesTable.parentNode);
    });

    printSaleBtn.addEventListener('click', () => {
        printContent(saleDetails);
    });

    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('Token='));
    if (!tokenCookie) {
        console.error('Token not found');
        return;
    }
    const token = tokenCookie.split('=')[1];

    // Fetch sales data from the server
    fetch('summary.aspx/GetSalesData', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ token: token, determineCurrentDate: determineCurrentDate() })
    })
        .then(response => response.json())
        .then(data => {
            if (data.d) {
                const salesData = data.d; // Store the fetched sales data

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
                        populateSaleDetails(sale);
                        saleDetails.style.display = 'block';
                    });
                });

                document.getElementById('totalCostContainer').textContent = `Total Cost: ${totalCost.toFixed(2)}`;
                document.getElementById('totalSalesContainer').textContent = `Total Sales: ${determineNumberofSales()}`;
                document.getElementById('totalCashCostContainer').textContent = `Total Cash Cost: ${totalCashCost.toFixed(2)}`;
            }
        })
        .catch(error => {
            console.error('Error fetching sales data:', error);
        });
});

function populateSaleDetails(selectedSale) {
    saleDetails.querySelector('#TimePrint').textContent = selectedSale.SaleDate;
    saleDetails.querySelector('#clientValue').textContent = selectedSale.ClientName;
    saleDetails.querySelector('#driverNamePrint').textContent = selectedSale.DriverName;
    saleDetails.querySelector('#carRegNoPrint').textContent = selectedSale.CarRegNo;

    let itemsHtml = '';
    if (selectedSale.SaleItems && selectedSale.SaleItems.length > 0) {
        selectedSale.SaleItems.forEach(item => {
            itemsHtml += `
                <tr>
                    <td>${item.ItemName}</td>
                    <td>${item.Quantity}</td>
                    <td>${item.UnitPrice}</td>
                    <td>${item.TotalCost}</td>
                </tr>
            `;
        });
    } else {
        itemsHtml = '<tr><td colspan="4">No items found for this sale</td></tr>';
    }
    itemsHtml += `
        <tr>
            <td colspan="3" class="text-end"><strong>Total</strong></td>
            <td><strong>${selectedSale.TotalCost}</strong></td>
        </tr>
    `;
    saleDetails.querySelector('#SalesAndTotalCosts').innerHTML = itemsHtml;
}
