'use strict';

var reportsjs = function () {
    return {

        init: function () {
            $(document).ready(function () {

                $(".yearSelect").datepicker({
                    format: "yyyy",
                    viewMode: "years", 
                    minViewMode: "years"
                });
                reportsjs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#reportTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#reportTable")) {
                reportsjs.table.clear();
                reportsjs.table.destroy();
            }
            reportsjs.table = $("#reportTable").DataTable({
                "dom":
                "<'row'" +
                "<'col-sm-6 d-flex align-items-center justify-conten-start'l>" +
                "<'col-sm-6 d-flex align-items-center justify-content-end'f>" +
                ">" +
              
                "<'table-responsive'tr>" +
              
                "<'row'" +
                "<'col-sm-12 col-md-5 d-flex align-items-center justify-content-center justify-content-md-start'i>" +
                "<'col-sm-12 col-md-7 d-flex align-items-center justify-content-center justify-content-md-end'p>" +
                    ">",
                colResize: true
            });

            // Make table headers resizable
            $("#reportTable th").resizable({
                handles: 'e',
                minWidth: 60,
                // Update column width on resize
                resize: function (event, ui) {
                    var colIndex = ui.helper.index() + 1;
                    table.columns.adjust().draw();
                }
            });

        }

    };

}();

// Call main function init
reportsjs.init();