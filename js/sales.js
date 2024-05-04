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
        var gasRefillQuantity = $('#gasRefillQuantityContainer')
        var gasRefillCost = $('#totalGasRefill')
        var gasCylinderInput = $('#gasCylinderQuantityInput')
        var fireExinguisherInput = $('#fireExtinguisherQuantityInput')
        var cordInput = $('#cordContainer')
      

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
        gasCylinderInput.hide();
        fireExinguisherInput.hide();
        cordInput.hide();
        
  



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

        } else if (selectedValues.includes('gasCylinder')) {
            populateGasCylinderOptions($subDropdown);
            $subDropdownContainer.show();
            gasCylinderInput.show();




        } else if (selectedValues.includes('fireExtinguisher')) {
            populateFireExtinguisherOptions($subDropdown);
            $subDropdownContainer.show();
            fireExinguisherInput.show();
        }

        else if (selectedValues.includes('cords')) {
            populateCordOptions($subDropdown);
            $subDropdownContainer.show();
            cordInput.show();
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

    function populateCordOptions($dropdown) {
        var cordOptions = [
            { id: 'cord', text: 'CORD - Rs 100.00' }
        ];
        populateOptions($dropdown, cordOptions);
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

    function populateGasRefillOptions($dropdown) {
        var gasRefillOptions = [
            {
                id: '12KG', text: '12KG - Rs 240.00'
            },
            {
                id: '5KG', text: '5KG - Rs 100.00'
            }
        ]

        populateOptions($dropdown, gasRefillOptions);


    }



    function populateGasCylinderOptions($dropdown) {
        var popGasRefillOptions = [
            { id: '12KG', text: '5KG - Rs 240.00' },
            { id: '5KG', text: '12KG - Rs 100.00' },
            {id: '12kgMetal', text: '12KG METAL - Rs 200.00' },


            
        ];
        populateOptions($dropdown, popGasRefillOptions);





    }


    function populateFireExtinguisherOptions($dropdown) {
        var fireExtinguisherOptions = [
            { id: 'fireExtinguisher', text: 'FIRE EXTINGUISHER - Rs 150.00' }
        ];
        populateOptions($dropdown, fireExtinguisherOptions);
    }

   

    

    function populateOptions($dropdown, options) {
        options.forEach(function (item) {
            $dropdown.append(new Option(item.text, item.id));
        });
        $dropdown.select2();
    }

    // Event listener for total calculation
    $(document).on('change keyup', '#subCategory, #fuelQuantity, #waterQuantity,#cordQuantity, #couponQuantity, #gasCylinderQuantity, #fireExtinguisherQuantity, #gasRefillQuantity', function () {
        updateTotals();
    });


    function updateTotals() {
        var selectedType = $('#subCategory').val();
        var quantity = parseFloat($('#fuelQuantity').val() || $('#waterQuantity').val() || $('#couponQuantity').val()) || ($('#regulatorQuantity').val()) || $('#gasRefillQuantity').val() || $('#gasCylinderQuantity').val() || $('#fireExtinguisherQuantity').val() || $('#cordQuantity').val();
        console.log(quantity)

        if (!quantity || quantity <= 0) {
            $('#totalCostContainer').hide();
            $('#waterTotalCostContainer').hide();
            $('#perGallonCostContainer').hide();
            $('#totalCouponCostContainer').hide();
            $('#totalRegulatorCost').hide();
            $('#totalGasRefillCost').hide();
            $('#totalGasCylinderCost').hide();
            $('#totalExtinguisherContainer').hide();
            $('#totalCordContainer').hide();
            return;
        }


        var price = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
        console.log(price.toFixed(2))
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
            console.log(totalRegulatorCost.toFixed(2))
            $('#totalRegulator').val(totalRegulatorCost.toFixed(2));
            $('#totalRegulatorCost').show();


        }
        else if (selectedType.includes('gasRefill')) {
            var gasRefillPrice = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
            var totalGasRefillCost = gasRefillPrice * quantity;
            $('#totalGasRefill').val(totalGasRefillCost.toFixed(2));
            $('#totalGasRefillCost').show();


        }
        else if (selectedType.includes('gasCylinder')) {
           

            var gasCylinderPrice = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
            var quantity = parseFloat($('#gasCylinderQuantity').val());
            var totalGasCylinderCost = gasCylinderPrice * quantity;
            $('#totalGasCylinder').val(totalGasCylinderCost.toFixed(2));
            $('#totalGasCylinderCost').show();

        } else if (selectedType.includes('fireExtinguisher')) {
            var fireExtinguisherPrice = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
            var quantity = parseFloat($('#fireExtinguisherQuantity').val()); 
           var totalCost = fireExtinguisherPrice * quantity;
            $('#extiniguisherAmount').val(totalCost.toFixed(2))
            $('#totalExtinguisherContainer').show();
        } else if (selectedType.includes('cords')) {
            var cordPrice = parseFloat($('#subCategory option:selected').text().split(" - Rs ")[1]);
            console.log(cordPrice)
            var quantity = parseFloat($('#cordQuantity').val());
            var totalCost = cordPrice * quantity;
            $('#cordAmount').val(totalCost.toFixed(2))
            $('#totalCordContainer').show();




        }



            




     else {
            $('#fuelAmount').val(totalCost.toFixed(2));
            $('#totalCostContainer').show();
        }
    }

    

})


$('#addSelect').click(function () {
    var newSelect = $('.js-example-basic-single:first').clone();
    newSelect.val(""); // Reset selected value
    newSelect.insertAfter('.js-example-basic-single:last').select2();
    // Optionally, you can add a remove button next to each cloned select
});







