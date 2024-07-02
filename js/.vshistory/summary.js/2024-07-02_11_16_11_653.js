let totalCost = 0; // Variable to store the total cost of all sales
let totalCashCost = 0;

function determineCurrentDate() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    const currentDay = currentDate.getDate();
    const determineCurrentDate = `${currentMonth < 10 ? '0' + currentMonth : currentMonth}/${currentDay < 10 ? '0' + currentDay : currentDay}/${currentYear}`;
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
    const numberOfRows = document.querySelectorAll('#salesTable tr.expandable');
    return numberOfRows.length;
}

function printElementBySaleId(saleId) {
    const printElements = document.querySelectorAll('#salesTable tr.expandable');
    printElements.forEach((element) => {
        if (element.dataset.saleId !== saleId) {
            element.style.display = 'none';
        }
    });

    // Hide print and toggle buttons, and the total cost elements
    const buttonsToHide = document.querySelectorAll('.print-btn, .toggle-btn');
    buttonsToHide.forEach(button => button.style.display = 'none');
    document.getElementById('totalCostContainer').style.display = 'none';
    document.getElementById('totalSalesContainer').style.display = 'none';
    document.getElementById('totalCashCostContainer').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
    const salesTable = document.getElementById('salesTable').querySelector('tbody');
    const saleDetailsTemplate = document.getElementById('saleDetailsTemplate').cloneNode(true);
    saleDetailsTemplate.id = ''; // Remove the ID from the clone

    // Function to populate the sales details
    const populateSaleDetails = (selectedSale, detailsContainer) => {
        detailsContainer.querySelector('#TimePrint').textContent = selectedSale.SaleDate;
        detailsContainer.querySelector('#clientValue').textContent = selectedSale.ClientName;
        detailsContainer.querySelector('#driverNamePrint').textContent = selectedSale.DriverName;
        detailsContainer.querySelector('#carRegNoPrint').textContent = selectedSale.CarRegNo;
        detailsContainer.querySelector('#mileagePrint').textContent = selectedSale.Mileage || '';

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
        detailsContainer.querySelector('#SalesAndTotalCosts').innerHTML = itemsHtml;
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
                    if (sale.ClientName.toUpperCase() === 'CASH') {
                        totalCashCost += parseFloat(sale.TotalCost); // Calculate the cost where the client's name is "cash"
                    }

                    const row = document.createElement('tr');
                    row.classList.add('expandable');
                    row.dataset.saleId = sale.SaleId;
                    row.innerHTML = `
                        <td>${sale.SaleDate}</td>
                        <td>${sale.ClientName}</td>
                        <td class='totalCost'>${sale.TotalCost}</td>
                        <td><button class="btn btn-secondary toggle-btn"></button></td>
                        <td><button class="btn btn-primary print-btn">Print</button></td>
                    `;
                    salesTable.appendChild(row);

                    const detailsContainer = saleDetailsTemplate.cloneNode(true);
                    detailsContainer.style.display = 'none';
                    row.after(detailsContainer);

                    row.querySelector('.toggle-btn').addEventListener('click', (e) => {
                        e.preventDefault();
                        if (detailsContainer.style.display === 'none') {
                            // Hide the total cost of all sales
                            document.getElementById('totalCostContainer').style.display = 'none';
                            document.getElementById('totalSalesContainer').style.display = 'none';
                            document.getElementById('totalCashCostContainer').style.display = 'none';

                            // Hide all other sales and details
                            Array.from(salesTable.children).forEach(sibling => {
                                if (sibling !== row) {
                                    sibling.style.display = 'none';
                                    const siblingDetails = sibling.nextElementSibling;
                                    if (siblingDetails && siblingDetails.classList.contains('details')) {
                                        siblingDetails.style.display = 'none';
                                    }
                                }
                            });
                            populateSaleDetails(sale, detailsContainer);
                            detailsContainer.style.display = 'block';
                            row.querySelector('.toggle-btn').classList.add('collapsed');
                        } else {
                            // Show the total cost of all sales
                            document.getElementById('totalCostContainer').style.display = 'block';
                            document.getElementById('totalSalesContainer').style.display = 'block';
                            document.getElementById('totalCashCostContainer').style.display = 'block';

                            // Show all sales
                            Array.from(salesTable.children).forEach(sibling => {
                                sibling.style.display = '';
                            });
                            detailsContainer.style.display = 'none';
                            row.querySelector('.toggle-btn').classList.remove('collapsed');
                        }
                    });

                    row.querySelector('.print-btn').addEventListener('click', (e) => {
                        e.preventDefault();
                        const saleId = e.target.closest('.expandable').dataset.saleId;
                        console.log(saleId, 'printEl');
                        printElementBySaleId(saleId);
                        window.print();
                        window.location.reload(); // Reload the page after printing to restore the original view
                    });
                });

                // Display total cost, total number of sales, and total number of items sold
                const totalNumberOfSalesItems = determineTotalNumberOfSalesItems(salesData);
                document.getElementById('totalCostContainer').textContent = `Total Cost: ${totalCost.toFixed(2)}`;
                document.getElementById('totalSalesContainer').textContent = `Total Sales are ${determineNumberofSales()} and Total Number of Items Sold are ${totalNumberOfSalesItems}`;
                document.getElementById('totalCashCostContainer').textContent = `Total Cash Cost: ${totalCashCost.toFixed(2)}`;
                console.log('Total Cost:', totalCost.toFixed(2));
                console.log(determineCurrentDate(), 'today\'s current date is');
                console.log('Total Number of Sales Items:', totalNumberOfSalesItems);
                console.log('Total Cash Cost:', totalCashCost.toFixed(2));
            }
        })
        .catch(error => {
            console.error('Error fetching sales data:', error);
        });
});
