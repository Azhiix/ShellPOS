'use strict';
var homejs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                homejs.handleDatatable();
            });
        },

        //POPULATE THE MAIN DATATABLE
        table: $(".hometable"),
        handleDatatable: function () {
            if ($.fn.dataTable.isDataTable(".hometable")) {
                homejs.table.clear();
                homejs.table.destroy();
            }
            homejs.table = $(".hometable");
            homejs.table = $(".hometable").DataTable();
            //homejs.table = $(".hometable").DataTable({
            //    "processing": true, // for show progress bar  
            //    "searching": true, "paging": true, "info": true,
            //    "serverSide": true, // for process server side  
            //    "filter": true, // this is for disable filter (search box)  
            //    "orderMulti": false, // for disable multiple column at once  
            //   // "scrollY": "50vh",
            //    //buttons: [
            //    //    'copy', 'excel', 'pdf'
            //    //],
            //    "ajax": {
            //        "url": "/Produit/getProduits",
            //        "type": "POST",
            //        "datatype": "json"
            //    },
            //    "rowId": "id",
            //    //"data": [],
            //    //"columnDefs":
            //    //    [{
            //    //        "targets": [0],
            //    //        "visible": true,
            //    //        "searchable": true
            //    //    }],
            //    "columns": [
            //        //{
            //        //    "data": null,
            //        //    "render": function (data, type, full, meta) {
            //        //        return '<td class="pd-l-20">1</td>';
            //        //    }
            //        //},
            //        { "data": "id", "autoWidth": true },
            //        { "data": "description", "autoWidth": true },
            //        { "data": "type", "autoWidth": true },
            //        {
            //            "data": null,
            //            "render": function (data, type, full, meta) {
            //                return '<div class="row"> <a href="#" class="tx-inverse tx-14 tx-medium d-block edit_tap" data-uid=' + data.id + '><i class="fas fa-edit edit_tap" data-uid=' + data.id +'></i></a>' +
            //                    ' <a href="#" class="tx-inverse tx-14 tx-medium d-block del_tap" data-uid=' + data.id +'><i class="fas fa-trash del_tap" data-uid=' + data.id +'></i></a></div>';
            //            }
            //        },

            //        //  { "data": "registeredDate", "autoWidth": true },

            //    ]
            //});
        },
       

    };

}();

// Call main function init
homejs.init();