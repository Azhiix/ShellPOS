'use strict';
var payslipjs = function () {
    return {

        init: function () {
            $(document).ready(function () {

                $(".yearSelect").datepicker({
                    format: "yyyy",
                    viewMode: "years", 
                    minViewMode: "years"
                });
                payslipjs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#psTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#psTable")) {
                payslipjs.table.clear();
                payslipjs.table.destroy();
            }
            payslipjs.table = $("#psTable").DataTable();

        }

    };

}();

// Call main function init
payslipjs.init();