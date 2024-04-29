'use strict';
var attendancejs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                attendancejs.handleDatatable();
                attendancejs.handleDonutChart();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $("#attendanceTable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable("#attendanceTable")) {
                attendancejs.table.clear();
                attendancejs.table.destroy();
            }
            attendancejs.table = $("#attendanceTable");
            attendancejs.table = $("#attendanceTable").DataTable();
        },

        handleDonutChart: function () {
            var xValues = ["Total", "Present", "Late", "Abs"];
            var yValues = [40, 28, 12, 4];
            var barColors = [
              "#626262",
              "#3e6ed5",
              "#e32e2e",
              "#ea851a"
            ];
            new Chart("donutatt", {
                type: "doughnut",
                data: {
                  labels: xValues,
                  datasets: [{
                    backgroundColor: barColors,
                    data: yValues
                  }]
                },
                options: {
                  title: {
                    display: false,
                    text: ""
                  },
                    legend: {
                      display: false
                  }
                }
              });
        },

    };

}();

// Call main function init
attendancejs.init();