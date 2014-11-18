/**
 * Created by aditya on 10/11/14.
 */

/**
 * Even though no Angular Frontend/Template Expressions are used for the searchController (Angular
 * bindings are fairly limited, we need to define a searchController (and force invoke it in the
 * frontend by attaching it to a DOM element). We may as well bind it to the right place.
 *
 * EDIT: http://thecodebarbarian.wordpress.com/2013/09/23/the-8020-guide-to-writing-angularjs-directives/
 * No, a directive is appropriate for this purpose.
 */
recMap.directive("mySearch", function($window, dataService, propService, yearService, similarService) {
    return {
        restrict: "A",
        scope: {
            // Critical binding step.
            // Tells Angular to pick up the OBJECT under
            // here from the scope of the controlling Controller.
        },
        link: function (scope, elem, attrs) {
            // constructs the suggestion engine for similar Economies
            var simSearch = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: function() {
                    var sims = [];
                    for (var head in scope.similar) {
                        for (var simCode1 in scope.similar[head]) {
                            var cname1 = dataService.getCodeToCont()[simCode1];
                            // This country's similarities - simCode1, cname1
                            for (var i = 0; i < scope.similar[head][simCode1].length; i++) {
                                var simCode2 = scope.similar[head][simCode1][i];
                                if (simCode2 == simCode1)
                                    continue;
                                var cname2 = dataService.getCodeToCont()[simCode2];
                                var match1, match2;
                                if (head != 'all') {
                                    match1 = "similarToby:" + " " + head + ": " + cname1 + " " + simCode1;
                                } else {
                                    match1 = "similarTo:" + " " + head + ": " + cname1 + " " + simCode1;
                                }
                                // If the above matches, we map this to cont2
                                // console.log(cname1, cname2, "similar over ", head);
                                var over = head == "all" ? "all variables" : head;
                                sims.push({
                                    value: match1,
                                    similarityFound: "similar over " + over,
                                    contName: cname2,
                                    code: simCode2,
                                    type: "similarity"
                                });
                            }
                        }
                    }
                    return sims;
                },
                limit: 30
            });

            scope.$watch(
                function() {
                    return similarService.isLoaded() &&
                        dataService.isLoaded() &&
                        propService.isEgroupsReady();
                },
                function(newVal, oldVal, scope) {
                    if (newVal == true) {
                        scope.similar = similarService.getSimilarData();
                        console.log("allLoaded", scope.similar, scope.EconProps, scope.ContToC);
                        // Now do any complex search or similar search, as you please.
                        simSearch.initialize();
                    }
                }
            )

            var CountriesSearch = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: function() {
                    var conts = [];
                    for (var cont in scope.ContToC) {
                        conts.push({
                            value: "Country: " + cont + " " + scope.ContToC[cont],
                            code: scope.ContToC[cont],
                            contName: cont,
                            type: "Country"
                        });
                    }
                    return conts;
                },
                limit: 10
            });

            // constructs the suggestion engine for Properties
            var EconPropsSearch = new Bloodhound({
                datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                local: function() {
                    var props = [];
                    for (var econVar in scope.EconProps) {
                        props.push({
                            value: "Property: " + econVar +
                                " " + scope.EconProps[econVar].Name +
                                " " + scope.EconProps[econVar].Source +
                                " " + scope.EconProps[econVar]["Impact on Susceptibility"] +
                                " " + scope.EconProps[econVar]["Impact Rating"] +
                                " " + scope.EconProps[econVar]["EconClasses"].join(" "),
                            code: econVar,
                            Name: scope.EconProps[econVar].Name,
                            type: "Property"
                        })
                    }
                    return props;
                },
                limit: 30
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
                }; }),
                limit: 15
            });
            searchYears.initialize();


            // Watches the ContToC output, waits for it to load. Once loaded, it initializes the search.
            scope.$watch(
                function () {
                    return isEmptyObject(dataService.getContToC());
                },
                function(newValue, oldValue, scope) {
                    if (newValue == false) {
                        scope.ContToC = dataService.getContToC();
                        CountriesSearch.initialize(true);
                    }
                });

            // Watches the EconProps output, waits for it to load. Once loaded, it initializes the search.
            scope.$watch(
                function () {
                    return isEmptyObject(propService.getPropData(true));
                },
                function(newValue, oldValue, scope) {
                    if (newValue == false) {
                        console.log("Props for Search:", !newValue, scope.EconProps);
                        scope.EconProps = propService.getPropData(true);
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
                                '<span style="float: right"><b>' + prop.code + '</b></span>'
                        }
                    }
                },
                {
                    name: 'search-similar',
                    displayKey: 'value',
                    source: simSearch.ttAdapter(),
                    templates: {
                        header: '<h5 class="type-name">Similar Economies</h5>',
                        suggestion: function(country) {
                            return '<b><span>' + country.contName + ' (' + country.code + ')</span></b>' +
                                '<span style="float: right">' + country.similarityFound + '</span>'
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
                } else if (datum.type == "similarity") {
                    dataService.setCountry(datum.code);
                }
                scope.$apply();
            });

        }
    }
});
