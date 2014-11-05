recMap.directive("myMap", function($window) {
    return {
        restrict: "A",
        scope: {
            // Critical binding step.
            // Tells Angular to pick up the OBJECT under
            // mapData attribute of myMap node
            // from the scope of the controlling Controller.
            mapData: '='
        },
        link: function (scope, elem, attrs) {
//            Testing
//            setInterval(function() { console.log(scope.mapData) }, 1000);
            
        }
    }
});