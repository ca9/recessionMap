/**
 * Created by aditya on 10/11/14.
 */

/**
 * Even though no Angular Frontend/Template Expressions are used for the searchController (Angular
 * bindings are fairly limited, we need to define a searchController (and force invoke it in the
 * frontend by attaching it to a DOM element). We may as well bind it to the right place.
 */
recMap.controller('searchController', function($scope, dataService, propService, yearService) {

    // constructs the suggestion engine for Countries
    var CountriesSearch = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: function() {
            var conts = [];
            for (cont in $scope.ContToC) {
                conts.push({
                    value: cont + " " + $scope.ContToC[cont],
                    code: $scope.ContToC[cont],
                    contName: cont,
                    type: "Country"
                });
            }
            return conts;
        }
    });

    // constructs the suggestion engine for Properties
    var EconPropsSearch = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: function() {
            var props = [];
            for (econVar in $scope.EconProps) {
                props.push({
                    value: econVar +
                        " " + $scope.EconProps[econVar].Name +
                        " " + $scope.EconProps[econVar].Source +
                        " " + $scope.EconProps[econVar]["Impact on Susceptibility"] +
                        " " + $scope.EconProps[econVar]["Impact Rating"] +
                        " " + $scope.EconProps[econVar]["EconClasses"].join(" "),
                    code: econVar,
                    Name: $scope.EconProps[econVar].Name,
                    type: "Property"
                })
            }
            return props;
        }
    });

    // Years
    var yearsArray = yearService.getYears();
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
            return isEmptyObject(dataService.getContToC());
        },
        function(newValue, oldValue, scope) {
            if (newValue == false) {
                $scope.ContToC = dataService.getContToC();
                CountriesSearch.initialize(true);
            }
    });

    // Watches the EconProps output, waits for it to load. Once loaded, it initializes the search.
    $scope.$watch(
        function () {
            return isEmptyObject(propService.getPropData(true));
        },
        function(newValue, oldValue, scope) {
            if (newValue == false) {
                console.log("Props for Search:", !newValue, $scope.EconProps);
                $scope.EconProps = propService.getPropData(true);
                EconPropsSearch.initialize(true);
            }
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
                    return '<b><span>' + country.contName + '</span></b>' +
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
                    return '<span><b>' + year.value + '</b></span>'
                }
            }
        },
        {
            name: 'search-properties',
            displayKey: 'value',
            source: EconPropsSearch.ttAdapter(),
            templates: {
                header: '<h5 class="type-name">Properties</h5>',
                suggestion: function(prop) {
                    return  '<span>' + prop.Name + '</span>' +
                        '<span style="float: right"><b>' + prop.code + ':</b></span>'
                }
            }
        }
    );

    $('#typeahead-search').on('typeahead:selected', function (e, datum) {
        console.log(datum);
        if (datum.type == "Country") {
            dataService.setCountry(datum.code);
        } else if (datum.type == "year") {
            yearService.setYear(parseInt(datum.value));
        } else if (datum.type == "Property") {
            propService.setProperty(datum.code);
        }
        $scope.$apply();
    });

})

