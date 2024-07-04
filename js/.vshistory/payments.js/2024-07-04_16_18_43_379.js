document.addEventListener('DOMContentLoaded', function () {
    fetch('payments.aspx/displayClientInfo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then(response => {
            console.log('Received response:', response);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.d) {
                const clientSelect = document.getElementById('clientSelect');
                const optionEl = `<option value="">Select Client</option>
            ${data.d.map(client => `<option value="${client.ClientID}">${client.Name}</option>`).join('')}`;
                clientSelect.innerHTML = optionEl;
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

    flatpickr("#dateFrom", {
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
    flatpickr("#paymentDateFrom", {
        dateFormat: "m-d-Y"
    });

    flatpickr("#paymentDateTo", {
        dateFormat: "m-d-Y"
    });

    document.getElementById('getSales').addEventListener('click', filterSales);
});

function formatDateToDDMMYYYY(dateString) {
    console.log("Original date string:", dateString);
    const [month, day, year] = dateString.split('-');
    console.log("Parsed month:", month, "Parsed day:", day, "Parsed year:", year);
    return `${day}/${month}/${year}`;
}

function filterSales() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    const payload = {
        dateFrom: formatDateToDDMMYYYY(dateFrom),
        dateTo: formatDateToDDMMYYYY(dateTo),
        clientID: document.getElementById('clientSelect').value,
    };

    console.log('Sending payload:', payload);

    fetch('payments.aspx/displayClientSales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            console.log('Received response:', response);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.d) {
                summarizeSales(data.d);
            } else {
                console.error('Unexpected response structure:', data);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

function summarizeSales(salesData) {
    let totalAmountOwed = 0;
    let totalSales = 0;
    let totalItemsSold = 0;

    salesData.forEach(sale => {
        totalAmountOwed += sale.TotalCost;
        totalSales += 1;
        sale.SaleItems.forEach(item => {
            totalItemsSold += item.Quantity;
        });
    });

    console.log('Total Amount Owed:', totalAmountOwed);
    console.log('Total Sales:', totalSales);
    console.log('Total Items Sold:', totalItemsSold);

    // Update the DOM or display the results as needed
    document.getElementById('totalAmountOwed').textContent = totalAmountOwed;
    document.getElementById('totalSales').textContent = totalSales;
    document.getElementById('totalItemsSold').textContent = totalItemsSold;
}
