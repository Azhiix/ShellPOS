'use strict';
var dashseniorjs = function () {
    return {

        init: function () {
            $(document).ready(function () {
                //$('#datetimepicker1').datepicker();

                dashseniorjs.handleDisappearOnScroll();
                dashseniorjs.handleCircularProgress();
            });
        },

        //On Scroll Make Top Header info disappear
        handleDisappearOnScroll: function () {
            $(window).scroll(function(){
                $(".hd-info").css("opacity", 1 - $(window).scrollTop() / 80);
              });
        },

        //Circular Progress Bar Config and Data
        handleCircularProgress: function () {
            $('.datepicker').datepicker({
                format: 'dd/MM/yyyy',
                startDate: '-3d'
            });

            $('.progressAbsence').circleProgress({
                max: 100,
                value: 20,
                textFormat: 'percent'
            });

            $('.progressLateness').circleProgress({
                max: 100,
                value: 40,
                textFormat: 'percent'
            });

            $('.progressPresence').circleProgress({
                max: 100,
                value: 80,
                textFormat: 'percent'
            });

            $('.progressLocalLeaves').circleProgress({
                max: 100,
                value: 15,
                textFormat: 'value'
            });

            $('.progressSickLeaves').circleProgress({
                max: 100,
                value: 12,
                textFormat: 'value'
            });

        },

    };

}();

// Call main function init
dashseniorjs.init();