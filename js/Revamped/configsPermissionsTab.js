var configsPermissionsTab = function () {
    return {

        bindTogglerEvent: function () {
            // Listen for change event on the radio buttons
            $('input[name="accessOptions"]').change(function () {
                // Check if Custom Access is selected
                if ($('#customAccess').is(':checked')) {
                    // Show the table and uncheck all checkboxes inside it
                    $('#tblPermissions').show().find('input[type="checkbox"]').prop('checked', false);
                } else {
                    // Hide the table if other options are selected
                    $('#tblPermissions').hide();
                }
            });


        },

        loadEmployeePermissionSettings: function (msg) {
            var uname = msg.d.employee.uname;
            $("#usernameField").val(uname);
            var permissions = msg.d.permissions;
            var adminIndex = msg.d.employee.iAdminIndex;
            
            switch (adminIndex) {
                case 0:
                    //SUPERADMIN
                    $("#superAdmin").prop("checked", true);
                    $('#tblPermissions').hide();
                    break;
                case 1:
                    //PERSONALACCESS
                    $("#privateAccess").prop("checked", true);
                    $('#tblPermissions').hide();
                    break;
                case 8:
                    //CUSTOMISEDACCESS
                    $("#customAccess").prop("checked", true);
                    $('#tblPermissions').show();
                    configsPermissionsTab.loadAuthorizedPermissions(permissions);
                    break;
                case 9:
                    //NOACCESS
                    $("#noAccess").prop("checked", true);
                    $('#tblPermissions').hide();
                    break;
                default:
                    //if no cases met, it may be that adminIndex is undefined. So the person doesnt have access as he doesnt have a login
                    $("#noAccess").prop("checked", true);
                    $('#tblPermissions').hide();
                    break;

            }
        },

        loadAllPossiblePermissions: function (possiblePerms) {
            // Initially hide the table
            $('#tblPermissions').hide();
            $("#tblPermissions tbody").empty();

            var groupedData = {};
            $.each(possiblePerms, function (index, item) {
                // Extract the main feature ID (e.g., 100, 200) by dividing by 100 and flooring.
                var mainFeatureId = Math.floor(item.permissionIndex / 100) * 100;
                // Initialize main feature object and permissions list if not already done
                if (!groupedData[mainFeatureId]) {
                    groupedData[mainFeatureId] = {
                        mainFeatureCheckbox: $('<input>', {
                            type: 'checkbox',
                            id: 'chk' + mainFeatureId,
                            'data-permissionId': mainFeatureId
                        }),
                        permissionsList: $('<ul>'),
                        mainFeatureDescription: item.permissionDescription
                    };
                }
                // If it's not the main feature itself, create and append the permission item
                if (item.permissionIndex !== mainFeatureId) {

                    if (item.allowsMultipleValues == 1) {
                        var $listItem = $('<li>');
                        var $selectDropdown = $('<select>', {
                            'data-permissionId': item.permissionIndex, // assuming item.permissionIndex is the ID
                            'class': 'form-control'
                        }).append(
                            $('<option>', { value: 0, text: 'Personal Access' }),
                            $('<option>', { value: 1, text: 'Team Access' }),
                            $('<option>', { value: 2, text: 'Full Access' })
                        );
                        $listItem.append(item.permissionDescription + ' ').append($selectDropdown);
                        groupedData[mainFeatureId].permissionsList.append($listItem);
                    }
                    else {
                        var $listItem = $('<li>');
                        var $inputCheckbox = $('<input>', {
                            'data-permissionId': item.permissionIndex,
                            'type': 'checkbox'
                        });
                        // Prepend the checkbox to the list item
                        $listItem.prepend($inputCheckbox).append(' ' + item.permissionDescription);
                        groupedData[mainFeatureId].permissionsList.append($listItem);
                    }

                }
            });

            // Now, append the grouped data to the table
            $.each(groupedData, function (mainFeatureId, featureData) {
                var $row = $('<tr>');
                $row.append($('<td>').append(featureData.mainFeatureCheckbox).append(' ' + featureData.mainFeatureDescription));
                $row.append($('<td>').append(featureData.permissionsList));

                $('#tblPermissions tbody').append($row);
            });
        },

        //this function will loop through each permission and check the checkbox if authorized
        loadAuthorizedPermissions: function (permissions) {
            $.each(permissions, function (index, item) {
                // Determine if it's a checkbox or a dropdown
                var $control = $('#tblPermissions [data-permissionId="' + item.permissionIndex + '"]');

                // Check if the control is a checkbox
                if ($control.is(':checkbox')) {
                    // Set checkbox checked status based on item.authorized
                    $control.prop('checked', item.authorized === 1);
                }
                // Otherwise, if it's a dropdown, set the selected value
                else if ($control.is('select')) {
                    // Set the dropdown to the value of item.authorized
                    $control.val(item.authorized.toString());
                }
            });
        },

        getEmployeePermissions: function () {
            var permissions = [];

            // Iterate over controls in the tblPermissions table
            $('#tblPermissions').find('input[type="checkbox"], select').each(function () {
                var $control = $(this);
                var permissionIndex = $control.data('permissionid');

                // Check if the control is a checkbox
                if ($control.is(':checkbox')) {
                    var authorized = $control.is(':checked') ? 1 : 0;
                    permissions.push({ permissionIndex: permissionIndex, authorized: authorized });
                }
                // Otherwise, if it's a dropdown, get the selected value
                else if ($control.is('select')) {
                    var accessLevel = $control.val(); // will be '0', '1', or '2'
                    permissions.push({ permissionIndex: permissionIndex, authorized: parseInt(accessLevel, 10) });
                }
            });

            return permissions;
        }
    };

}();

