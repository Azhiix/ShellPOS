const bounds = Object.freeze({
    minBound: 0,
    maxBound: 999999999
    // ... add other absence types as needed
});

//Functions to keep below:
var configsTaxes = (function () {
    return {

        handleTaxes: function () {

            $('#createTaxType').on('click', function () {
                // Clean all inputs and remove clones
                emptyTaxesDetailsInputs();

                var taxNameDropdownForm = $('#taxNameDropdownForm');
                var taxNameForm = $('#taxNameForm');

                // Check if the taxNameForm is currently displayed
                if (taxNameForm.css('display') === 'block') {
                    // If so, hide taxNameForm and show taxNameDropdownForm
                    taxNameForm.css('display', 'none');
                    taxNameDropdownForm.css('display', 'block');
                    this.textContent = "Create new tax type"; // Updating button text
                } else {
                    // If not, hide taxNameDropdownForm and show taxNameForm
                    taxNameDropdownForm.css('display', 'none');
                    taxNameForm.css('display', 'block');
                    this.textContent = "View existing tax types"; // Updating button text
                }
            });

            $('#taxNameDropdown').on('change', function () {
                emptyTaxesDetailsInputs();
                var selectedId = $(this).val();

                jQuery.ajax({
                    type: "POST",
                    url: "configs.aspx/getTaxRates", //It calls our web method  
                    data: JSON.stringify({ taxTypeId: selectedId }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "JSON",
                    success: function (msg) {

                        var taxRates = msg.d;
                        if (taxRates && taxRates.length > 0) {
                            taxRates.forEach(function (taxRate, index) {
                                // Clone the template before populating it but skip cloning for the first item
                                if (index > 0) {
                                    cloneTemplate();
                                }
                                // Populate the fields of the last template (which is the one we just cloned or the first one on the first iteration)
                                populateTaxRateFields(taxRate, $('.clsTaxTemplate').length - 1);
                            });
                        }
                    },
                    failure: function (msg) {
                        displayErrorMessage(msg, true);
                    },
                    error: function (xhr) {
                        displayErrorMessage("get tax rates failed: " + xhr.responseText, true);
                    }
                });
            });

            document.getElementById('saveTaxType').addEventListener('click', async () => {

                const url = $('#createTaxType').text() === 'View existing tax types' ? 'configs.aspx/postTaxesDetails' : 'configs.aspx/UpdateTaxesDetails';
                var taxTypes = $('#createTaxType').text() === 'View existing tax types' ? gatherTaxType() : gatherTaxTypeFromDropdown();
                var taxRatesList = gatherTaxRates();
                try {
                    startLoadingAnimation();

                    const response = await fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json; charset=utf-8',
                            'Authorization': `Bearer ${getCookie("jwttoken")}`, // Include JWT if needed
                        },
                        body: JSON.stringify({
                            taxTypes: taxTypes,
                            taxRatesList: taxRatesList
                        }),
                    });
                    if (!response.ok) {
                        const errorText = await response.text(); // Get plain text response (safer than assuming JSON)
                        const errorMessage = response.statusText + ((errorText && errorText.length > 0) ? `: ${errorText}` : "");
                        throw new Error(`HTTP error ${response.status}: ${errorMessage}`);
                    }
                    const result = await response.json();

                    // Check if the result is as expected for success
                    if (result.d==1) { // Adjust this condition based on how your API indicates success
                        displaySuccessMessage("Successfully saved tax details");
                    } 

                } catch (error) {
                    displayErrorMessage("Tax operation failed: " + error.message);
                } finally {
                    stopLoadingAnimation();
                }
            });

            $('.hasBounds').on('change', function () {
                var $boundsInput = $(this).closest('.center-container').find('.lowerBound, .upperBound');
                $boundsInput.prop('disabled', !$(this).is(':checked')).val('');
            });

            $('.paidEmployee').on('change', function () {
                var $employeeRateInput = $(this).closest('.clsTaxTemplate').find('.taxRateEmployee');
                $employeeRateInput.prop('disabled', !$(this).is(':checked')).val('');
            });

            $('.paidEmployer').on('change', function () {
                var $employerRateInput = $(this).closest('.clsTaxTemplate').find('.taxRateEmployer');
                $employerRateInput.prop('disabled', !$(this).is(':checked')).val('');
            });
            
            $('.hasSalaryCap').on('change', function () {
                // Find the nearest '.salaryCap' textbox relative to the checkbox
                var $salaryCapInput = $(this).closest('.form-check').next().find('.salaryCap');

                if ($(this).is(':checked')) {
                    // If the checkbox is checked, enable the salary cap input
                    $salaryCapInput.prop('disabled', false);
                } else {
                    // If the checkbox is not checked, disable the salary cap input and reset its value
                    $salaryCapInput.prop('disabled', true).val('');
                }
            });

        },

        loadTaxesDetails: function () {
            $(".settingsBtns").css("display", "none");
            $(".taxesDetails").css("display", "block");
            $('#taxesDetailsContainer').css("display", "block");


            var jwtToken = getCookie("jwttoken");

            //the first Ajax is to retrieve the employee datas
            jQuery.ajax({
                type: "POST",
                url: "configs.aspx/getTaxTypes", //It calls our web method  
                data: '{}',
                headers: {
                    'Authorization': 'Bearer ' + jwtToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                success: function (lstTaxTypes) {
                    if (lstTaxTypes.d == null)
                        displayWarningMessage("No tax types found");
                    else {
                        // Handle the response data
                        var a = lstTaxTypes.d;
                        //initSelect2Emp(lstEmp);
                        initSelect2TaxTypes(a);
                    }
                },
                error: function (xhr, status, error) {
                    console.log(error);
                    console.log(status);
                }
            });
        }
    }
})();

function cloneTemplate() {
    var templateToClone = $(".clsTaxTemplate").clone().prop('outerHTML');
    $(".clonedTemplates").append(templateToClone);
    configsTaxes.handleTaxes();
}

function populateTaxRateFields(taxRate, index) {
    // Helper function to set input value and disabled state
    const setValueAndDisable = ($element, value, disable) => {
        if ($element.length === 0) return;

        if ($element.is(':checkbox')) {
            $element.prop('checked', value);
        } else {
            if (disable == true) {
                $element.val(value);
                $element.prop('disabled', false);
            }
            else {
                $element.val('');
                $element.prop('disabled', true);
            }
        }
    };

    // Find the target template using the index
    const $template = $(".clsTaxTemplate").eq(index);

    setValueAndDisable($template.find('.taxRateId'), taxRate.taxRateID, true);
    setValueAndDisable($template.find('.hasSalaryCap'), taxRate.salaryCap !== bounds.maxBound);
    setValueAndDisable($template.find('.salaryCap'), taxRate.salaryCap, taxRate.salaryCap !== bounds.maxBound);

    const hasBounds = taxRate.upperBound !== bounds.maxBound || taxRate.lowerBound !== bounds.minBound;
    setValueAndDisable($template.find('.hasBounds'), hasBounds);
    setValueAndDisable($template.find('.lowerBound'), taxRate.lowerBound, hasBounds);
    setValueAndDisable($template.find('.upperBound'), taxRate.upperBound, hasBounds);

    setValueAndDisable($template.find('.paidEmployee'), taxRate.taxRateEmployee !== bounds.minBound);
    setValueAndDisable($template.find('.taxRateEmployee'), taxRate.taxRateEmployee, taxRate.taxRateEmployee !== bounds.minBound);

    setValueAndDisable($template.find('.paidEmployer'), taxRate.taxRateEmployer !== bounds.minBound);
    setValueAndDisable($template.find('.taxRateEmployer'), taxRate.taxRateEmployer, taxRate.taxRateEmployer !== bounds.minBound);
}

function initSelect2TaxTypes(lstTaxTypes) {
    var select = $('#taxNameDropdown');
    // Clear existing options, keeping the placeholder if necessary
    select.empty(); // Keep this line if you want to retain the placeholder

    var option = new Option("Select an option", "", false, false);
    // Append new options
    select.append(option);
    // Loop through each item in the returned data
    $.each(lstTaxTypes, function (index, item) {
        var option = new Option(item.taxName, item.taxTypeID);
        // Append new options
        select.append(option);
    });

    // Refresh the Select2 widget
    select.select2();
}

function emptyTaxesDetailsInputs() {

    //First we empty the cloned templates
    $(".clonedTemplates").empty();

    //Now we empty the tax rates in the default(first template)
    //First we empty all checkboxes
    $('.paidEmployee').prop('checked', false);
    $('.paidByEmployer').prop('checked', false);
    $('.hasBounds').prop('checked', false);
    $('.hasSalaryCap').prop('checked', false);

    //Now we empty all input fields(textboxes)
    $('.taxRateEmployee').val('');
    $('.taxRateEmployer').val('');
    $('.lowerBound').val('');
    $('.upperBound').val('');
    $('.salaryCap').val('');
    $('.taxRateId').val('');
}

function gatherTaxType() {
    return {
        taxName: $('#taxName').val(),
    };
}

function gatherTaxTypeFromDropdown() {
    // Use jQuery to select the dropdown
    const $dropdown = $('#taxNameDropdown');

    return {
        taxName: $dropdown.find('option:selected').text(),
        taxTypeId: $dropdown.val()
    };
}

function gatherTaxRates() {
    const taxRates = [];
    // Get all elements with the class 'clsTaxTemplate'
    var taxRateEmployeeElements = $(".clsTaxTemplate");

    // Loop through all elements with the 'clsTaxTemplate' class using jQuery's .each() method
    taxRateEmployeeElements.each(function (index) {
        var $element = $(this);

        taxRates.push({
            lowerBound: $element.find('.lowerBound').val().trim() === "" ? 0 : parseFloat($element.find('.lowerBound').val()),
            upperBound: $element.find('.upperBound').val().trim() === "" ? 999999999 : parseFloat($element.find('.upperBound').val()),
            taxRateEmployee: $element.find('.taxRateEmployee').val().trim() === "" ? 0 : parseFloat($element.find('.taxRateEmployee').val()),
            taxRateEmployer: $element.find('.taxRateEmployer').val().trim() === "" ? 0 : parseFloat($element.find('.taxRateEmployer').val()),
            salaryCap: $element.find('.salaryCap').val().trim() === "" ? 999999999 : parseFloat($element.find('.salaryCap').val()),
            taxRateId: $element.find('.taxRateId').val()
        });
    });

    return taxRates;
}
