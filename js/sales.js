var allProducts = [];

$(document).ready(function () {
    fetchProducts();
    attachEventListeners();
});

function fetchProducts() {
    fetch('sales.aspx/ShowProducts', {
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
    $('#salesEntries').empty().append(createSaleEntryForm());
    $('#salesEntries .clsProductType').empty().append([...productTypes].map(type => new Option(type, type)));
    $('#salesEntries .clsProductType').select2();
}

function createSaleEntryForm() {
    const saleCount = $('#salesEntries .saleEntry').length + 1;
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
                                <input type="number" class="form-control" id="quantityAmount${saleCount}" placeholder="100" min="0" aria-label="Amount" onchange="updateSummary(${saleCount})">
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
    localStorage.setItem(`sale_${saleId}`, JSON.stringify(saleData));
}

function minimizeSale(saleId) {
    $(`#collapse${saleId}`).collapse('hide');
}

function expandSale(saleId) {
    $(`#collapse${saleId}`).collapse('show');
}

function loadSale(saleId) {
    const saleData = JSON.parse(localStorage.getItem(`sale_${saleId}`));
    if (saleData) {
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
        $('#salesEntries').append(createSaleEntryForm());
        $('.js-example-basic-single').select2();
    });

    $('body').on('click', '.saveButton', function () {
        const saleId = $(this).data('sale-id');
        const productType = $(`#sale${saleId} .clsProductType`).val();
        const quantity = $(`#quantityAmount${saleId}`).val();
        const totalCost = calculateTotalCost($(`#subCategory${saleId} option:selected`).data('price'), quantity);
        $(`#itemSummary${saleId}`).text(productType);
        $(`#priceSummary${saleId}`).text(totalCost.toFixed(2));
        $(`#totalCost${saleId}`).val(totalCost);
        saveSale(saleId);
        minimizeSale(saleId);
    });

    $('body').on('click', '.editButton', function () {
        const saleId = $(this).data('sale-id');
        console.log('Edit button clicked for sale ID:', saleId);
        loadSale(saleId);
        expandSale(saleId);
    });

    $('body').on('change', '.clsProductType', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        populateOptions(`#subCategory${saleId}`, $(this).val());
    });

    $('body').on('change', '.clsProductItems', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        updateSummary(saleId);
    });

    $('body').on('input change', '.quantityAmount', function () {
        const saleId = $(this).closest('.saleEntry').attr('id').replace('sale', '');
        updateSummary(saleId);
    });


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

function calculateTotalCost(price, quantity) {
    return price * quantity;
}
