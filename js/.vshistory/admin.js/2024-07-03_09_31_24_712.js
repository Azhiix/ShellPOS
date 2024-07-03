function determineNumberOfChildrenForThElement(thElementId) {
    const thElement = document.getElementById(thElementId);
    if (thElement) {
        return thElement.childElementCount;
    }
    return 0; 
}




const customSwal = Swal.mixin({
    customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
});
        
$(document).ready(function () {


    $("#minimiseUserDetails").click(function () {
        $(".clsUserDetails").toggle();
    });
    $('#minimizeProductDetails').click(function () {
        $('.products-details').toggle();
    });
    $('#minimiseAddUser').click(function () {
        $('.add-user').toggle();
    });
    $("#minimiseAddClient").click(function () {
        $(".add-client").toggle();

    })

    $('.clsUserDetails').hide();

    $('#minimiseClientDetails').on('click', function () {
        $('.clsUserDetails').toggle();

        // Add User
        $("#submitBtn").on('click', function () {
            var username = $("#username").val();
            var password = $("#password").val();
            var fullName = $('#FullName').val();
            var permissionNames = $('#permissionNames').val();
            var checkboxValue = $('#isAdmin').is(':checked');
            var valid = true;

            // Validate fields
            if (!username) {
                $("#username").addClass("is-invalid");

                valid = false;
            } else {
                $("#username").removeClass("is-invalid");
            }

            if (!password) {
                $("#password").addClass("is-invalid");
                valid = false;
            } else {
                $("#password").removeClass("is-invalid");
            }

            if (!fullName) {
                $("#FullName").addClass("is-invalid");
                valid = false;
            } else {
                $("#FullName").removeClass("is-invalid");
            }

            if (!permissionNames) {
                $("#permissionNames").addClass("is-invalid");
                valid = false;
            } else {
                $("#permissionNames").removeClass("is-invalid");
            }

            if (valid) {
                $.ajax({
                    type: "POST",
                    url: "admin.aspx/validateCreateLogin",
                    contentType: "application/json; charset=utf-8",
                    dataType: "json",
                    data: JSON.stringify({ username: username, password: password, roleid: checkboxValue ? 2 : 1, fname: fullName, permissionNames: permissionNames }),
                    success: function (response) {
                        customSwal.fire({
                            title: 'User Added Successfully',
                            icon: 'success',
                            confirmButtonText: 'OK'
                        });

                        $("#username").val('');
                        $("#password").val('');
                        $('#FullName').val('');
                        $('#permissionNames').val('');
                        $('#isAdmin').prop('checked', false);
                    },
                    error: function (xhr, textStatus, errorThrown) {
                        $("#result").text("Error: " + errorThrown);
                    }
                });
            }
        });

        // View All Users
        $('#userSelect').on('click', function () {
            $.ajax({
                type: "POST",
                url: "admin.aspx/retrieveAllUserInfo",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    console.log(response);
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

        // Populate User Details on Selection
        $('#userSelect').change(function () {
            var selectedOption = $(this).find('option:selected');
            $('#roleId').val(selectedOption.data('roleid'));
            $('#hiddenPermissionNames').val(selectedOption.data('permissions'));
            $('#usernameChange').val(selectedOption.data('username'));
            $('#fname').val(selectedOption.data('fullname'));
            $('#hiddenUserId').val(selectedOption.val());
            $(".clsUserDetails").show();
        });

        // Edit User
        $('#editBtn').click(function () {
            var username = $('#usernameChange').val();
            var password = $('#passwordChange').val();
            var roleId = $('#roleId').val();
            var fname = $('#fname').val();
            var permissionNames = $('#hiddenPermissionNames').val();
            var userId = $('#hiddenUserId').val();

            if (!password) {
                customSwal.fire({
                    title: 'Please enter a new password',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
                return; // Exit the function if password is not entered
            }

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
                //lets first ensure that the user has updated the password


                success: function (response) {
                    customSwal.fire({
                        title: 'User Updated Successfully',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    $('#usernameChange').val('');
                    $('#passwordChange').val('');
                    $('#roleId').val('');
                    $('#fname').val('');
                    $('#hiddenPermissionNames').val('');
                    $('#hiddenUserId').val('');
                    $('#userSelect').trigger('click');
                },
                error: function (xhr, textStatus, errorThrown) {
                    $("#result").text("Error: " + errorThrown);
                }
            });
        });

        // View All Products
        $('.viewAllProductsDropdown').on('click', function (e) {
            e.preventDefault();
            var productSelect = $('#productname');
            productSelect.empty().append('<option selected disabled>Select a Product</option>');  // Reset dropdown

            $.ajax({
                type: "POST",
                url: "admin.aspx/retrieveAllProducts",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    var productDetailsMap = {};  // Map product IDs to their details
                    data.d.forEach(function (product) {
                        productDetailsMap[product.ItemId] = product;  // Store product details in the map
                        productSelect.append($('<option>', {
                            value: product.ItemId,
                            text: product.ItemName
                        }));
                    });
                    productSelect.data('productDetailsMap', productDetailsMap);
                },
                error: function (xhr, textStatus, errorThrown) {
                    $("#result").text("Error: " + errorThrown);
                }
            });
        });

        // Display Product Details on Selection
        $('#productname').change(function () {
            var selectedId = $(this).val();
            var productDetailsMap = $(this).data('productDetailsMap');
            if (selectedId in productDetailsMap) {
                var details = productDetailsMap[selectedId];
                $('#productnameValue').val(details.ItemName);
                $('#unitprice').val(details.UnitPrice);
                $('#hiddenProductId').val(details.ItemId); // Set the hidden input field value
            }
        });

        // Save Product Changes
        $('#updateproductBtn').click(function () {
            var itemId = $('#hiddenProductId').val(); // Use hidden input field value
            var itemName = $('#productnameValue').val();
            var unitPrice = $('#unitprice').val();

            $.ajax({
                type: "POST",
                url: "admin.aspx/updateProducts",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify({
                    itemId: itemId,
                    itemName: itemName,
                    unitPrice: unitPrice
                }),
                success: function (response) {
                    customSwal.fire({
                        title: 'Product Updated Successfully',
                        icon: 'success',
                        confirmButtonText: 'OK'
                    });
                    $('#viewAllProductsDropdown').trigger('click');
                },
                error: function (xhr, textStatus, errorThrown) {
                    $("#result").text("Error: " + errorThrown);
                }
            });
        });

        // Delete Product
        $('#deleteProductBtn').click(function () {
            var productId = $('#productname').val();

            $.ajax({
                type: "POST",
                url: "admin.aspx/deleteProduct",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                data: JSON.stringify({ productId: productId }),
                success: function (response) {

                    alert('Product deleted successfully');
                    $('#viewAllProductsDropdown').trigger('click');
                },
                error: function (xhr, textStatus, errorThrown) {
                    $("#result").text("Error: " + errorThrown);
                }
            });
        });

        $('#clientSubmit').click(function () {
            var clientName = $('#clientName').val();
            var address = $('#clientAddress').val();
            var contactInfo = $('#clientContact').val();
            var brnNo = $('#BrnNo').val(); // Correct the variable name to match the input ID

            if (!clientName) {
                $('#clientName').addClass('is-invalid');
                return;
            } else {
                $('#clientName').removeClass('is-invalid');
            }

            if (!address) {
                $('#clientAddress').addClass('is-invalid');
                return;


            } else {
                $('#clientAddress').removeClass('is-invalid');
            }
            if (!contactInfo) {
                $('#clientContact').addClass('is-invalid');
                return;

            } else {
                $('#clientContact').removeClass('is-invalid');
            }


            $.ajax({
                type: "POST",
                url: "admin.aspx/createClient",
                contentType: 'application/json; charset=utf-8',
                dataType: 'json',
                data: JSON.stringify({
                    name: clientName,
                    address: address,
                    contactInfo: contactInfo,
                    brn: brnNo
                }),
                success: function (response) {
                    console.log('Client created successfully:', response.d);
                    // Clear the input fields
                    $('#clientName').val('');
                    $('#clientAddress').val('');
                    $('#clientContact').val('');
                    $('#BrnNo').val('');
                },
                error: function (xhr, status, error) {
                    console.error('Error creating client:', error);
                }
            });
        });



        $('#editClientBtn').click(function () {
            alert('The button has been clicked successfully');
            $.ajax({
                type: "POST",
                url: "admin.aspx/ShowClients",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (response) {
                    var clients = response.d; // response.d is the default behavior of ASP.NET WebMethods
                    console.log(clients);
                },
                error: function (xhr, status, error) {
                    console.error('AJAX Error: ', status, error);
                }
            });
        });



    })

});

document.addEventListener('DOMContentLoaded', function () {
    var productDropdown = document.getElementById('viewAllProductsDropdown');

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
            var productDetailsMap = {};  
            data.d.forEach(function (product) {
                productDetailsMap[product.ItemId] = product;  // Store product details in the map
                productSelect.innerHTML += `<option value="${product.ItemId}">${product.ItemName}</option>`;
            });
            productSelect.dataset.productDetailsMap = JSON.stringify(productDetailsMap);
        });
    });

    // Display Product Details on Selection
    document.getElementById('productname').addEventListener('change', function () {
        var selectedId = this.value;
        var productDetailsMap = JSON.parse(this.dataset.productDetailsMap || '{}');
        if (selectedId in productDetailsMap) {
            var details = productDetailsMap[selectedId];
            document.getElementById('productnameValue').value = details.ItemName;
            document.getElementById('unitprice').value = details.UnitPrice;
        }
    });
});



$(document).ready(function () {
    // Fetch clients and populate dropdown on page load
    $.ajax({
        type: "POST",
        url: "admin.aspx/ShowClients",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (response) {
            var clients = response.d; // response.d is typically used in ASP.NET for JSON responses
            var clientSelect = $('#clientSelect');
            clientSelect.empty();
            clientSelect.append('<option disabled selected>Select Client</option>');
            clients.forEach(function (client) {
                clientSelect.append(
                    `<option value="${client.ClientID}" 
                             data-name="${client.Name}" 
                             data-contactinfo="${client.ContactInfo}" 
                             data-address="${client.Address}" 
                             data-brn="${client.BRN}">
                        ${client.Name}
                    </option>`
                );
            });
        },
        error: function (xhr, status, error) {
            console.error('AJAX Error: ', status, error);
        }
    });

    // Handle client selection from dropdown
    $('#clientSelect').change(function () {
        var selectedOption = $(this).find('option:selected');
        $('#clientNameChange').val(selectedOption.data('name'));
        $('#contactInfoChange').val(selectedOption.data('contactinfo'));
        $('#addressChange').val(selectedOption.data('address'));
        $('#BRNChange').val(selectedOption.data('brn'));
    });

    // Handle client update

    $('#editClientBtn').click(function () {

        var clientId = $('#clientSelect').val();
        var name = $('#clientNameChange').val();
        var contactInfo = $('#contactInfoChange').val();
        var address = $('#addressChange').val();
        var brn = $('#BRNChange').val();

        // Validate fields
        if (!name) {
            $('#clientNameChange').addClass('is-invalid');

            return;

        } else {
            $('#clientNameChange').removeClass('is-invalid');



            if (!contactInfo) {
                $('#contactInfoChange').addClass('is-invalid');
                return;


            } else {
                $('#contactInfoChange').removeClass('is-invalid');
            }










    })


});






/*admin.aspx/updateClientInfo*/