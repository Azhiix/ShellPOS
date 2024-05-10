$(document).ready(function () {
    $("#submitBtn").click(function () {
        var username = $("#username").val();
        var password = $("#password").val();
        //<input type="checkbox" id="isAdmin" name="admin" value="Yes" >
        //    <label for="isAdmin">Is an Admin</label><br>
        var checkboxValue = $('#isAdmin').is(':checked');
         const roleid = checkboxValue ? "2": "1";
      
        
        $.ajax({
            type: "POST",
            url: "admin.aspx/validateCreateLogin", 
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ username: username, password: password, roleid  }),
            success: function (response) {
                console.log(response)
                alert('Successfully created user');
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });



    $('.view-users').on('click', function () {
        $.ajax({
            type: "POST",
            url: "admin.aspx/displayAllUsers",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                var select = $('#clientSelect');
                select.empty(); // Clear previous options

                // Add a default option as the first entry
                select.append($('<option>').text('Client').attr({
                    value: "disabled selected",
                    disabled: true,
                    selected: true
                }));

                // Split the response string into an array of names
                var names = response.d.split(',');

                // Remove empty entries if any
                names = names.filter(function (name) {
                    return name.trim() !== '';
                });

                // Populate dropdown with names from the server
                $.each(names, function (index, name) {
                    select.append($('<option>').text(name).val(name));
                });

                // To make the select element visible
                select.closest('.mt-4').show();
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });
});