$(document).ready(function () {
    fetchProducts().then(() => {
        console.log('Products have been fetched, attaching event listeners.');
        attachEventListeners();
        extractUsernameFromToken();
    });

    // Prevent form submission on Enter key for specific input fields
    preventFormSubmissionOnEnter();
});

function fetchProducts() {
    console.log('Fetching products...');
    return fetch('sales.aspx/ShowProducts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    })
        .then(response => response.json())
        .then(data => {
            allProducts = data.d;
            console.log('Products fetched:', allProducts);
            populateProductTypes();
        })
        .catch(error => console.error('Error fetching products:', error));
}

function populateProductTypes() {
    const productTypes = new Set();
    allProducts.forEach(item => productTypes.add(item.ProdTypeName));
    console.log('Unique product types:', productTypes);
    $('#salesEntries').empty().append(createSaleEntryForm());
    const productTypeSelect = $('#salesEntries .clsProductType').first();
    productTypes.forEach(type => {
        console.log('Adding product type option:', type);
        productTypeSelect.append(new Option(type, type));
    });
    productTypeSelect.select2();
    console.log('Initial product type dropdown populated.');
}

function createSaleEntryForm(productType = '') {
    const saleCount = $('#salesEntries .saleEntry').length + 1;
    console.log(`Creating sale entry form ${saleCount}`);
    return `
        <div class="card mt-3 saleEntry" id="sale${saleCount}">
            <div class="card-header" id="heading${saleCount}">
                <h5 class="mb-0 d-flex justify-content-between align-items-center">
                    <div>
                        <button class="btn btn-link" data-bs-toggle="collapse" data-bs-target="#collapse${saleCount}" aria-expanded="true" aria-controls="collapse${saleCount}">
                            Sale ${saleCount} - <span id="itemSummary${saleCount}">New Item</span>: $<span id="priceSummary${saleCount}">0.00</span>
                        </button>
                    </div>
                    <button type="button" class="btn btn-warning editButton" data-sale-id="${saleCount}">Edit</button>
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
                                <input type="number" class="form-control quantityAmount" id="quantityAmount${saleCount}" placeholder="100" min="0" aria-label="Amount" onchange="updateSummary(${saleCount})">
                                <div class="input-group-append">
                                    <span class="input-group-text">L</span>
                                </div>
                                <input type="number" id="totalCost${saleCount}" class="form-control" disabled />
                            </div>
                        </div>
                        <div class="col-12 d-flex justify-content-center mt-2">
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

    console.log('Saving sale data:', saleData);

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
        console.log('Sale loaded:', saleData);
        $(`#sale${saleId} .clsProductType`).val(saleData.productType).trigger('change');
        $(`#subCategory${saleId}`).val(saleData.item).trigger('change');
        $(`#quantityAmount${saleId}`).val(saleData.quantity);
        $(`#totalCost${saleId}`).val(saleData.totalCost);
    } else {
        console.log('No data found for sale ID:', saleId);
    }
}

function attachEventListeners() {
    $('body').on('click', '#addItemButton', function () {
        console.log('Add Item button clicked.');
        $('#salesEntries').append(createSaleEntryForm());
        const newProductTypeSelect = $('#salesEntries .clsProductType').last();
        console.log('New product type select created:', newProductTypeSelect);

        const productTypes = new Set();
        allProducts.forEach(item => productTypes.add(item.ProdTypeName));
        console.log('Unique product types for new select:', productTypes);

        productTypes.forEach(type => {
            console.log('Adding product type option to new select:', type);
            newProductTypeSelect.append(new Option(type, type));
        });

        newProductTypeSelect.select2();
        console.log('New product type dropdown populated.');
        newProductTypeSelect.change();
    });

    $('body').on('click', '.saveButton', function () {
        const saleId = $(this).data('sale-id');
        console.log(`Save button clicked for sale ID: ${saleId}`);
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

    $('body').on('click', '.editButton', function () {
        const saleId = $(this).data('sale-id');
        console.log('Edit button clicked for sale ID:', saleId);
        loadSale(saleId);
        expandSale(saleId);
    });

    $('body').on('change', '.clsProductType', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        console.log(`Product type changed for sale ID: ${saleId}, new value: ${$(this).val()}`);
        populateOptions(`#subCategory${saleId}`, $(this).val());
    });

    $('body').on('change', '.clsProductItems', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        console.log(`Product item changed for sale ID: ${saleId}, new value: ${$(this).val()}`);
        updateSummary(saleId);
        determineTotalCostForAllSales();
    });

    $('body').on('input change', '.quantityAmount', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        console.log(`Quantity changed for sale ID: ${saleId}, new value: ${$(this).val()}`);
        updateSummary(saleId);
        determineTotalCostForAllSales();
    });

    $('body').on('click', '.saveAndPrint', function (e) {
        console.log('Save and Print button clicked.');
        printAllSales();
        determineTotalCostForAllSales();
        removeAllSales();
    });
}

function preventFormSubmissionOnEnter() {
    $('body').on('keydown', 'input, select', function (e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            console.log('Enter key pressed, default form submission prevented.');
        }
    });
}

function populateOptions(subDropdownSelector, category) {
    console.log(`Populating options for category: ${category} in dropdown: ${subDropdownSelector}`);
    const $dropdown = $(subDropdownSelector);
    const options = allProducts.filter(product => product.ProdTypeName.toLowerCase() === category.toLowerCase());
    console.log('Filtered options:', options);
    $dropdown.empty();
    options.forEach(item => {
        const option = new Option(`${item.ItemName} - Rs ${item.UnitPrice}`, item.ItemId);
        $(option).data('price', item.UnitPrice);
        console.log('Adding item option:', option);
        $dropdown.append(option);
    });
    $dropdown.select2();
    console.log('Options populated.');
}

function updateSummary(saleId) {
    const $selectedOption = $(`#subCategory${saleId} option:selected`);
    const quantity = parseFloat($(`#quantityAmount${saleId}`).val()) || 0;
    const price = parseFloat($selectedOption.data('price')) || 0;
    const totalCost = quantity * price;
    console.log(`Updating summary for sale ID: ${saleId}, quantity: ${quantity}, price: ${price}, total cost: ${totalCost}`);
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
            <td>${saleData.totalCost}</td>
        </tr>`;

        // Append the new row to the table
        $("#SalesAndTotalCosts").append(newRow);

        // Accumulate total cost
        totalCost += parseFloat(saleData.totalCost);
    });

    // Append the total cost row to the table
    const totalRow = `<tr class="mt-2">
        <td colspan="3">Total</td>
        <td>${totalCost.toFixed(2)}</td>
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
     
   
}

function collectSalesData() {
    let salesData = [];
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

        salesData.push(saleData);
        totalCost += parseFloat(saleData.totalCost);
    });

    const clientInfo = {
        clientName: $('#clientSelect option:selected').text(),
        date: new Date().toLocaleString(),
        driverName: $('#inputDriversName').val(),
        carRegNo: $('#Car\\ Registration\\ No\\.').val(),
        mileage: $('.inputMileage').val(),
        totalCost: totalCost.toFixed(2)
    };


    return { salesData, clientInfo };
}

// need to find a way to create one object with the sales data and client info

function printSalesData() {
    const { salesData, clientInfo } = collectSalesData();
    console.log('Sales data:', salesData);
    console.log('Client info:', clientInfo);
}




function addRelevantClientInformation() {
    var client = $('#clientSelect option:selected').text();
    var date = new Date().toLocaleString();
    console.log('Client:', client, 'Date:', date);
    $('#TimePrint').text(date);
    $('#clientValue').text(client);
}

function addDriverAndCarInfo() {
    var driverName = $('#inputDriversName').val();
    var carRegNo = $('#Car\\ Registration\\ No\\.').val();
    var mileage = $('.inputMileage').val();
    console.log('Driver:', driverName, 'Car Registration No.:', carRegNo, 'Mileage:', mileage);
    $('#driverNamePrint').text(driverName);
    $('#carRegNoPrint').text(carRegNo);
    $('#mileagePrint').text(mileage) ;
}

function determineTotalCostForAllSales() {
    const totalCost = $('.saleEntry').toArray().reduce((sum, saleEntry) => {
        const $saleEntry = $(saleEntry);
        return sum + (parseFloat($saleEntry.find(`#totalCost${$saleEntry.attr('id').replace('sale', '')}`).val()) || 0);
    }, 0);
    console.log('Total cost for all sales:', totalCost);
    $('#totalSalesCosts').val(totalCost.toFixed(2));
    $('#totalValue').text(totalCost.toFixed(2));
}
