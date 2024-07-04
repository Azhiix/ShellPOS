

function triggerPageRefresh() {
    customSwal.fire({
        title: 'Success!',
        text: 'Sale succesfully saved.',
        icon: 'success',
        confirmButtonText: 'OK'

    });

    setTimeout(() => {
        location.reload();
    }, 3000);

}

function determineWhetherUserHasSaved() {


}

const customSwal = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
});


function validateSale(saleId) {
    const productType = $(`#sale${saleId} .clsProductType`).val();
    const item = $(`#subCategory${saleId}`).val();
    const quantity = $(`#quantityAmount${saleId}`).val();

    if (!productType) {
        customSwal.fire({
            title: 'Error!',
            text: 'Please select a product type.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return false;
    }

    if (!item) {
        customSwal.fire({
            title: 'Error!',
            text: 'Please select an item.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return false;
    }

    if (!quantity) {
        customSwal.fire({
            title: 'Error!',
            text: 'Please enter a valid quantity.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return false;
    }

    return true;
}
$(document).ready(function () {
    // Initialize the select2 dropdowns
    $('.js-example-basic-single').select2();
    $('#vehicleRegSelect').select2({
        placeholder: "Choose...",
        tags: true,
        tokenSeparators: [',', ' ']
    });
    $('#vehicleRegSelect').select2({
        placeholder: "Choose...",
        tags: true,
        tokenSeparators: [',', ' ']
    });

    $('#driversNameSelect').select2({
        placeholder: "Choose...",
        tags: true,
        tokenSeparators: [',', ' ']
    });




    fetchProducts().then(() => {

        attachEventListeners();
        extractUsernameFromToken();
    });

    // Prevent form submission on Enter key for specific input fields
    preventFormSubmissionOnEnter();

    fetchClientsAndVehicleReg();
});

let clientsAndVehicleReg = [];

function fetchClientsAndVehicleReg() {
    // Assuming the token is stored in a cookie named 'token'
    const token = document.cookie.split('; ').find(row => row.startsWith('Token=')).split('=')[1];
    console.log('Token:', token)

    return fetch('sales.aspx/ShowClients', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
        }
    })
        .then(response => {
            console.log('Token:', token);

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && data.d) {
                clientsAndVehicleReg = data.d;
                populateClientAndVehicleRegDropdown();
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        .catch(error => console.error('Error fetching clients and vehicle registration numbers:', error));
}

function populateClientAndVehicleRegDropdown() {
    const clientSelect = $('#clientSelect')
        ;
    clientsAndVehicleReg.forEach(item => {
        clientSelect.append(new Option(item.Name, item.ClientID));
    });

    clientSelect.on('change', function () {
        const clientId = $(this).val();
        const client = clientsAndVehicleReg.find(item => item.ClientID == clientId);

        // Populate the vehicle registration numbers
        const vehicleRegSelect = $('#vehicleRegSelect');
        vehicleRegSelect.empty();
        vehicleRegSelect.append('<option value="" disabled selected>Choose...</option>');

        const registrationNumbers = client.RegistrationNo.split(', ');
        registrationNumbers.forEach(regNo => {
            vehicleRegSelect.append(new Option(regNo, regNo));
        });

        // Reinitialize Select2 for the vehicle registration field
        vehicleRegSelect.select2({
            placeholder: "Choose...",
            tags: true,
            tokenSeparators: [',', ' ']
        });


        const driversNameSelect = $('#driversNameSelect');
        driversNameSelect.empty();
        driversNameSelect.append('<option value="" disabled selected>Choose...</option>');

        const driverNames = client.DriverName.split(', ');
        driverNames.forEach(driverName => {
            driversNameSelect.append(new Option(driverName, driverName));
        });

        // Reinitialize Select2 for the driver's name field
        driversNameSelect.select2({
            placeholder: "Choose...",
            tags: true,
            tokenSeparators: [',', ' ']
        });

      
    });
}






function fetchProducts() {
    const token = document.cookie.split('; ').find(row => row.startsWith('Token=')).split('=')[1];
    

    return fetch('sales.aspx/ShowProducts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,

        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.d) {
                allProducts = data.d;

                populateProductTypes();
            } else {
                throw new Error('Unexpected response structure');
            }
        })
        
}

function populateProductTypes() {
    const productTypes = new Set();
    allProducts.forEach(item => productTypes.add(item.ProdTypeName));

    $('#salesEntries').empty().append(createSaleEntryForm());
    const productTypeSelect = $('#salesEntries .clsProductType').first();
    productTypes.forEach(type => {

        productTypeSelect.append(new Option(type, type)); //dding product type option: Fuel

       

    });




}

function removeSale(saleId) {
   
    $(`#sale${saleId}`).remove();
    determineTotalCostForAllSales();
}

function createSaleEntryForm(productType = '') {
    const saleCount = $('#salesEntries .saleEntry').length + 1;
    return `
            <div class="card mt-3 saleEntry" id="sale${saleCount}">
                <div class="card-header" id="heading${saleCount}">
                    <h5 class="mb-0 d-flex justify-content-between align-items-center">
                        <div>
                            <button class="btn btn-link" onclick="event.preventDefault(); toggleCollapse('${saleCount}');" data-bs-toggle="collapse" data-bs-target="#collapse${saleCount}" aria-expanded="true" aria-controls="collapse${saleCount}">
                                Sale ${saleCount} - <span id="itemSummary${saleCount}">New Item</span>: Rs<span id="priceSummary${saleCount}">0.00</span>
                            </button>
                        </div>
                        <button type="button" class="btn btn-danger" onclick="event.preventDefault(); removeSale('${saleCount}');">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </h5>
                </div>
                <div id="collapse${saleCount}" class="collapse show" aria-labelledby="heading${saleCount}" data-parent="#salesEntries">
                    <div class="card-body">
                        <section class="form-container">
                            <div class="row">
                                <div class="col-md-6 col-12">
                                    <div class="mt-4 mb-2">
                                        <select class="js-example-basic-single form-control clsProductType" onchange="populateOptions('#subCategory${saleCount}', $(this).val())">
                                            <option value="">Select Product Type</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-md-6 col-12">
                                    <div class="mt-4 mb-2">
                                        <select class="js-example-basic-single form-control clsProductItems" id="subCategory${saleCount}" onchange="updateSummary(${saleCount})">
                                            <!-- Options for items will be dynamically loaded here -->
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6 totalCostForm">
                                <label for="quantityAmount${saleCount}" class="form-label mt-2">Quantity</label>
                                <div class="input-group">
                                    <input type="number" class="form-control quantityAmount" id="quantityAmount${saleCount}" oninput="updateSummary(${saleCount})" />
                                    <div class="input-group-append">
                                        <span class="input-group-text ml-3">Price</span>
                                    </div>
                                    <input type="number" id="totalCost${saleCount}" class="form-control" disabled />
                                </div>
                            </div>
                            <div class="col-12 d-flex justify-content-center mt-4">
                                <button type="button" class="btn btn-success saveButton" data-sale-id="${saleCount}">Save</button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>`;
}






function saveSale(saleId) {
    const productType = $(`#sale${saleId} .clsProductType`).val();
    const item = $(`#subCategory${saleId}`).val();
    const itemName = $(`#subCategory${saleId} option:selected`).text();
    const quantity = $(`#quantityAmount${saleId}`).val();
    const totalCost = calculateTotalCost($(`#subCategory${saleId} option:selected`).data('price'), quantity);

    const saleData = {
        productType: productType,
        item: item,
        itemName: itemName,
        quantity: quantity,
        totalCost: totalCost
    };

   

    const $saleEntry = $(`#sale${saleId}`);
    $saleEntry.data('productType', productType);
    $saleEntry.data('item', item);
    $saleEntry.data('itemName', itemName);
    $saleEntry.data('quantity', quantity);
    $saleEntry.data('totalCost', totalCost);
}

function minimizeSale(saleId) {
    $(`#collapse${saleId}`).collapse('hide');
}

function expandSale(saleId) {
    $(`#collapse${saleId}`).collapse('show');
}

function loadSale(saleId) {
    const $saleEntry = $(`#sale${saleId}`);
    const saleData = {
        productType: $saleEntry.data('productType'),
        item: $saleEntry.data('item'),
        itemName: $saleEntry.data('itemName'),
        quantity: $saleEntry.data('quantity'),
        totalCost: $saleEntry.data('totalCost')
    };

    if (saleData.productType) {
      
        $(`#sale${saleId} .clsProductType`).val(saleData.productType).trigger('change');
        $(`#subCategory${saleId}`).val(saleData.item).trigger('change');
        $(`#quantityAmount${saleId}`).val(saleData.quantity);
        $(`#totalCost${saleId}`).val(saleData.totalCost);
    } else {
       
    }
}

function attachEventListeners() {
    $(document).on('click', '#addItemButton', function () {

        $('#salesEntries').append(createSaleEntryForm());
        $('.js-example-basic-single').select2();
        const newProductTypeSelect = $('#salesEntries .clsProductType').last();
       

        const productTypes = new Set();
        allProducts.forEach(item => productTypes.add(item.ProdTypeName));
       

        productTypes.forEach(type => {
            
            newProductTypeSelect.append(new Option(type, type));
        });

        newProductTypeSelect.select2();
       
        newProductTypeSelect.change();
    });

    $(document).on('click', '.saveButton', function () {
        const saleId = $(this).data('sale-id');
       
        if (!validateSale(saleId)) return;



        const productType = $(`#sale${saleId} .clsProductType`).val();
        const quantity = $(`#quantityAmount${saleId}`).val();
        const totalCost = calculateTotalCost($(`#subCategory${saleId} option:selected`).data('price'), quantity);
        $(`#itemSummary${saleId}`).text(productType);
        $(`#priceSummary${saleId}`).text(totalCost.toFixed(2));
        $(`#totalCost${saleId}`).val(totalCost);
        saveSale(saleId);
        minimizeSale(saleId);
        determineTotalCostForAllSales();

    });

    //$(document).on('click', '.editButton', function () {
    //    const saleId = $(this).data('sale-id');
    //    console.log('Edit button clicked for sale ID:', saleId);
    //    loadSale(saleId);
    //    expandSale(saleId);
    //});

    $(document).on('change', '.clsProductType', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');

        
        printAllSales();
        determineTotalCostForAllSales();
        removeAllSales();


    });

    $(document).on('change', '.clsProductItems', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        
        updateSummary(saleId);
        determineTotalCostForAllSales();
    });

    $(document).on('input change', '.quantityAmount', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        console.log(`Quantity changed for sale ID: ${saleId}, new value: ${$(this).val()}`);
        updateSummary(saleId);
        determineTotalCostForAllSales();
    });

    $(document).on('click', '.saveAndPrint', function () {
        validateSalesData()

        
        printAllSales();
        determineTotalCostForAllSales();

        removeAllSales();
        triggerPageRefresh()

    });

    $(document).on('click', '.reloadSale', function () {
       

        reloadPreviousSales();


    });


}
function preventFormSubmissionOnEnter() {
    $(document).on('keydown', 'input, select', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();

        }
    })
}

function populateOptions(subDropdownSelector, category) {
   
    const $dropdown = $(subDropdownSelector);
    const options = allProducts.filter(product => product.ProdTypeName.toLowerCase() === category.toLowerCase());
    
    $dropdown.empty();
    options.forEach(item => {
        const option = new Option(`${item.ItemName} - Rs ${item.UnitPrice}`, item.ItemId);
        $(option).data('price', item.UnitPrice);
       
        $dropdown.append(option);
    });
    $dropdown.select2();
   
}

function updateSummary(saleId) {
    const $selectedOption = $(`#subCategory${saleId} option:selected`);
    const quantity = parseFloat($(`#quantityAmount${saleId}`).val()) || 0;
    const price = parseFloat($selectedOption.data('price')) || 0;
    const totalCost = quantity * price;
   
    $(`#totalCost${saleId}`).val(totalCost.toFixed(2)).toggle(totalCost > 0);
}

function removeAllSales() {
    console.log('Remove all sales');
    $('.saleEntry').each(function () {
        const $saleEntry = $(this);
        $saleEntry.removeData('productType');
        $saleEntry.removeData('item');
        $saleEntry.removeData('itemName');
        $saleEntry.removeData('quantity');
        $saleEntry.removeData('totalCost');
    });
    console.log('All sales have been removed.');
}


function calculateTotalCost(price, quantity) {
    return price * quantity;
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

function extractUsernameFromToken() {
    const cookieName = 'Token';
    const token = getCookie(cookieName);
    console.log('Token:', token)
    if (token) {
        try {
            const decodedToken = jwt_decode(token);
            const username = decodedToken['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
            console.log(`Username: ${username}`);
            document.getElementById('usernameValue').innerText = username;
        } catch (e) {
            console.error('Error decoding token:', e);
        }
    } else {
        console.error('Token not found in the cookie.');
    }
}

function printAllSales() {

    console.log('Print all sales');

    // Clear the table before adding new rows
    $("#SalesAndTotalCosts").empty();

    let totalCost = 0;

    $('.saleEntry').each(function () {
        const $saleEntry = $(this);
        const saleData = {
            productType: $saleEntry.data('productType'),
            item: $saleEntry.data('item'),
            itemName: $saleEntry.data('itemName'),
            quantity: $saleEntry.data('quantity'),
            totalCost: $saleEntry.data('totalCost')
        };
        console.log('Sale:', saleData);


        const match = saleData.itemName.match(/(.+?) - Rs (\d+)/);
        const productName = match ? match[1].trim() : 'Unknown Product';
        const unitPrice = match ? parseFloat(match[2]) : 0;

        const newRow = `<tr>
                    <td>${productName}</td>
                    <td>${saleData.quantity}</td>
                    <td>${unitPrice}</td>
                    <td>${saleData.totalCost.toFixed(2)}</td>
                </tr>`;

        // Append the new row to the table
        $("#SalesAndTotalCosts").append(newRow);

        // Accumulate total cost
        totalCost += parseFloat(saleData.totalCost);
    });

    // Append the total cost row to the table
    const totalRow = `<tr class="mt-2">
                <td style="font-weight: bold;" colspan="3">Total</td>
                <td style="font-weight: bold;">${totalCost.toFixed(2)}</td>
            </tr>`;
    $("#SalesAndTotalCosts").append(totalRow);

    // Update the total value in the print section
    $("#totalValue").text(totalCost.toFixed(2));

    // Add client and additional information
    addRelevantClientInformation();
    addDriverAndCarInfo();

    // Ensure the print section is visible for printing
    $('.printWindow').removeClass('d-none');

    // Trigger print
    window.print();

    // Hide the print section after printing
    $('.printWindow').addClass('d-none');

    printSalesData()
    saveSalesData()

}

function validateSalesData() {
    // Ensure that client, car registration, and driver name are selected
    const clientSelect = $('#clientSelect');
    const vehicleRegSelect = $('#vehicleRegSelect')
    vehicleRegSelect.select2
        ;
    const driversNameSelect = $('#driversNameSelect');

    if (!clientSelect.val() || !vehicleRegSelect.val() || !driversNameSelect.val()) {
        customSwal.fire({
            title: 'Error!',
            text: 'Please select a client, vehicle registration number, and driver.',
            icon: 'error',
            confirmButtonText: 'OK'
        });
        return false;
    }
    return true;
}

async function prepareSalesDataForPrinting() {
    const { salesData, clientInfo } = collectSalesData();
    console.log('Sales data:', JSON.stringify(salesData));
    console.log('Client info:', JSON.stringify(clientInfo));

    // Clear the table before adding new rows
    $("#SalesAndTotalCosts").empty();

    addRelevantClientInformation(clientInfo);
    addDriverAndCarInfo(clientInfo);
}

function displayPrintWindow() {
    $('.printWindow').removeClass('d-none');
}

function hidePrintWindow() {
    $('.printWindow').addClass('d-none');
}


function collectSalesData() {
    let salesData = [];
    let totalCost = 0;


    // Check if salesData is empty


    $('.saleEntry').each(function (index) {
        var $saleEntry = $(this);
        const itemName = $saleEntry.data('itemName');
        const itemId = $saleEntry.data('item');




        var priceMatch = itemName.match(/Rs\s(\d+\.\d+|\d+)/);
        var price = priceMatch ? parseFloat(priceMatch[1]) : null;

        if (price === null) {
            console.error('Price could not be extracted from item name:', itemName);
        } else {
            console.log('Extracted Price:', price);
        }

        var name = itemName.split(/\s*-\s*/)[0];
        var saleData = {
            id: index + 1,
            productType: $saleEntry.data('productType'),
            ItemId: itemId,
            itemName: name,
            quantity: $saleEntry.data('quantity'),
            totalItemCost: $saleEntry.data('totalCost'),
            unitPrice: price
        };

        salesData.push(saleData);
        totalCost += parseFloat(saleData.totalItemCost);
    });

    const clientInfo = {
        ClientId: $('#clientSelect option:selected').val(),
        Username: $('#usernameValue').text(),
        date: new Date().toLocaleString().split('-').reverse().join('-').split(',')[0],
        driverName: $('#driversNameSelect').val(),
        carRegNo: $('#vehicleRegSelect option:selected').val(),
        mileage: $('.inputMileage').val(),
        totalCost: totalCost.toFixed(2)
    };
    localStorage.setItem('sales', JSON.stringify(salesData));

    return { salesData, clientInfo };
}



function printSalesData() {
    const { salesData, clientInfo } = collectSalesData();
 ;
}

function saveSalesData() {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('Token='));
    if (!tokenCookie) {
        console.error('Token not found');
        return;
    }
    const token = tokenCookie.split('=')[1];
    const { salesData, clientInfo } = collectSalesData();

    console.log('Sales data:', JSON.stringify(salesData));
    console.log('Client info:', JSON.stringify(clientInfo));

    fetch('sales.aspx/AddSales', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token,
        },
        body: JSON.stringify({
            salesJson: JSON.stringify(salesData),
            clientInfoJson: JSON.stringify(clientInfo)
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.d) {
                console.log('Data saved successfully:', data.d);


            } else {
                console.error('Error saving data:', data);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
}




function addRelevantClientInformation() {
    const client = $('#clientSelect option:selected').text();
    let date = new Date().toLocaleString(); //  saleDate is a date, and is saved  in this format: '26/06/2024, should be like this: 2024-05-30

   /* date = date.split(' ')[0].split('/').reverse().join('-'); //2024,-06-26*/
    date = date.split('-').reverse().join('-').split(',')[0]; //2024-06-26


    $('#TimePrint').text(date);
    $('#clientValue').text(client);
}

function addDriverAndCarInfo() {
   
    const driverName = $('#driversNameSelect option:selected').text(); // Changed to use .text() to get the selected option's text
    const carRegNo = $('#vehicleRegSelect option:selected').val();
    //carRegNo.select2({
    //    placeholder: "Choose...",
    //    tags: true,
    //    tokenSeparators: [',', ' ']
    //});

    const mileage = $('.inputMileage').val();

    $('#driverNamePrint').text(driverName);
    $('#carRegNoPrint').text(carRegNo);
    //$('#mileagePrint').text(mileage);
    //$('#mileagePrint').append(' km');
}

function determineTotalCostForAllSales() {
    const totalCost = $('.saleEntry').toArray().reduce((sum, saleEntry) => {
        const $saleEntry = $(saleEntry);
        return sum + (parseFloat($saleEntry.find(`#totalCost${$saleEntry.attr('id').replace('sale', '')}`).val()) || 0);
    }, 0);

    $('#totalSalesCosts').val(totalCost.toFixed(2));
    $('#totalValue').text(totalCost.toFixed(2));
}