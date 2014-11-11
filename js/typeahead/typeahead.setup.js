/**
 * Created by aditya on 10/11/14.
 */

recMap.controller('searchController', function($scope, dataService, propService, yearService) {

    $scope.ContToC = dataService.getContToC();
    $scope.setYear = yearService.setYear;

    // constructs the suggestion engine for Countries
    var CountriesSearch = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
        local: function() {
            var conts = [];
            for (cont in $scope.ContToC) {
                conts.push( {
                    value: cont,
                    code: $scope.ContToC[cont],
                    type: "Country"
                });
            }
            return conts;
        }
    });

    // Years
    yearsArray = yearService.getYears(); //[2001, 2002, 2003, 2004, 2005, 2006, 2007, 2010, 2011, 2012, 2013];
    var searchYears = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // `states` is an array of state names defined in "The Basics"
        local: $.map(yearsArray, function(year) { return {
            value: year.toString(),
            type: "year"
        }; })
    });
    searchYears.initialize();


    // Watches the ContToC output, waits for it to load. Once loaded, it initializes the search.
    $scope.$watch(
        function () {
            return isEmptyObject($scope.ContToC);
        },
        function(newValue, oldValue, scope) {
        CountriesSearch.initialize(true);
    });


    $('#typeahead-search .typeahead').typeahead({
            hint: true,
            highlight: true
        },
        {
            name: 'search-countries',
            displayKey: 'value',
            source: CountriesSearch.ttAdapter(),
            templates: {
                header: '<h5 class="type-name">Countries</h5>',
                suggestion: function(country) {
//                    console.log(country);
                    return '<b><span>' + country.value + '</span></b>' +
                        '<span style="float: right">' + country.code + '</span>'
                }
            }
        },
        {
            name: 'search-years',
            displayKey: 'value',
            source: searchYears.ttAdapter(),
            templates: {
                header: '<h5 class="type-name">Years</h5>',
                suggestion: function(year) {
//                    console.log(country);
                    return '<span ng-click="setYear(' + year.value + ')"><b>' + year.value + '</b></span>'
                }
            }
        }
//    ,{
//        name: 'nhl-teams',
//        displayKey: 'team',
//        source: nhlTeams.ttAdapter(),
//        templates: {
//            header: '<h3 class="league-name">NHL Teams</h3>'
//        }
//    }
    );

    $('#typeahead-search').on('typeahead:selected', function (e, datum) {
        console.log(datum);
        if (datum.type == "Country") {
            dataService.setCountry(datum.code);
        } else if (datum.type == "year") {
            yearService.setYear(parseInt(datum.value));
        }
        $scope.$apply();
    });

})

