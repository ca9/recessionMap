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

recMap.service("dataService", function() {
    var allData = {};
    $get.http('data/final_data.json')
        .success(function(data) {
            allData = data;
        })
        .error(function(data, status, headers, config) {
            allData.data = data;
            allData.status = status;
            allData.headers = headers;
            allData.config = config;
        })
});

recMap.controller('timeController', function($scope, yearService) {
//      static inits
        $scope.years = yearService.getYears();
//      Year Binding
        $scope.curyear = yearService.curyear;
        $scope.setYear = yearService.setYear;
        $scope.checkYear = yearService.checkYear;
    }
);

recMap.controller('dataController', function($scope, dataService) {
    $scope.data = dataService.allData;
})