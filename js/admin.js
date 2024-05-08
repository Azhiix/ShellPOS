$(document).ready(function () {
    $("#submitBtn").click(function () {
        var username = $("#username").val();
        var password = $("#password").val();
        console.log(username,password)
        $.ajax({
            type: "POST",
            url: "Admin.aspx/validateCreateLogin", 
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ username: username, password: password }),
            success: function (response) {
                console.log(response)
                $("#result").text(response.d);
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });
});