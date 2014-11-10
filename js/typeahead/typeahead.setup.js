/**
 * Created by aditya on 10/11/14.
 */

recMap.controller('searchController', function($scope, dataService, propService, yearService) {

    $scope.ContToC = dataService.getContToC();

    // constructs the suggestion engine
    var CountriesSearch = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
    // `states` is an array of state names defined in "The Basics"
        local: function() {
            var conts = [];
            for (cont in $scope.ContToC) {
                conts.push( {
                    value: cont,
                    code: $scope.ContToC[cont]
                });
            }
            return conts;
        }//$.map($scope.ContToC, function(state) { return { value: state }; })
    });

    // Watches the ContToC output, waits for it to load. Once loaded, it initializes the search.
    $scope.$watch(
        function () {
            return isEmptyObject($scope.ContToC);
        },
        function(newValue, oldValue, scope) {
        CountriesSearch.initialize(true);
    });

    //nbaTeams.initialize();
    //nhlTeams.initialize();

    $('#typeahead-search .typeahead').typeahead({
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
                    return '<b><span>' + country.value + '</span></b><span style="float: right">' + country.code + '</span>'
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
//    For Testing:
//    setInterval(function() { console.log($scope.allData)}, 5000 );
})

