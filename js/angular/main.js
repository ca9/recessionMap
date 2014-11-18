/**
 * Created by aditya on 23/10/14.
 */

// Helper Functions, to be on the safe side
function isEmptyObject( obj ) {
    for ( var name in obj ) {
        return false;
    }
    return true;
}

function trim(s) {
    return ( s || '' ).replace( /^\s+|\s+$/g, '' )
        .replace(/\.+$/, ''); //Also remove trailing full stops.
}

String.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length == 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this.charCodeAt(i);
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
};

function average(anArray) {
    var sum = 0, j = 0;
    for (var i = 0; i < anArray.length, isFinite(anArray[i]); i++) {
        sum += parseFloat(anArray[i]); ++j;
    }
    return j ? sum / j : 0;
};

// App
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
   var curCountry = "World", loaded = false;

   dataAsService.queryData = function() {
       $http.get(url)
           .then(function (response) {
               var inData = response['data'];
               for (var someItem in inData) {

                   var code = inData[someItem]["Country.Code2"];
                   var cont  = inData[someItem]["Country.Name"];
                   if (!(cont in cToCode)) {
                       cToCode[cont] = code;
                       codeToC[code] = cont;
                   }
                   // This is crucial. The object must remain the same.
                   // allData[someItem] = inData[someItem] - we must clean up the param names.
                   allData[someItem] = {};
                   for (var subItem in inData[someItem]) {
                        allData[someItem][trim(subItem)] = inData[someItem][subItem];
                   }
               }
               console.log(allData);
               console.log("CtoCode:", cToCode);
               loaded = true;
               return allData;
           })
   }

   dataAsService.isLoaded = function () { return loaded; };

   dataAsService.getAllData = function() {
       if (isEmptyObject(allData))
            this.queryData();
       return allData;
   }

   dataAsService.getCurCountry = function () {
       return curCountry;
   }

    // Get the Country to Code mapping.
   dataAsService.getContToC = function () {
       return cToCode;
   }

   dataAsService.getCodeToCont = function () {
       return codeToC;
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

    // Get minimum and maximum values of a property. Now Unused.
    dataAsService.getMinMax = function(property) {
        var myMin = Number.POSITIVE_INFINITY, myMax= Number.NEGATIVE_INFINITY, property = trim(property);
        for (var item in allData) {
            myMin = allData[item][property] < myMin ? allData[item][property] : myMin;
            myMax = allData[item][property] > myMax ? allData[item][property] : myMax;
        }
        console.log("Computed new min and max:", myMin, myMax);
        return { 'minVal': myMin , 'maxVal': myMax };
    }

    // Fetches a property value for given property, country, year.
   dataAsService.getPropValFor = function(countryCode, property, year) {
       if (countryCode in cToCode) {
            countryCode = cToCode[countryCode];
       }
       var dataKey = year.toString() + "." + countryCode;
       var dataRow = allData[dataKey];
       if (dataRow != undefined) {
           return dataRow[property];
       } else {
           return "NA";
       }
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
    var egroupsReady = false;

    propAsService.isEgroupsReady = function(){
        return egroupsReady;
    };

    propAsService.getPropData = function(override) {
        if (override) {
            return eprops;
        } else if (isEmptyObject(eprops)) {
            this.queryData();
        }
        return eprops;
    };

    propAsService.getPropGroups = function (override) {
        if (override) {
            return egroups;
        } else if (isEmptyObject(egroups)) {
            //this.queryData();
        }
        return egroups;
    };

    propAsService.setProperty = function(newProp) {
        curProp = newProp;
        console.log("Property Changed:", newProp);
    };

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
                console.log("Egroups ready:". egroups);
                egroupsReady = true;
                return eprops;
            });
    };

//  Important: This is how we access/bind a string on the frontend.
    propAsService.getCurProp = function () { return curProp; };
    propAsService.getGroups = function () { return Object.keys(egroups); };
    propAsService.getPropsForGroup = function (agroup, max) {
        max = typeof max !== 'undefined' ? max :false;
        var retlist = [];
        for (var avar in eprops[agroup]) {
            retlist.push(avar);
        }
        if (max) //Opened in details, cant show more.
            retlist = retlist.slice(0,7);
        return retlist;
    };

    propAsService.getPropExpanded = function(aVar) {
        if (isEmptyObject(eprops)) {
            return { "Name":"Loading", "Meaning":"Loading.", "Source":"Loading.", "EconClasses":"GDP", "Impact on Susceptibility":"Increased", "Impact Rating":"HIGH", "LowCutoff":0, "HighCutoff":10, "Mean":5, "SD":2.5, "Comments":"Loading...", "Index Reg. (Unused)":3, "Impact Rank (Unused)":0.975, "Index Stats (Unused)":30};
        } else {
            return eprops[aVar];
        }
    };
    return propAsService;
});

recMap.factory('similarService', function($http, propService, dataService) {
    var similarService = {}, similarJSON = {}, called = false, loaded = false, url = 'data/similarEcons.json';

    /* Pulls the data if not found. Returns the object that will contain the data. May be empty. */
    similarService.getSimilarData = function () {
        if (!loaded) {
            if (!called) {
                called = true;
                $http.get(url)
                    .then(function(response) {
                        var inData = response['data'];
                        for (var x in inData) {
                            similarJSON[x] = inData[x];
                        }
                        loaded = true;
                    }
                )
            }
        }
        return similarJSON;
    }

    // Get similar Countries by code and expanded name, for given Econ Class.
    // Returns empty object if nothing is found.
    similarService.getSimilarCountryType = function(contCode, EconClass) {
        var simConts = {};
        if (propService.isEgroupsReady() && !isEmptyObject(similarJSON)) {
            var eGroups = propService.getGroups();
            EconClass = eGroups.hasOwnProperty(EconClass) ?  EconClass : "all";
            var contMap = dataService.getCodeToCont();
            if (contMap.hasOwnProperty(contCode)) {
                var simList = similarJSON[EconClass][contCode];
                for (var i = 0; i < simList.length; i++) {
                    if (contMap.hasOwnProperty(simList[i])) {
                        simConts[simList[i]] = contMap[simList[i]];
                    }
                }
            }
        }
        return simConts;
    }

    similarService.isLoaded = function () { return loaded };
    return similarService;
})

recMap.factory('mapService', function($http, propService, dataService) {
    var mapJSON = {}, url = "data/world-topo-min.json",
        mapService = {}, called = false;

    mapService.getMapJSON = function() {
        if (!called) {
            // Ensure the data is requested only once.
            called = true;
            $http.get(url)
                .then(function(response) {
                    var inData = response['data'];
                    for (var key in inData) {
                        mapJSON[key] = inData[key];
                    }
                    console.log("Got mapData:", mapJSON);
                })
        }
        return mapJSON;
    }

    return mapService;
})

recMap.controller('timeController', function($scope, yearService) {
//      Static inits
        $scope.years = yearService.getYears();
//      Year Binding
        $scope.curYear = yearService.getCurYear;
        $scope.setYear = yearService.setYear;
        $scope.checkYear = yearService.checkYear;
    }
);

recMap.controller('dataController', function($scope, dataService, propService, yearService, similarService) {
    // Expose Services to Directives
    $scope.propService = propService;
    $scope.dataService = dataService;
    $scope.yearService = yearService;
    $scope.similarService = similarService;

    $scope.allData = dataService.getAllData();

    $scope.eprops = propService.getPropData(false);
    $scope.getPropExpanded = propService.getPropExpanded;
//    Not needed, pulled directly from the service # Yolo.
//    $scope.groupNames = propService.getGroups;
//    $scope.getPropsForGroup = propService.getPropsForGroup;

    $scope.getCurCountry = dataService.getCurCountry;
    $scope.curYear = yearService.getCurYear;
    $scope.curProp = propService.getCurProp;

    $scope.getPropValFor = dataService.getPropValFor;

    $scope.checkImpact = function(checkif) {
        if (checkif == 'high') {
            if (propService.getPropExpanded($scope.curProp())["Impact Rating"] == "HIGH")
                return true;
        } else if (checkif == "med") {
            if (propService.getPropExpanded($scope.curProp())["Impact Rating"] == "MED")
                return true;
        } else if (checkif == "low") {
            if (propService.getPropExpanded($scope.curProp())["Impact Rating"] == "LOW")
                return true;
        } else {
            return true;
        }
        return false;
    }

    $scope.checkDirection = function(checkif) {
        if (checkif == "DEC") {
            if (propService.getPropExpanded($scope.curProp())["Impact on Susceptibility"] == "Decreased")
                return true;
        } else if (checkif == "INC") {
            if (propService.getPropExpanded($scope.curProp())["Impact on Susceptibility"] == "Increased")
                return true;
        } else { //NA
            return true;
        }
        return false;
    }

//    For Testing:
    setInterval(function() { console.log($scope.getCurCountry(), $scope.curYear(), $scope.curProp())}, 5000 );
//    setInterval(function() { console.log($scope.allData)}, 5000 );

})


//Important Resources
//http://stackoverflow.com/questions/15800454/angularjs-the-correct-way-of-binding-to-a-service-properties
//http://stackoverflow.com/questions/12008908/how-can-i-pass-variables-between-controllers
//http://stackoverflow.com/questions/518000/is-javascript-a-pass-by-reference-or-pass-by-value-language