
/*
ENUMERATING THE DEFAULT ABSENCE VALUES THAT WILL APPLY TO ALL COMPANIES BELOW:
CANNOT BE MODIFIED ANYWHERE EXCEPT HERE BECAUSE THE OBJECT HAS BEEN FROZEN TO SIMULATE C#'S ENUMERATION FUNCTION

Note for later: We need to add a pop up informing the users of payroll that whenever an absence is approved for a day, 
neither the lateness nor the overtime will be calculated for that particular day
*/
const AbsenceTypes = Object.freeze({
    IDPRESENT: '-1',
    IDSICKLEAVE: '1',
    IDHALFSICKLEAVE: '2',
    IDLOCALLEAVE: '3',
    IDHALFLOCALLEAVE: '4',
    IDPUBLICHOLIDAY: '5',
    IDFREEHOLIDAY: '6',
    IDHALFLEAVEWITHOUTPAY: '7',
    IDLEAVEWITHOUTPAY: '8'
    // ... add other absence types as needed
});

class finalizedDetails {

    //static variables so that i dont need to instantiate an object of this class before using these variables
    static workingDays = 0;
    static presentDays = 0;
    static localLeaves = 0;
    static sickLeaves = 0;
    static overtimeDurationHours = 0;
    static totalLateness = 0;
    static totalNetAdjust = 0;
    static holidayExtraPayHours = 0;
    static leavesWithoutPay = 0;
    static freeHolidays = 0;
    static mealAllowanceAmount = 0;
    static exceptionalOvertimeHours = 0;
}

$(document).ready(function () {
    findCompanyDefaults();
    $(".punch-table").hide();
    initSelect2Emp();
    readFirstUnlockedPeriod();
    EventsFunctions.bindPreviousNextButtonEvents();

});

function initializeGoogleMap(idPrimaryKey) {
    var mapContainerSelector = '#mapContainer' + idPrimaryKey;
    var mapContainer = $(mapContainerSelector);

    // Retrieve the data attributes
    var latitude = parseFloat(mapContainer.data('latitude'));
    var longitude = parseFloat(mapContainer.data('longitude'));
    var locationName = mapContainer.data('location-name');

    if (mapContainer.length > 0) {
        var mapOptions = {
            zoom: 13,
            center: new google.maps.LatLng(latitude, longitude),
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(mapContainer[0], mapOptions);

        var marker = new google.maps.Marker({
            position: new google.maps.LatLng(latitude, longitude),
            map: map,
            title: locationName // Use the location name for the marker title
        });
    } else {
        console.error('Map container not found:', mapContainerSelector);
    }
}
function exportTableToCSV() {
    var csv = [];
    var rows = document.querySelectorAll("table#timeTable tr");

    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll("td, th");

        for (var j = 0; j < cols.length; j++) {
            // Check if this is the 11th column with a select2 dropdown
            if (j === 10 && cols[j].querySelector('.select2-selection__rendered')) {
                // Get the selected text from the select2 dropdown
                var selectedText = cols[j].querySelector('.select2-selection__rendered').innerText;
                row.push(selectedText);
            } else {
                // Otherwise, use the innerText
                row.push(cols[j].innerText);
            }
        }

        csv.push(row.join(","));
    }

    // Download CSV function not shown here
    downloadCSV(csv.join("\n"));
}

function downloadCSV(csv) {
    var csvFile;
    var downloadLink;
    var filename = `Timesheet ${$("#empNameTimesheet").text()} ${$("#timesheetSearchPeriod").val()}.csv`;

    // CSV file
    csvFile = new Blob([csv], { type: "text/csv" });

    // Download link
    downloadLink = document.createElement("a");

    // File name
    downloadLink.download = filename;

    // Create a link to the file
    downloadLink.href = window.URL.createObjectURL(csvFile);

    // Hide download link
    downloadLink.style.display = "none";

    // Add the link to DOM
    document.body.appendChild(downloadLink);

    // Click download link
    downloadLink.click();
}

const EventsFunctions = {
    bindPreviousNextButtonEvents: function () {
        $(document).on('mouseenter', '.mapIcon', function () {
            var idPrimaryKey = $(this).closest('tr').attr('idPrimaryKey');
            var mapContainerSelector = '#mapContainer' + idPrimaryKey;

            // Make the map container visible
            $(mapContainerSelector).css('height', '300px'); // Set the desired height for the map
            $(mapContainerSelector + ' .closeButton').show(); // Show the close button

            // Initialize the map only if it hasn't been initialized already
            if (!$(mapContainerSelector).hasClass('initialized')) {
                $(mapContainerSelector).addClass('initialized');
                // Call the map initialization function
                initializeGoogleMap(idPrimaryKey);
            }
        });

        // Click event for the close button to hide the map container
        $(document).on('click', '.closeButton', function () {
            var idPrimaryKey = $(this).data('id');
            var mapContainerSelector = '#mapContainer' + idPrimaryKey;
            $(this).hide(); // Hide the close button
            $(mapContainerSelector).css('height', '0').removeClass('initialized'); // Hide and reset the map container
        });
        // Event handler for your Next button (Employee)
        $('#btnNext').on('click', function () {
            var $current = $('.timesheetEmpSelect2').find(':selected');
            var $next = $current.next('option');
            if ($next.length) {
                $('.timesheetEmpSelect2').val($next.val()).trigger('change');
            }
            else {
                displayWarningMessage("You are at the last employee.");
            }

        });

        // Event handler for your Previous button(employee)
        $('#btnPrevious').on('click', function () {
            var $current = $('.timesheetEmpSelect2').find(':selected');
            var $prev = $current.prev('option');

            // Check if the previous option is not the placeholder (assumed to be empty)
            if ($prev.length && $prev.val() !== '') {
                $('.timesheetEmpSelect2').val($prev.val()).trigger('change');
            } else {
                // Alert the user that there is no previous employee option
                displayWarningHtml("You are already at the first employee.");
            }
        });

        // Event handler for your Next button (Month)
        $('#btnNextMonth').on('click', function () {
            var dateObject = BeingCalledByOtherFunctions.selectNextMonth();
            //Now we display the next month and year in the clsFirstUnlockedPeriod
            $(".clsFirstUnlockedPeriod").attr("month", dateObject.month);
            $(".clsFirstUnlockedPeriod").attr("year", dateObject.year);

            $(".clsFirstUnlockedPeriod").val(dateObject.year + "-" + String(1 + dateObject.month).padStart(2, '0'));

            var $current = $('.timesheetEmpSelect2').find(':selected');
            if ($current.val() == '') displayWarningMessage("No Employee has been selected yet");
            else $('.timesheetEmpSelect2').val($current.val()).trigger('change');

        });

        //Event handler for your Previous button (Month)
        $('#btnPreviousMonth').on('click', function () {
            var dateObject = BeingCalledByOtherFunctions.selectPreviousMonth();
            //update the clsFirstUnlockedPeriod with the new month and year
            $(".clsFirstUnlockedPeriod").attr("month", dateObject.month);
            $(".clsFirstUnlockedPeriod").attr("year", dateObject.year);

            $(".clsFirstUnlockedPeriod").val(dateObject.year + "-" + String(1 + dateObject.month).padStart(2, '0'));

            var $current = $('.timesheetEmpSelect2').find(':selected');
            if ($current.val() == '') displayWarningMessage("No Employee has been selected yet");
            else $('.timesheetEmpSelect2').val($current.val()).trigger('change');

        });

        $('#timesheetSearchPeriod').on('change', function () {
            //retrieve the date from it
            var selectedDate = this.value; // gets the full date in 'YYYY-MM' format
            var [year, month] = selectedDate.split('-'); //gets the Year and month from it
            //subtracting 1 from the month since it is not zero indexed
            month = month - 1;

            $('.clsFirstUnlockedPeriod').attr({
                'month': month,
                'year': year
            });

            //Now we check if an employee is selected, then we call the server to find the punches
            var $current = $('.timesheetEmpSelect2').find(':selected');
            if ($current.val() == '') displayWarningMessage("No Employee has been selected yet");
            else $('.timesheetEmpSelect2').val($current.val()).trigger('change');
        });

        //When a user selects an employee from the select2
        $('.timesheetEmpSelect2').on('change', function () {
            //// First, destroy the DataTable instance if it exists
            //if ($.fn.dataTable.isDataTable('#timeTable')) {
            //    $('#timeTable').DataTable().destroy();
            //}

            // Then, clear the table's contents
            $('#timeTable tbody').empty();

            var selectedId = $(this).val();
            // Find the selected option based on the value
            var selectedOption = $(this).find('option[value="' + selectedId + '"]');

            // Retrieve the text (name) and data attributes from the selected option
            var selectedName = selectedOption.text();
            var position = selectedOption.data('position');
            var image = selectedOption.data('image');
            var hireDate = selectedOption.data('hiredate');
            var shiftWrapper = selectedOption.data('shiftWrapper');
            var shiftList = selectedOption.data('shiftList');
            var CLEL = selectedOption.data('CLEL');
            var COAR = selectedOption.data('COAR');
            var COLL = selectedOption.data('COLL');

            $("#empNameTimesheet").html(selectedName);

            $("#empPositionTimesheet").html(position);

            $("#empImageTimesheet").attr("src", 'data:image/jpeg;base64,' + image);

            $(".empDateInf").html(formatDotNetJsonDateInAnotherFormat(hireDate));

            // -------------------------
            // Region Start:The below Section is to load the attendance(Punch Data) of the selected employee from the Database
            // -------------------------

            var jwtToken = getCookie("jwttoken");

            const startDate = localStorage.getItem('startDate');
            const startMonth = localStorage.getItem('startMonth');
            const endDate = localStorage.getItem('endDate');

            var firstUnlockedMonth = $(".clsFirstUnlockedPeriod").attr("month");
            var firstUnlockedYear = $(".clsFirstUnlockedPeriod").attr("year");

            var punchData = [];

            if (startMonth == "Current") {
                //Find how many days are in this month
                //First we convert the month from an integer to a string
                var monthString = convertIntegerMonthToString(firstUnlockedMonth);
                //now We calculate the amount of days in that month
                var daysInMonth = new Date(firstUnlockedYear, firstUnlockedMonth, 0).getDate();
                var startDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth, 1);
                var endDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth, daysInMonth);
            }
            else {
                //we subtract 1 from the month because we are starting our payroll from the previous month
                //No need to worry about having it being a negative value because month is zero indexed....
                //so if it becomes -1, javascript will automatically pick up the previous year's December...
                var startDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth - 1, startDate);
                var endDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth, endDate);
            }

            jQuery.ajax({
                type: "POST",
                url: "timesheet.aspx/loadPunchData", //It calls our web method  
                data: JSON.stringify({ emp_pin: selectedId, dateToStartSearch: startDateForTimesheet, dateToEndSearch: endDateForTimesheet }), //inside the webmethod, am loading 1 previous day and 1 day extra
                headers: {
                    'Authorization': 'Bearer ' + jwtToken
                },
                contentType: "application/json; charset=utf-8",
                dataType: "JSON",
                async: false,
                success: function (lstAttendance) {

                    if (lstAttendance.d == null) {
                        window.location.href = '/Login_New.aspx?discon=true';
                    }
                    punchData = [];

                    // Loop through each item in the returned data
                    $(".punch-table").html(`<tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Punch Time</th>
                        <th>Punch Type</th>
                        <th>Action</th>
                    </tr>`);

                    $.each(lstAttendance.d, function (index, item) {
                        // Determine the background color based on item.isIgnored
                        var bgColor = item.isIgnored == 1 ? '#d3d3d3' : '#ffffff';
                        //Now we define the different values for the Punch Type.
                        //1 means inputed on device
                        //9 means added by Admin
                        //2 means clocked in using employee's mobile phone
                        //now we create a switch statement to determine the punch type
                        var punchType = '';
                        var mapHtml = ''; // Initialize an empty string for the map icon HTML
                        switch (item.punchType) {
                            case 1:
                                punchType = 'Clocked on Company Device';
                                break;
                            case 2:
                                punchType = 'Clocked in using Mobile Phone';
                                // Add the map icon HTML next to the punchType text
                                mapHtml = `<div id="mapIcon${item.idPrimaryKey}" class="mapIcon">
                                               <i class="fas fa-map-marker-alt" style="font-size: 20px; color: #d35400;"></i> (${item.locationName})
                                           </div>
                                           <div id="mapContainer${item.idPrimaryKey}" class="map-container" style="height: 0; overflow: hidden; position: relative;"
                                                data-latitude="${item.latitude}" data-longitude="${item.longitude}" data-location-name="${item.locationName}">
                                               <!-- The map will be initialized here -->
                                           </div>`;
                                break;
                            case 9:
                                punchType = 'Added by Admin';
                                break;
                        }

                        var newRow = `<tr idPrimaryKey="${item.idPrimaryKey}" punch_time_attr="${item.punch_time}" employee_id_attr="${selectedId}" style="background-color: ${bgColor}">
                      <td>${findDayFromDate(item.date)}</td>
                      <td>${item.date}</td>
                      <td>${item.time}</td>
                      <td>${punchType} ${mapHtml}</td> <!-- Append mapHtml only when punchType is 2 -->
                      <td><select class="form-select actionBtn"><option value="0">Use in Timesheet</option><option value="1">Ignore Data</option><option value="2">Previous day's Overtime</option></select></td>
                  </tr>`;
                        $(".punch-table").append(newRow);
                        $(".punch-table tr:last .actionBtn").val(item.isIgnored);
                        punchData.push(item);

                    });

                    //make the action button a select2 but remove the searchbar on top. ActionBtn is created above. its the button used to ignore the punch data
                    $('.actionBtn').select2({
                        minimumResultsForSearch: Infinity
                    });

                    //The below function will fill the Timesheet datatable with the dates that payroll is being considered for
                    populateDataTableWithEmptyDates(shiftList);

                    /*
                      Now we need to load the check-in and check-out times into the timesheet
                      We need to retrieve all approved clock-outs from the database by making an ajax call to the server
                      We will then store the approved clock-outs in a dictionary where the key is the data and time is the value
                      We will then use this dictionary to fill the approved clock - out time in the timesheet
                    */
                    var approvedClockOutAndOvertimes = {};
                    approvedClockOutAndOvertimes = BeingCalledByOtherFunctions.retrieveAndLoadApprovedOvertimes(selectedId, startDateForTimesheet, endDateForTimesheet);

                    /*
                      now we also need to load the absence approval data.We need to know which days the employee was absent
                      We will make an ajax call to the server to retrieve the absence approval data
                      We will then store the absence approval data in a dictionary where the key is the date and the value is the absence approval status
                      We will then use this dictionary to fill the absence approval status in the timesheet
                    */
                    var absenceApprovalData = {};
                    absenceApprovalData = BeingCalledByOtherFunctions.retrieveAndLoadAbsenceApprovalData(selectedId, startDateForTimesheet, endDateForTimesheet);

                    loadTimeSheetFromPunchData(punchData, approvedClockOutAndOvertimes, "day", shiftList, CLEL, COAR, COLL, shiftWrapper);

                    //we Gray out the rows that have been ignored in the attendance data pageS
                    grayOutIgnoredRows();

                    //Now we display the relevant data inside the small circles on top of the page
                    BeingCalledByOtherFunctions.displayDataInCircles();

                    $("#UpdateTimeSheet").show();
                    $("#finalizeTimesheet").show();
                    $("#exportToExcel").show();

                    // Set empInfoBar, empBubbles and timeTable's display to block
                    $("#empInfoBar").css("display", "");
                    $("#empBubbles").css("display", "");
                    $("#timeTable").css("display", "");

                },
                error: function (xhr, status, error) {
                    console.error("Error occurred: ", status, error);
                    // Additional error handling
                }
            });

            // Get absence amount left
            EventsFunctions.getAbsenceAmountLeft();

        });

        $("#UpdateTimeSheet").on("click", function () {
            // Create an array to hold the data
            var currentMonth = $(".clsFirstUnlockedPeriod").attr("month");
            var currentYear = $(".clsFirstUnlockedPeriod").attr("year");
            var isLocked = isLockedPeriod(currentMonth, currentYear);
            if (isLocked) {
                displayWarningHtml("This period is <b>locked</b>. You cannot update the timesheet");
                return;
            }
            var dataToSend = [];
            var emp_pin = $('.timesheetEmpSelect2').find(':selected').val();

            //Here we are going to loop through all the rows in the timesheet and retrieve the data
            $('#timeTable tbody tr').each(function () {
                var date = $(this).find('td:eq(1)').text();

                //Why are we doing all this? (The code below)
                //This is because we need to compare the new value and the original values to know if the user has made any changes
                //However, when we are retrieving the data, the integer 0 being retrieved is being considered as same as undefined.
                //So even when the user hasnt changed anything, its thinking that it has changed something
                //Therefore I decided to convert the 0 to a string "0" so that it can be compared with the original value
                //This also allows the user to save the value 0 in the database
                var approvedClockOutInput = $(this).find('td:eq(4)').find('input').val() || '';
                var approvedClockOutInputOriginal = $(this).find('td:eq(4)').find('input').data('original-value');
                approvedClockOutInputOriginal = approvedClockOutInputOriginal !== undefined ? String(approvedClockOutInputOriginal) : '';

                var netAdjust = $(this).find('td:eq(7)').find('input').val() || '';
                var netAdjustOriginal = $(this).find('td:eq(7)').find('input').data('original-value');
                netAdjustOriginal = netAdjustOriginal !== undefined ? String(netAdjustOriginal) : '';

                var ExtraOvert = $(this).find('td:eq(8)').find('input').val() || '';
                var ExtraOverOriginal = $(this).find('td:eq(8)').find('input').data('original-value');
                ExtraOverOriginal = ExtraOverOriginal !== undefined ? String(ExtraOverOriginal) : '';

                var ExceptOvert = $(this).find('td:eq(9)').find('input').val() || '';
                var ExceptOverOriginal = $(this).find('td:eq(9)').find('input').data('original-value');
                ExceptOverOriginal = ExceptOverOriginal !== undefined ? String(ExceptOverOriginal) : '';


                //Now we need to compare the new value and the original values to know if the user has made any changes
                //If the user has made any changes, we need to send the data to the server
                //We will send an array containing 1 date, the corresponding netAdjust, ExtraOvert and ExceptOvert
                if (approvedClockOutInput!=approvedClockOutInputOriginal|| netAdjust != netAdjustOriginal || ExtraOvert != ExtraOverOriginal || ExceptOvert != ExceptOverOriginal) {
                    dataToSend.push({
                        Date: date,
                        TimeValue: approvedClockOutInput,
                        netAdjust: netAdjust,
                        ExtraOvert: ExtraOvert,
                        ExceptOvert: ExceptOvert
                    });
                }

            });

            // Send the data using AJAX if the array is not empty
            if (dataToSend.length > 0 ) {
                $.ajax({
                    url: 'timesheet.aspx/UpdateApprovedClockOuts', // Replace with your server endpoint
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ timeEntries: dataToSend, emp_pin: emp_pin }),
                    success: function (response) {
                        // Handle success
                        displaySuccessMessage(response.d + ' overtimes successfully approved');
                        //trigger the employee change event to reload the page
                        $('.timesheetEmpSelect2').trigger('change', { triggeredByCode: true });
                    },
                    error: function (xhr, status, error) {
                        // Handle errors
                        console.error('An error occurred', status, error);
                    }
                });
            }

        });

        $("#finalizeTimesheet").on("click", function () {

            var currentMonth = $(".clsFirstUnlockedPeriod").attr("month");
            var currentYear = $(".clsFirstUnlockedPeriod").attr("year");
            var isLocked = isLockedPeriod(currentMonth, currentYear);
            if (isLocked) {
                displayWarningHtml("This period is <b>locked</b>. You cannot update the timesheet");
                return;
            }

            Swal.fire({
                title: "Confirm timesheet details?",
                html: `<div style="text-align: left; font-family: Arial, sans-serif;">
                             <p style="font-weight: bold; color: #333;">Timesheet Summary:</p>
                            <div style="background-color: #f9f9f9; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                <p><strong>Working Days:</strong> <span style="color: #2a9d8f;">${finalizedDetails.workingDays} days</span></p>
                                <p><strong>Present Days:</strong> <span style="color: #2a9d8f;">${finalizedDetails.presentDays} days</span></p>
                                <p><strong>Local Leaves:</strong> <span style="color: #e76f51;">${finalizedDetails.localLeaves} days</span></p>
                                <p><strong>Sick Leaves:</strong> <span style="color: #e76f51;">${finalizedDetails.sickLeaves} days</span></p>
                                <p><strong>Leaves Without Pay:</strong> <span style="color: #e76f51;">${finalizedDetails.leavesWithoutPay} days</span></p>
                                <p><strong>Free Holidays:</strong> <span style="color: #2a9d8f;">${finalizedDetails.freeHolidays} days</span></p>
                            </div>
                            <div style="background-color: #eef6f9; padding: 10px; border-radius: 5px; margin-bottom: 10px;">
                                <p><strong>Overtime Duration:</strong> <span style="color: #264653;">${finalizedDetails.overtimeDurationHours} Hrs</span></p>
                                <div class="form-group row">
                                    <label for="mealAllowances" class="col-sm-6 col-form-label"><strong>Meal Allowances:</strong></label>
                                    <div class="col-sm-6">
                                        <input type="text" class="form-control" id="mealAllowances" value="${finalizedDetails.mealAllowanceAmount}">
                                    </div>
                                </div>
                                <p><strong>Total Lateness:</strong> <span style="color: #f4a261;">${finalizedDetails.totalLateness} Hrs</span></p>
                                <p><strong>Net Adjustment:</strong> <span style="color: #264653;">${finalizedDetails.totalNetAdjust} Hrs</span></p>
                                <p><strong>Holiday Extra Hours:</strong> <span style="color: #2a9d8f;">${finalizedDetails.holidayExtraPayHours} Hrs</span></p>
                                <p><strong>Exceptional Overtime:</strong> <span style="color: #2a9d8f;">${finalizedDetails.exceptionalOvertimeHours} Hrs</span></p>
                            </div>
                        </div>`,
                showDenyButton: true,
                showCancelButton: false,
                confirmButtonText: "Finalize",
                denyButtonText: `Back`
            }).then((result) => {
                if (result.isConfirmed) {
                    var emp_pin = $('.timesheetEmpSelect2').find(':selected').val();
                    var month = $(".clsFirstUnlockedPeriod").attr("month");
                    var year = $(".clsFirstUnlockedPeriod").attr("year");
                    var objFinalizedInfos = {
                        emp_pin: emp_pin,
                        month: month,
                        year: year,
                        workingDays: finalizedDetails.workingDays,
                        presentDays: finalizedDetails.presentDays,
                        localLeaves: finalizedDetails.localLeaves,
                        sickLeaves: finalizedDetails.sickLeaves,
                        overtimeDurationHours: finalizedDetails.overtimeDurationHours,
                        exceptionalOvertimeHours: finalizedDetails.exceptionalOvertimeHours,
                        totalLateness: finalizedDetails.totalLateness,
                        totalNetAdjust: finalizedDetails.totalNetAdjust,
                        holidayExtraPayHours: finalizedDetails.holidayExtraPayHours,
                        leavesWithoutPay: finalizedDetails.leavesWithoutPay,
                        freeHolidays: finalizedDetails.freeHolidays,
                        mealAllowanceAmount: $("#mealAllowances").val()
                    }

                    //send the cookie(token) along with the request
                    var jwtToken = getCookie("jwttoken");

                    $.ajax({
                        url: 'timesheet.aspx/FinalizeTimesheet', // Replace with your server endpoint
                        type: 'POST',
                        headers: {
                            'Authorization': 'Bearer ' + jwtToken
                        },
                        contentType: 'application/json',
                        data: JSON.stringify({ objFinalizedInfos: objFinalizedInfos }),
                        success: function (response) {
                            // Handle success
                            if (response.d == 1) {
                                Swal.fire("Timesheet Successfully overwritten for this period!", "", "success");
                            }
                            if (response.d == 0) {
                                Swal.fire("Timesheet Successfully finalized for this period!", "", "success");
                            }
                            if (response.d == 9) {
                                Swal.fire("Timesheet could not be saved!", "", "error");
                            }

                        },
                        error: function (xhr, status, error) {
                            // Handle errors
                            console.error('An error occurred', xhr, status, error);
                        }
                    });

                } else if (result.isDenied) {
                    Swal.fire("Changes are not saved", "", "info");
                }
            });
        });

        $(document).on('keydown', function (event) {
            // Check if the "+" key is pressed. For "+" without shift, check for the key code directly.
            // Note: "+" is usually obtained by pressing Shift + "=" on many keyboards
            if (event.key === '+' || (event.key === '=' && event.shiftKey)) {
                // Prevent default action to avoid any unwanted behavior
                event.preventDefault();
                // Call the function to open the modal
                loadFPAdditionModal();
            }
        });

        function toggleExceptionalOvertime() {
            $('#timeTableHead th:nth-child(10)').toggleClass('hidden-column-default');
            $('#timeTableBody td:nth-child(10)').toggleClass('hidden-column-default');
        }

        // Event handler for button click
        $('#IdShowExOvertime').on('click', toggleExceptionalOvertime);

        // Event handler for keypress " / "... when this key is pressed, exceptional overtime is shown
        $(document).on('keypress', function (e) {
            if (e.which === 47) { // 47 is the keycode for '/'
                toggleExceptionalOvertime();
            }
        });

        $('#timeTable').on('input', '.approvedOvertimeInput', function () {
            // Retrieve the new value entered by the user
            var newValue = $(this).val();

            // Update the 'data-netadjustment' attribute for the parent row to reflect the new net adjustment
            $(this).closest('td').attr('data-netadjustment', newValue);

            // Now that the data attribute is updated, recalculate and display the totals
            BeingCalledByOtherFunctions.displayDataInCircles();
        });

        $('#timeTable').on('input', '.extraOvertimeInput', function () {
            var newValue = $(this).val();
            $(this).closest('td').attr('data-extraovertime', newValue);

            // Assuming you have a function to recalculate and display totals
            BeingCalledByOtherFunctions.displayDataInCircles();
        });

        $('#timeTable').on('input', '.exceptionalOvertimeInput', function () {
            var newValue = $(this).val();
            $(this).closest('td').attr('data-exceptionalovertime', newValue);

            // Trigger recalculation of totals
            BeingCalledByOtherFunctions.displayDataInCircles();
        });
    },

    getAbsenceAmountLeft: function () {
        // This function will load the absence amount left for the selected employee
        var selectedId = $('.timesheetEmpSelect2').find(':selected').val();
        jQuery.ajax({
            type: "POST",
            url: "timesheet.aspx/getAbsenceAmountLeft", //It calls our web method  
            data: JSON.stringify({ emp_pin: selectedId }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (msg) {
                $("#absenceAmountLeft").html(msg.d);
                // Display absence amounts in the leavesModal
                document.getElementById('sickLeaves').textContent = msg.d.sickLeft;
                document.getElementById('localLeaves').textContent = msg.d.localLeft;
            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            },
            error: function (xhr, status, error) {
                console.error("An error occurred while loading absence amount left:", error);
            }

        });
    },

    lateBindingAfterInitializationOfAbsenceElements: function () {
        //When a user changes the absence type in the absence type dropdown list
        $('.absenceTypesSelect').on('change', function (event, data) {
            /*
            There are 2 ways this event is being triggered:
            1 is by the user when he changes the absence value
            2nd is by the code when we are loading the absence approval data from the database. This should not call the ajax to send the data to the server
            */
            if (!(data && data.triggeredByCode)) {
                // The change event was triggered by the user
                //Now we need to send the data to the server to save it in the database
                //We need to send the employeeID, the date and the absence type
                var selectedId = $('.timesheetEmpSelect2').find(':selected').val();
                var date = $(this).attr('date');
                var absenceType = $(this).val();

                jQuery.ajax({
                    type: "POST",
                    url: "timesheet.aspx/saveAbsenceApprovalData", //It calls our web method  
                    data: JSON.stringify({ emp_pin: selectedId, dateToSave: date, absenceTypeToSave: absenceType }),
                    contentType: "application/json; charset=utf-8",
                    dataType: "JSON",
                    success: function (msg) {
                        if (msg.d == 1)
                            displaySuccessMessage("Absence successfully saved");
                        else if (msg.d == 0) displayWarningMessage("Cannot save absence. Please ensure the employee leave amounts have been set");
                        else {
                            displayErrorMessage("An error occurred while saving absence. Please contact the administrator", true);
                        }
                    },
                    failure: function (msg) {
                        displayErrorMessage(msg, true);
                    }
                });
            }

            if ($(this).val() == 5) {
                //add class" non working day" to the <tr> element
                $(this).parent().parent().addClass('nonWorkingDay');
                //since its a public holiday, we need to remove the class "workingDay" from the <tr> element
                $(this).parent().parent().removeClass('workingDay');
            }

            $(this).parent().parent().css('background-color', $(this).find('option:selected').attr('colourofdiv'));
            $(this).parent().parent().css('background-color', $(this).find('option:selected').attr('colourofdiv'));

            // Trigger an employee change (with the current employee) to reload the page, however, make sure not to fall in an infinite loop
            if (!data || !data.triggeredByCode) {
                $('.timesheetEmpSelect2').trigger('change', { triggeredByCode: true });
            }
        });
    },

    initializeTooltipOnBubbles: function () {
        //initializing the tooltip on the 4 bubbles on top
        $('[data-toggle="tooltip"]').tooltip('dispose').tooltip({ html: true });
    },

    SaveComments: function () {
        //This function will save the comments in the database
        var selectedId = $('.timesheetEmpSelect2').find(':selected').val();
        var comment = $("#commentsSection").val();
        //we also need to save the period month and year in the database
        var month = $(".clsFirstUnlockedPeriod").attr("month");
        var year = $(".clsFirstUnlockedPeriod").attr("year");

        jQuery.ajax({
            type: "POST",
            url: "timesheet.aspx/saveComments", //It calls our web method  
            data: JSON.stringify({ emp_pin: selectedId, month: month, year: year, comment: comment }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            async: false,
            success: function (msg) {
                displaySuccessMessage("Comment successfully saved");
            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            }
        });
    },

    GetComments: function () {
        //This function is called when we open the comments modal. It will retrieve and display the comments
        var selectedId = $('.timesheetEmpSelect2').find(':selected').val();
        var month = $(".clsFirstUnlockedPeriod").attr("month");
        var year = $(".clsFirstUnlockedPeriod").attr("year");

        jQuery.ajax({
            type: "GET",
            url: "timesheet.aspx/getComments",
            data: { emp_pin: selectedId, month: month, year: year },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            async: false,
            success: function (msg) {
                $("#commentsSection").val(msg.d);
            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            }
        });
    }

};

const HideUnhideCertainDivs = {
    loadPunchData: function () {
        $(".time-table").hide();
        $(".punch-table").show();
        $("#finalizeTimesheet").hide();
        $("#UpdateTimeSheet").hide();
        $("#exportToExcel").hide();
    },

    loadTimeSheet: function () {
        $(".time-table").show();
        $(".punch-table").hide();
        $("#finalizeTimesheet").show();
        $("#validateTimeSheet").show();
        $("#exportToExcel").show();
        $("#UpdateTimeSheet").show();
    },

    loadCommentsModal: function () {
        $('#commentsModal').modal('show');
        EventsFunctions.GetComments();
    },

    loadLeavesModal: function () {
        $('#leavesModal').modal('show');
    }

}

const BeingCalledByOtherFunctions = {

    selectNextMonth: function () {
        //find the current month in the clsFirstUnlockedPeriod
        var currentMonth = $(".clsFirstUnlockedPeriod").attr("month");
        var currentYear = $(".clsFirstUnlockedPeriod").attr("year");
        //Then deduce the next month after this month/year combination
        var nextMonth = parseInt(currentMonth) + 1;
        var nextYear = currentYear;
        if (nextMonth == 12) {
            nextMonth = 0;
            nextYear = parseInt(currentYear) + 1;
        }

        //Call the function to load the timesheet of the next month
        $(".clsFirstUnlockedPeriod").attr("month", nextMonth);
        $(".clsFirstUnlockedPeriod").attr("year", nextYear);

        var dateObject = {
            month: nextMonth,
            year: nextYear
        }
        return dateObject;
    },

    selectPreviousMonth: function () {
        //find the current month in the clsFirstUnlockedPeriod
        var currentMonth = $(".clsFirstUnlockedPeriod").attr("month");

        var currentYear = $(".clsFirstUnlockedPeriod").attr("year");
        //Then deduce the previous month after this month/year combination
        var previousMonth = parseInt(currentMonth) - 1;
        var previousYear = currentYear;
        if (previousMonth == -1) {
            previousMonth = 11;
            previousYear = parseInt(currentYear) - 1;
        }

        //Call the function to load the timesheet of the previous month
        $(".clsFirstUnlockedPeriod").attr("month", previousMonth);
        $(".clsFirstUnlockedPeriod").attr("year", previousYear);

        var dateObject = {
            month: previousMonth,
            year: previousYear
        }
        return dateObject;

    },

    retrieveAndLoadApprovedOvertimes: function (selectedId, startDateForTimesheet, endDateForTimesheet) {
        var approvedOvertimes = {};

        jQuery.ajax({
            type: "POST",
            url: "timesheet.aspx/loadApprovedClockOuts", //It calls our web method  
            data: JSON.stringify({ emp_pin: selectedId, dateToStartSearch: startDateForTimesheet, dateToEndSearch: endDateForTimesheet }),
            async: false,
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (lstApprovedOvertimes) {

                // Loop through each item in the returned data
                $.each(lstApprovedOvertimes.d, function (index, item) {
                    var approvedClockOutDateOnly = item.Date;
                    
                    if (!approvedOvertimes[approvedClockOutDateOnly]) {
                        // If no entry exists for this date, create an array with the current item's details
                        approvedOvertimes[approvedClockOutDateOnly] = [];
                    }

                    // Push the current item's details into the array for this date
                    approvedOvertimes[approvedClockOutDateOnly].push({
                        approvedClockOutTimeOnly: item.TimeValue,
                        netAdjust: item.netAdjust,
                        ExtraOvert: item.ExtraOvert,
                        ExceptOvert: item.ExceptOvert
                    });
                });


            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            }
        });

        return approvedOvertimes;
    },

    retrieveAndLoadAbsenceApprovalData: function (selectedId, startDateForTimesheet, endDateForTimesheet) {
        //Now we need to retrieve the absence approval data from the database
        //We will make an ajax call to the server to retrieve the absence approval data
        //We will then store the absence approval data in a dictionary where the key is the date and the value is the absence approval status
        //We will then use this dictionary to fill the absence approval status in the timesheet
        var absenceApprovalData = {};

        jQuery.ajax({
            type: "POST",
            url: "timesheet.aspx/loadAbsenceApprovalData", //It calls our web method  
            data: JSON.stringify({ emp_pin: selectedId, dateToStartSearch: startDateForTimesheet, dateToEndSearch: endDateForTimesheet }),
            async: false,
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (lstAbsenceApprovalData) {

                // Loop through each item in the returned data
                $.each(lstAbsenceApprovalData.d, function (index, item) {
                    absenceApprovalData[`${index}`] = item;
                    //select the absence value in the dropdown list
                    $(`select.absenceTypesSelect[date='${index}']`).val(item).trigger('change', { triggeredByCode: true });
                });

                //After retrieving absence types from the database, we will use the absenceType with index 5 (which is the absence type for "Public Holiday") to fill the absence approval data
                //The non working days have class name "nonWorkingDay" and the working days have class name "workingDay"
                var colourOfHolidaysAndNonWorkingDays = $(".absenceTypesSelect option[value='5']").attr("colourofdiv");
                $(".nonWorkingDay").css('background-color', colourOfHolidaysAndNonWorkingDays);
            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            }
        });
        return absenceApprovalData;
    },

    retrieveAbsenceTypesFromDatabase: function () {
        //This function will retrieve the absence types from the database and return them in a list
        var absenceTypes = [];

        jQuery.ajax({
            type: "GET",
            url: "timesheet.aspx/loadAbsenceTypes", //It calls our web method  
            data: '{}',
            async: false,
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (lstAbsenceTypes) {

                // Loop through each item in the returned data
                $.each(lstAbsenceTypes.d, function (index, item) {
                    //item.absenceTypeID contains the absenceTypeID
                    //item.absenceTypeDescription contains the absenceTypeDescription
                    //We will create a key in the dictionary using the absenceTypeID
                    //The value will be the absenceTypeDescription
                    absenceTypes[item.absenceTypeID] = {
                        description: item.absenceName,
                        colour: item.colour
                    };
                });
            },
            failure: function (msg) {
                displayErrorMessage(msg, true);
            }
        });
        return absenceTypes;
    },

    createInputDivsInTimesheet: function (row, inputVal, indexInTable) {
        //When indexInTable==4, it means we are creating the input for the "Approved Clock-Out" column
        if (indexInTable == 4) {
            var inputDiv = document.createElement("input");
            inputDiv.setAttribute("class", 'form-control approvedClockOutInput');
            //we put the date in a hidden attribute named "date" in order to know when to retrieve it. We will retrieve it when the user clicks on the save button
            inputDiv.setAttribute("date", row.id);
            inputDiv.setAttribute("type", 'time');
            row.children[indexInTable].innerHTML = '';
            if (inputVal) {
                //here we need to display the value in the input textbox
                inputDiv.setAttribute("value", inputVal);
                inputDiv.setAttribute("data-original-value", inputVal);
            }
            row.children[indexInTable].appendChild(inputDiv);
        }
        //When indexInTable==7, it means we are creating the input for the overtime column. We are currently allowing overtime overrides
        //In this case we will create an input that will simply display the value of the overtime in the database. No time input is needed.just number based
        if (indexInTable == 7) {
            var inputDiv = document.createElement("input");
            inputDiv.setAttribute("class", 'form-control approvedOvertimeInput');
            inputDiv.setAttribute("date", row.id);
            inputDiv.setAttribute("type", 'number');
            inputDiv.setAttribute("data-original-value", inputVal);
            row.children[indexInTable].innerHTML = '';
            inputDiv.setAttribute("value", inputVal);
            row.children[indexInTable].appendChild(inputDiv);
        }
        // When indexInTable==8, it means we are creating the input for the "Extra Overtime" column.
        if (indexInTable == 8) {
            var inputDiv = document.createElement("input");
            inputDiv.setAttribute("class", 'form-control extraOvertimeInput');
            inputDiv.setAttribute("date", row.id); // Assuming you might need the date here as well.
            inputDiv.setAttribute("type", 'number');
            inputDiv.setAttribute("value", inputVal); // Prefill with extraOvertimeDone
            inputDiv.setAttribute("data-original-value", inputVal);
            row.children[indexInTable].innerHTML = '';
            row.children[indexInTable].appendChild(inputDiv);
        }
        // When indexInTable==9, creating the input for the "Exceptional Overtime" column
        if (indexInTable == 9) {
            var inputDiv = document.createElement("input");
            inputDiv.setAttribute("class", 'form-control exceptionalOvertimeInput');
            inputDiv.setAttribute("date", row.id); // Assuming you might need the date here as well.
            inputDiv.setAttribute("type", 'number');
            inputDiv.setAttribute("value", inputVal); // Prefill with exceptionalOvertimeDone
            inputDiv.setAttribute("data-original-value", inputVal);
            row.children[indexInTable].innerHTML = '';
            row.children[indexInTable].appendChild(inputDiv);
        }

    },

    displayDataInCircles: function () {
        //Find the total absences.
        //This is done by looping through all the table rows and finding all working days.
        //For all working days, if the checkInTime and CheckOutTime are both "--:--", that is their value is 0, then we add 1 to the total absences
        var totalAbsences = 0;
        var noOfWorkingDays = 0;
        var totalLateness = 0;
        var totalOvertime = 0;
        var totalNetAdjust = 0;
        var totalExtraOvertime = 0;
        var extraOvertimeDataAttribute;
        var totalExceptionalOvertime = 0;
        var ExceptionalOvertimeDataAttribute;

        /*
        We need to group similar absences together according to the AbsenceTypes objects...
            IDPRESENT: -1,
            IDSICKLEAVE: 1,
            IDHALFSICKLEAVE: 2,
            IDLOCALLEAVE: 3,
            IDHALFLOCALLEAVE: 4,
            IDPUBLICHOLIDAY: 5,
            IDFREEHOLIDAY: 6,
            IDHALFLEAVEWITHOUTPAY: 7,
            IDLEAVEWITHOUTPAY: 8
        */

        var presentDays = 0;
        var sickLeaves = 0;
        var localLeaves = 0;
        var freeHolidays = 0;
        var leavesWithoutPay = 0;
        var totalMealAllowances = 0;

        $(".time-table tr.workingDay").each(function () {

            noOfWorkingDays++;
            //if he has no checkInTime means he is absent
            if ($(this).find('td[data-checkintime]').length == 0) {
                totalAbsences = totalAbsences + 1;
            }
            if ($(this).find('td[data-checkintime]').length > 0) {
                presentDays = presentDays + 1;
            }
            if ($(this).find('td[data-lateness]').data('lateness')) {
                totalLateness = totalLateness + $(this).find('td[data-lateness]').data('lateness');
            }
            if ($(this).find('td[data-overtime]').data('overtime')) {
                totalOvertime = totalOvertime + $(this).find('td[data-overtime]').data('overtime');
            }
            if ($(this).find('td[data-netadjustment]').attr('data-netadjustment')) {
                totalNetAdjust += parseInt($(this).find('td[data-netadjustment]').attr('data-netadjustment'), 10);
            }
            extraOvertimeDataAttribute = $(this).find('td[data-extraovertime]').data('extraovertime');
            if (extraOvertimeDataAttribute !== undefined && extraOvertimeDataAttribute !== 'undefined') {
                totalExtraOvertime = totalExtraOvertime + $(this).find('td[data-extraovertime]').data('extraovertime');
            }
            if ($(this).find('td[data-overtime]').data('meal-allowance')) {
                totalMealAllowances += $(this).find('td[data-overtime]').data('meal-allowance');
            }


            var selectedAbsence = $(this).find('td.leave-taken select').val();

            switch (selectedAbsence) {
                //case AbsenceTypes.IDPRESENT:
                //    presentDays++;
                //    break;
                case AbsenceTypes.IDSICKLEAVE:
                    sickLeaves++;
                    break;
                case AbsenceTypes.IDHALFSICKLEAVE:
                    sickLeaves = sickLeaves + 0.5;
                    break;
                case AbsenceTypes.IDLOCALLEAVE:
                    localLeaves++;
                    break;
                case AbsenceTypes.IDHALFLOCALLEAVE:
                    localLeaves = localLeaves + 0.5;
                    break;
                case AbsenceTypes.IDFREEHOLIDAY:
                    freeHolidays++;
                    break;
                case AbsenceTypes.IDHALFLEAVEWITHOUTPAY:
                    leavesWithoutPay = leavesWithoutPay + 0.5;
                    break;
                case AbsenceTypes.IDLEAVEWITHOUTPAY:
                    leavesWithoutPay++;
                    break;
            }
            extraOvertimeDataAttribute = $(this).find('td[data-extraovertime]').attr('data-extraovertime');
            ExceptionalOvertimeDataAttribute = $(this).find('td[data-exceptionalovertime]').attr('data-exceptionalovertime');

            if (extraOvertimeDataAttribute !== undefined && extraOvertimeDataAttribute !== 'undefined') {
                totalExtraOvertime += parseInt(extraOvertimeDataAttribute, 10);
            }

            if (ExceptionalOvertimeDataAttribute !== undefined && ExceptionalOvertimeDataAttribute !== 'undefined') {
                totalExceptionalOvertime += parseInt(ExceptionalOvertimeDataAttribute, 10);
            }

        });
        $(".time-table tr.nonWorkingDay").each(function () {
            //This part is currently duplicated in the working days section too because of the dynamic ability of the textbox to change
            //depending on user input purely...
            extraOvertimeDataAttribute = $(this).find('td[data-extraovertime]').attr('data-extraovertime');
            ExceptionalOvertimeDataAttribute = $(this).find('td[data-exceptionalovertime]').attr('data-exceptionalovertime');

            if (extraOvertimeDataAttribute !== undefined && extraOvertimeDataAttribute !== 'undefined') {
                totalExtraOvertime += parseInt(extraOvertimeDataAttribute, 10);
            }

            if (ExceptionalOvertimeDataAttribute !== undefined && ExceptionalOvertimeDataAttribute !== 'undefined') {
                totalExceptionalOvertime += parseInt(ExceptionalOvertimeDataAttribute, 10);
            }
            if ($(this).find('td[data-netadjustment]').attr('data-netadjustment')) {
                totalNetAdjust += parseInt($(this).find('td[data-netadjustment]').attr('data-netadjustment'), 10);
            }
        });

        //Now we display the total absences in the circle
        $(".absencesCount").html(totalAbsences);
        $(".totalLatenessValue").html((totalLateness / 60).toFixed(1));
        $(".totalOvertimeValue").html((totalOvertime / 60).toFixed(1));
        $(".totalNetAdjustment").html((totalNetAdjust / 60).toFixed(1));

        //Setting the tooltip value for the absences circle
        $('.absencesBubbleJS').attr('title', `Number of Working Days :${noOfWorkingDays}<br/>No. of Present days: ${presentDays}<br/> Local Leaves taken: ${localLeaves}<br/>Sick Leaves taken:${sickLeaves}<br/> Free Approved Holidays:${freeHolidays}<br/> Leaves Without Pay:${leavesWithoutPay}`);
        $('.latenessBubbleJS').attr('title', 'Total Lateness for full working days(mins) :' + totalLateness);
        $('.overtimeBubbleJS').attr('title', `Total Overtime for full working days(mins) :${totalOvertime} <br/> Meal allowances:${totalMealAllowances}`);
        $('.netAdjustmentBubbleJS').attr('data-html', 'true').attr('title', 'Total Adjustments (mins) :' + totalNetAdjust + '<br>Extra Overtime(mins):' + totalExtraOvertime + '<br>Exceptional Overtime(mins):' + totalExceptionalOvertime);

        finalizedDetails.workingDays = noOfWorkingDays;
        finalizedDetails.presentDays = presentDays;
        finalizedDetails.localLeaves = localLeaves;
        finalizedDetails.sickLeaves = sickLeaves;
        finalizedDetails.overtimeDurationHours = (totalOvertime / 60).toFixed(1);
        finalizedDetails.totalLateness = (totalLateness / 60).toFixed(1);
        finalizedDetails.totalNetAdjust = (totalNetAdjust / 60).toFixed(1);
        finalizedDetails.holidayExtraPayHours = (totalExtraOvertime / 60).toFixed(1);
        finalizedDetails.leavesWithoutPay = leavesWithoutPay;
        finalizedDetails.freeHolidays = freeHolidays;
        finalizedDetails.mealAllowanceAmount = totalMealAllowances;
        finalizedDetails.exceptionalOvertimeHours = (totalExceptionalOvertime / 60).toFixed(1);

        EventsFunctions.initializeTooltipOnBubbles();
    }
}

const calculations = {

    calculateLateness: function (checkInTime, checkOutTime, shiftList, CLEL, dayOfTheWeekInteger, approvedClockOutTime) {
        /*
            Now we need to calculate the lateness for this employee for this day
            first we will need to use the checkInTime and the ShiftList to find the shift that the employee is on

            ShiftList contains the following data:
            templateDetails
            templateID
            shiftStart as timespan datatype
            shiftEnd as a timespan datatype
            dayOfTheWeek starting from 0 where 0 represents sunday and 6 represents saturday
            workingDay is an integer. 0 means he does not work on this day, 1 means he works on this day
            latenessToleranceMinutes represents the amount of minutes where we can allow him to be late after the shiftStart time

            Now we start by finding the shift that the employee is on depending on the day of the week
            The current day is in dayOfTheWeekInteger
            shiftList[dayOfTheWeekInteger] will give us the shift that the employee is on for this day]
            //Now we need to find the shiftStart of this shift    
        */

        var shift = shiftList[dayOfTheWeekInteger];
        var shiftStart = shift.shiftStart;

        const shiftStartHours = shiftStart.Hours;
        const shiftStartMinutes = shiftStart.Minutes;

        // Convert shift start time to minutes
        const shiftStartTimeInMinutes = (shiftStartHours * 60) + shiftStartMinutes;

        // Parse checkInTime string
        const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);

        // Convert check-in time to minutes
        const checkInTimeInMinutes = (checkInHours * 60) + checkInMinutes;

        // Calculate the difference
        const lateness = checkInTimeInMinutes - shiftStartTimeInMinutes;

        // If lateness is negative, it means the employee is not late
        var TotalLateness = lateness > 0 ? lateness : 0;

        //now if the CLEL is 1, then we need to calculate the lateness for this employee for this day if he leaves before his shiftEnd time
        if (CLEL == 1) {
            //However, before doing this, we must know whether the checkOutTime is before the checkInTime, meaning that there is an exceptional overtime(Previous day's overtime))
            //If there is an exceptional overtime, then we will not calculate the lateness due to early leaving for this day because the clockout is not an early leaving
            //Therefore we will check if the checkOutTime is before the checkInTime
            //If there is an approved clock-out, then we will use that time instead of the checkOutTime
            if (approvedClockOutTime) {
                checkOutTime = approvedClockOutTime;
            }
            //now we check if the checkOutTime is before the checkInTime
            if (checkOutTime && checkOutTime != 'Not registered') {
                var checkOutTimeObj = new Date(0, 0, 0, checkOutTime.split(":")[0], checkOutTime.split(":")[1], 0, 0);
            }
            else return TotalLateness;
            var checkInTimeObj = new Date(0, 0, 0, checkInTime.split(":")[0], checkInTime.split(":")[1], 0, 0);
            if (checkOutTimeObj < checkInTimeObj) return TotalLateness;

            //now we need to find the shiftEnd of this shift
            var shiftEnd = shift.shiftEnd;
            const shiftEndHours = shiftEnd.Hours;
            const shiftEndMinutes = shiftEnd.Minutes;

            // Convert shift end time to minutes
            const shiftEndTimeInMinutes = (shiftEndHours * 60) + shiftEndMinutes;

            // Parse checkOutTime string

            const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);

            // Convert check-out time to minutes
            const checkOutTimeInMinutes = (checkOutHours * 60) + checkOutMinutes;

            // Calculate the difference
            const lateness = shiftEndTimeInMinutes - checkOutTimeInMinutes;

            // If lateness is negative, it means the employee is not late
            if (lateness > 0) TotalLateness = TotalLateness + lateness;
        }
        return TotalLateness;
    },

    groupEntriesPerDay: function (entries) {
        // Group entries by date and employee ID
        let groupedEntries = {};

        entries.forEach(entry => {
            function groupEntries(status) {
                let date = entry.date; // Assuming 'date' is already in 'YYYY-MM-DD' format
                let key = `${date}`;

                //Status ==2 means exceptional overtime (Previous day's overtime)
                if (status == 2) {
                    let previousDay = new Date(formatDate(date));
                    previousDay.setDate(previousDay.getDate() - 1);
                    previousDay = formatDateToDDMMYYYY(previousDay);
                    key = `${previousDay}`;
                }

                if (!groupedEntries[key]) {
                    groupedEntries[key] = [];
                }
                groupedEntries[key].push(entry);
            }

            switch (entry.isIgnored) {
                case 0:
                    //Use in timesheet
                    groupEntries(0);
                    break;
                case 1:
                    //Ignored
                    break;
                case 2:
                    //Exceptional overtime
                    groupEntries(2);
                    break;
            };
        });
        return groupedEntries;
    },

    calculateOvertime: function (checkInTime, checkOutTime, shiftList, cummulateOvertimeEarlyArrivals, cummulateOvertimeLateLeaving, dayOfTheWeekInteger, approvedClockOutTime) {

        var earlyArrivalOvertime = 0;
        var lateLeavingOvertime = 0;
        var shift = shiftList[dayOfTheWeekInteger];
        //Now we need to find the shiftStart of this shift and also the meal allowance details
        var shiftStart = shift.shiftStart;
        var shiftEnd = shift.shiftEnd;
        var mealAllowanceTime = shift.mealAllowanceTime;
        var mealAllowanceGiven = false;

        //we convert the meal allowance Time to a date object
        mealAllowanceTime = new Date(0, 0, 0, mealAllowanceTime.Hours, mealAllowanceTime.Minutes, 0, 0);

        if (approvedClockOutTime) {
            //In that case we always calculate the overtime using the approvedClockOutTime even if automatic cumulation of overtime is set to 0
            checkOutTime = approvedClockOutTime;
            var shiftEndDateObj = new Date(0, 0, 0, shiftEnd.Hours, shiftEnd.Minutes, 0, 0);
            var checkOutTimeObj = new Date(0, 0, 0, checkOutTime.split(":")[0], checkOutTime.split(":")[1], 0, 0);
            if (checkOutTimeObj > shiftEndDateObj) {

                lateLeavingOvertime = (checkOutTimeObj - shiftEndDateObj) / 60000;
                //we also give meal allowance here if the checkOutTime is after the MealAllowanceTime
                //we check if the time he has clocked out is after the meal allowance time (meaning he has worked what is required to get the meal allowance)
                if (checkOutTimeObj > mealAllowanceTime) {
                    mealAllowanceGiven = true;
                }
            }
        }

        if (cummulateOvertimeEarlyArrivals == 1) {

            var shiftStartDateObj = new Date(0, 0, 0, shiftStart.Hours, shiftStart.Minutes, 0, 0);

            var checkInTimeSplit = checkInTime.split(":");

            var checkInTimeObj = new Date(0, 0, 0, checkInTimeSplit[0], checkInTimeSplit[1], 0, 0);

            if (checkInTimeObj < shiftStartDateObj) {

                earlyArrivalOvertime = (shiftStartDateObj - checkInTimeObj) / 60000;
            }
        }

        if (cummulateOvertimeLateLeaving == 1) {
            /*
              There are 2 possibilities here:
              1) If the employee's clock out time is after the clock in time. This means he finished work on the same day
              2) If the employee's clock out time is before the clock in time. This means he finished work on the next day
              Therefore we will need to check if the clock out time is before the clockintime  or after the clockintime
              if its before, then we calculate a whole overtime day (from shiftEnd to midnight)
              Then from midnight to the clockout time, we calculate the additional overtime and add it together
            */
            var checkInTimeObj = new Date(0, 0, 0, checkInTime.split(":")[0], checkInTime.split(":")[1], 0, 0);
            var shiftEndDateObj = new Date(0, 0, 0, shiftEnd.Hours, shiftEnd.Minutes, 0, 0);
            var checkOutTimeObj = new Date(0, 0, 0, checkOutTime.split(":")[0], checkOutTime.split(":")[1], 0, 0);

            if (checkOutTimeObj < checkInTimeObj) {
                //if we are here it means there is an exceptional overtime (Previous day's overtime)
                //Therefore we will calculate the overtime from the shiftEnd time to midnight
                lateLeavingOvertime = (new Date(0, 0, 0, 23, 59, 0, 0) - shiftEndDateObj) / 60000;
                //then we calculate the overtime from midnight to the clockout time
                lateLeavingOvertime = lateLeavingOvertime + ((checkOutTimeObj - new Date(0, 0, 0, 0, 0, 0, 0)) / 60000);
                //we need to also give him meal allowance for this day
                mealAllowanceGiven = true;
            }

            else if (checkOutTimeObj > shiftEndDateObj) {

                lateLeavingOvertime = (checkOutTimeObj - shiftEndDateObj) / 60000;
                //we also give meal allowance here if the checkOutTime is after the MealAllowanceTime
                //we check if the time he has clocked out is after the meal allowance time (meaning he has worked what is required to get the meal allowance)
                if (checkOutTimeObj > mealAllowanceTime) {
                    mealAllowanceGiven = true;
                }
            }
        }
        //After calculating the necessary overtimes,we add both and return the result
        var totalOvertime = earlyArrivalOvertime + lateLeavingOvertime;

        return { totalOvertime, mealAllowanceGiven };
    },

    calculateExtraAndExceptionalOvertime: function (checkInTime, checkOutTime, approvedClockOutTime, workDay, ExceptionalOvertimeHours) {

        //if its not a working day OR
        //if the clockoutTime has exceeded the overtimeThresholdHours (functionality to be added later)
        if (!workDay) {
            if (approvedClockOutTime) checkOutTime = approvedClockOutTime;
            //this means that its a non working day.Therefore we calculate the difference between the clockout and clockin times and return it as exceptional overtime
            if (checkOutTime && checkOutTime != 'Not registered') {
                var checkOutTimeSplit = checkOutTime.split(":");
                var checkOutTimeObj = new Date(0, 0, 0, checkOutTimeSplit[0], checkOutTimeSplit[1], 0, 0);
            }
            else return { ExceptionalOvertimeDone: 0, ExtraOvertimeDone: 0 };
            var checkInTimeSplit = checkInTime.split(":");
            var checkInTimeObj = new Date(0, 0, 0, checkInTimeSplit[0], checkInTimeSplit[1], 0, 0);
            var difference = checkOutTimeObj - checkInTimeObj;
            var totalExtraOvertime = difference / 60000;
            //Now we check if the totalExtraOvertime has Exceeded the threshold for exceptional overtime
            if (totalExtraOvertime > ExceptionalOvertimeHours) {
                //if it has exceeded, then we subtract the threshold from the totalExtraOvertime and we return both the remainder and the threshold
                var ExceptionalOvertimeDone = totalExtraOvertime - ExceptionalOvertimeHours;
                var ExtraOvertimeDone = ExceptionalOvertimeHours;
                //now we return both
                return { ExceptionalOvertimeDone: ExceptionalOvertimeDone, ExtraOvertimeDone: ExtraOvertimeDone };
            }
            else {
                //else we return 0 in the ExceptionalOvertimeDone and the totalExtraOvertime in the ExtraOvertimeDone
                return { ExceptionalOvertimeDone: 0, ExtraOvertimeDone: totalExtraOvertime };
            }
        }
        //if its a working day, then we return 0 in both the ExceptionalOvertimeDone and the ExtraOvertimeDone
        return { ExceptionalOvertimeDone: 0, ExtraOvertimeDone: 0 };

    },

}

function initSelect2Emp() {
    var jwtToken = getCookie("jwttoken");

    jQuery.ajax({
        type: "POST",
        url: "timesheet.aspx/loadEmployeesForTimesheet", //It calls our web method  
        headers: {
            'Authorization': 'Bearer ' + jwtToken
        },
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (lstEmp) {

            if (lstEmp.d == null) {
                window.location.href = '/Login_New.aspx?discon=true';
            }
            $('.timesheetEmpSelect2').html("<option></option>");

            // Initialize the 2 select2 dropdowns in the page. One for the timesheet and one for time addition
            var timesheetEmpSelect = $('.timesheetEmpSelect2').select2();

            // Loop through each item in the returned data
            $.each(lstEmp.d, function (index, item) {
                var option = new Option(item.emp_lastname + " " + item.emp_firstname, item.emp_pin, false, false);
                $(option).data('position', item.position);
                $(option).data('image', item.img);
                $(option).data('hiredate', item.hiredate);
                $(option).data('shiftWrapper', item.shiftTemplateWrapper);
                $(option).data('shiftList', item.shiftTemplateWrapper.Templates);
                $(option).data('CLEL', item.CLEL)
                $(option).data('COAR', item.COAR);
                $(option).data('COLL', item.COLL);
                // Append new options
                timesheetEmpSelect.append(option);
            });

            // Refresh the Select2 widget
            timesheetEmpSelect.select2();

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        },
        error: function (xhr, status, error) {
            displayErrorMessage(xhr.responseJSON.Message, true);
        }

    });

}

function loadTimeSheetFromPunchData(punchData, approvedClockOutAndOvertimes, template, shiftList, CLEL, COAR, COLL, shiftWrapper) {
    if (template == "day") {
        entries = calculations.groupEntriesPerDay(punchData);

        clockData = LoadCheckInCheckOutTimes(entries, approvedClockOutAndOvertimes, "day", shiftList, CLEL, COAR, COLL, shiftWrapper);
    }
    return 0;
}

function populateDataTableWithEmptyDates(shiftList) {
    //Retrieve some important variables
    const startDate = localStorage.getItem('startDate');
    const startMonth = localStorage.getItem('startMonth');
    const endDate = localStorage.getItem('endDate');
    var firstUnlockedMonth = $(".clsFirstUnlockedPeriod").attr("month");
    var firstUnlockedYear = $(".clsFirstUnlockedPeriod").attr("year");
    var punchData = [];

    if (startMonth == "Current") {
        /*
          Find how many days are in this month
          First we convert the month from an integer to a string
          Then We calculate the amount of days in that month
        */
        var monthString = convertIntegerMonthToString(firstUnlockedMonth);
        var daysInMonth = new Date(firstUnlockedYear, firstUnlockedMonth, 0).getDate();
        var startDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth, 1);
        var endDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth, daysInMonth);
    }
    else {
        /*
            we subtract 1 from the month because we are starting our payroll from the previous month
            No need to worry about having it being a negative value because month is zero indexed....
            so if it becomes -1, javascript will automatically pick up the previous year's December...
        */
        var startDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth - 1, startDate);
        var endDateForTimesheet = new Date(firstUnlockedYear, firstUnlockedMonth, endDate);
    }

    var absenceTypes = [];
    absenceTypes = BeingCalledByOtherFunctions.retrieveAbsenceTypesFromDatabase();

    $("#timeTableHead").html(`<tr>
                        <th>Day</th>
                        <th>Date</th>
                        <th>Check In</th>
                        <th>Check Out</th>
                        <th>Approved Check-out</th>
                        <th>Lateness</th>
                        <th>Overtime</th>
                        <th>Net Adjustment</th>
                        <th>Extra Overtime(x2)</th>
                        <th class="hidden-column-default">Exceptional Overtime(x3)</th>
                        <th>Leave</th>
                    </tr>`)
    while (startDateForTimesheet <= endDateForTimesheet) {

        var day = findDayFromInteger(startDateForTimesheet.getDay());
        var fullDate = `${startDateForTimesheet.getDate().toString().padStart(2, '0')}/${(startDateForTimesheet.getMonth() + 1).toString().padStart(2, '0')}/${startDateForTimesheet.getFullYear()}`;
        //when appending the <td class="leave-taken">Leave Taken</td>, we will instead append a <select> tag with all the absence types
        //the absence types are found in the absenceTypes array
        //we will loop through the array and append an <option> tag for each absence type
        var absenceTypesSelect = document.createElement("select");
        absenceTypesSelect.setAttribute("class", "absenceTypesSelect");
        absenceTypesSelect.setAttribute("date", fullDate);
        absenceTypesSelect.setAttribute("style", "width: 100% !important;");
        for (var key in absenceTypes) {
            if (absenceTypes.hasOwnProperty(key)) {
                var absenceTypeOption = document.createElement("option");
                absenceTypeOption.setAttribute("value", key);
                //we also need to save the colour of the absence type in the option tag
                absenceTypeOption.setAttribute("colourOfDiv", `${absenceTypes[key].colour}`);
                absenceTypeOption.textContent = absenceTypes[key].description;
                absenceTypesSelect.appendChild(absenceTypeOption);
            }
        }
        //now that we have created the absenceTypesSelect, we need to append it to the appropriate<td> tag below
        //we will append it to the <td> tag with class="leave-taken"

        //before appending the table row, we need to know whether this is a working or a non working day.
        //so that we can gray out the row if it is a non workinmg day
        //the current day is in the variable day.
        //we will use the shiftList to find out whether this is a working day or not
        //we need to get the day as an integer. Sunday is 0 and Saturday is 6
        var dayOfTheWeekInteger = getDayOfWeek(fullDate);
        var shift = shiftList[dayOfTheWeekInteger];
        //now we need to check if this is a working day or not
        //if it is not a working day, then we need to gray out the row
        if (shift && shift.workingDay === 0) {
            $("#timeTableBody").append(`<tr id=${fullDate} class="nonWorkingDay">
                        <td>${day}</td>
                        <td>${fullDate}</td>
                        <td>--:--</td>
                        <td>--:--</td>
                        <td>--:--</td>
                        <td class="late">--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td class="hidden-column-default">--</td>
                        <td class="leave-taken"></td>
                    </tr>`)
        }
        else {
            $("#timeTableBody").append(`<tr id=${fullDate} class="workingDay">
                        <td>${day}</td>
                        <td>${fullDate}</td>
                        <td>--:--</td>
                        <td>--:--</td>
                        <td>--:--</td>
                        <td class="late">--</td>
                        <td>--</td>
                        <td>--</td>
                        <td>--</td>
                        <td class="hidden-column-default">--</td>
                        <td class="leave-taken"></td>
                    </tr>`)
        }

        //the id is in a format that is not allowed by jquery.
        //because the date is in the format dd/MM/yyyy and jquery does not allow the / character in the id
        //we will use vanilla javascript to select the element and append the absenceTypesSelect to it
        if (shift && shift.workingDay == 1) //append the leave types only for working days..Employee can't take a leave on non working days
            document.getElementById(`${fullDate}`).getElementsByClassName("leave-taken")[0].appendChild(absenceTypesSelect);


        // Increment the date by one day
        startDateForTimesheet = addDay(startDateForTimesheet);


    }
    //binding the event handler for the absence type dropdown list
    EventsFunctions.lateBindingAfterInitializationOfAbsenceElements();

    $('.absenceTypesSelect').select2({
        theme: "classic"
    });

}

function addDay(date) {
    var result = new Date(date);
    result.setDate(result.getDate() + 1);
    return result;
}

//Key/Main function whereby Everything Timesheet related happens here.
function LoadCheckInCheckOutTimes(entries, approvedClockOuts, template, shiftList, cummulateLatenessEarlyLeaving, cummulateOvertimeEarlyArrivals, cummulateOvertimeLateLeaving, shiftWrapper) {

    if (template == "day") {
        for (let key in entries) {
            if (entries.hasOwnProperty(key)) {
                punch_times = entries[key];
                checkInTime = punch_times[0].time;
                if (punch_times.length >= 2)
                    checkOutTime = punch_times[punch_times.length - 1].time;
                else
                    checkOutTime = "Not registered";

                //Fill row data
                var row = document.getElementById(`${key}`);
                var dayOfTheWeekInteger = getDayOfWeek(key);
                if (row) {

                    // Set the check-in time
                    row.children[2].textContent = checkInTime;
                    row.children[2].setAttribute('data-checkInTime', checkInTime);

                    // Set the check-out time
                    row.children[3].textContent = checkOutTime;
                    row.children[3].setAttribute('data-checkOutTime', checkOutTime);

                    // Set the approved check-out time by first checking if there is an approved overtime or Clock out time for this date
                    if (approvedClockOuts[`${key}`]) {
                        var approvedClockOutTime = approvedClockOuts[`${key}`][0].approvedClockOutTimeOnly;
                    }
                    else {
                        var approvedClockOutTime = 0;
                    }
                    
                    BeingCalledByOtherFunctions.createInputDivsInTimesheet(row, approvedClockOutTime, 4);

                    // Set the lateness in minutes
                    var shift = shiftList[dayOfTheWeekInteger];
                    var lateness = 0;
                    if (shift.workingDay == 1 && ($(row.children[10]).find('.absenceTypesSelect').val()) == 0) lateness = calculations.calculateLateness(checkInTime, checkOutTime, shiftList, cummulateLatenessEarlyLeaving, dayOfTheWeekInteger, approvedClockOutTime);
                    row.children[5].textContent = lateness;
                    row.children[5].setAttribute('data-lateness', lateness);

                    // Set the overtime
                    //pass the shift.workingDay as parameter. If its a non working day, we will not calculate the overtime, we will calculate the number of hours worked instead and put it in extra hours
                    var overtime = 0;
                    if (shift.workingDay == 1 && ($(row.children[10]).find('.absenceTypesSelect').val()) == 0) {
                        var overtimeObj = calculations.calculateOvertime(checkInTime, checkOutTime, shiftList, cummulateOvertimeEarlyArrivals, cummulateOvertimeLateLeaving, dayOfTheWeekInteger, approvedClockOutTime, shift.workingDay);
                        overtime = overtimeObj.totalOvertime;
                        var mealAllowanceGiven = overtimeObj.mealAllowanceGiven;
                        if (mealAllowanceGiven) row.children[6].setAttribute('data-meal-allowance', 1);
                    }
                    row.children[6].textContent = overtime;
                    row.children[6].setAttribute('data-overtime', overtime);

                    // Set the net adjustment
                    var netAdjustment = 0;
                    if (approvedClockOuts[`${key}`]) {
                        var netAdjustmentApproved = approvedClockOuts[`${key}`][0].netAdjust;
                        netAdjustment = netAdjustmentApproved;
                    }
                    else {
                        netAdjustment = overtime - lateness;
                    }
                    //row.children[7].textContent = netAdjustment;
                    BeingCalledByOtherFunctions.createInputDivsInTimesheet(row, netAdjustment, 7);
                    row.children[7].setAttribute('data-netAdjustment', netAdjustment);

                    //setting the extra overtime
                    var overtimeResults = calculations.calculateExtraAndExceptionalOvertime(checkInTime, checkOutTime, approvedClockOutTime, row.className === 'workingDay', shiftWrapper.ExceptionalOvertimeHours);
                    // Now, overtimeResults has the returned object, and we can access ExceptionalOvertimeDone and ExtraOvertimeDone like this:
                    var exceptionalOvertimeDone = overtimeResults.ExceptionalOvertimeDone;
                    var extraOvertimeDone = overtimeResults.ExtraOvertimeDone;
                    if (approvedClockOuts[`${key}`]) {
                        var extraOvertimeApproved = approvedClockOuts[`${key}`][0].ExtraOvert;
                        var exceptionalOvertimeApproved = approvedClockOuts[`${key}`][0].ExceptOvert;
                        extraOvertimeDone = extraOvertimeApproved;
                        exceptionalOvertimeDone = exceptionalOvertimeApproved;
                    }
                    BeingCalledByOtherFunctions.createInputDivsInTimesheet(row, extraOvertimeDone, 8);
                    row.children[8].setAttribute('data-extraovertime', extraOvertimeDone);

                    BeingCalledByOtherFunctions.createInputDivsInTimesheet(row, exceptionalOvertimeDone, 9);
                    row.children[9].setAttribute('data-exceptionalovertime', exceptionalOvertimeDone);

                }
                else {
                    console.log(`No clock-in and clock-out found for date: ${key}.Employee must be absent or its irrelevant data,not being used in this context.`);
                }
            }
        }
    }

    return null;
}

function grayOutIgnoredRows() {
    $('.actionBtn').on('change', function () {
        var selectedOption = $(this).find('option:selected').val();
        if (selectedOption == 1) {
            $(this).closest('tr').css('background-color', '#d3d3d3');
        }
        else {
            $(this).closest('tr').css('background-color', '#ffffff');
        }
        var jwtToken = getCookie("jwttoken");
        var idPrimaryKey = $(this).closest('tr').attr("idPrimaryKey");

        jQuery.ajax({
            type: "POST",
            url: "timesheet.aspx/UpdatePunchDataIgnoreStatus", //It calls our web method  
            data: JSON.stringify({ idPrimaryKey: idPrimaryKey, isIgnored: selectedOption }),
            headers: {
                'Authorization': 'Bearer ' + jwtToken
            },
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            success: function (nbRowsAffected) {
                if (nbRowsAffected.d == null) {
                    window.location.href = '/Login_New.aspx?discon=true';
                }

                if (nbRowsAffected.d == 0) {
                    displayErrorMessage("Error occurred while updating the punch data", true);
                    return;
                }
                //now we simulate a click on the select2 dropdown to reload the timesheet
                var $current = $('.timesheetEmpSelect2').find(':selected');
                $('.timesheetEmpSelect2').val($current.val()).trigger('change');

                displaySuccessMessage("Punch data updated successfully");
            },
            error: function (xhr, status, error) {
                console.error("Error occurred: ", status, error);
                // Additional error handling
            }
        });


    });
}

//Function that is being called when clicking on the "Add Time button"
function loadFPAdditionModal() {
    var currentMonth = $(".clsFirstUnlockedPeriod").attr("month");
    var currentYear = $(".clsFirstUnlockedPeriod").attr("year");
    var isLocked = isLockedPeriod(currentMonth, currentYear);
    if (isLocked) {
        displayWarningHtml("This period is <b>locked</b>. You cannot add times");
        return;
    }
    $('#exampleModalCenter').modal('show');
}

function validateTimeEntry() {
    var empIDToAddTime = $(".timesheetEmpSelect2").val();
    var dateToAdd = $(".dateToAdd").val();
    var timeToAdd = $(".timeToAdd").val();

    jQuery.ajax({
        type: "POST",
        url: "timesheet.aspx/addTimeDetails", //It calls our web method
        data: JSON.stringify({
            emp_pin: empIDToAddTime, dateToAdd: dateToAdd, timeToAdd: timeToAdd
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            if (msg.d == 1) {
                displaySuccessMessage("Fingerprint successfully added for this date/time");
                var $current = $('.timesheetEmpSelect2').find(':selected');
                $('.timesheetEmpSelect2').val($current.val()).trigger('change'); //Reload the timesheet and attendance data
                $('#exampleModalCenter').modal('hide'); //Hide the modal
                //if (isModal == 1) reloadThisEmp();
                //else loadAdvances();
            }
            if (msg.d == 0) {
                displayErrorMessage("Error while adding time", true);
            }
        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}

function readFirstUnlockedPeriod() {

    jQuery.ajax({
        type: "GET",
        url: "timesheet.aspx/readFirstUnlockedPeriod", //It calls our web method  
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            var x = 0;
            //msg.d.month contains the month (January starts at 0)
            //msg.d.year contains the year
            //set the month and year in the monthpicker
            //since month(found inside msg.d.month) is zero indexed and the monthpicker is not zero indexed 
            //we need to add 1 to the month
            $(".clsFirstUnlockedPeriod").val(msg.d.year + "-" + (1 + msg.d.month).toString().padStart(2, '0'));

            //Now we are saving these month and year values in hidden attributes so that we can pass them as parameters in other functions when needed
            $(".clsFirstUnlockedPeriod").attr("month", msg.d.month);
            $(".clsFirstUnlockedPeriod").attr("year", msg.d.year);

        },
        failure: function (msg) {
            displayErrorMessage(msg, true);
        }
    });
}
