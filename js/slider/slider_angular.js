recMap.directive("mySlider", function ($window, yearService) {
    return {
        restrict: "A",
        scope: {},
        link: function (scope) {
            scope.slider = $("#year-slider");

            scope.slider.simpleSlider({
                allowedValues: yearService.getYears(),
//                    [2000, 2001, 2002, 2003, 2004, 2005, 2006, 2007, 2010, 2011, 2012, 2013],
                snap: true,
                theme: "volume"
            });

            scope.slider.bind("slider:changed", function (event, data) {
                yearService.setYear(parseInt(data.value));
                if (scope.$root.$$phase != '$apply' && scope.$root.$$phase != '$digest') {
                    scope.$apply();
                }
            });

            scope.$watch(
                function () {
                    return yearService.getCurYear();
                },
                function (newValue, oldValue) {
                    console.log("from slider", oldValue, newValue);
                    scope.slider.simpleSlider("setValue", newValue);
                }
            )
        }
    }
});