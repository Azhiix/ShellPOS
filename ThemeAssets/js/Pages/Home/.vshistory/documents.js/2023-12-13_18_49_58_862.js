'use strict';

window.onload = function () {
    document.getElementById('upload-btn').addEventListener('change', function (event) {
        var files = event.target.files;
        var formData = new FormData();

        for (var i = 0; i < files.length; i++) {
            if (files[i].size > 10971520) { // 10MB
                alert('File size should not exceed 10MB');
                return;
            }
            formData.append("files", files[i]);
        }
        var test = 0;
        jQuery.ajax({
            type: "POST",
            url: "documents.aspx/UploadDocument", //It calls our web method  
            dataType: "JSON",
            contentType: "image/png; charset=utf-8",
            data: files[0],
            cache: false,
            processData: false,
            async: true,
            success: function (response) {
                var test = data;
                return;
                // Handle success
            },
            error: function (xhr, status, error) {
                var test = "fail";
                return;
                // Handle failure
            }
        });
    });
};
