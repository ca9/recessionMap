/**
 * Created by aditya on 23/10/14.
 */

//Helper Functions, to be on the safe side
function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
}

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

    this.getCurYear = function() {
        return curyear;
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

recMap.factory("dataService", function($http) {
   var allData = {}, dataAsService = {}, url = "data/final_data.json";
   var curCountry = "";

   dataAsService.queryData = function() {
       $http.get(url)
           .then(function (response) {
               inData = response['data'];
               for (someItem in inData) {
                   // This is crucial. The object must remain the same.
                   allData[someItem] = inData[someItem];
               }
               console.log(allData)
               return allData;
           })
   }

   dataAsService.getAllData = function() {
       if (isEmptyObject(allData))
            this.queryData();
       return allData;
   }

   dataAsService.getCurCountry = function () {
       return curCountry;
   }

   return dataAsService;
});

recMap.factory('propService', function($http) {
    var eprops = {}, egroups = [], curProp = null, url = 'data/propMap.json', propAsService = {};

    propAsService.getPropData = function() {
        if (isEmptyObject(eprops)) {
            this.queryData();
        }
        return eprops;
    }

    propAsService.queryData = function() {
        $http.get(url)
            .then(function(response) {
                eprops = response['data'];
                curProp = "Drop.SD";
                console.log(eprops);
                for (var key in eprops) {
                    if (key != "names") {
                        egroups.push(key);
                    }
                }
                return eprops;
            })
    }

//    Important: This is how we access/bind a string on the frontend.
    propAsService.getCurProp = function () { return curProp; }
    propAsService.getGroups = function () {return egroups; }
    propAsService.getPropsForGroup = function (agroup, max) {
        max = typeof max !== 'undefined' ? max :false;
        var retlist = [];
        for (var avar in eprops[agroup]) {
            retlist.push(avar);
        }
        if (max) //Opened in details, cant show more.
            retlist = retlist.slice(0,7);
        return retlist;
    }
    return propAsService;
});

recMap.controller('timeController', function($scope, yearService) {
//      Static inits
        $scope.years = yearService.getYears();
//      Year Binding
        $scope.curyear = yearService.getCurYear;
        $scope.setYear = yearService.setYear;
        $scope.checkYear = yearService.checkYear;
    }
);

recMap.controller('dataController', function($scope, dataService, propService, yearService) {
    $scope.allData = dataService.getAllData();
    $scope.eprops = propService.getPropData();
    $scope.groupNames = propService.getGroups;
    $scope.getPropsForGroup = propService.getPropsForGroup;

    $scope.curCountry = dataService.getCurCountry;
    $scope.curyear = yearService.getCurYear;
    $scope.curProp = propService.getCurProp;

//    For Testing:
//    setInterval(function() { console.log($scope.groupNames)}, 2000 );
})


//Important Resources
//http://stackoverflow.com/questions/15800454/angularjs-the-correct-way-of-binding-to-a-service-properties
//http://stackoverflow.com/questions/12008908/how-can-i-pass-variables-between-controllers
//http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language