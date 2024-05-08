const gridOptions = {
    // Row Data: The data to be displayed.
    rowData: [
        { make: "Tesla", model: "Model Y", price: 64950, electric: true, year: 2022, color: "Red" },
        { make: "Ford", model: "F-Series", price: 33850, electric: false, year: 2021, color: "Blue" },
        { make: "Toyota", model: "Corolla", price: 29600, electric: false, year: 2023, color: "Green" },
        // Adding new rows below
        { make: "Chevrolet", model: "Silverado", price: 49000, electric: false, year: 2022, color: "Black" },
        { make: "Nissan", model: "Leaf", price: 31990, electric: true, year: 2022, color: "White" },
        { make: "BMW", model: "i3", price: 44450, electric: true, year: 2021, color: "Grey" }
    ],
    // Column Definitions: Defines the columns to be displayed.
    columnDefs: [
        { field: "make" },
        { field: "model" },
        { field: "price", headerName: "Price ($)", valueFormatter: params => `$${params.value.toLocaleString()}` },
        { field: "electric", headerName: "Is Electric?", cellRenderer: params => params.value ? 'Yes' : 'No' },
        { field: "year" },
        { field: "color" }
    

    ]
};

function downloadCSV() {
    gridOptions.api.exportDataAsCsv();
}


//const ediv = document.getElementById('myGrid');

//document.addEventListener('DOMContentLoaded', function () {
//    const eGridDiv = document.querySelector('#myGrid');
//    new agGrid.Grid(eGridDiv, gridOptions);

//    flatpickr("#dateFrom", {});
//    flatpickr("#dateTo", {});

//    // This ensures columns fit the grid container on initial load
//    gridOptions.api.sizeColumnsToFit();
//});


//document.addEventListener('DOMContentLoaded', function() {
//  flatpickr("#dateFrom", {});
//  flatpickr("#dateTo", {});
//});
window.addEventListener('resize', function () {
    if (gridOptions.api) { // Check if the API is available
        gridOptions.api.sizeColumnsToFit();
    }
});



document.addEventListener('DOMContentLoaded', function () {
    const eGridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(eGridDiv, gridOptions);

    flatpickr("#dateFrom", {});
    flatpickr("#dateTo", {});

    // This ensures columns fit the grid container on initial load
    gridOptions.api.sizeColumnsToFit();

    window.addEventListener('resize', function () {
        if (gridOptions.api) { // Check if the API is available
            gridOptions.api.sizeColumnsToFit();
        }
    });
});


