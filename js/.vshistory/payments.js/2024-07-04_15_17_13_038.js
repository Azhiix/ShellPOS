﻿document.addEventListener('DOMContentLoaded', function () {
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
        
    }
   
    const clientSelect = document.getElementById('clientSelect').value;
    const formattedDateFrom = formatDateToDDMMYYYY(dateFrom);
    const formattedDateTo = formatDateToDDMMYYYY(dateTo);

    console.log(clientSelect, formattedDateFrom, formattedDateTo);

    // Add your filtering logic here


    fetch('payments.aspx/displayAllSalesForAClient', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            body: JSON.stringify({
               payload
            })
            },





    })





