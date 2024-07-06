let totalCost = 0; // Variable to store the total cost of all sales

function determineCurrentDate() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-based
    const currentDay = currentDate.getDate();
    const determineCurrentDate = `${currentDay < 10 ? '0' + currentDay : currentDay}/${currentMonth < 10 ? '0' + currentMonth : currentMonth}/${currentYear}`; // Outputs in DD/MM/YYYY format
    return determineCurrentDate;
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
    const numberOfRows = document.querySelectorAll('#salesTable tbody tr');
    return numberOfRows.length;
}

document.addEventListener('DOMContentLoaded', () => {
    const salesTable = document.getElementById('salesTable').querySelector('tbody');
    const saleDetails = document.getElementById('saleDetailsTemplate');
    let selectedSaleForReprint = null;

    const printSummaryBtn = document.getElementById('printSummaryBtn');
    const printInvoiceBtn = document.getElementById('printInvoiceBtn');

    // Function to populate the sales details
    const populateSaleDetails = (selectedSale) => {
        saleDetails.querySelector('#TimePrint').textContent = selectedSale.SaleDate;
        saleDetails.querySelector('#clientValue').textContent = selectedSale.ClientName;
        saleDetails.querySelector('#driverNamePrint').textContent = selectedSale.DriverName;
        saleDetails.querySelector('#carRegNoPrint').textContent = selectedSale.CarRegNo;

        // Populate the items in the table
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
            <tr class="mt-2">
                <td colspan="3" class="text-end">Total</td>
                <td>${selectedSale.TotalCost}</td>
            </tr>
        `;
        saleDetails.querySelector('#SalesAndTotalCosts').innerHTML = itemsHtml;
    };

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
            console.log('Fetched sales data:', data); // Add this line to log the fetched data
            if (data.d) {
                const salesData = data.d; // Store the fetched sales data

                // Populate the sales table with fetched sales data
                salesData.forEach(sale => {
                    totalCost += parseFloat(sale.TotalCost);

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
                        selectedSaleForReprint = sale;
                        populateSaleDetails(sale);
                        saleDetails.style.display = 'block';
                        printInvoiceBtn.disabled = false; // Enable the reprint invoice button
                    });
                });

                // Display total cost
                document.getElementById('totalCostContainer').textContent = `Total Cost: ${totalCost.toFixed(2)}`;
                console.log('Total Cost:', totalCost.toFixed(2));
                console.log(determineCurrentDate(), 'today\'s current date is');
            }
        })
        .catch(error => {
            console.error('Error fetching sales data:', error);
        });

    // Function to print the summary
    function printSummary() {
        const printContent = document.getElementById('salesTable').outerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Sales Summary</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write('<h1>Sales Summary</h1>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // Function to print a specific invoice
    function printInvoice() {
        if (!selectedSaleForReprint) {
            alert('Please select a sale to reprint the invoice.');
            return;
        }
        const printContent = saleDetails.outerHTML;
        const printWindow = window.open('', '', 'height=600,width=800');
        printWindow.document.write('<html><head><title>Invoice</title>');
        printWindow.document.write('</head><body>');
        printWindow.document.write(printContent);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    }

    // Attach event listeners to the print buttons
    printSummaryBtn.addEventListener('click', printSummary);
    printInvoiceBtn.addEventListener('click', printInvoice);
});
