'use strict';
//IMPORTANT
//The datepickers are initialized in bootstrap-datepicker.js
var attendancejs = function () {

    var attDonut;

    return {

        init: function () {
            $(document).ready(function () {
                
                attendancejs.handleDatatable();
                attendancejs.handleDonutChart(40,28,12,4);
                $('#nameSearch').select2();
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

        handleDonutChart: function (total,pres,abs,appr) {
            var xValues = ["Total", "Present", "Absent", "Approved Abs"];
            var yValues = [total, pres, abs, appr];
            var barColors = [
              "#626262",
              "#3e6ed5",
              "#e32e2e",
              "#ea851a"
            ];
            if (attDonut) {
                attDonut.destroy();
            }
            attDonut=new Chart("donutatt", {
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

//other standard functions
function searchAtt() {
    if ($(".datestart").val() == '' && $(".dateend").val()) {
        alert("Please select start and end dates");
    }

    //get the search parameters
    var selectedValue = $('.nameSearch').val();
    var startdate = formatDate($(".datestart").val());
    var enddate = formatDate($(".dateend").val());
    var submitButton;
    var jwtToken = getCookie("jwttoken");

    if (enddate >= startdate) {
        
        submitButton = document.querySelector('#searchatt');
        submitButton.setAttribute('data-kt-indicator', 'on');
        submitButton.disabled = true;

        $.ajax({
            url: 'attendance_new.aspx/searchAtt',
            type: 'POST',
            contentType: "application/json; charset=utf-8",
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            data: JSON.stringify({
                id: selectedValue,
                startdate: startdate,
                enddate: enddate
            }),
            success: function (data) {
                // Handle success

                var rowsToAdd = [];

                for (var i = 0; i < data.d.listAtt.length; i++) {
                    var item = data.d.listAtt[i];

                    rowsToAdd.push([item.fullName, item.date, findDayFromDate(item.date), item.time, item.presenceText]);
                }
                //change the Counter values
                $("#idtotalEmpCount").html(data.d.ObjCounter.totalEmpCounter);
                $("#idtotalPresentCount").html(data.d.ObjCounter.totalPresentCount);
                $("#idtotalabsentCount").html(data.d.ObjCounter.totalabsentCount);
                $("#idtotalApprovedAbsCount").html(data.d.ObjCounter.totalApprovedAbsCount);

                //first we empty the datatable
                attendancejs.table.clear().draw();
                //then we refill it
                attendancejs.table.rows.add(rowsToAdd).draw();

                submitButton.removeAttribute('data-kt-indicator');

                //update the donut chart as well
                attendancejs.handleDonutChart(data.d.ObjCounter.totalEmpCounter, data.d.ObjCounter.totalPresentCount, data.d.ObjCounter.totalabsentCount, data.d.ObjCounter.totalApprovedAbsCount);

                // Enable button
                submitButton.disabled = false;
            },
            error: function (error) {
                // Handle error
                console.log(error);
            }
        });
    }

    else alert("End date cannot be before start date");

}
