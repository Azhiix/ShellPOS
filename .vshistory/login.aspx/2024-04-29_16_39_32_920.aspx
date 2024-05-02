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