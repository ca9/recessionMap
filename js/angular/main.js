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
function trim(s){
    return ( s || '' ).replace( /^\s+|\s+$/g, '' );
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
        console.log("Year Changed:", curyear);
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
   var cToCode = {}, codeToC = {};
   var curCountry = "World";

   dataAsService.queryData = function() {
       $http.get(url)
           .then(function (response) {
               inData = response['data'];
               for (someItem in inData) {

                   // This is crucial. The object must remain the same.
                   allData[someItem] = inData[someItem];
                   var code = inData[someItem]["Country.Code2"];
                   var cont  = inData[someItem]["Country.Name"];
                   if (!(cont in cToCode)) {
                       cToCode[cont] = code;
                       codeToC[code] = cont;
                   }
               }
               console.log(allData);
               console.log("CtoCode:", cToCode);
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

   dataAsService.getContToC = function () {
       return cToCode;
   }

   dataAsService.setCountry = function(inCountry) {
        if (inCountry in codeToC) {
            // Check the Code and set the "Country Name"
            curCountry = codeToC[inCountry];
        } else if (inCountry in cToCode) {
            curCountry = cToCode[inCountry];
        }
       console.log("Current Country Changed:", curCountry);
   }

   return dataAsService;
});

recMap.factory('propService', function($http) {
    var eprops = {}, egroups = {
        "Banking": [],
        "Central Government": [],
        "Economic Structure": [],
        "GDP": [],
        "Manufacturing": [],
        "Net Exports": []
    }, curProp = "Drop.SD", url = 'data/propertiesFlourish.json', propAsService = {};

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
                for (var key in eprops) {
                    var myGroups = [];
                    for (agroup in eprops[key].EconClasses.split(",")) {
                        var agroup = trim(eprops[key].EconClasses.split(",")[agroup]);
                        if (agroup in egroups)
                            egroups[agroup].push(key);
                            myGroups.push(agroup);
                    }
                    eprops[key].EconClasses = myGroups;
                }
                console.log(egroups);
                return eprops;
            })
    }

//    Important: This is how we access/bind a string on the frontend.
    propAsService.getCurProp = function () { return curProp; }
    propAsService.getGroups = function () { return Object.keys(egroups); }
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
    propAsService.getPropExpanded = function(aVar) {
        if (isEmptyObject(eprops)) {
            return { "Name":"Loading", "Meaning":"Loading.", "Source":"Loading.", "EconClasses":"GDP", "Impact on Susceptibility":"Increased", "Impact Rating":"HIGH", "LowCutoff":0, "HighCutoff":10, "Mean":5, "SD":2.5, "Comments":"Loading...", "Index Reg. (Unused)":3, "Impact Rank (Unused)":0.975, "Index Stats (Unused)":30};
        } else {
            return eprops[aVar];
        }
    }
    return propAsService;
});

recMap.controller('timeController', function($scope, yearService) {
//      Static inits
        $scope.years = yearService.getYears();
//      Year Binding
        $scope.curYear = yearService.getCurYear;
        $scope.setYear = yearService.setYear;
        $scope.checkYear = yearService.checkYear;
    }
);

recMap.controller('dataController', function($scope, dataService, propService, yearService) {
    $scope.allData = dataService.getAllData();

    $scope.propService = propService;
    $scope.eprops = propService.getPropData();
    $scope.getPropExpanded = propService.getPropExpanded;
//    Not needed, pulled directly from the service # Yolo.
//    $scope.groupNames = propService.getGroups;
//    $scope.getPropsForGroup = propService.getPropsForGroup;

    $scope.getCurCountry = dataService.getCurCountry;
    $scope.curYear = yearService.getCurYear;
    $scope.curProp = propService.getCurProp;

//    For Testing:
    setInterval(function() { console.log($scope.getCurCountry(), $scope.curYear(), $scope.curProp())}, 5000 );
//    setInterval(function() { console.log($scope.allData)}, 5000 );
})


//Important Resources
//http://stackoverflow.com/questions/15800454/angularjs-the-correct-way-of-binding-to-a-service-properties
//http://stackoverflow.com/questions/12008908/how-can-i-pass-variables-between-controllers
//http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language