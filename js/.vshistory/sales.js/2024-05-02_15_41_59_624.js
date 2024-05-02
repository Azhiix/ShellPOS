$(document).ready(function () {
    $('.js-example-basic-single').select2();

    $('#mainDropdown .js-example-basic-single').on('change', function () {
        var selectedValues = $(this).val();
        var $subDropdown = $('#subCategory');
        var $subDropdownContainer = $('#subDropdown');
        var $fuelQuantityInput = $('#fuelQuantityInput');
        var $waterQuantityInput = $('#waterQuantityInput');
        var $couponQuantityInput = $('#couponQuantityInput');
        var $waterTotalCostContainer = $('#waterTotalCostContainer');
        var $perGallonCostContainer = $('#perGallonCostContainer');
        var $totalCouponCostContainer = $('#totalCouponCostContainer');
        var $regulatorQuantityInput = $('#totalRegulatorQuantity'); // Make sure this is the correct ID
        var $totalRegulatorCostContainer = $('#totalRegulatorCost'); // Make sure this is the correct ID

        // Hide all inputs and containers
        $subDropdownContainer.hide();
        $fuelQuantityInput.hide();
        $waterQuantityInput.hide();
        $couponQuantityInput.hide();
        $waterTotalCostContainer.hide();
        $perGallonCostContainer.hide();
        $totalCouponCostContainer.hide();
        $totalRegulatorCostContainer.hide();

        // Clear previous options
        $subDropdown.empty();

        // Populate dropdown based on selection
        if (selectedValues.includes('fuel')) {
            populateFuelOptions($subDropdown);
            $subDropdownContainer.show();
            $fuelQuantityInput.show();
        } else if (selectedValues.includes('water')) {
            populateWaterOptions($subDropdown);
            $subDropdownContainer.show();
            $waterQuantityInput.show();
        } else if (selectedValues.includes('parking')) {
            populateCouponOptions($subDropdown);
            $subDropdownContainer.show();
            $couponQuantityInput.show();
        } else if (selectedValues.includes('regulator')) {
            $totalRegulatorCostContainer.show();
            $regulatorQuantityInput.show();
        }
    });

    // Define functions to populate dropdowns
    // ... same as your code for populateFuelOptions, populateWaterOptions, populateCouponOptions

    // Event listener for total calculation
    $(document).on('change keyup', '#subCategory, #fuelQuantity, #waterQuantity, #couponQuantity, #totalRegulatorQuantity', function () {
        updateTotals();
    });

    function updateTotals() {
        var selectedType = $('#subCategory').val();
        var quantity = parseFloat($('#fuelQuantity').val() || $('#waterQuantity').val() || $('#couponQuantity').val() || $('#totalRegulatorQuantity').val()) || 0;

        if (!quantity || quantity <= 0) {
            $('#totalCostContainer').hide();
            $('#waterTotalCostContainer').hide();
            $('#perGallonCostContainer').hide();
            $('#totalCouponCostContainer').hide();
            $('#totalRegulatorCost').hide();
            return;
        }

        var price = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
        var totalCost = price * quantity;

        if (selectedType.startsWith('coupon')) {
            $('#totalCouponAmount').val(totalCost.toFixed(2));
            $('#totalCouponCostContainer').show();
        } else if (selectedType.includes('WATER')) {
            $('#waterTotalAmount').val(totalCost.toFixed(2));
            $('#perGallonPrice').val(price.toFixed(2));
            $('#waterTotalCostContainer').show();
            $('#perGallonCostContainer').show();
        } else if (selectedType === 'regulator') {
            var regulatorPrice = 200.00; // Assuming price is constant as 200.00
            var totalRegulatorCost = regulatorPrice * quantity;
            $('#regulatorCostDisplay').text(totalRegulatorCost.toFixed(2));
            $('#totalRegulatorCost').show();
        } else {
            $('#fuelAmount').val(totalCost.toFixed(2));
            $('#totalCostContainer').show();
        }
    }
});
