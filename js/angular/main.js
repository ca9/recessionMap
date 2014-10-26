/**
 * Created by aditya on 23/10/14.
 */
var recMap = angular.module('recMap', []);

recMap.service("yearService", function() {
    var years = [];
    var curyear = 2013;

    var initi = function() {
        for (var i = 2000; i <= 2013; i++) {
            if ((i <= 2007) || (i >= 2010)) {
                years.push(i);
            }
        }
    }
    initi();

    this.setYear = function(inYear) {
        curyear = inYear;
    }

    this.getYears = function() {
        return years;
    }

    this.checkYear = function(inYear) {
        if (inYear == curyear) {
            return true;
        }
    }
});

recMap.service("dataService", function($http, $q) {
    var allData = null;
    this.async = function() {
        return $http.get('data/final_data.json')
            .then(function(response) {
                allData = response['data'];
                console.log(allData);
                return allData;
            })
    };

});

recMap.controller('timeController', function($scope, yearService) {
//      Static inits
        $scope.years = yearService.getYears();
//      Year Binding
        $scope.curyear = yearService.curyear;
        $scope.setYear = yearService.setYear;
        $scope.checkYear = yearService.checkYear;
    }
);

recMap.controller('dataController', function($scope, dataService) {
    $scope.allData = {};
    if (dataService.allData == null) {
        dataService.async().then(function(inData) {
            $scope.allData = inData;
            console.log($scope.allData);
        });
    } else {
        $scope.allData = dataService.allData;
    }
})