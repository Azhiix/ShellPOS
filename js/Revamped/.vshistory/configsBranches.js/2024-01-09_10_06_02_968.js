var configsBranches = function () {
    return {
        select2handler: function () {
            $('#branchSelect').select2({
                placeholder: "Select a branch...",
                allowClear: true
            });

            // Handle Select2 change event
            $('#branchSelect').on('change', function () {
                var branchId = $(this).val();

                // Show the custom table container if a branch is selected
                if (branchId) {
                    // Load the branch details into the container.
                    // This is where you would insert your AJAX call or similar to get the branch data.
                    // For this example, we're just showing the container.
                    $('#branchDetailsContainer').show();
                } else {
                    $('#branchDetailsContainer').hide();
                }
            });
        }
    }
}