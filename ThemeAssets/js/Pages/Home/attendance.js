'use strict';
var attendancejs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                attendancejs.handleDatatable();
                attendancejs.handleCircularProgress();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $(".hometable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable(".hometable")) {
                attendancejs.table.clear();
                attendancejs.table.destroy();
            }
            attendancejs.table = $(".hometable");
            attendancejs.table = $(".hometable").DataTable();
        },


        handleCircularProgress: function () {
            $('.datepicker').datepicker({
                format: 'dd/mm/yyyy',
                startDate: '-3d'
            });

            $('.progressAbsence').circleProgress({
                max: 100,
                value: 20,
                textFormat: 'percent'
            });

            $('.progressLateness').circleProgress({
                max: 100,
                value: 40,
                textFormat: 'percent'
            });

            $('.progressPresence').circleProgress({
                max: 100,
                value: 80,
                textFormat: 'percent'
            });
        },

    };

}();

// Call main function init
attendancejs.init();
