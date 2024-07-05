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
            customSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load client information. Please try again later.',
            });
        });

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
        defaultDate: today,
        dateFormat: "m-d-Y",
    });
    flatpickr("#paymentDateFrom", {
        dateFormat: "m-d-Y"
    });
    flatpickr("#paymentDateTo", {
        dateFormat: "m-d-Y"
    });

    document.getElementById('useSearchPeriod').addEventListener('change', function () {
        const useSearchPeriod = this.checked;
        document.getElementById('paymentDateFromContainer').style.display = useSearchPeriod ? 'none' : 'block';
        document.getElementById('paymentDateToContainer').style.display = useSearchPeriod ? 'none' : 'block';

        if (useSearchPeriod) {
            document.getElementById('paymentDateFrom').value = document.getElementById('dateFrom').value;
            document.getElementById('paymentDateTo').value = document.getElementById('dateTo').value;
        } else {
            document.getElementById('paymentDateFrom').value = '';
            document.getElementById('paymentDateTo').value = '';
        }
    });

    document.getElementById('getSales').addEventListener('click', filterSales);
    document.querySelector('.submitPayment').addEventListener('click', submitPayment);  
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

    if (!payload.dateFrom || !payload.dateTo) {
        customSwal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select a date range',
        });
        return;
    }

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
            document.querySelector('.totalOwed').classList.remove('d-none'); // Show the total amount owed
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.d) {
                summarizeSales(data.d);

            } else {
                console.error('Unexpected response structure:', data);
                customSwal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Unexpected response structure.',
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            customSwal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load sales data. Please try again later.',
            });
        });
}

function summarizeSales(salesData) {
    let totalAmountOwed = 0;

    salesData.forEach(sale => {
        totalAmountOwed += sale.TotalCost;
    });

    console.log('Total Amount Owed:', totalAmountOwed);
    document.getElementById('totalAmountOwed').textContent = totalAmountOwed;
}

function submitPayment(event) {
    event.preventDefault();

    const paymentDateFrom = document.getElementById('paymentDateFrom').value;
    const paymentDateTo = document.getElementById('paymentDateTo').value;
    const amount = document.getElementById('paymentAmount').value;
    const reference = document.getElementById('paymentReference').value;
    const comments = document.getElementById('paymentComments').value;
    const paymentType = document.getElementById('paymentType').value; // Assuming there's a select element with id 'paymentType'

    //if (!amount || !reference) {
    //    Swa.fire({
    //        icon: 'error',
    //        title: 'Error',
    //        text: 'Please fill in all required fields',
    //    });
    //    return;
    //}

    const payload = {
        dateFrom: paymentDateFrom || null,
        dateTo: paymentDateTo || null,
        amount: amount,
        reference: reference,
        comments: comments,
        clientId: document.getElementById('clientSelect').value,
        paymentTypeId: paymentType
    };

    console.log('Sending payment payload:', payload);

    fetch('payments.aspx/submitPayment', {
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
            customSwal.fire({
                icon: 'success',
                title: 'Payment Submitted',
                text: 'The payment has been successfully submitted.',
            });
        })
        .catch(error => {
            console.error('Error:', error);
            //customSwal.fire({
            //    icon: 'error',
            //    title: 'Error',
            //    text: 'Failed to submit payment. Please try again later.',
            //});
        });
}
