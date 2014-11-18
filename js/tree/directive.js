recMap.directive("myTree", function ($window, propService) {
    return {
        restrict: "A",
        scope: {},
        link: function (scope) {
            var m = [0, 90, 0, 90],
                w = 1024 - m[1] - m[3],
                h = 300 - m[0] - m[2],
                i = 0,
                root;

            var propColours = {
                HIGH: {
                    border: "#e51c23",
                    fill: "#ff2129"
                },
                MED: {
                    border: "#ff5722",
                    fill: "#ff9800"
                },
                LOW: {
                    border: "#259b24",
                    fill: "#5af158"
                },
                OTHER: {
                    border: "#3f51b5",
                    fill: "#6889ff"
                }
            };

            var tree = d3.layout.tree()
                .size([h, w]);

            var diagonal = d3.svg.diagonal()
                .projection(function (d) {
                    return [d.y, d.x];
                });

            var vis = d3.select("#propTree").append("svg:svg")
                .attr("width", w)//+ m[1] + m[3])
                .attr("height", h)// + m[0] + m[2])
                .append("svg:g")
                .attr("transform", "translate(" + m[3] + "," + m[0] + ")");

            // Watch the var propGroups. When available, generate the tree json and draw it..
            scope.$watch(
                function () {
                    if (propService.isEgroupsReady()) {
                        scope.propGroups = propService.getPropGroups();
                        return true;
                    }
                    return false;
                },
                function (newValue, oldValue, scope) {
                    if (newValue == true) {
                        var copyProps = scope.propGroups;
                        var treeDict = {"name": "Properties", "children": []};
                        for (var group in copyProps) {
                            if (copyProps.hasOwnProperty(group)) {
                                var children = [];
                                for (var child in group) {
                                    if (group.hasOwnProperty(child) && copyProps[group][child] != undefined) {
                                        var propStats = propService.getPropExpanded(copyProps[group][child]);
                                        children.push({
                                            "name": copyProps[group][child],
                                            "fullName": propStats["Name"],
                                            "rating": propStats["Impact Rating"],
                                            "children": []
                                        });
                                    }
                                }
                                treeDict.children.push({"name": group, children: children});
                            }
                        }
                        draw(treeDict);
                    }
                });

            scope.$watch(
                function () {
                    return propService.getCurProp();
                }, function (newValue) {
                    if (newValue != undefined) {
                        var propStats = propService.getPropExpanded(newValue);
                        var propGroup;
                        if (propStats.EconClasses.constructor === Array)
                            propGroup = propStats.EconClasses[0];
                        else
                            propGroup = propStats.EconClasses;
                        console.log("New property!", propGroup, newValue);
                        if (root != undefined) {
                            root.children.forEach(closeAll);
                            console.log(tree.nodes(root));
                        }
                    }
                }
            );

            function draw(json) {
                root = json;
                root.x0 = h / 2;
                root.y0 = 0;

                function toggleAll(d) {
                    if (d.children) {
                        d.children.forEach(toggleAll);
                        toggle(d);
                    }
                }

                // Initialize the display to show a few nodes.
                root.children.forEach(toggleAll);
                update(root);
                //toggle(root._children[3]);
            }

            function update(source) {
                var duration = d3.event && d3.event.altKey ? 5000 : 500;

                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse();

                // Normalize for fixed-depth.
                nodes.forEach(function (d) {
                    d.y = d.depth * 180;
                });

                // Update the nodes…
                var node = vis.selectAll("g.node")
                    .data(nodes, function (d) {
                        return d.id || (d.id = ++i);
                    });

                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("svg:g")
                    .attr("class", "node")
                    .attr("transform", function () {
                        return "translate(" + source.y0 + "," + source.x0 + ")";
                    })
                    .on("click", function (d) {
                        toggle(d);
                        update(d);
                    }).on("mouseover", function (d) {
                        var g = d3.select(this); // The node
                        // The class is used to remove the additional text later
                        var info = g.append('text')
                            .classed('info', true)
                            .attr('x', 20)
                            .attr('y', 10)
                            .text(d.fullName);
                    })
                    .on("mouseout", function () {
                        // Remove the info text on mouse out.
                        d3.select(this).select('text.info').remove();
                    });

                nodeEnter.append("svg:circle")
                    .attr("r", 1e-6)
                    .style("fill", function (d) {
                        if (d._children && d.rating != undefined) {
                            return propColours[d.rating] ? propColours[d.rating].fill : propColours.OTHER.fill;
                        }
                        return d._children ? propColours.OTHER.border : propColours.OTHER.fill;
                    });

                nodeEnter.append("svg:text")
                    .attr("x", function (d) {
                        return d.children || d._children ? -10 : 10;
                    })
                    .attr("dy", ".35em")
                    .attr("dx", "-.60em")
                    .attr("text-anchor", function (d) {
                        return d.children || d._children ? "end" : "start";
                    })
                    .text(function (d) {
                        return d.name;
                    })
                    .style("fill-opacity", 1e-6);

                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function (d) {
                        return "translate(" + d.y + "," + d.x + ")";
                    });

                nodeUpdate.select("circle")
                    .attr("r", 9)
                    .style("fill", function (d) {
                        if (d._children && d.rating != undefined) {
                            return propColours[d.rating] ? propColours[d.rating].fill : propColours.OTHER.fill;
                        }
                        return d._children ? propColours.OTHER.border : propColours.OTHER.fill;
                    });

                nodeUpdate.select("text")
                    .style("fill-opacity", 1);

                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function () {
                        return "translate(" + source.y + "," + source.x + ")";
                    })
                    .remove();

                nodeExit.select("circle")
                    .attr("r", 1e-6);

                nodeExit.select("text")
                    .style("fill-opacity", 1e-6);

                // Update the links…
                var link = vis.selectAll("path.link")
                    .data(tree.links(nodes), function (d) {
                        return d.target.id;
                    });

                // Enter any new links at the parent's previous position.
                link.enter().insert("svg:path", "g")
                    .attr("class", "link")
                    .attr("d", function () {
                        var o = {x: source.x0, y: source.y0};
                        return diagonal({source: o, target: o});
                    })
                    .transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition links to their new position.
                link.transition()
                    .duration(duration)
                    .attr("d", diagonal);

                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function () {
                        var o = {x: source.x, y: source.y};
                        return diagonal({source: o, target: o});
                    })
                    .remove();

                // Stash the old positions for transition.
                nodes.forEach(function (d) {
                    d.x0 = d.x;
                    d.y0 = d.y;
                });
            }

            // Toggle children.
            function toggle(d) {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
            }

            // close all children
            function closeAll(d) {
                if (d.children) {
                    console.log("has children");
                    d.children.forEach(closeAll);
                    close(d);
                }
            }

            function close(d) {
                if (d.children) {
                    console.log("toggling...");
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
            }
        }
    }
});