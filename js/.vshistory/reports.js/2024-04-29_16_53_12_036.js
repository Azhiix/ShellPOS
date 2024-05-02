$(document).ready(function () {
    var table = $('#example').DataTable({
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'excel',
                text: 'Export to Excel',
                title: 'Data_Export',
                className: 'btnExcel'
            }
        ]
    });

    $('#exportButton').on('click', function () {
        $('.btnExcel').click();
    });
});
