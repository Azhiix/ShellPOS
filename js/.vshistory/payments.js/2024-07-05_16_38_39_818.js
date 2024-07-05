document.addEventListener('DOMContentLoaded', function () {
    fetchClientInfo();
    setupDatePickers();

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

function fetchClientInfo() {
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
}

function setupDatePickers() {
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
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
}

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
            return response.json();
        })
        .then(data => {
            console.log('Received data:', data);
            if (data && data.d) {
                summarizeSales(data.d);
                fetchPayments(payload.clientID, payload.dateFrom, payload.dateTo); // Fetch payments for the selected client within the date range
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
    document.getElementById('totalAmountOwed').textContent = totalAmountOwed.toFixed(2);
    document.querySelector('.totalOwed').classList.remove('d-none');
}

function fetchPayments(clientID, dateFrom, dateTo) {
    fetch('payments.aspx/displayClientPayments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientID: clientID }),
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
                const filteredPayments = data.d.filter(payment => {
                    const paymentDate = new Date(payment.CreatedDate.split('/').reverse().join('-'));
                    const dateFromObj = new Date(dateFrom.split('/').reverse().join('-'));
                    const dateToObj = new Date(dateTo.split('/').reverse().join('-'));
                    return paymentDate >= dateFromObj && paymentDate <= dateToObj;
                });
                displayPayments(filteredPayments);
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
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load payments data. Please try again later.',
            });
        });
}

function displayPayments(paymentData) {
    console.log('Payments data is', paymentData)
    const paymentsTableBody = document.querySelector('#paymentsTable tbody');
    paymentsTableBody.innerHTML = ''; // Clear existing rows

    let totalAmountPaid = 0;

    paymentData.forEach(payment => {
        totalAmountPaid += payment.Amount;
        const row = `
            <tr>
                <td>${payment.CreatedDate}</td>
                <td>${payment.Amount.toFixed(2)}</td>
                <td>${payment.Reference}</td>
                <td>${payment.Comments || ''}</td>
            </tr>
        `;
        paymentsTableBody.innerHTML += row;
    });
    document.querySelector('.paymentInfo').classList.remove('d-none');
    document.querySelector('.payDetails').classList.remove('d-none');
    console.log('Total Amount Paid:', totalAmountPaid);
    document.getElementById('totalAmountPaid').textContent = totalAmountPaid.toFixed(2);
    document.querySelector('.totalPaid').classList.remove('d-none');

    const totalAmountOwed = parseFloat(document.getElementById('totalAmountOwed').textContent);
    const outstandingAmount = totalAmountOwed - totalAmountPaid;
    document.getElementById('outstandingAmount').textContent = outstandingAmount.toFixed(2);
    document.querySelector('.outstandingAmount').classList.remove('d-none');
}

function submitPayment(event) {
    event.preventDefault();
    let today = new Date();
    let dd = String(today.getDate()).padStart(2, '0');
    let mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    let yyyy = today.getFullYear();

    today = mm + '-' + dd + '-' + yyyy;

    const specificDate = today
    const amount = parseFloat(document.getElementById('paymentAmount').value); // Ensure Amount is a decimal
    const reference = document.getElementById('paymentReference').value;
    const comments = document.getElementById('paymentComments').value;
    const clientId = parseInt(document.getElementById('clientSelect').value); // Ensure clientId is an integer
    const paymentTypeId = parseInt(document.getElementById('paymentType').value); // Ensure paymentTypeId is an integer

    if (!amount || !reference) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please fill in all required fields',
        });
        return;
    }

    const payload = {
        specificDate: specificDate || null,
        amount: amount,
        reference: reference,
        comments: comments,
        clientId: clientId,
        paymentTypeId: paymentTypeId
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
            Swal.fire({
                icon: 'success',
                title: 'Payment Submitted',
                text: 'The payment has been successfully submitted.',
            });

            // Refresh the payments table and totals
            fetchPayments(clientId);
            //now we clear all the values 
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit payment. Please try again later.',
            });
        });
}
