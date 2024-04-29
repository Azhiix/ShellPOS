'use strict';
var doc_downloadjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                doc_downloadjs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#doc_downTB"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#doc_downTB")) {
                doc_downloadjs.table.clear();
                doc_downloadjs.table.destroy();
            }
            doc_downloadjs.table = $("#doc_downTB");
            doc_downloadjs.table = $("#doc_downTB").DataTable();
        },

    };

}();

// Call main function init
doc_downloadjs.init();