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

            
       

})

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



//Function to filter Sales via the ClientId, DateFrom and DateTo



function filterSales() {
    const dateFrom = document.getElementById('dateFrom').value
    const dateTo = document.getElementById('dateTo').value
    const clientSelect = document.getElementById('clientSelect');
    const formattedDateFrom = formatDateToDDMMYYYY(dateFrom.value);
    const formattedDateTo = formatDateToDDMMYYYY(dateTo.value);

    
    console.log(clientSelect, formattedDateFrom, formattedDateTo);

    
}



function formatDateToDDMMYYYY(dateString) {
    console.log("Original date string:", dateString);
    const [month, day, year] = dateString.split('-');
    console.log("Parsed month:", month, "Parsed day:", day, "Parsed year:", year);
    return `${day}/${month}/${year}`;
}




$(document).on('click', '#getSales', function () {




    alert('Button has been Clicked ')

    filterSales()

})