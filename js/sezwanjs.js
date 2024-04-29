//global variable declaration
var absenceIndex;
var sickLeaves = 0;
var localLeaves = 0;
var unapprovedAbsences = 0;
var totOvertime = 0.00;
var totOvertimeFloatOnly = 0.00;
var allCurrentEmployees;
var noWorkingDays = 0;
var currentEmpName;
var actualfinalizedDetailsObj;
var localsLeft = 0;
var sicksLeft = 0;
var approvedHoliday = 0;
var periodLocked = true;
var mealAllowance = 0;
var dependants = 0;
var csgValue;
var nsfValue;
var advanceTaken;

$(document).ready(function () {
    hideUnecessaryItems();
});

function computePAYE(dependants, grossSalary, refunds) {
    loadGovDetailsFromDB();
    //PAYE CALCULATION
    //threshold for those having 0 child is threshold0, 1 child is threshold1, 2 children is threshold2 etc...
    var threshold0 = payezerodep / 13;
    var threshold1 = payeonedep / 13;
    var threshold2 = payetwodep / 13;
    var threshold3 = payethreedep / 13;
    var threshold4 = payefourdep / 13;
    var thresholdActualToBeUsed;
    var payePercentage;

    if (dependants == 0 || dependants == null) {
        thresholdActualToBeUsed = threshold0;
    }
    else if (dependants == 1) {
        thresholdActualToBeUsed = threshold1;
    }
    else if (dependants == 2) {
        thresholdActualToBeUsed = threshold2;
    } else if (dependants == 3) {
        thresholdActualToBeUsed = threshold3;
    }
    else if (dependants >=4) {
        thresholdActualToBeUsed = threshold4;
    }

    //must calculate the PAYE amount but remove the PAYE NON DEDUCTIBLE ALLOWANCES SUCH AS TELEPHONE
    var PAYEToBePaid = grossSalary - thresholdActualToBeUsed - parseFloat(refunds);
    var GrossSalMinusRefunds = grossSalary - parseFloat(refunds);
    if (PAYEToBePaid < 0) PAYEToBePaid = 0;

    //now we need to check the value of the PAYE to be paid in order to find the % PAYE to use
    if (GrossSalMinusRefunds <= (payeLessText / 13)) payePercentage = payeLessVal/100;
    if ((GrossSalMinusRefunds < (payeLessText / 13)) && GrossSalMinusRefunds >= (payeMoreText/13)) payePercentage = payeMiddleVal/100;
    if (GrossSalMinusRefunds > (payeLessText / 13)) payePercentage = payeMoreVal/100;

    PAYEToBePaid = Math.round(PAYEToBePaid * 100 * payePercentage) / 100;

    document.getElementById("idPAYE").innerHTML = PAYEToBePaid;

    return PAYEToBePaid;
}

function hideUnecessaryItems() {
    //the cookie saves the admin Index (from the login page)
    if (document.cookie == 8) {
        $("li").hide();
        $(".showAdmin").parent().parent().show();
        $(".fixedSalCss").html("<br/><br/><br/>");
        $("#idBtnPayslip").hide();
    }
}

function loadEmployee() {
    emp_arr = new Array();
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/loadEmployees", //It calls our web method  
        data: '{}',
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (lstEmp) {
            for (i = 0; i < lstEmp.d.length; i++) {
                $("#employeeList").append('<option value="' + lstEmp.d[i].emp_pin + '">' + lstEmp.d[i].emp_firstname + " " + lstEmp.d[i].emp_lastname + '</option>');
            }
            selectCurrentMonth();
            allCurrentEmployees = lstEmp.d;

        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function calcTotOvertime() {

    $(".workingDay").each(function () {
        var overt = $(this)[0].getElementsByClassName("netovertime")[0];
        var overtimeAsSecondSplitted;
        var overtimeAsSecond;
        if (overt != undefined) {
            //check if time is positive or negative
            if (overt.innerHTML.charAt(0) == '-') {
                //this means that the time is negative and must be subtracted
                //convert the time string into seconds 
                overtimeAsSecondSplitted = overt.innerHTML.split(':');
                overtimeAsSecond = ((-overtimeAsSecondSplitted[0]) * 60 * 60) + ((+overtimeAsSecondSplitted[1]) * 60);
                //check if the overtime is negative or positive
                totOvertime = totOvertime - overtimeAsSecond;
            }

            else {
                //else the time is positive and must be added
                //convert the time string into seconds 
                overtimeAsSecondSplitted = overt.innerHTML.split(':');
                overtimeAsSecond = ((+overtimeAsSecondSplitted[0]) * 60 * 60) + ((+overtimeAsSecondSplitted[1]) * 60);
                //check if the overtime is negative or positive
                totOvertime = totOvertime + overtimeAsSecond;
            }
        }
    });

    if (totOvertime != undefined && totOvertime != 0) {
        //convert the total overtime back to hours and minutes from seconds
        if (totOvertime < 0) {
            totOvertime = totOvertime * -1;
            var totOvertimeHours = Math.floor(totOvertime / 3600);
            var totOvertimeMinusHours = totOvertime - (totOvertimeHours * 60 * 60);
            var totOvertimeMinutes = Math.floor(totOvertimeMinusHours / 60);
            totOvertimeMinutes = totOvertimeMinutes / 60;
            totOvertime = totOvertimeHours + totOvertimeMinutes;
            totOvertime = parseFloat(totOvertime).toFixed(3);
            totOvertimeFloatOnly = "-" + totOvertime;
            totOvertime = "- " + totOvertime + " hours";
        }
        else {
            var totOvertimeHours = Math.floor(totOvertime / 3600);
            var totOvertimeMinusHours = totOvertime - (totOvertimeHours * 60 * 60);
            var totOvertimeMinutes = Math.floor(totOvertimeMinusHours / 60);
            totOvertimeMinutes = totOvertimeMinutes / 60;
            totOvertime = totOvertimeHours + totOvertimeMinutes;
            totOvertime = parseFloat(totOvertime).toFixed(3);
            totOvertimeFloatOnly = totOvertime;
            totOvertime = totOvertime + " hours";
        }
    }
    else if (totOvertime == 0) {
        totOvertimeFloatOnly = totOvertime;
    }
}

function selectCurrentMonth() {
    var currentd = new Date();
    var currentm = currentd.getMonth();
    var currenty = currentd.getFullYear();
    var indexYearToSearch = currenty - 2019;
    $("#month option:eq(" + currentm + ")").attr('selected', 'selected');
    $("#year option:eq(" + indexYearToSearch + ")").attr('selected', 'selected');
}

function SaveAbsApproved(saveBtnObj) {
    var dateToExport = saveBtnObj.parentNode.parentElement.id;
    alert("Hello owlrd_");
}

function loadPreviousMonthDates(daysInPreviousMonth, previousYear, previousMonth, previousDate) {
    //loading previous month data
    //this loop will loop from the first day of the previous month and create the table data to be displayed
    //starts from the variable 'StartDate' and ends on the last day of the previous month
    if (startMonth == "Previous") {
        for (var daySelected = startDate; daySelected <= daysInPreviousMonth; daySelected++) {
            previousDate = daySelected + "/" + previousMonth + "/" + previousYear;
            dateAsPerJS = new Date(previousYear, (previousMonth - 1), daySelected);
            if (dateAsPerJS.getDay() == 0) {
                $("#attData").append("<tr id='" + previousDate + "' class=" + 'holiday' + ">  <td>" + findDayFromDate(dateAsPerJS) + "</td> <td>" + previousDate + "</th><th  class=" + 'arrival' + "> N/A </td><td class=" + 'departure' + "> N/A </td><td class=" + 'approved' + ">N/A</td><td class=" + 'lateness' + "> N/A </td><td class=" + 'overtime' + "> N/A </td><td class=" + 'netovertime' + "> N/A </td><td></td></tr>");
            }
            else {
                $("#attData").append("<tr id='" + previousDate + "'> <td>" + findDayFromDate(dateAsPerJS) + "</td> <td>" + previousDate + "</td><td  class=" + 'arrival' + "></td><td class=" + 'departure' + "></td><td  class=" + 'approved' + "><input name='" + previousDate + "' class=" + 'approvedtime' + " value='x" + "' type=" + 'text' + "></input></td><td class=" + 'lateness' + "></td><td class=" + 'overtime' + "> N/A </td><td class=" + 'netovertime' + "> N/A </td><td id='absenceBlock'><select name='" + previousDate + "' onchange='saveAbsenceDetails(this);' id='absenceApproval' class='absenceApproval'><option value='0'>Leave taken?</option><option value='1'>Sick</option><option value='2'>Half Sick</option><option value='3'>Local</option><option value='4'>Half Local</option><option value='5'>Holiday</option><option value='6'>Approved Holiday</option><option value='7'>Half Unapproved</option></select></td></tr>");
            }
        }
    }
}

function findAbsentDays() {
    //looping through the times to find if employee was present/absent 
    //or has not registered his fingerprint data for that day
    $("tr").each(function () {
        var arrivalTime = $(this).find(".arrival").html();
        var DepartureTime = $(this).find(".departure").html();
        if (arrivalTime == "" && DepartureTime == "") {

            //writing absent in the column 
            $(this).children()[4].innerHTML = "ABSENT";
            $(this).children()[5].innerHTML = "";
            $(this).children()[6].innerHTML = "";
            $(this).children()[7].innerHTML = "";

            //inputting the red color on the absent fields
            $(this).children()[2].style.backgroundColor = "red";
            $(this).children()[3].style.backgroundColor = "red";
            $(this).children()[4].style.backgroundColor = "red";
            $(this).children()[4].style.paddingLeft = "110px";
            $(this).children()[5].style.backgroundColor = "red";
            $(this).children()[6].style.backgroundColor = "red";
            $(this).children()[7].style.backgroundColor = "red";

        }
        else if (arrivalTime == "") {
            $(this).children()[2].innerHTML = "NOT REGISTERED";
        }

        else if (DepartureTime == "") {
            $(this).children()[3].innerHTML = "NOT REGISTERED";
            $(this).children()[3].style.backgroundColor = "#ff4f4f";
        }
    });
}

function calculateLateness() {
    //lateness calculation
    //looping through each table row
    $(".workingDay").each(function () {
        var clockInTime = $(this).children()[2].innerHTML;
        var clockOutTime = $(this).children()[3].innerHTML;
        var approvedClockOutTime;

        $(this).children()[4].innerHTML == 'N/A' || $(this).children()[4].children[0] == undefined ? approvedClockOutTime = clockOutTime : approvedClockOutTime = $(this).children()[4].children[0].value;

        if (CLEL == true) var lateMinsDeparture = calcLateFromDeparture(clockOutTime, approvedClockOutTime, this);
        else var lateMinsDeparture = calcLateFromDeparture(approvedClockOutTime, approvedClockOutTime, this);

        var lateMinsArrival = calcLateFromArrival(clockInTime, this);

        computeAndDisplayTotalLateness(lateMinsArrival, lateMinsDeparture, this);
    });
}

function calculateOvertime() {

    $(".workingDay").each(function () {
        var clockInTime = $(this).children()[2].innerHTML;
        var clockOutTime = $(this).children()[3].innerHTML;
        var approvedClockOutTime;

        ($(this).children()[4].innerHTML == 'N/A' || $(this).children()[4].children[0] == undefined) ? approvedClockOutTime = clockOutTime : approvedClockOutTime = $(this).children()[4].children[0].value;

        if (COAR == true) var OvertimeMinsArrival = calcOverFromArrival(clockInTime, this);
        else var OvertimeMinsArrival = 0;

        if (COLL == true) var OvertimeMinsDeparture = calcOverFromDeparture(clockOutTime, approvedClockOutTime, this);
        else var OvertimeMinsDeparture = calcOverFromDeparture(approvedClockOutTime, approvedClockOutTime, this);

        computeAndDisplayTotalOvertime(OvertimeMinsArrival, OvertimeMinsDeparture, this);

    });

}

function calculateNetOvertime() {

    $(".workingDay").each(function () {
        //get lateness
        var latenessAmount = $(this).children()[5].innerHTML;

        //get overtime 
        var overtimeAmount = $(this).children()[6].innerHTML;

        var diffNetOvertime = (new Date("1970-1-1 " + overtimeAmount) - new Date("1970-1-1 " + latenessAmount)) / 1000 / 60 / 60;

        if (diffNetOvertime >= 0) {

            var diffNetOvertimeHours = Math.floor(diffNetOvertime);
            var diffNetOvertimeMinutes = (diffNetOvertime - diffNetOvertimeHours) * 60;
            diffNetOvertimeMinutes = Math.round(diffNetOvertimeMinutes);
            if (diffNetOvertimeMinutes < 10) {
                diffNetOvertimeMinutes = "0" + diffNetOvertimeMinutes;
            }

            //display net overtime
            $(this).children()[7].innerHTML = diffNetOvertimeHours + ":" + diffNetOvertimeMinutes;
        }
        else {
            diffNetOvertime = Math.abs(diffNetOvertime);
            var diffNetOvertimeHours = Math.floor(diffNetOvertime);
            var diffNetOvertimeMinutes = (diffNetOvertime - diffNetOvertimeHours) * 60;
            diffNetOvertimeMinutes = Math.round(diffNetOvertimeMinutes);
            if (diffNetOvertimeMinutes < 10) {
                diffNetOvertimeMinutes = "0" + diffNetOvertimeMinutes;
            }

            //display net overtime
            $(this).children()[7].innerHTML = "-" + diffNetOvertimeHours + ":" + diffNetOvertimeMinutes;
        }
    });
}

function fillDetailsDiv() {

    //find the holiday extra pay before overwriting it
    var holidayPayValue = $("#idHolidayHoursTBOX").val();
    holidayPayValue = parseInt(holidayPayValue);
    if (holidayPayValue != "") {
        $("#fixedDivDetails").html("<i class='fa minBtn fa-solid fa-arrow-right cssBtnSlider' onclick='sliderRight()'></i><br/>Holiday/Extra pay (in hours) <input name='holidayHours' id='idHolidayHoursTBOX' type='text' value='" + holidayPayValue + "' /> <div onclick='validateData(this)' class='fas fa-check-circle fa-lg tickValidate'> </div> ");
    }
    else {
        $("#fixedDivDetails").html("<i class='fa  minBtn fas fa-2x fa-arrow-right cssBtnSlider' onclick='sliderRight()'></i><br/>Holiday/Extra pay (in hours) <input name='holidayHours' id='idHolidayHoursTBOX' type='text' value='0' /> <div onclick='validateData(this)' class='fas fa-check-circle fa-lg tickValidate'> </div> ");
    }
    $("#fixedDivDetails").append("<div> Meal Allowance <input name='mealAllow' id='idMealAllowTBOX' type='text' value='" + mealAllowance + "' /></div> ");
    $("#fixedDivDetails").append("<div> Details for the month: </div>");
    $("#fixedDivDetails").append("<div> Local leaves left for this year:" + localsLeft + "</div>");
    $("#fixedDivDetails").append("<div> Sick leaves left for this year:" + sicksLeft + "</div>");
    $("#fixedDivDetails").append("<div> No. of unapproved absences: " + unapprovedAbsences + "</div>");
    $("#fixedDivDetails").append("<div> No. of local leaves taken:" + localLeaves + "</div>");
    $("#fixedDivDetails").append("<div> No. of sick leaves taken:" + sickLeaves + "</div>");
    $("#fixedDivDetails").append(`<div class='cssDisplayInline'> Total Overtime: ` + totOvertime + `</div>
                    <label class="check">
                        <input type="checkbox" id="cbxDedAttBonus">
                        <div class='attBonusDeduct'>Deduct from bonus<div class='tooltiptext'>Deduct from Attendance bonus(if any)</div></div>
				    </label>`);
    $("#fixedDivDetails").append("<div> No. of working days:" + noWorkingDays + "</div>");
    $("#fixedDivDetails").append(`
            <button type='button' id='idbtnAddTime' data-toggle='modal' data-target='#addTimeModal' class='btn btn-secondary  btnTime' onclick=''>Add time</button>
            <button type='button' id='idBtnPayslip' data-toggle='modal' data-target='#payslipModal' class='btn btn-warning btnPayroll' onclick='validateData(this)'>Generate Payslip</button>`);
    hideUnecessaryItems();
}

function slideRight() {
    $("#fixedDivDetails").show("slide", { direction: "right" }, 1000);
}

function sliderRight() {
    // To slide something leftwards into view,
    // with a delay of 1000 msec
    $("#fixedDivDetails").hide("slide", { direction: "right" }, 1000);
}

function calcPerfBonus(sickTaken, localTaken, unappTaken, perfBonus) {
    if (unappTaken > 0) return 0;

    totalTaken = sickTaken + localTaken;

    var excessTaken = totalTaken - perfDeductThresh;

    if (excessTaken <= 0) return perfBonus;

    if (excessTaken <= 1) return perfBonus * 0.667;

    if (excessTaken <= 2) return perfBonus * 0.333;

    else return 0;
}

function calcAttBonus(sickTaken, unappTaken, attBonusRate, dailyRate) {
    var totAmountToDed = 0;

    if ($("#cbxDedAttBonus")[0].checked) totAmountToDed = parseFloat((dailyRate * totOvertimeFloatOnly * -1)/8);
    var attBonusSemiFinalValue;
    var excessSickTaken = sickTaken - attDeductThresh;
    if (unappTaken > 0) attBonusSemiFinalValue = 0;
    else if (excessSickTaken <= 0) attBonusSemiFinalValue = attBonusRate;
    else if (excessSickTaken <= 1) attBonusSemiFinalValue = (attBonusRate * 0.667);
    else if (excessSickTaken <= 2) attBonusSemiFinalValue = (attBonusRate * 0.333);
    else attBonusSemiFinalValue = 0;

    //calculate the final att bonus amount after deducting the negative overtime.
    if (totAmountToDed == 0) return attBonusSemiFinalValue;
    else return (attBonusSemiFinalValue - totAmountToDed).toFixed(2);

}

function loadCompDetailsInPayslip() {

    $("#compAddress").html(sessionStorage.getItem('companyName') + "<br/>" + sessionStorage.getItem('CompAddress') + `
        <br/>
        Email: `+ sessionStorage.getItem('email') + ` &nbsp &nbsp VAT No.: ` + sessionStorage.getItem('VAT') + ` &nbsp &nbsp BRN: ` + sessionStorage.getItem('BRN') + `
        <br/>
    Tel: `+ sessionStorage.getItem('telNum') + ` &nbsp &nbsp Fax: ` + sessionStorage.getItem('faxNum'));

}

function generatePayslip() {

    //Need to load the company details from the session variables to be inserted in the payslip
    loadCompDetailsInPayslip();

    //first we need to get the required details from the appropriate table.
    //we just need the employee pin to begin searching for everything
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var pinAloneArray = currentEmpPin.split("?");
    currentEmpIndex = pinAloneArray[0];
    //now the emp pin is saved in currentEmpIndex
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/LoadEmpPayslipDetails", //It calls our web method  
        data: JSON.stringify({
            emp_pin: currentEmpIndex
        }),
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {

            //start by hiding the additional details that the user can write if he wishes
            $("#addedDeduct1").hide();
            $("#addedDeduct11").hide();
            $("#addedAdd1").hide();
            $("#addedAdd11").hide();
            $("#addedDeduct2").hide();
            $("#addedDeduct22").hide();
            $("#addedAdd2").hide();
            $("#addedAdd22").hide();
            $("#addedDeduct3").hide();
            $("#addedDeduct33").hide();

            var hireDate = msg.d["hireDate"];
            var occupation = msg.d["occupation"];
            var NID = msg.d["NID"];
            var basicSalary = msg.d["basicSalary"];
            var perfBonus = msg.d["perfBonus"];
            var commission = msg.d["commission"];
            var travellingPerDay = msg.d["travellingPerDay"];
            var telephone = msg.d["telephone"];
            var prefOvertime = msg.d["prefOvertime"];
            var attBonusRate = msg.d["attBonus"];
            var valueMealAllow = document.getElementById("idMealAllowTBOX").value;

            //global variables(used for PAYE calculation)
            dependants = msg.d["dependants"];

            loadFinalizedDetailsForPayslip();

            var WorkingDaysActual = actualfinalizedDetailsObj["workingDays"];
            var actualTotalOvertime = actualfinalizedDetailsObj["overtimeHours"];
            var actualTotalHolidayHours = actualfinalizedDetailsObj["holidayExtraHours"];
            var sickDaysActual = actualfinalizedDetailsObj["sick"];
            var localDaysActual = actualfinalizedDetailsObj["local"];
            var unapprovedDaysActual = actualfinalizedDetailsObj["unapproved"];
            var totalAbs = parseFloat(sickDaysActual) + parseFloat(localDaysActual) + parseFloat(unapprovedDaysActual);
            totalAbs = parseFloat(totalAbs);

            //calculation of the meal allowance to give the employee
            //the rate is currently hard coded at Rs125.
            //Note for Myself(Azhar)::: Kindly Remove the hard coding and adjust the meal allowance rate for variable rates to be given
            var finalValueMeal = valueMealAllow * 125;

            //calculation of the travelling to pay the employee
            //if the travelling per day is more than 500 it means that we are giving a fixed travelling for this person
            //NOTE to Azhar: TO CHANGE THIS HARDCODING AND ADJUST FOR VARIABLE AMOUNTS OF FIXED TRAVELLING ALLOWANCE
            if (travellingPerDay > 500) {
                totalTransportToBePaid = travellingPerDay;
                if (totalAbs > 0) {
                    totalTransportToBePaid = (totalTransportToBePaid * WorkingDaysActual) / 26;
                    totalTransportToBePaid = Math.round(totalTransportToBePaid * 100) / 100;
                }
            }
            else {
                totalTransportToBePaid = travellingPerDay * WorkingDaysActual;
            }

            //calculating the overtime rate per hour worked
            //if the employee has a preferential overtime rate (use the basic pay + performance bonus when calculating overtime)
            var overtimeRatePerHour = prefOvertime == 1 ? (((basicSalary + perfBonus) / 26) / 8) * 1.5 : ((basicSalary / 26) / 8) * 1.5;

            var totalOvertime = Math.round(overtimeRatePerHour * actualTotalOvertime);

            //calculation of the advance taken to be deducted from the payslip (if any)
            retrieveAdvances();

            //calculation of the CSG and the NSF 
            calculateCsgNsf(basicSalary);

            //Calculating the unapproved absence deduction rate (daily work rate)
            var unappAbsDeductionRate = basicSalary / 26;

            //calculation of the performance bonus to be paid
            perfBonus = calcPerfBonus(sickLeaves, localLeaves, unapprovedAbsences, perfBonus);
            //calculation of the attendance bonus
            var attBonusValueFinal = calcAttBonus(sickLeaves, unapprovedAbsences, attBonusRate, unappAbsDeductionRate);

            var unappAbsAmount = unappAbsDeductionRate * actualfinalizedDetailsObj["unapproved"];
            if (attBonusValueFinal < 0) {
                unappAbsAmount = unappAbsAmount - attBonusValueFinal;
                attBonusValueFinal = 0;
            }
            unappAbsAmount = Math.round(unappAbsAmount * 100) / 100;

            if (actualTotalHolidayHours >= 0) {
                var holidayHoursRate = (overtimeRatePerHour / 1.5) * 2;
                actualTotalHolidayHours = actualTotalHolidayHours * holidayHoursRate;
                if (actualTotalHolidayHours > 0)
                    actualTotalHolidayHours = Math.round(actualTotalHolidayHours * 100) / 100;
            }
            else actualTotalHolidayHours = 0;

            //calculating the grossSalary
            var grossSalary = Math.round(basicSalary + perfBonus + commission + actualTotalHolidayHours + totalTransportToBePaid + totalOvertime + parseInt(finalValueMeal) + parseInt(attBonusValueFinal) + parseFloat(telephone));

            //calculation and display of the PAYE to be paid
            var PAYEToBePaid = computePAYE(dependants, grossSalary, telephone);

            //calculating the total deductions
            var totalDeductions = Math.round(csgValue + nsfValue + PAYEToBePaid + unappAbsAmount + parseInt(advanceTaken));

            //calculating and updating the net salary amount
            var netSalary = Math.round(parseFloat(grossSalary) - parseFloat(totalDeductions));

            fillPayslipDetails(currentEmpName, occupation, hireDate, NID, basicSalary, commission, telephone, perfBonus, attBonusValueFinal, finalValueMeal, totalTransportToBePaid, totalOvertime, actualTotalOvertime, csgValue, nsfValue, unappAbsAmount, actualTotalHolidayHours, grossSalary, PAYEToBePaid, totalDeductions, netSalary);
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function calculateCsgNsf(basicSalary) {
    //first check if basic salary is below or above threshold
    csgValue = basicSalary < thresholdAmnt ? ((basicSalary * percCsgBelow) / 100) : ((basicSalary * percCsgAbove) / 100);
    nsfValue = basicSalary < nsfCeiling ? ((basicSalary * nsfEmployee) / 100) : (nsfCeiling / 100);

    csgValue = Math.round(csgValue * 100) / 100;
    nsfValue = Math.round(nsfValue * 100) / 100;
}

function fillPayslipDetails(currentEmpName, occupation, hireDate, NID, basicSalary, commission, telephone, perfBonus, attBonusValueFinal, finalValueMeal, totalTransportToBePaid, totalOvertime, actualTotalOvertime, csgValue, nsfValue, unappAbsAmount, actualTotalHolidayHours, grossSalary, PAYEToBePaid, totalDeductions, netSalary) {
    document.getElementById("empNamePayslip").innerHTML = currentEmpName;
    document.getElementById("empJobPayslip").innerHTML = occupation;
    document.getElementById("empDOEPayslip").innerHTML = hireDate;
    document.getElementById("empIDPayslip").innerHTML = NID;
    document.getElementById("basicSalary").innerHTML = basicSalary;
    document.getElementById("idcommission").innerHTML = '<input type="number" id="IdCommissionAllowance" onkeyup="recalcTot();" value="' + commission + '"/>';
    document.getElementById("idTelephone").innerHTML = '<input type="number" id="IdRefunds" onkeyup="recalcTot();" value="' + telephone + '"/>';
    document.getElementById("perfBonus").innerHTML = '<input type="number" id="IdPerfBonus" onkeyup="recalcTot();" value="' + perfBonus + '"/>';
    document.getElementById("attBonus").innerHTML = attBonusValueFinal;
    document.getElementById("idMealAllowance").innerHTML = finalValueMeal;
    document.getElementById("idTravelling").innerHTML = totalTransportToBePaid;
    document.getElementById("idOvertime").innerHTML = totalOvertime;
    document.getElementById("overtimeTitle").innerHTML = "Overtime(" + actualTotalOvertime + " Hours) ";
    document.getElementById("idCSG").innerHTML = csgValue;
    document.getElementById("idNSF").innerHTML = nsfValue;
    document.getElementById("idAbsences").innerHTML = unappAbsAmount;
    document.getElementById("idHolidayHours").innerHTML = actualTotalHolidayHours;
    document.getElementById("idGrossSalary").innerHTML = grossSalary;
    document.getElementById("idDeductions").innerHTML = totalDeductions;
    document.getElementById("idNetSalary").innerHTML = netSalary;
}

function recalcTot() {

    //start by getting all the INCOMEs
    var basic = $("#basicSalary").html();
    var perf = $("#IdPerfBonus").val();
    var att = $("#attBonus").html();
    var comm = $("#IdCommissionAllowance").val();
    var meal = $("#idMealAllowance").html();
    var hold = $("#idHolidayHours").html();
    var refunds = $("#IdRefunds").val();
    var trav = $("#idTravelling").html();
    var overt = $("#idOvertime").html();
    var add1 = $("#addedAdd11").val();
    if (add1 == "") add1 = 0;
    var add2 = $("#addedAdd22").val();
    if (add2 == "") add2 = 0;

    var grossSalary = parseFloat(basic) + parseFloat(perf) + parseFloat(att) + parseFloat(refunds) + parseFloat(meal) + parseFloat(comm) + parseFloat(hold) + parseFloat(trav) + parseFloat(overt) + parseFloat(add1) + parseFloat(add2);
    document.getElementById("idGrossSalary").innerHTML = Math.round(grossSalary * 100) / 100;

    //recompute the PAYE and redisplay it
    computePAYE(dependants, grossSalary, refunds)

    //now get all the deductions
    var csg = $("#idCSG").html();
    var nsf = $("#idNSF").html();
    var paye = $("#idPAYE").html();
    var abs = $("#idAbsences").html();
    var adv = $("#idAdvanceTaken").html();
    var ded1 = $("#addedDeduct11").val();
    if (ded1 == "") ded1 = 0;
    var ded2 = $("#addedDeduct22").val();
    if (ded2 == "") ded2 = 0;
    var ded3 = $("#addedDeduct33").val();
    if (ded3 == "") ded3 = 0;

    var totalDeductions = parseFloat(csg) + parseFloat(nsf) + parseFloat(paye) + parseFloat(abs) + parseFloat(adv) + parseFloat(ded1) + parseFloat(ded2) + parseFloat(ded3);
    document.getElementById("idDeductions").innerHTML = totalDeductions;
    var netSalary = parseFloat(grossSalary) - parseFloat(totalDeductions);
    document.getElementById("idNetSalary").innerHTML = Math.round(netSalary * 100) / 100;
}

function loadFinalizedDetailsForPayslip() {

    //we use the emp pin, the month and the year to retrieve the validated employee details that have been finalized.
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    //now the emp pin, the current month and the current year have already been found. now we have to load the validated and finalized details
    //PLEASE NOTE THAT A PAYSLIP CANNOT BE GENERATED UNLESS THE FINALIZED DETAILS ALREADY EXIST
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/retrieveFinalDatas", //It calls our web method  
        data: JSON.stringify({
            emp_pin: currentEmpIndex, month: currentMonth, year: currentYear
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            if (msg.d == null || msg.d == undefined) {
                alert("UNDEFINED VALUES OBTAINED PLEASE CHECK the loadFinalizedDetailsForPayslip method (JS)");
            }
            else {
                var totalAbs = msg.d["unapproved"] + msg.d["sick"] + msg.d["local"];
                findApprovedHolidays();
            }
            actualfinalizedDetailsObj = msg.d;
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function findApprovedHolidays() {
    approvedHoliday = 0;
    $("tr").each(function () {
        var approvedAbs = $(this)[0].getElementsByClassName("approved")[0];
        if (approvedAbs != undefined)
            if (approvedAbs.innerHTML == "APPROVED HOLIDAY") {
                approvedHoliday = 1;
            }
    });
}

function validateData(holidayTxtBox) {

    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/checkLock", //It calls our web method  
        data: JSON.stringify({
            month: currentMonth, year: currentYear
        }),
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            periodLocked = msg.d;
        },
        failure: function (msg) {
            alert(msg);
        }
    });
    //first check if period has been locked. If locked, display error.
    //if not locked, proceed
    if (periodLocked) {
        alert("Period is locked");
    }
    else {

        //automatically fill the payslip with the correct month details
        var months = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var monthForPayslip = (parseInt(currentMonth) - 1);
        var yearForPayslip = parseInt(currentYear);
        var prevMonthForPayslip = monthForPayslip - 1;
        if (prevMonthForPayslip < 0) {
            prevMonthForPayslip = 11;
        }
        $("#idMonthYearPayslip").html(months[monthForPayslip] + " " + yearForPayslip);
        if (startMonth == "Previous") {
            $("#idBeginEndMonthPayslip").html(startDate + " " + months[prevMonthForPayslip] + " " + endDate + " " + months[monthForPayslip] + " " + yearForPayslip);
        }
        else if (startMonth == "Current") {
            $("#idBeginEndMonthPayslip").html(months[monthForPayslip] + " " + yearForPayslip);
        }

        if (totOvertimeFloatOnly <= 0) {
            var totalOvertimeToBePosted = 0.0
        }
        else var totalOvertimeToBePosted = totOvertimeFloatOnly;

        if (holidayTxtBox.parentElement.children[0].value == "") {
            postValidatedDataToDatabase(currentEmpIndex, currentMonth, currentYear, 0, unapprovedAbsences, noWorkingDays, localLeaves, sickLeaves, totalOvertimeToBePosted, holidayTxtBox);
        }
        else {
            var holidayHoursValue = $("#idHolidayHoursTBOX").val();
            holidayHoursValue = parseFloat(holidayHoursValue);
            if (isNaN(holidayHoursValue)) {
                alert("Please input a valid number of hours for holiday pay (as a decimal number)");
            }
            else {
                postValidatedDataToDatabase(currentEmpIndex, currentMonth, currentYear, holidayHoursValue, unapprovedAbsences, noWorkingDays, localLeaves, sickLeaves, totalOvertimeToBePosted, holidayTxtBox);
            }
        }
    }
}

function postValidatedDataToDatabase(currentEmpIndex, currentMonth, currentYear, holidayHoursValue, unapprovedAbsences, noWorkingDays, localLeaves, sickLeaves, totalOvertimeToBePosted, holidayTxtBox) {
    if (totalOvertimeToBePosted == 0) {
        totalOvertimeToBePosted = "0.00";
    }
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/postData", //It calls our web method  
        data: JSON.stringify({
            emp_pin: currentEmpIndex, month: currentMonth, year: currentYear, holidayHours: holidayHoursValue,
            unapprovedAbsences: unapprovedAbsences, noWorkingDays: noWorkingDays, localLeaves: localLeaves, sickLeaves: sickLeaves, totalOvertime: totalOvertimeToBePosted
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            if (holidayTxtBox.id == "idBtnPayslip")
                generatePayslip();
            else alert("Holiday hours successfully saved");
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function loadSelectedMonthDates(dateATM, dateAsPerJS, daysInTheMonth, selectedEmployee, selectedMonth, selectedYear) {
    //looping through the days of the currently selected month.
    //this loop displays the dates and days in the table

    endDate == 31 ? endDateLoop = daysInTheMonth : endDateLoop = endDate;

    for (dayATM = 1; dayATM <= endDateLoop; dayATM++) {
        dateATM = dayATM + "/" + selectedMonth + "/" + selectedYear;
        dateAsPerJS = new Date(selectedYear, (selectedMonth - 1), dayATM);
        if (dateAsPerJS.getDay() == 0) {
            $("#attData").append("<tr id='" + dateATM + "' class=" + 'holiday' + ">  <td>" + findDayFromDate(dateAsPerJS) + "</td> <td>" + dateATM + "</td><td  class=" + 'arrival' + "> N/A </td><td class=" + 'departure' + "> N/A </td><td class=" + 'approved' + ">N/A</td><td class=" + 'lateness' + "> N/A </td><td class=" + 'overtime' + "> N/A </td><td class=" + 'netovertime' + "> N/A </td><td></td></tr>");
        }
        else {
            $("#attData").append("<tr id='" + dateATM + "'> <td>" + findDayFromDate(dateAsPerJS) + "</td> <td>" + dateATM + "</td><td  class=" + 'arrival' + "></td><td class=" + 'departure' + "></td><td  class=" + 'approved' + "><input name='" + dateATM + "' class=" + 'approvedtime' + " value='x" + "' type=" + 'text' + "></input></td><td class=" + 'lateness' + "></td><td class=" + 'overtime' + "> N/A </td><td class=" + 'netovertime' + "> N/A </td><td><select name='" + dateATM + "' id='absenceApproval' onchange='saveAbsenceDetails(this);' class='absenceApproval'><option value='0'>Leave taken?</option><option value='1'>Sick</option><option value='2'>Half Sick</option><option value='3'>Local</option><option value='4'>Half Local</option><option value='5'>Holiday</option><option value='6'>Approved Holiday</option><option value='7'>Half Unapproved</option></select></td></tr>");
        }
    }
}

function loadAttendance() {

    $("#employeeSelection").hide();
    $("#attDetails").css('visibility', 'inherit');
    $("#showSliderBtn").css('display', 'inherit');
    var selectedEmployee = $("#employeeList").children("option:selected").val();
    var selectedEmployeeName = $("#employeeList").children("option:selected").text();
    var selectedMonth = $("#month").children("option:selected").val();
    var selectedYear = $("#year").children("option:selected").val();
    window.history.replaceState(null, null, "?emp_pin=" + selectedEmployee + "?month=" + selectedMonth + "?year=" + selectedYear);
    loadEmpDetails(selectedEmployee, selectedMonth, selectedYear);
    currentEmpName = selectedEmployeeName;
    $("#EmpName").html(selectedEmployeeName);

    //getting the hiredate using the employe pin
    //employee pin is saved in the variable: selected Employee.
    findEmployeeHireDate(selectedEmployee);

    //$("#prevName").html(allCurrentEmployees[(allCurrentEmployees.length - 1)].emp_firstname);
    //$("#nextName").html(allCurrentEmployees[1].emp_firstname);

    $("#prevName").html("Previous employee");
    $("#nextName").html("Next employee");
    sliderRight();
}

function showHome() {
    $("#employeeSelection").show();
}

$(document).ready(function () {
    var table = $('#table_id').DataTable({
        "paging": false,
        "ordering": false,
        "info": false,
        "searching": false,
        "language": {
            "emptyTable": " "
        }
    });
    table.columns.adjust().draw();
});

//function used as a comparator to sort dates
function compare(a, b) {
    if (a.punch_time < b.punch_time) {
        return -1;
    }
    if (a.punch_time > b.punch_time) {
        return 1;
    }
    return 0;
}

function loadEmpDetails(selectedEmployee, selectedMonth, selectedYear) {
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/loadAttendance", //It calls our web method  
        data: JSON.stringify({ emp_pin: selectedEmployee, month: selectedMonth, year: selectedYear }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (att) {

            //display empty calender
            var daysInPreviousMonth = getDaysInMonth((selectedMonth - 1), selectedYear);
            var daysInTheMonth = getDaysInMonth(selectedMonth, selectedYear);
            var previousYear = selectedYear;
            var dateATM;
            var dateAsPerJS;
            var previousDate;
            var previousMonth = selectedMonth - 1;
            if (previousMonth < 10) {
                previousMonth = "0" + previousMonth;
            }
            if (selectedMonth == 01) {
                previousMonth = 12;
                previousYear = selectedYear - 1
            }

            loadPreviousMonthDates(daysInPreviousMonth, previousYear, previousMonth, previousDate);

            loadSelectedMonthDates(dateATM, dateAsPerJS, daysInTheMonth, selectedEmployee, selectedMonth, selectedYear);

            $(".holiday").css("background-color", "yellow");

            //re-order the list by date (Starts with earliest and end with latest)
            att.d.sort(compare);

            //start to loop through the actual attendance times
            //This loop will display each attendance time for the worker
            for (a = 0; a < att.d.length; a++) {
                //converting the date into javascript dateTime object
                var dateToFind = ToJavaScriptDateTime(att.d[a].punch_time);
                //finding the month from the punchtime (adding 1 because javascript dateTime object)
                var dateFinishedMonthOnly = dateToFind.getMonth() + 1;
                //adding the 0 digit if the month is less than 10 ( this is during display on the date column)
                //This is because 
                if (dateFinishedMonthOnly < 10)
                    dateFinishedMonthOnly = "0" + dateFinishedMonthOnly;
                var dateFinished = dateToFind.getDate() + "/" + dateFinishedMonthOnly + "/" + dateToFind.getFullYear();

                if (document.getElementById(dateFinished) != null) {
                    if (document.getElementById(dateFinished).getElementsByClassName("arrival")[0].innerHTML == "" || document.getElementById(dateFinished).getElementsByClassName("arrival")[0].innerHTML == " N/A ") {
                        document.getElementById(dateFinished).getElementsByClassName("arrival")[0].innerHTML = dateToFind.getHours() + ":" + dateToFind.getMinutes();
                        document.getElementById(dateFinished).getElementsByClassName("arrival")[0].parentElement.classList.add("workingDay");
                    }

                    else {
                        document.getElementById(dateFinished).getElementsByClassName("departure")[0].innerHTML = dateToFind.getHours() + ":" + dateToFind.getMinutes();
                    }
                }

            }

            //find the locals and sicks left for this person
            findAbsencesLeft();

            //find and display absent days
            findAbsentDays();

            //call the function that will initiliase the event listener for the textbox
            addEventListenerForApproved();

            //call the function that will fill the textboxes with the approved overtimes
            fillTextboxesWithApprovedTimes();

            //lateness calculation
            calculateLateness();

            //Overtime calculation
            calculateOvertime();

            //Calculate net overtime(that is; overtime minus lateness)
            calculateNetOvertime();

            fillAbsencesWithApprovedAbsences();

            //calculate total overtime taken
            calcTotOvertime();

            //calculate the number of working days for the employee
            calcWorkingDays();

            //calculate the number of Meal Allowance 
            calcMealAllowance();

            //in order to refresh the fixed details
            fillDetailsDiv();

            //check if net overtime is negative so that we hide the deduct from bonus button
            //it is very important that this function is called after the FillDetailsDiv function
            //this is because the "Deduct from bonus" button is being created in that function
            checkForNegativeOvertime();

            //load validated data (will load only the values for the holiday hours)
            loadValidatedHolidayHours();

            //check if period is locked to prevent payslip generation
            checkPeriodLock();

        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function checkForNegativeOvertime() {
    if (totOvertimeFloatOnly < 0) $(".check").css("display", "inline");
    else $(".check").css("display", "none");
}

function calcMealAllowance() {
    mealAllowance = 0;
    $("tr").each(function () {
        var overtimeDepartureElement = $(this).children()[4].firstElementChild;
        if (overtimeDepartureElement != null) {
            var overtimeDeparture = $(this).children()[4].firstElementChild.getAttribute('value');
        }
        else {
            var overtimeDeparture = "";
        }
        var actualOvertimeDeparture = toDate(overtimeDeparture);
        var overtimeHours = actualOvertimeDeparture.getHours();
        overtimeMinutes = actualOvertimeDeparture.getMinutes();

        var diffOvertime = (new Date("1970-1-1 " + overtimeHours + ":" + overtimeMinutes) - new Date("1970-1-1 " + "19:00")) / 1000 / 60 / 60;

        if (overtimeDeparture == "ABSENT" || overtimeDeparture == "NOT REGISTERED" || overtimeDeparture == " N/A " || diffOvertime < 0 || overtimeDeparture == "" || overtimeDeparture == " " || overtimeDeparture == "Clock-out") { }
        else mealAllowance = mealAllowance + 1;

    });

}

function checkPeriodLock() {
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/checkLock", //It calls our web method  
        data: JSON.stringify({
            month: currentMonth, year: currentYear
        }),
        async: false,
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            periodLocked = msg.d;
            if (periodLocked == true)
                $("#idBtnPayslip").hide();
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function findAbsencesLeft() {

    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var pinAloneArray = currentEmpPin.split("?");
    currentEmpIndex = pinAloneArray[0];

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/findAbsencesLeft",
        data: JSON.stringify({ emp_pin: currentEmpIndex }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            localsLeft = msg.d.localLeft;
            sicksLeft = msg.d.sickLeft;
        },
        failure: function (msg) {
            alert("ERROR while retrieving absences left for this employee(local/sick left)");
        }
    });
}

function loadValidatedHolidayHours() {

    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/loadValidatedData",
        data: JSON.stringify({ emp_pin: currentEmpIndex, month: currentMonth, year: currentYear }),
        contentType: "application/json; charset=utf-8",
        async: false,
        dataType: "JSON",
        success: function (msg) {
            if (msg.d >= 0) {
                //this means that data has been finalized, so we can show the payslip button
                document.getElementById('idHolidayHoursTBOX').value = msg.d;
            }
            if (msg.d == -9) {
                //if value returned is -9, this means that there was no finalized data for this event
                //so we will output zero but we will not show the payslip button
                document.getElementById('idHolidayHoursTBOX').value = 0;
            }
            if (msg.d == 9999999 || msg.d == -1) {
                alert("an error has occured during the retrieval of the holiday hours. Please check the function that loads the validated data");
            }
        },
        failure: function (msg) {
            alert("ERROR while approving overtime");
        }
    });
}

function calcWorkingDays() {

    noWorkingDays = 0;
    //looping through the times to find if employee was present/absent 
    //or has not registered his fingerprint data for that day (only the clock-in times are being counted)
    $("tr").each(function () {
        var clockin = $(this)[0].getElementsByClassName("arrival")[0];
        var approvedtime = $(this)[0].getElementsByClassName("approvedtime")[0];
        var approvedAbs = $(this)[0].getElementsByClassName("approved")[0];
        var continueIndex = 0;
        if (clockin != undefined) {
            if (clockin.innerHTML != "" && clockin.innerHTML != "N/A" && clockin.innerHTML != " N/A ") {
                if (approvedAbs != undefined) {
                    if (approvedAbs.innerHTML == "HALF SICK" || approvedAbs.innerHTML == "HALF LOCAL" || approvedAbs.innerHTML == "HALF UNAPPROVED") {
                        noWorkingDays += 1;
                        continueIndex = 1;
                    }
                }
                if (continueIndex == 0) {
                    if (approvedtime != undefined && approvedtime.innerHTML != "HOLIDAY" && approvedtime.innerHTML != "LOCAL" && approvedtime.innerHTML != "SICK") {
                        noWorkingDays += 1;
                    }
                }
            }
        }
    });
}

var getDaysInMonth = function (month, year) {
    // Here January is 1 based
    //Day 0 is the last day in the previous month
    return new Date(year, month, 0).getDate();
    // Here January is 0 based
    // return new Date(year, month+1, 0).getDate();
};

function ToJavaScriptDateTime(value) {
    var pattern = /Date\(([^)]+)\)/;
    var results = pattern.exec(value);
    return new Date(parseFloat(results[1]));
}

function findDayFromDate(date) {
    var weekday = new Array(7);
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";
    return weekday[date.getDay()];
}

function toDate(dStr) {
    var now = new Date();
    if (dStr.includes(':')) {
        now.setHours(dStr.substr(0, dStr.indexOf(":")));
        now.setMinutes(dStr.substr(dStr.indexOf(":") + 1));
        now.setSeconds(0);
        return now;
    }
    else if (dStr.includes('.')) {
        now.setHours(dStr.substr(0, dStr.indexOf(".")));
        now.setMinutes(dStr.substr(dStr.indexOf(".") + 1));
        now.setSeconds(0);
        return now;
    }
    else {
        now.setHours(dStr.substr(0, dStr.indexOf(":")));
        now.setMinutes(dStr.substr(dStr.indexOf(":") + 1));
        now.setSeconds(0);
        return now;
    }
}

function updateApprovedCO(pinToExport, dateToExport, timeToExport) {
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/updateApprovedCO", //It calls our web method  
        data: JSON.stringify({ emp_pin: pinToExport, date: dateToExport, approvedTime: timeToExport }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        success: function (msg) {
            //alert("Overtime successfully approved");
        },
        failure: function (msg) {
            alert("ERROR while approving overtime");
        }
    });
}

$.urlParam = function (name) {
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results == null) {
        return null;
    }
    return decodeURI(results[1]) || 0;
}

function addEventListenerForApproved() {
    $(".approvedtime").keypress(function (event) {
        var param = $.urlParam('emp_pin'); // employee pin
        var pinToExportArray = param.split("?");
        var pinToExport = pinToExportArray[0]; // the variable pinToExport contains the employee pin
        var dateToExport = $(this).attr('name');
        var timeToExport = $(this).val();
        //change the value of the textbox in order for the overtime to be correctly calculated
        $(this)[0].setAttribute("value", timeToExport);

        if (event.which == 13) {
            updateApprovedCO(pinToExport, dateToExport, timeToExport);
            //need to update the row details as soon as overtime is approved
            calculateLateness();
            calculateOvertime();
            calculateNetOvertime();
            calcMealAllowance();

            //reset overtime for recalculation
            totOvertime = 0.00;

            calcTotOvertime();
            fillDetailsDiv();
            checkForNegativeOvertime();

            //update the UI with another element to show approval
            $(this)[0].parentElement.parentElement.style.backgroundColor = "#00c8514a";
            if (periodLocked == true)
                $("#idBtnPayslip").hide();
        }
    });
}

function findTime(pinToExport, dateOfThisTxbx) {
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/getApprovedCO", //It calls our web method  
        data: JSON.stringify({ emp_pin: pinToExport, date: dateOfThisTxbx, }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            window.value = msg.d;
        },
        failure: function (msg) {
            alert("ERROR while getting the approved overtimes");
        }
    });
}

function fillTextboxesWithApprovedTimes() {
    //for each table row,
    //find the textbox and use the employee pin and the date (from the name of the textbox)
    //request for the approved times from the database for this date
    var param = $.urlParam('emp_pin'); //emp pin
    var pinToExportArray = param.split("?");
    var pinToExport = pinToExportArray[0]; // the variable pinToExport contains the employee pin

    $(".approvedtime").each(function () {
        //get the date
        var dateOfThisTxbx = $(this).attr('name');
        var timeToFind = findTime(pinToExport, dateOfThisTxbx);
        $(this).val(window.value);
        $(this).attr('value', window.value);
    });
}

function syncDataLast() {
    var timerId = 0;
    var ctr = 0;
    var max = 10;

    timerId = setInterval(function () {
        // interval function
        ctr++;
        $('#blips > .progress-bar').attr("style", "width:" + ctr * max + "%");

        // max reached?
        if (ctr == max) {
            clearInterval(timerId);
        }

    }, 1000);

    $('.btn-default').click(function () {
        clearInterval(timerId);
    });
}

function syncData() {

    syncDataLast();

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/getAttendance", //It calls our web method 
        data: JSON.stringify({ emp_pin: 1 }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        aync: false,
        success: function (msg) {
            alert(msg.d);
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function saveAbsenceDetails(saveBtnObj) {
    var param = $.urlParam('emp_pin'); // employee pin
    var pinToExportArray = param.split("?");
    var pinToExport = pinToExportArray[0]; // the variable pinToExport contains the employee pin
    var dateToExport = saveBtnObj.parentNode.parentElement.id;
    var absIndex = saveBtnObj.parentElement.children[0].selectedOptions[0].value;
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/saveAbsenceDetails", //It calls our web method  
        data: JSON.stringify({ emp_pin: pinToExport, date: dateToExport, absenceIndex: absIndex }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            alert("Absence successfully approved and saved");
            fillAbsencesWithApprovedAbsences();

            //calculate the number of working days for the employee
            calcWorkingDays();

            //refresh the number of absences left
            findAbsencesLeft();

            //in order to refresh the fixed details
            fillDetailsDiv();

            //hide the overtime deduction button if its not meant to be present
            checkForNegativeOvertime();

            //index 0 is NO ABSENCE
            if (absIndex == 0) {
                reloadThisEmp();
            }


        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function fillAbsencesWithApprovedAbsences() {
    //for each table row,
    //find the select dropdown and use the employee pin and the date (from the name of the dropdown)
    //request for the approved absences from the database for this date
    var param = $.urlParam('emp_pin'); //emp pin
    var pinToExportArray = param.split("?");
    var pinToExport = pinToExportArray[0]; // the variable pinToExport contains the employee pin
    //reinitialise everything to 0 because we are recalculating everything
    sickLeaves = 0;
    localLeaves = 0;
    unapprovedAbsences = 0;

    $(".absenceApproval").each(function () {
        //get the date
        var dateOfThisTxbx = $(this)[0].name;
        var absIndexToDisplay = getAbsenceIndex(pinToExport, dateOfThisTxbx);
        absIndexToDisplay = absenceIndex;
        $(this)[0].selectedIndex = absIndexToDisplay;

        //index 1 is SICK 
        if (absIndexToDisplay == 1) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "SICK";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "#7c7cf3";
            sickLeaves = sickLeaves + 1;
        }

        //index 2 is HALF SICK 
        if (absIndexToDisplay == 2) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "HALF SICK";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "#7c7cf3";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "#7c7cf3";
            sickLeaves = sickLeaves + 0.5;
        }

        //index 3 is LOCAL
        if (absIndexToDisplay == 3) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "LOCAL";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "#8be7f0";
            localLeaves = localLeaves + 1;
        }

        //index 4 is HALF LOCAL
        if (absIndexToDisplay == 4) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "HALF LOCAL";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "#8be7f0";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "#8be7f0";
            localLeaves = localLeaves + 0.5;
        }

        //index 5 is HOLIDAY
        if (absIndexToDisplay == 5) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "HOLIDAY";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "yellow";
        }

        //index 6 is a APPROVED HOLIDAY
        if (absIndexToDisplay == 6) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "APPROVED HOLIDAY";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "yellow";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "yellow";
        }

        //index 7 is a HALF UNAPPROVED ABSENCE
        if (absIndexToDisplay == 7) {
            $(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML = "HALF UNAPPROVED";
            $(this).parent().parent()[0].children[0].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[1].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[2].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[3].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[4].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[5].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[6].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[7].style.backgroundColor = "red";
            $(this).parent().parent()[0].children[8].style.backgroundColor = "red";
        }

        if ($(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML == "ABSENT") {
            unapprovedAbsences = unapprovedAbsences + 1;
        }
        if ($(this).parent().parent()[0].getElementsByClassName("approved")[0].innerHTML == "HALF UNAPPROVED") {
            unapprovedAbsences = unapprovedAbsences + 0.5;
        }
    });
}

function getAbsenceIndex(pinToExport, dateOfThisTxbx) {
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/getApprovedAbsence", //It calls our web method  
        data: JSON.stringify({ emp_pin: pinToExport, date: dateOfThisTxbx, }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            absenceIndex = msg.d;
        },
        failure: function (msg) {
            alert("ERROR while getting the approved overtimes");
        }
    });
}

function findEmployeeHireDate(employeePin) {
    jQuery.ajax({
        type: "POST",
        url: "index.aspx/getHireDate", //It calls our web method  
        data: JSON.stringify({ emp_pin: employeePin }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            var hireDate = msg.d;
            hireDate = "Employed since: " + hireDate;
            $("#empHireDate").html(hireDate);
        },
        failure: function (msg) {
            alert("ERROR while getting the employee Hire Date");
        }
    });
}

function prevLoad() {

    //remove all previous attendance datas
    var element = document.getElementsByTagName("tr"), index;

    for (index = element.length - 1; index >= 0; index--) {
        if (element[index].id == "tblHead") {

        }
        else {
            element[index].parentNode.removeChild(element[index]);
        }
    }

    //find the current employee index inside the array
    var prevEmpIndex;
    var currentEmpIndex;
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    //sorting the array in order(not really needed)
    //allCurrentEmployees.sort((a, b) => (a.emp_pin > b.emp_pin) ? 1 : ((b.emp_pin > a.emp_pin) ? -1 : 0))

    var pinAloneArray = currentEmpPin.split("?");
    currentEmpIndex = pinAloneArray[0];

    for (x = 0; x < allCurrentEmployees.length; x++) {
        if (allCurrentEmployees[x].emp_pin == currentEmpIndex) {
            arrayIndexCurrentEmp = x;
            if (x == 0) {
                prevEmpIndex = allCurrentEmployees.length - 1;
                $("#nextName").html(allCurrentEmployees[x].emp_firstname + " " + allCurrentEmployees[x].emp_lastname);
                $("#prevName").html(allCurrentEmployees[(prevEmpIndex - 1)].emp_firstname + " " + allCurrentEmployees[(prevEmpIndex - 1)].emp_lastname);
            }
            else {
                prevEmpIndex = x - 1;
                if (prevEmpIndex == 0) {
                    $("#nextName").html(allCurrentEmployees[x].emp_firstname + " " + allCurrentEmployees[x].emp_lastname);
                    $("#prevName").html(allCurrentEmployees[(allCurrentEmployees.length - 1)].emp_firstname + " " + allCurrentEmployees[(allCurrentEmployees.length - 1)].emp_lastname);
                }
                else {
                    $("#nextName").html(allCurrentEmployees[x].emp_firstname + " " + allCurrentEmployees[x].emp_lastname);
                    $("#prevName").html(allCurrentEmployees[(prevEmpIndex - 1)].emp_firstname + " " + allCurrentEmployees[(prevEmpIndex - 1)].emp_lastname);
                }
            }
            break;
        }

    }

    var selectedEmployeePin = allCurrentEmployees[prevEmpIndex].emp_pin;
    var selectedEmployeeName = allCurrentEmployees[prevEmpIndex].emp_firstname + " " + allCurrentEmployees[prevEmpIndex].emp_lastname;

    //continue coding check as from here
    var selectedMonth = currentMonth;
    var selectedYear = currentYear;
    window.history.replaceState(null, null, "?emp_pin=" + selectedEmployeePin + "?month=" + selectedMonth + "?year=" + selectedYear);

    //initialise fixed div details to 0
    sickLeaves = 0;
    localLeaves = 0;
    unapprovedAbsences = 0;
    totOvertime = 0.00;
    noWorkingDays = 0;
    mealAllowance = 0;
    loadEmpDetails(selectedEmployeePin, selectedMonth, selectedYear);
    $("#EmpName").html(selectedEmployeeName);
    currentEmpName = selectedEmployeeName;
    //getting the hiredate using the employe pin
    //employee pin is saved in the variable: selected Employee.
    findEmployeeHireDate(selectedEmployeePin);

}

function nextLoad() {

    //remove all previous attendance datas
    var element = document.getElementsByTagName("tr"), index;

    for (index = element.length - 1; index >= 0; index--) {
        if (element[index].id == "tblHead") {

        }
        else {
            element[index].parentNode.removeChild(element[index]);
        }
    }

    //find the current employee index inside the array
    var currentEmpIndex;
    var nextEmpIndex;
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    var pinAloneArray = currentEmpPin.split("?");
    currentEmpIndex = pinAloneArray[0];

    for (x = 0; x < allCurrentEmployees.length; x++) {
        if (allCurrentEmployees[x].emp_pin == currentEmpIndex) {
            arrayIndexCurrentEmp = x;
            if (x == allCurrentEmployees.length - 1) {
                nextEmpIndex = 0;
                $("#prevName").html(allCurrentEmployees[x].emp_firstname + " " + allCurrentEmployees[x].emp_lastname);
                $("#nextName").html(allCurrentEmployees[(nextEmpIndex + 1)].emp_firstname + " " + allCurrentEmployees[(nextEmpIndex + 1)].emp_lastname);
            }
            else {
                nextEmpIndex = x + 1;
                $("#prevName").html(allCurrentEmployees[x].emp_firstname + " " + allCurrentEmployees[x].emp_lastname);
                if (nextEmpIndex == allCurrentEmployees.length - 1) {
                    $("#nextName").html(allCurrentEmployees[0].emp_firstname + " " + allCurrentEmployees[0].emp_lastname);
                }
                else $("#nextName").html(allCurrentEmployees[(nextEmpIndex) + 1].emp_firstname + " " + allCurrentEmployees[(nextEmpIndex) + 1].emp_lastname);
            }
            break;
        }

    }

    var selectedEmployeePin = allCurrentEmployees[nextEmpIndex].emp_pin;
    var selectedEmployeeName = allCurrentEmployees[nextEmpIndex].emp_firstname + " " + allCurrentEmployees[nextEmpIndex].emp_lastname;

    //continue coding check as from here
    var selectedMonth = currentMonth;
    var selectedYear = currentYear;
    window.history.replaceState(null, null, "?emp_pin=" + selectedEmployeePin + "?month=" + selectedMonth + "?year=" + selectedYear);

    //initialise fixed div details to 0
    sickLeaves = 0;
    localLeaves = 0;
    unapprovedAbsences = 0;
    totOvertime = 0.00;
    noWorkingDays = 0;
    mealAllowance = 0;
    loadEmpDetails(selectedEmployeePin, selectedMonth, selectedYear);
    $("#EmpName").html(selectedEmployeeName);
    currentEmpName = selectedEmployeeName;
    //getting the hiredate using the employe pin
    //employee pin is saved in the variable: selected Employee.
    findEmployeeHireDate(selectedEmployeePin);
}

function reloadThisEmp() {

    //remove all previous attendance datas
    var element = document.getElementsByTagName("tr"), index;

    for (index = element.length - 1; index >= 0; index--) {
        if (element[index].id == "tblHead") {

        }
        else {
            element[index].parentNode.removeChild(element[index]);
        }
    }

    //find the current employee index inside the array
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpPin = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    //initialise fixed div details to 0
    sickLeaves = 0;
    localLeaves = 0;
    unapprovedAbsences = 0;
    totOvertime = 0.00;
    noWorkingDays = 0;
    mealAllowance = 0;
    loadEmpDetails(currentEmpPin, currentMonth, currentYear);
}

function retrieveAdvances() {
    //we use the emp pin, the month and the year to retrieve the related advances taken by the employee for the specified period
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];

    jQuery.ajax({
        type: "POST",
        url: "advance.aspx/retrieveAdvance", //It calls our web method  
        data: JSON.stringify({
            emp_pin: currentEmpIndex, month: currentMonth, year: currentYear
        }),
        contentType: "application/json; charset=utf-8",
        dataType: "JSON",
        async: false,
        success: function (msg) {
            $("#idAdvanceTaken").html(msg.d);
            advanceTaken = msg.d;
        },
        failure: function (msg) {
            alert(msg);
        }
    });
}

function expandMe(btnClicked) {

    if (btnClicked.classList[2] == "clsDeductBtn1") {
        $("#clsDeductBtn1").hide();
        $("#addedDeduct1").show();
        $("#addedDeduct11").show();
    }
    if (btnClicked.classList[2] == "clsAddBtn1") {
        $("#clsAddBtn1").hide();
        $("#addedAdd1").show();
        $("#addedAdd11").show();
    }
    if (btnClicked.classList[2] == "clsDeductBtn2") {
        $("#clsDeductBtn2").hide();
        $("#addedDeduct2").show();
        $("#addedDeduct22").show();
    }
    if (btnClicked.classList[2] == "clsAddBtn2") {
        $("#clsAddBtn2").hide();
        $("#addedAdd2").show();
        $("#addedAdd22").show();
    }
    if (btnClicked.classList[2] == "clsDeductBtn3") {
        $("#clsDeductBtn3").hide();
        $("#addedDeduct3").show();
        $("#addedDeduct33").show();
    }
}

function saveFinalPayslip() {
    //first we need to get all these elements value before being able to post
    var currentEmpPin = $.urlParam('emp_pin'); //emp pin
    var currentMonth = $.urlParam('month'); //month
    var currentYear = $.urlParam('year'); //year
    var pinAloneArray = currentEmpPin.split("?");
    var monthAloneArray = currentMonth.split("?");
    var yearAloneArray = currentYear.split("?");
    currentEmpIndex = pinAloneArray[0];
    currentMonth = monthAloneArray[0];
    currentYear = yearAloneArray[0];
    currentEmpIndex = parseInt(currentEmpIndex);
    currentMonth = parseInt(currentMonth);
    currentYear = parseInt(currentYear);

    var monthText = $("#idMonthYearPayslip").html();
    var fullMonthText = $("#idBeginEndMonthPayslip").html();
    var emp_name = $("#empNamePayslip").html();
    var doe = $("#empDOEPayslip").html();
    var occupation = $("#empJobPayslip").html();
    var NID = $("#empIDPayslip").html();
    var BasicSalary = parseFloat($("#basicSalary").html());
    var perfBonus = parseFloat($("#IdPerfBonus").val());
    var attBonus = parseFloat($("#attBonus").html());
    var commission = parseFloat($("#IdCommissionAllowance").val());
    var holiday = parseFloat($("#idHolidayHours").html());
    var travelling = parseFloat($("#idTravelling").html());
    var add1name = $("#addedAdd1").val();
    var add1value = $("#addedAdd11").val();
    if (add1value != "")
        add1value = parseFloat(add1value);
    else add1value = 0;
    var add2name = $("#addedAdd2").val();
    var add2value = $("#addedAdd22").val();
    if (add2value != "")
        add2value = parseFloat(add2value);
    else add2value = 0;
    var overtime = parseFloat($("#idOvertime").html());
    var csg = parseFloat($("#idCSG").html());
    var nsf = parseFloat($("#idNSF").html());
    var paye = parseFloat($("#idPAYE").html());
    var absences = parseFloat($("#idAbsences").html());
    var advance = parseFloat($("#idAdvanceTaken").html());
    var ded1name = $("#addedDeduct1").val();
    var ded1value = $("#addedDeduct11").val();
    if (ded1value != "")
        ded1value = parseFloat(ded1value);
    else ded1value = 0;
    var ded2name = $("#addedDeduct2").val();
    var ded2value = $("#addedDeduct22").val();
    if (ded2value != "")
        ded2value = parseFloat(ded2value);
    else ded2value = 0;
    var ded3name = $("#addedDeduct3").val();
    var ded3value = $("#addedDeduct33").val();
    if (ded3value != "")
        ded3value = parseFloat(ded3value);
    else ded3value = 0;
    var grossSal = parseFloat($("#idGrossSalary").html());
    var totalDed = parseFloat($("#idDeductions").html());
    var netSal = parseFloat($("#idNetSalary").html());
    var telephoneAllowance = parseFloat($("#IdRefunds").val());
    var mealAllowFinalVal = parseFloat($("#idMealAllowance").html());
    var bankAc = "Default";
    var bankName = "Default";

    if (isNaN(netSal) == true) {
        $("#EmpName").append("<br/> <h5 style='color:red;'>ERROR saving the payslip. Please double check your entries. Error code: 0x4eFC<h5/>");
        alert("ERROR saving the payslip. Please double check your entries. Error code: 0x4eFC");
    }
    else {
        jQuery.ajax({
            type: "POST",
            url: "index.aspx/saveFinalPayslip", //It calls our web method  
            data: JSON.stringify({
                emp_pin: currentEmpIndex, month: currentMonth, year: currentYear, monthText: monthText, fullMonthText: fullMonthText, emp_name: emp_name, doe: doe,
                occupation: occupation, NID: NID, BasicSalary: BasicSalary, perfBonus: perfBonus, attBonus: attBonus, commission: commission, holiday: holiday,
                travelling: travelling, add1name: add1name, add1value: add1value, add2name: add2name, add2value: add2value, overtime: overtime, csg: csg,
                nsf: nsf, paye: paye, absences: absences, advance: advance, ded1name: ded1name, ded1value: ded1value, ded2name: ded2name,
                ded2value: ded2value, ded3name: ded3name, ded3value: ded3value, grossSal: grossSal, totalDed: totalDed, netSal: netSal, telephone: telephoneAllowance, mealAllow: mealAllowFinalVal,bankAc:bankAc,bankName:bankName
            }),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            async: false,
            success: function (msg) {
                if (msg.d == "successfully created in DB" || msg.d == "successfully updated in DB")
                    $("#EmpName").append("<br/> <h5 style='color:deepskyblue;'>Payslip validated and saved<h5/>");
                else
                    $("#EmpName").append("<br/> <h5 style='color:red;'>ERROR saving the payslip. Please contact your system admin. Error code: 0x3eFC<h5/>");
            },
            failure: function (msg) {
                alert("ERROR saving the payslip. Please contact your system admin. Error code: 0x3eFC");
            }
        });
    }
}

$(document).on('hide.bs.modal', '#payslipModal', function () {
    $("#clsAddBtn1").show();
    $("#clsAddBtn2").show();
    $("#clsDeductBtn1").show();
    $("#clsDeductBtn2").show();
    $("#clsDeductBtn3").show();

    $("#addedAdd1").val("");
    $("#addedAdd11").val("");
    $("#addedAdd2").val("");
    $("#addedAdd22").val("");
    $("#addedDeduct1").val("");
    $("#addedDeduct11").val("");
    $("#addedDeduct2").val("");
    $("#addedDeduct22").val("");
    $("#addedDeduct3").val("");
    $("#addedDeduct33").val("");

});

function loadAdminPage() {

    jQuery.ajax({
        type: "POST",
        url: "index.aspx/loadAdminDetails", //It calls our web method  
        contentType: "application/json; charset=utf-8",
        async: false,
        success: function (msg) {

            var AdminList = '';
            for (var x = 0; x < msg.d.length; x++) {
                AdminList = AdminList + '<input type="checkbox" id="' + msg.d[x].nid +
                    '" accno="' + msg.d[x].add2name +
                    '" emp_pin="' + msg.d[x].emp_pin +
                    '" bank="' + msg.d[x].ded2name +
                    '" doe="' + msg.d[x].doe +
                    '" occupation="' + msg.d[x].occupation +
                    '" nid="' + msg.d[x].nid +
                    '" basicSalary="' + msg.d[x].basicSalary +
                    '" perfBonus="' + msg.d[x].perfBonus +
                    '" attBonus="' + msg.d[x].attBonus +
                    '" commission="' + msg.d[x].commission +
                    '" holiday="' + msg.d[x].holiday +
                    '" travelling="' + msg.d[x].travelling +
                    '" add1name="' + msg.d[x].add1name +
                    '" add1value="' + msg.d[x].add1value +
                    '" overtime="' + msg.d[x].overtime +
                    '" csg="' + msg.d[x].csg +
                    '" nsf="' + msg.d[x].nsf +
                    '" paye="' + msg.d[x].paye +
                    '" ded1name="' + msg.d[x].ded1name +
                    '" ded1value="' + msg.d[x].ded1value +
                    '" grossSal="' + msg.d[x].grossSal +
                    '" totalDed="' + msg.d[x].totalDed +
                    '" telephone="' + msg.d[x].telephone +
                    '" absences="' + msg.d[x].absences +
                    '" mealAllow="' + msg.d[x].mealAllow +
                    '" netSal="' + msg.d[x].netSal +
                    '" name="' + msg.d[x].emp_name +
                    '">' + msg.d[x].emp_name + '- Rs ' + msg.d[x].netSal + '</input><br/> '
            }
            AdminList = AdminList + `Month :<select id="adminMonth" name="adminMonth" class="col-md-4">
                        <option value="01">January</option>
                        <option value="02">February</option>
                        <option value="03">March</option>
                        <option value="04">April</option>
                        <option value="05">May</option>
                        <option value="06">June</option>
                        <option value="07">July</option>
                        <option value="08">August</option>
                        <option value="09">September</option>
                        <option value="10">October</option>
                        <option value="11">November</option>
                        <option value="12">December</option>
                    </select>
                <br/>
                Year :<select id="adminYear" name="adminYear" class="col-md-4">
                        <option value="2019">2019</option>
                        <option value="2020">2020</option>
                        <option value="2021">2021</option>
                        <option value="2022">2022</option>
                        <option value="2023">2023</option>
                        <option value="2024">2024</option>
                        <option value="2025">2025</option>
                        <option value="2026">2026</option>
                        <option value="2027">2027</option>
                        <option value="2028">2028</option>
                        <option value="2029">2029</option>
                        <option value="2030">2030</option>
                        <option value="2031">2031</option>
                    </select>`;

            $(".AdminBody").html(AdminList);
            selectCurrentDateAdmin();
        },
        failure: function (msg) {
            alert("ERROR loading the details. Please contact your system admin. Error code: 0x4FLAP");
            alert(msg.d);
        }
    });

}

function selectCurrentDateAdmin() {
    var currentd = new Date();
    var currentm = currentd.getMonth();
    var currenty = currentd.getFullYear();
    var indexYearToSearch = currenty - 2019;
    $("#adminMonth option:eq(" + currentm + ")").attr('selected', 'selected');
    $("#adminYear option:eq(" + indexYearToSearch + ")").attr('selected', 'selected');

}

function findCheckedBoxes() {
    var value = $("[type='checkbox']");
    for (var i = value.length - 1; i >= 0; --i) {
        if (!value[i].checked) {
            value.splice(i, 1);
        }
    }

    //first we need to get all these elements value before being able to post
    var currentMonth = $('#adminMonth').find(":selected").val();
    var currentYear = $('#adminYear').find(":selected").val();
    currentMonth = parseInt(currentMonth);
    currentYear = parseInt(currentYear);

    //automatically fill the payslip with the correct month details
    var months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var monthForPayslip = (parseInt(currentMonth) - 1);
    var yearForPayslip = currentYear;
    var prevMonthForPayslip = monthForPayslip - 1;
    if (prevMonthForPayslip < 0) {
        prevMonthForPayslip = 11;
    }
    var monthText = months[monthForPayslip] + " " + yearForPayslip;
    var fullMonthText = "27 " + months[prevMonthForPayslip] + " to 26 " + months[monthForPayslip] + " " + yearForPayslip;
    for (j = 0; j < value.length; j++) {
        //To get every other fieldname
        var emp_name = value[j].attributes["name"].value;
        var emp_pin = value[j].attributes["emp_pin"].value;
        var NID = value[j].attributes["id"].value;
        var occupation = value[j].attributes["occupation"].value;
        var BasicSalary = value[j].attributes["basicSalary"].value;
        var perfBonus = value[j].attributes["perfBonus"].value;
        var attBonus = value[j].attributes["attBonus"].value;
        var commission = value[j].attributes["commission"].value;
        var holiday = value[j].attributes["holiday"].value;
        var travelling = value[j].attributes["travelling"].value;
        var csg = value[j].attributes["csg"].value;
        var nsf = value[j].attributes["nsf"].value;
        var paye = value[j].attributes["paye"].value;
        var absences = value[j].attributes["absences"].value;
        var doe = value[j].attributes["doe"].value;
        var overtime = value[j].attributes["overtime"].value;
        var grossSal = value[j].attributes["grossSal"].value;
        var totalDed = value[j].attributes["totalDed"].value;
        var netSal = value[j].attributes["netSal"].value;
        var telephoneAllowance = value[j].attributes["telephone"].value;
        var mealAllowFinalVal = value[j].attributes["mealAllow"].value;
        var bankName = value[j].attributes["bank"].value;
        var bankAc = value[j].attributes["accno"].value;

        jQuery.ajax({
            type: "POST",
            url: "index.aspx/saveFinalPayslip", //It calls our web method  
            data: JSON.stringify({
                emp_pin: emp_pin, month: currentMonth, year: currentYear, monthText: monthText, fullMonthText: fullMonthText, emp_name: emp_name, doe: doe,
                occupation: occupation, NID: NID, BasicSalary: BasicSalary, perfBonus: perfBonus, attBonus: attBonus, commission: commission, holiday: holiday,
                travelling: travelling, add1name: "", add1value: 0, add2name: "", add2value: 0, overtime: overtime, csg: csg,
                nsf: nsf, paye: paye, absences: absences, advance: 0, ded1name: "", ded1value: 0, ded2name: "",
                ded2value: 0, ded3name: "", ded3value: 0, grossSal: grossSal, totalDed: totalDed, netSal: netSal, telephone: telephoneAllowance, mealAllow: mealAllowFinalVal,bankAc:bankAc,bankName:bankName}),
            contentType: "application/json; charset=utf-8",
            dataType: "JSON",
            async: false,
            success: function (msg) {
                if (msg.d == "successfully created in DB" || msg.d == "successfully updated in DB") {
                    $("#adminPayslipMsg").append("<br/> <h5 style='color:deepskyblue;text-align: center;'>Payslip validated for:" + emp_name + "<h5/>");
                    $("#EmpName").append("<br/> <h5 style='color:deepskyblue;text-align: center;'>Payslip validated for:" + emp_name + "<h5/>");
                }
                else {
                    $("#adminPayslipMsg").append("<br/> <h5 style='color:red;text-align: center;'>ERROR saving the payslip. Please contact your system admin. Error code: 0x3eFC<h5/>");
                    $("#EmpName").append("<br/> <h5 style='color:red;text-align: center;'>ERROR saving the payslip. Please contact your system admin. Error code: 0x3eFC<h5/>");
                }
            },
            failure: function (msg) {
                alert("ERROR saving the payslip. Please contact your system admin. Error code: 0x3eFC");
            }
        });
    }

}
