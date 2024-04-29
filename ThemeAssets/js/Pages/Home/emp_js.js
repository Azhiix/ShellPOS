'use strict';
var empjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                empjs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#empTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#empTable")) {
                empjs.table.clear();
                empjs.table.destroy();
            }
            empjs.table = $("#empTable");
            empjs.table = $("#empTable").DataTable();
        },

    };

}();

// Call main function init
empjs.init();