recMap.directive("myMap", function($window, mapService, dataService, propService, yearService, similarService) {
    return {
        restrict: "A",
        link: function (scope, elem, attrs) {

            // Invoke this call.
            scope.similarData = similarService.getSimilarData();

            // Updates with a new redraw timer when window is resized.
            d3.select(window).on("resize", throttle);

            var zoom = d3.behavior.zoom()
                .scaleExtent([1, 9])
                .on("zoom", move);

            // This is allowed inside a directive.
            var width = document.getElementById('MapContainer').offsetWidth;
            var mapTooltip = d3.select("#MapContainer").append("div").attr("class", "tooltip hidden");
            // var tooltip = $('#chosenCountry');

            var height = width / 2;
            var centered;
            var topo, projection, path, svg, g;
            var graticule = d3.geo.graticule();

            var legend = d3.select("#legendBox")
                .append("div")
                .style("float", "left")
                .style("height", "70px")
                .style("margin-left", "-12%")
                .style("position", "absolute")
                .style("top", "-1%")
                .attr("id", "linearLegend")
                .attr("class", "legend");

            setup(width,height);

            function setup(width, height){
                projection = d3.geo.mercator()
                    .translate([(width/2), (height/1.5)])
                    .scale( width / 2 / Math.PI);

                path = d3.geo.path().projection(projection);
                console.log("Selected", d3.select("#MapContainer"));
                svg = d3.select("#MapContainer").append("svg")
                    .attr("width", width)
                    .attr("height", height)
                    .style("border", "5px solid #040406")
                    .call(zoom)
                    .on("click", click)

                g = svg.append("g");
            }

            // Watch if the mapData has arrived. When it does, make the map.
            // Note that there is no year data.
            scope.$watch(
                function () {
                    scope.mapJSON = mapService.getMapJSON();
                    return isEmptyObject(scope.mapJSON);
                },
                function(newValue, oldValue, scope) {
                    if (newValue == false) {
                        console.log("Got map data within directive:", scope.mapJSON);
                        scope.topo = topojson.feature(scope.mapJSON,
                            scope.mapJSON.objects.countries).features;
                        // Access as follows:
                        // angular.element("div#MapContainer").scope().topo
                        draw(scope.topo);
                    }
                });

            function draw(topo) {

                svg.append("path")
                    .datum(graticule)
                    .attr("class", "graticule")
                    .attr("d", path);

                g.append("path")
                    .datum({type: "LineString", coordinates: [[-180, 0], [-90, 0], [0, 0], [90, 0], [180, 0]]})
                    .attr("class", "equator")
                    .attr("d", path)
                    .style("fill", '#000000');

                // console.log("Attaching data:", topo)
                // What sorcery is this?
                // DATA JOIN: http://bost.ocks.org/mike/join/
                scope.country = g.selectAll(".country").data(topo);
//                console.log(scope.country);
                // angular.element("div#MapContainer").scope().country

                updateColorScales(scope.curProp());
                scope.country.enter().insert("path")
                    .attr("class", "country")
                    .attr("d", path)
                    .attr("id", function(d, i) { return d.id; })
                    .attr("title", function(d, i) { return d.properties.name; })
                    .style("fill", function(d, i) {
//                        return d.properties.color;
                        return getColor(d, scope.curProp(), scope.curYear());
                    })
                    .style("stroke", '#000000')
                    .style("stroke-width", "1");

                outlineMeAndSimilar(1);

                //offsets for tooltips
                var offsetL = document.getElementById('MapContainer').offsetLeft + 20;
                var offsetT = document.getElementById('MapContainer').offsetTop + 10;

                //tooltips
                scope.country
                    .on("mousemove", function(d, i) {
                        var mouse = d3.mouse(svg.node()).map( function(d) { return parseInt(d); } );
                        mapTooltip.classed("hidden", false)
                            .attr("style", "left:"+(mouse[0] + offsetL)+"px;top:"+(mouse[1] + offsetT)+"px")
                            .html("<p><h5>" + d.properties.name + "</h5></p>" +
                                "<b>" + scope.curProp() + ": &nbsp;</b>" +
                                dataService.getPropValFor(d.properties.code,
                                    scope.curProp(),
                                    scope.curYear()) + "");

                        d3.select(this)
                            .style("fill", "#FF0");
                    })
                    .on("mouseout",  function(d, i) {
                        mapTooltip.classed("hidden", true)
                        d3.select(this)
                            .style("fill", function(d, i) {
                                return getColor(d, propService.getCurProp(), yearService.getCurYear());
//                                return d.properties.color;
                            })
                    })
                    // More D3 Beauty - multiple listeners for an event.
                    .on('click.view', recenterCountry)
                    .on('click.update', updateService);
                    // console.log("Country Map objects:", scope.country);
            }


            function redraw() {
                console.log("Redrawing.");
                width = document.getElementById('MapContainer').offsetWidth;
                height = width / 2;
                d3.select('svg').remove();
                setup(width, height);
                draw(scope.topo);
            }


            function move() {
                var t = d3.event.translate;
                var s = d3.event.scale;
                zscale = s;
                var h = height/4;

                t[0] = Math.min(
                        (width/height)  * (s - 1),
                    Math.max( width * (1 - s), t[0] )
                );

                t[1] = Math.min(
                        h * (s - 1) + h * s,
                    Math.max(height  * (1 - s) - h * s, t[1])
                );

                zoom.translate(t);
                g.attr("transform", "translate(" + t + ")scale(" + s + ")");

                //adjust the country hover stroke width based on zoom level
                d3.selectAll(".country").style("stroke", "#000000");
                d3.selectAll(".country").style("stroke-width", 1 / s);

                outlineMeAndSimilar(s);
            }


            var throttleTimer;
            // Just invokes redraw 200ms after the window is resized.
            function throttle() {
                window.clearTimeout(throttleTimer);
                throttleTimer = window.setTimeout(function() {
                    redraw();
                }, 200);
            }


            //geo translation on mouse click in map
            function click() {
                var latlon = projection.invert(d3.mouse(this));
                console.log(latlon);
            }


            //function to add points and text to the map (used in plotting capitals)
            function addpoint(lat,lon,text) {

                var gpoint = g.append("g").attr("class", "gpoint");
                var x = projection([lat,lon])[0];
                var y = projection([lat,lon])[1];

                gpoint.append("svg:circle")
                    .attr("cx", x)
                    .attr("cy", y)
                    .attr("class","point")
                    .attr("r", 1.5);

                //conditional in case a point has no associated text
                if(text.length>0){

                    gpoint.append("text")
                        .attr("x", x+2)
                        .attr("y", y+2)
                        .attr("class","text")
                        .text(text);
                }

            }

            // We need to listen to the global "curCountry" and update the map as it changes.
            scope.curCountry;
            scope.$watch(
                function() {
                    scope.curCountry = dataService.getCurCountry();
                    return scope.curCountry;
                },
                function (newValue, oldValue) {
                    if (newValue !== "World") { // Else if fites a DBG error, can't find variable.
                        var myCode = dataService.getContToC()[scope.curCountry];
                        console.log("Map detected that curCountry has changed to:", myCode);
                        scope.country.filter(function (d, i) {
                            if (d.properties.code == myCode) {
                                if (scope.centered != d.properties.code)
                                    recenterCountry(d, i);
                            }
                        })
                        outlineMeAndSimilar(1);
                    }
                }
            )

            // Changes view to the country provided only. Nothing more, nothing less.
            function recenterCountry(d, i) {
//                console.log("Recentering to...", d, i, scope.centered);
                var x, y, k;

                if (d && scope.centered != d.properties.code) {
                    var centroid = path.centroid(d);
                    x = centroid[0];
                    y = centroid[1];
                    k = 4;
                    scope.centered = d.properties.code;
                } else {
                    // Return to world view.
                    x = width / 2;
                    y = height / 2;
                    k = 1;
                    scope.centered = null;
                }

                g.transition()
                    .duration(750)
                    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                    .style("stroke-width", 1.5 / k + "px");
            }

            // Informs the service about the new country in town.
            function updateService(d, i) {
                // Do the magic.
                console.log("Selected:", d.properties);
                dataService.setCountry(d.properties.code);
                outlineMeAndSimilar(1);
                scope.$apply()
            }

            // Updates outline ass specified.
            function outlineMeAndSimilar(s) {
                s = s ? s : 1;

                scope.curCountryCode = '' || dataService.getContToC()[scope.getCurCountry()];
                var similarConts = similarService.getSimilarCountryType(scope.curCountryCode, "all")

                scope.country.style("stroke", "black").style("stroke-width", "1").style("stroke-dasharray", "0");

                // Update the similarEconomies.
                g.selectAll(".country").filter( function(d, i) {
                    if (similarConts.hasOwnProperty(d.properties.code)) {
                        return true;
                    }
                    return false;
                })
                    .style("stroke", "red")
                    .style("stroke-dasharray", "3, 1")
                    .style("stroke-width", 3 / s);

                // Make me blue.
                g.selectAll(".country").filter( function (d, i ) { if (d.properties.code == scope.curCountryCode) return true; return false; })
                    .style("stroke", "blue")
                    .style("stroke-width", 3 / s);

            }

            // Get the right color scales based on curProp.
            function updateColorScales(selectedProp) {
                var selectedPropExpanded = propService.getPropExpanded(selectedProp);
                if ((selectedPropExpanded.Name == "Loading") || isEmptyObject(scope.mapJSON))
                    return;

                var myDomain;
                if (selectedPropExpanded["Impact on Susceptibility"] == "Increased") {
                    // Higher values are worse.
                    myDomain = [ selectedPropExpanded.myMax, selectedPropExpanded.Mean, selectedPropExpanded.myMin ]
                } else {
                    myDomain = [ selectedPropExpanded.myMin, selectedPropExpanded.Mean, selectedPropExpanded.myMax ]
                }
                console.log("For: ", selectedProp, ", domain:", myDomain);
                scope.colorScale = d3.scale.linear()
                    .domain(myDomain)
                    .range(["red", "yellow", "green"]);
                d3.select("#linearLegend svg").remove();
                colorlegend("#linearLegend", scope.colorScale, "linear",
                    {
                        title: selectedProp,
                        linearBoxes: 5,
                        boxWidth: 30
                    });
            }

            // Get the right color based on curProp, if any.
            function getColor(d, selectedProp, selectedYear) {
                if (scope.colorScale) {
                    var val = dataService.getPropValFor(d.properties.code, selectedProp, selectedYear);
//                    console.log("Supplying color:", scope.colorScale(val));
                    if (val != "NA")
                        return scope.colorScale(val);
                    return "black";
                } else {
                    return d.properties.color;
                }
            }

            // Recolour if any property or year changes.
            scope.$watch(
                function() {
                    scope.curState = scope.curYear().toString() + scope.curProp();
                    return scope.curState;
                },
                function (newValue, oldValue) {
                    if (scope.colorScale) {
                    // Defined if drawn once.
                        redraw();
                    }
                }
            )
        }
    }
});