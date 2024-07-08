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
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
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
            console.error('Error fetching client info:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load client information. Please try again later.',
            });
        });
}

function setupDatePickers() {
    const dateFormat = "d/m/Y";

    flatpickr("#dateFrom", {
        defaultDate: new Date(),
        dateFormat: dateFormat,
        onChange: function (selectedDates, dateStr, instance) {
            flatpickr("#dateTo", {
                minDate: dateStr,
                dateFormat: dateFormat,
            });
        }
    });

    flatpickr("#dateTo", {
        defaultDate: new Date(),
        dateFormat: dateFormat,
    });

    flatpickr("#paymentDateFrom", {
        dateFormat: dateFormat
    });

    flatpickr("#paymentDateTo", {
        dateFormat: dateFormat
    });
}

function formatDateToDDMMYYYY(dateString) {
    const [day, month, year] = dateString.split('/');
    return `${day}/${month}/${year}`;
}

function filterSales() {
    const dateFrom = document.getElementById('dateFrom').value;
    const dateTo = document.getElementById('dateTo').value;

    if (!dateFrom || !dateTo) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Please select a date range',
        });
        return;
    }

    const payload = {
        dateFrom: formatDateToDDMMYYYY(dateFrom),
        dateTo: formatDateToDDMMYYYY(dateTo),
        clientID: document.getElementById('clientSelect').value,
    };

    fetch('payments.aspx/displayClientSales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.d) {
                summarizeSales(data.d);
                fetchPayments(payload.clientID, payload.dateFrom, payload.dateTo);
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => {
            console.error('Error fetching sales data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load sales data. Please try again later.',
            });
        });
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
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.d) {
                const filteredPayments = data.d.filter(payment => {
                    const paymentDate = new Date(payment.CreatedDate.split('/').reverse().join('-'));
                    const dateFromObj = new Date(dateFrom.split('/').reverse().join('-'));
                    const dateToObj = new Date(dateTo.split('/').reverse().join('-'));
                    return paymentDate >= dateFromObj && paymentDate <= dateToObj;
                });
                displayPayments(filteredPayments);
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => {
            console.error('Error fetching payments data:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load payments data. Please try again later.',
            });
        });
}

function displayPayments(paymentData) {
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
    document.getElementById('totalAmountPaid').textContent = totalAmountPaid.toFixed(2);
    document.querySelector('.totalPaid').classList.remove('d-none');

    const totalAmountOwed = parseFloat(document.getElementById('totalAmountOwed').textContent);
    const outstandingAmount = totalAmountOwed - totalAmountPaid;
    document.getElementById('outstandingAmount').textContent = outstandingAmount.toFixed(2);
    document.querySelector('.outstandingAmount').classList.remove('d-none');
}

function submitPayment(event) {
    event.preventDefault();
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // January is 0!
    const yyyy = today.getFullYear();
    const specificDate = `${dd}/${mm}/${yyyy}`;

    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const reference = document.getElementById('paymentReference').value;
    const comments = document.getElementById('paymentComments').value;
    const clientId = parseInt(document.getElementById('clientSelect').value);
    const paymentTypeId = parseInt(document.getElementById('paymentType').value);

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

    fetch('payments.aspx/submitPayment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Payment Submitted',
                text: 'The payment has been successfully submitted.',
            });

            fetchPayments(clientId);
            document.getElementById('paymentAmount').value = '';
            document.getElementById('paymentReference').value = '';
            document.getElementById('paymentComments').value = '';
            document.getElementById('paymentType').value = '';
        })
        .catch(error => {
            console.error('Error submitting payment:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to submit payment. Please try again later.',
            });
        });
}
