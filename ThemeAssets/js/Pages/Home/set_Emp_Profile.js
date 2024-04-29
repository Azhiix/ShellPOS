'use strict';
var empProfilejs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                empProfilejs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#empProfileTB"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#empProfileTB")) {
                empProfilejs.table.clear();
                empProfilejs.table.destroy();
            }
            empProfilejs.table = $("#empProfileTB");
            empProfilejs.table = $("#empProfileTB").DataTable();
        }

    };

}();

// Call main function init
empProfilejs.init();