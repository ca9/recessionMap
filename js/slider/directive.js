recMap.directive("mySlider", function ($window, yearService) {
    return {
        restrict: "A",
        scope: {},
        link: function (scope) {
            scope.slider = $("#year-slider");
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