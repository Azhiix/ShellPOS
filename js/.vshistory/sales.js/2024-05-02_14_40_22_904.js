$(document).ready(function () {
    $('.js-example-basic-single').select2();

    $('#mainDropdown .js-example-basic-single').on('change', function () {
        var selectedValues = $(this).val();
        var $subDropdown = $('#subCategory');
        var $subDropdownContainer = $('#subDropdown');
        var $fuelQuantityInput = $('#fuelQuantityInput');
        var $waterQuantityInput = $('#waterQuantityInput');
        var $gasQuantityInput = $('#gasQuantityInput'); // Assuming you have a similar input for gas
        var $waterTotalCostContainer = $('#waterTotalCostContainer');
        var $perGallonCostContainer = $('#perGallonCostContainer');
        var addNewItem = $('.add-item')

        $subDropdownContainer.hide();
        $fuelQuantityInput.hide();
        $waterQuantityInput.hide();
        $gasQuantityInput.hide();
        $waterTotalCostContainer.hide();
        $perGallonCostContainer.hide();

        $subDropdown.empty();

        if (selectedValues.includes('fuel')) {
            populateFuelOptions($subDropdown);
            $subDropdownContainer.show();
            $fuelQuantityInput.show();
        } else if (selectedValues.includes('water')) {
            populateWaterOptions($subDropdown);
            $subDropdownContainer.show();
            $waterQuantityInput.show();
        } else if (selectedValues.includes('gas')) { // Handle gas selection
            populateGasOptions($subDropdown);
            $subDropdownContainer.show();
            $gasQuantityInput.show(); // Show gas quantity input
        }
    });


    function populateFuelOptions($dropdown) {
        var fuelOptions = [
            { id: 'super', text: 'SUPER - Rs 66.20' },
            { id: 'diesel', text: 'DIESEL - Rs 63.95' },
            { id: 'vpower', text: 'VPOWER - Rs 76.90' }
        ];
        fuelOptions.forEach(function (item) {
            $dropdown.append(new Option(item.text, item.id));
        });
        $dropdown.select2();
    }

    function populateParkingCoupons($dropdown) {

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
            waterOptions.forEach(function (item) {
                $dropdown.append(new Option(item.text, item.id));
            });
            $dropdown.select2();
        }

        function populateGasOptions($dropdown) {
            var gasOptions = [
                { id: 'couponVert', text: 'COUPON PARKING VERT - Rs 100.00' },
                { id: 'couponRouge', text: 'COUPON PARKING ROUGE - Rs 200.00' },
                { id: 'couponMaron', text: 'COUPON PARKING MARON - Rs 100.00' }
            ];
            gasOptions.forEach(function (item) {
                $dropdown.append(new Option(item.text, item.id));
            });
            $dropdown.select2();
        }

        $(document).on('change keyup', '#subCategory, #fuelQuantity, #waterQuantity', function () {
            updateTotals();
        });

        function updateTotals() {
            var selectedType = $('#subCategory').val();
            var quantity = parseFloat($('#fuelQuantity').val() || $('#waterQuantity').val());

            // Early exit if invalid quantity
            if (!quantity || quantity <= 0) {
                $('#totalCostContainer').hide();
                $('#waterTotalCostContainer').hide();
                $('#perGallonCostContainer').hide();
                return;
            }

            var price = 0;
            switch (selectedType) {
                case 'super': price = 66.20; break;
                case 'diesel': price = 63.95; break;
                case 'vpower': price = 76.90; break;
                case 'crystalBigRefill':
                case 'crystalBigCylinder':
                case 'vitalBigRefill':
                case 'vitalSmallRefill':
                case 'crystalMedium':
                case 'crystalMediumCylinder':
                case 'vitalBigCylinder':
                case 'vitalSmallCylinder':
                    price = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
                    break;
                case 'couponVert': price = 100.00; break;
                case 'couponRouge': price = 200.00; break;
                case 'couponMaron': price = 100.00; break;

            }

            var totalCost = price * quantity;

            if (['crystalBigRefill', 'crystalBigCylinder', 'vitalBigRefill', 'vitalSmallRefill', 'crystalMedium', 'crystalMediumCylinder', 'vitalBigCylinder', 'vitalSmallCylinder'].includes(selectedType)) {
                $('#waterTotalAmount').val(totalCost.toFixed(2));
                $('#perGallonPrice').val(price.toFixed(2));
                $('#waterTotalCostContainer').show();
                $('#perGallonCostContainer').show();
            } else {
                $('#fuelAmount').val(totalCost.toFixed(2));
                $('#totalCostContainer').show();
            }
        }

        addNewItem.on('click', function () {
            var selectedType = $('#subCategory').val();
            var quantity = parseFloat($('#fuelQuantity').val() || $('#waterQuantity').val());

            // Early exit if invalid quantity
            if (!quantity || quantity <= 0) {
                $('#totalCostContainer').hide();
                $('#waterTotalCostContainer').hide();
                $('#perGallonCostContainer').hide();
                return;
            }

            var price = 0;
            switch (selectedType) {
                case 'super': price = 66.20; break;
                case 'diesel': price = 63.95; break;
                case 'vpower': price = 76.90; break;
                case 'crystalBigRefill':
                case 'crystalBigCylinder':
                case 'vitalBigRefill':
                case 'vitalSmallRefill':
                case 'crystalMedium':
                case 'crystalMediumCylinder':
                case 'vitalBigCylinder':
                case 'vitalSmallCylinder':
                    price = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
                    break;
                case 'couponVert': price = 100.00; break;
                case 'couponRouge': price = 200.00; break;
                case 'couponMaron': price = 100.00; break;

            }

            var totalCost = price * quantity;

            if (['crystalBigRefill', 'crystalBigCylinder', 'vitalBigRefill', 'vitalSmallRefill', 'crystalMedium', 'crystalMediumCylinder', 'vitalBigCylinder', 'vitalSmallCylinder'].includes(selectedType)) {
                $('#waterTotalAmount').val(totalCost.toFixed(2));
                $('#perGallonPrice').val(price.toFixed(2));
                $('#waterTotalCostContainer').show();
                $('#perGallonCostContainer').show();
            } else {
                $('#fuelAmount').val(totalCost.toFixed(2));
                $('#totalCostContainer').show();
            }
        })


    }
});




  
        












