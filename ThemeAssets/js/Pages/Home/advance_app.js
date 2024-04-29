'use strict';
var advancesjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                advancesjs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#advanceTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#advanceTable")) {
                advancesjs.table.clear();
                advancesjs.table.destroy();
            }
            advancesjs.table = $("#advanceTable");
            advancesjs.table = $("#advanceTable").DataTable();
        }

    };

}();

// Call main function init
advancesjs.init();