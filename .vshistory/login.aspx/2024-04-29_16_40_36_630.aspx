<%@ Page Title="Title" Language="C#"  CodeBehind="login.aspx.cs" Inherits="SezwanPayroll.login" %>

<h1> hello there .Test</h1>


<script>


    $.AJAX({
        type: "POST",
        url: "login.aspx/testDBConnection",
        data: "{}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            alert(response.d);
        },
        failure: function (response) {
            alert(response.d);
        }
    });
</script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.js" integrity="sha512-+k1pnlgt4F1H8L7t3z95o3/KO+o78INEcXTbnoJQ/F2VqDVhWoaiVml/OEHv9HsVgxUaVW+IbiZPUJQfF/YxZw==" crossorigin="anonymous" referrerpolicy="no-referrer"></script>