'use strict';
var emp_land_setjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                emp_land_setjs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#setEmpLandTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#setEmpLandTable")) {
                emp_land_setjs.table.clear();
                emp_land_setjs.table.destroy();
            }
            emp_land_setjs.table = $("#setEmpLandTable");
            emp_land_setjs.table = $("#setEmpLandTable").DataTable();
        },

    };

}();

// Call main function init
emp_land_setjs.init();