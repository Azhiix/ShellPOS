$(document).ready(function () {

    $("#submitBtn").on('click', function () {

        var username = $("#username").val();
        var password = $("#password").val();
        var checkboxValue = $('#isAdmin').is(':checked');
        var roleid = $('#roleSelect').val();
        var valid = true;

        //if (username.length === 0) {
        //    $('#username').addClass('is-invalid');
        //    valid = false;
        //} else {
        //    $('#username').removeClass('is-invalid');
        //}

        //if (password.length === 0) {
        //    $('#password').addClass('is-invalid');
        //    valid = false;
        //} else {
        //    $('#password').removeClass('is-invalid');
        //}


        $.ajax({
            type: "POST",
            url: "admin.aspx/validateCreateLogin",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({ username: username, password: password, roleid: 1 }),
            success: function (response) {
                alert('Successfully created user');
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
     
    });

    $('.view-users').on('click', function () {
        $('#userSelect').show();

        $.ajax({
            type: "POST",
            url: "admin.aspx/retrieveAllUserInfo",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (response) {
                var users = response.d;
                var select = $('#userSelect');
                select.empty();
                select.append($('<option>', { value: '', text: 'Select User', selected: true, disabled: true }));
                users.forEach(function (user) {
                    select.append($('<option>', {
                        value: user.UserId,
                        text: user.Fname,
                        'data-roleid': user.RoleId,
                        'data-permissions': user.PermissionNames,
                        'data-fullname': user.Fname,
                        'data-username': user.Username
                    }));
                });
                select.closest('.form-group').show();
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });

    $('#userSelect').change(function () {
        var selectedOption = $(this).find('option:selected');
        $('#roleId').val(selectedOption.data('roleid'));
        $('#hiddenPermissionNames').val(selectedOption.data('permissions'));
        $('#usernameChange').val(selectedOption.data('username'));
        $('#fname').val(selectedOption.data('fullname'));
        $(".clsUserDetails").show();
    });

    $('#editBtn').click(function () {
        var username = $('#usernameChange').val();
        var password = $('#passwordChange').val();
        var roleId = $('#roleId').val();
        var fname = $('#fname').val();
        var permissionNames = $('#hiddenPermissionNames').val();
        var userId = $("#userSelect").find('option:selected').val();

        $.ajax({
            type: "POST",
            url: "admin.aspx/updateUser",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data: JSON.stringify({
                userId: userId,
                username: username,
                password: password,
                RoleId: roleId,
                PermissionNames: permissionNames,
                fname: fname
            }),
            success: function (response) {
                alert('User updated successfully');
            },
            error: function (xhr, textStatus, errorThrown) {
                $("#result").text("Error: " + errorThrown);
            }
        });
    });








})


document.addEventListener('DOMContentLoaded', function () {
    var productDropdown = document.getElementById('viewAllProductsDropdown');
    var productDetailsMap = {};  // This will map product IDs to their details

    productDropdown.addEventListener('click', function (e) {
        e.preventDefault();
        var productSelect = document.querySelector('#productname');
        productSelect.innerHTML = '<option selected disabled>Select a Product</option>';  // Reset dropdown

        fetch('admin.aspx/retrieveAllProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        }).then(response => response.json())
          .then(data => {
            console.log(data);
            data.d.forEach(function (product) {
                productDetailsMap[product.ItemId] = product;  // Store product details in the map
                productSelect.innerHTML += `<option value="${product.ItemId}">${product.ItemName}</option>`;
            });
        });
    });

    // Adding event listener for change on product select to display details
    document.getElementById('productname').addEventListener('change', function () {
        var selectedId = this.value;
        if (selectedId in productDetailsMap) {
            var details = productDetailsMap[selectedId];
            document.getElementById('productnameValue').value = details.ItemName;
            document.getElementById('unitprice').value = details.UnitPrice;
            document.getElementById('prodTypeName').value = details.ProdTypeName || 'N/A';  
        }
    });
});
