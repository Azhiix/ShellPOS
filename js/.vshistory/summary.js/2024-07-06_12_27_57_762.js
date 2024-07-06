document.addEventListener('DOMContentLoaded', () => {
    const salesTable = document.getElementById('salesTable').querySelector('tbody');
    const saleDetails = document.getElementById('saleDetailsTemplate').cloneNode(true);
    saleDetails.style.display = 'none';
    document.body.appendChild(saleDetails);

    const printAllSalesBtn = document.getElementById('printAllSalesBtn');
    const printSaleBtn = saleDetails.querySelector('#printSaleBtn');

    // Function to print the content of a given element
    const printContent = (element) => {
        const printWindow = window.open('', '', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Print</title>');
        printWindow.document.write('<link rel="stylesheet" type="text/css" href="css/summary.css">'); // Add your CSS link here
        printWindow.document.write('</head><body >');
        printWindow.document.write(element.innerHTML);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
    };

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
                    if (sale.ClientName.toUpperCase() === 'CASH') {
                        totalCashCost += parseFloat(sale.TotalCost); // Calculate the cost where the client's name is "cash"
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

