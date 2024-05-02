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
        var regulatorQuantity = $('#totalRegulatorQuantity')
        var totalRegulatorCost = $('#totalRegulatorCost')
        var gasRefillQuantity = $('#gasRefillQuantity')
        var gasRefillCost = $('#totalGasRefill')

        // Hide all inputs and containers
        $subDropdownContainer.hide();
        $fuelQuantityInput.hide();
        $waterQuantityInput.hide();
        $couponQuantityInput.hide();
        $waterTotalCostContainer.hide();
        $perGallonCostContainer.hide();
        $totalCouponCostContainer.hide();
        totalRegulatorCost.hide();
        regulatorQuantity.hide();
        gasRefillQuantity.hide();
        gasRefillCost.hide();

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
            totalRegulatorCost.show();
            regulatorQuantity.show();
        } else if (selectedValues.includes('gasRefill')) {
            populateGasRefillOptions($subDropdown);
            $subDropdownContainer.show();
            gasRefillQuantity.show();
        }
    });

    function updateTotals() {
        var selectedType = $('#subCategory').val();
        var quantity = parseFloat($('#fuelQuantity').val() || $('#waterQuantity').val() || $('#couponQuantity').val() || $('#regulatorQuantity').val() || $('#gasRefillQuantity').val());

        if (!quantity || quantity <= 0) {
            $('#totalCostContainer').hide();
            $('#waterTotalCostContainer').hide();
            $('#perGallonCostContainer').hide();
            $('#totalCouponCostContainer').hide();
            $('#totalRegulatorCost').hide();
            $('#totalGasRefillCost').hide();
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
        } else if (selectedType.includes('regulator')) {
            var regulatorPrice = 200.00;
            var totalRegulatorCost = regulatorPrice * quantity;
            $('#totalRegulator').val(totalRegulatorCost.toFixed(2));
            $('#totalRegulatorCost').show();
        } else if (selectedType.includes('gasRefill')) {
            var gasRefillPrice = price;  // Assuming price parsed from dropdown is correct
            var totalGasRefillCost = gasRefillPrice * quantity;
            $('#totalGasRefill').val(totalGasRefillCost.toFixed(2));
            $('#totalGasRefillCost').show();
        } else {
            $('#fuelAmount').val(totalCost.toFixed(2));
            $('#totalCostContainer').show();
        }
    }
});
