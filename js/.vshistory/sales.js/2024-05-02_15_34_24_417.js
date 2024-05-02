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

        // Hide all inputs and containers
        $subDropdownContainer.hide();
        $fuelQuantityInput.hide();
        $waterQuantityInput.hide();
        $couponQuantityInput.hide();
        $waterTotalCostContainer.hide();
        $perGallonCostContainer.hide();
        $totalCouponCostContainer.hide();
        totalRegulatorCost.hide();

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
        }
    });

    // Define functions to populate dropdowns
    function populateFuelOptions($dropdown) {
        var fuelOptions = [
            { id: 'super', text: 'SUPER - Rs 66.20' },
            { id: 'diesel', text: 'DIESEL - Rs 63.95' },
            { id: 'vpower', text: 'VPOWER - Rs 76.90' }
        ];
        populateOptions($dropdown, fuelOptions);
    }

    function populateWaterOptions($dropdown) {
        var waterOptions = [
            { id: 'crystalBigRefill', text: 'WATER CRYSTAL BIG REFILL - Rs 230.00' },
            { id: 'crystalBigCylinder', text: 'WATER CRYSTAL BIG CYLINDER - Rs 200.00' },
            { id: 'vitalBigRefill', text: 'WATER VITAL BIG REFILL - Rs 215.00' },
            { id: 'vitalSmallRefill', text: 'WATER VITAL SMALL REFILL - Rs 150.00' },
            { id: 'crystalMedium', text: 'WATER CRYSTAL MEDIUM - Rs 160.00' },
            { id: 'crystalMediumCylinder', text: 'WATER CRYSTAL MEDIUM CYLINDER - Rs 200.00' },
            { id: 'vitalBigCylinder', text: 'WATER VITAL BIG CYLINDER - Rs 100.00' },
            { id: 'vitalSmallCylinder', text: 'WATER VITAL SMALL CYLINDER - Rs 100.00' }
        ];
        populateOptions($dropdown, waterOptions);
    }

    function populateCouponOptions($dropdown) {
        var couponOptions = [
            { id: 'couponVert', text: 'COUPON PARKING VERT - Rs 100.00' },
            { id: 'couponRouge', text: 'COUPON PARKING ROUGE - Rs 200.00' },
            { id: 'couponMaron', text: 'COUPON PARKING MARON - Rs 100.00' }
        ];
        populateOptions($dropdown, couponOptions);
    }

    function populateOptions($dropdown, options) {
        options.forEach(function (item) {
            $dropdown.append(new Option(item.text, item.id));
        });
        $dropdown.select2();
    }

    // Event listener for total calculation
    $(document).on('change keyup', '#subCategory, #fuelQuantity, #waterQuantity, #couponQuantity', function () {
        updateTotals();
    });

    function updateTotals() {
        var selectedType = $('#subCategory').val();
        var quantity = parseFloat($('#fuelQuantity').val() || $('#waterQuantity').val() || $('#couponQuantity').val()) || parseFloat($('#totalRegulatorQuantity').val());

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
            // Assuming a fixed price for regulators, define it here or fetch it from data
            var regulatorPrice = 150.00;  // Example price per regulator
            var totalRegulatorCost = regulatorPrice * quantity;
            $('#regulatorCostDisplay').text(totalRegulatorCost.toFixed(2));
            $('#totalRegulatorCost').show();
        } else {
            $('#fuelAmount').val(totalCost.toFixed(2));
            $('#totalCostContainer').show();
        }
    }

