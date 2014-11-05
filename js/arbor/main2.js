var final_data, continent_data;
(function($) {
    var Renderer = function(elt) {
        var dom = $(elt)
        var canvas = dom.get(0)
        var ctx = canvas.getContext("2d");
        var gfx = arbor.Graphics(canvas)
        var sys = null

        var _vignette = null
        var selected = null,
            nearest = null,
            _mouseP = null;


        var that = {
            init: function(pSystem) {
                sys = pSystem
                sys.screen({
                    size: {
                        width: dom.width(),
                        height: dom.height()
                    },
                    padding: [36, 60, 36, 60]
                })

                $(window).resize(that.resize)
                that.resize()
                that._initMouseHandling()

            },

            resize: function() {
                canvas.width = $(window).width()
                canvas.height = .75 * $(window).height()
                sys.screen({
                    size: {
                        width: canvas.width,
                        height: canvas.height
                    }
                })
                _vignette = null
                that.redraw()
            },

            redraw: function() {
                gfx.clear()

                sys.eachEdge(function(edge, p1, p2) {
                    if (edge.source.data.alpha * edge.target.data.alpha == 0) return
                    gfx.line(p1, p2, {
                        stroke: "#b2b19d",
                        width: 2,
                        alpha: edge.target.data.alpha
                    })
                })

                sys.eachNode(function(node, pt) {
                    var w = Math.max(20, 20 + gfx.textWidth(node.data.label))
                    if (node.data.alpha === 0) return
                    if (node.data.shape == 'dot') {
                        gfx.oval(pt.x - w / 2, pt.y - w / 2, w, w, {
                            fill: node.data.color,
                            alpha: node.data.alpha
                        })
                        gfx.text(node.data.label, pt.x, pt.y + 7, {
                            color: "white",
                            align: "center",
                            font: "Arial",
                            size: 12
                        })
                        gfx.text(node.data.label, pt.x, pt.y + 7, {
                            color: "white",
                            align: "center",
                            font: "Arial",
                            size: 12
                        })
                    } else {
                        gfx.rect(pt.x - w / 2, pt.y - 8, w, 20, 4, {
                            fill: node.data.color,
                            alpha: node.data.alpha
                        })
                        gfx.text(node.data.label, pt.x, pt.y + 9, {
                            color: "white",
                            align: "center",
                            font: "Arial",
                            size: 12
                        })
                        gfx.text(node.data.label, pt.x, pt.y + 9, {
                            color: "white",
                            align: "center",
                            font: "Arial",
                            size: 12
                        })
                    }
                })

                that._drawVignette()
            },

            _drawVignette: function() {
                var w = canvas.width
                var h = canvas.height
                var r = 20

                if (!_vignette) {
                    var top = ctx.createLinearGradient(0, 0, 0, r)
                    top.addColorStop(0, "#e0e0e0")
                    top.addColorStop(.7, "rgba(255,255,255,0)")

                    var bot = ctx.createLinearGradient(0, h - r, 0, h)
                    bot.addColorStop(0, "rgba(255,255,255,0)")
                    bot.addColorStop(1, "white")

                    _vignette = {
                        top: top,
                        bot: bot
                    }
                }

                // top
                ctx.fillStyle = _vignette.top
                ctx.fillRect(0, 0, w, r)

                // bot
                ctx.fillStyle = _vignette.bot
                ctx.fillRect(0, h - r, w, r)
            },

            switchMode: function(e) {
                if (e.mode == 'hidden') {
                    dom.stop(true).fadeTo(e.dt, 0, function() {
                        if (sys) sys.stop()
                        $(this).hide()
                    })
                } else if (e.mode == 'visible') {
                    dom.stop(true).css('opacity', 0).show().fadeTo(e.dt, 1, function() {
                        that.resize()
                    })
                    if (sys) sys.start()
                }
            },

            switchSection: function(newSection) {
                var parent = sys.getEdgesFrom(newSection)[0].source
                var children = $.map(sys.getEdgesFrom(newSection), function(edge) {
                    return edge.target
                })

                sys.eachNode(function(node) {
                    if (node.data.shape == 'dot') return // skip all but leafnodes

                    var nowVisible = ($.inArray(node, children) >= 0)
                    var newAlpha = (nowVisible) ? 1 : 0
                    var dt = (nowVisible) ? .5 : .5
                    sys.tweenNode(node, dt, {
                        alpha: newAlpha
                    })

                    if (newAlpha == 1) {
                        node.p.x = parent.p.x + .05 * Math.random() - .025
                        node.p.y = parent.p.y + .05 * Math.random() - .025
                        node.tempMass = .001
                    }
                })
            },

            _initMouseHandling: function() {
                // no-nonsense drag and drop (thanks springy.js)
                selected = null;
                nearest = null;
                var dragged = null;
                var oldmass = 1
                var _section = null

                var handler = {
                    moved: function(e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                        nearest = sys.nearest(_mouseP);

                        if (!nearest.node) return false

                        if (nearest.node.data.shape != 'dot') {
                            selected = (nearest.distance < 50) ? nearest : null
                            if (selected) {
                                dom.addClass('linkable')
                                window.status = selected.node.data.link.replace(/^\//, "http://" + window.location.host + "/").replace(/^#/, '')
                            } else {
                                dom.removeClass('linkable')
                                window.status = ''
                            }
                        } else if ($.inArray(nearest.node.name, ['arbor.js', 'code', 'docs', 'demos']) >= 0) {
                            if (nearest.node.name != _section) {
                                _section = nearest.node.name
                                that.switchSection(_section)
                            }
                            dom.removeClass('linkable')
                            window.status = ''
                        }

                        return false
                    },

                    clicked: function(e) {
                        var pos = $(canvas).offset();
                        _mouseP = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)
                        nearest = dragged = sys.nearest(_mouseP);

                        if (nearest && selected && nearest.node === selected.node) {
                            //TODO: Add changes here.
                            var link = selected.node.data.link
                                //                            if (link.match(/^#/)){
                                //                                $(that).trigger({type:"navigate", path:link.substr(1)})
                                //                            } else {
                                //                                window.location = link
                                //                            }
                                //                            return false
                        }

                        if (dragged && dragged.node !== null) dragged.node.fixed = true

                        $(canvas).unbind('mousemove', handler.moved);
                        $(canvas).bind('mousemove', handler.dragged)
                        $(window).bind('mouseup', handler.dropped)
                        return false
                    },

                    dragged: function(e) {
                        var old_nearest = nearest && nearest.node._id
                        var pos = $(canvas).offset();
                        var s = arbor.Point(e.pageX - pos.left, e.pageY - pos.top)

                        if (!nearest) return
                        if (dragged !== null && dragged.node !== null) {
                            var p = sys.fromScreen(s)
                            dragged.node.p = p
                        }

                        return false
                    },

                    dropped: function(e) {
                        if (dragged === null || dragged.node === undefined) return
                        if (dragged.node !== null) dragged.node.fixed = false
                        dragged.node.tempMass = 1000
                        dragged = null;
                        // selected = null
                        $(canvas).unbind('mousemove', handler.dragged)
                        $(window).unbind('mouseup', handler.dropped)
                        $(canvas).bind('mousemove', handler.moved);
                        _mouseP = null
                        return false
                    }
                }
                $(canvas).mousedown(handler.clicked);
                $(canvas).mousemove(handler.moved);

            }
        }
        return that
    }


    var getArborContinentNodes = function(continents){
        nodes = {"World": {label: "Shit.", color: "red", shape: "dot", alpha: 1}};
        for(var continent in continents){
            if (continents.hasOwnProperty(continent)) {
                //console.log(continent, continents[continent]);
                nodes[continent] = { label: continent, color: "#b2b19d", shape: "dot", alpha: 1 };
            }
        }
        return nodes;               
    }

    var getArborCountryNodes = function(countries){
        nodes = {};
        var i = 0;
        for(var country in countries){
            if (countries.hasOwnProperty(country)) {
                country_data = countries[country];
                nodes[country_data.code3] = { label: country_data.common_name, color: "black", shape: "dot", alpha: 1 };
            }
            //if (i++ > 15)
            //    break;
        }
        return nodes;
    }

    var getArborContinentEdges = function(continents){
        edges = {};
        for(var continent in continents){
            if (continents.hasOwnProperty(continent)) {
                edges[continent] = {};
                countries = continents[continent];
                for(var country in countries){
                    edges[continent][countries[country]] = {};
                }
            }
        }
        return edges;
    }

    function merge(obj1, obj2){
        var obj3 = {};
        for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
        for (var attrname in obj2) { obj3[attrname] = obj2[attrname]; }
        return obj3;
    }
    
    $(document).ready(function() {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                if (xhr.overrideMimeType)
                    xhr.overrideMimeType("application/json");
            }
        });
        $.when(
            $.getJSON("data/SPARTA.json", function(data) {
                final_data = data;
            }),
            $.getJSON("data/continents.json", function(data) {
                continent_data = data;
            })
        ).then(function() {
            var continents = getArborContinentNodes(continent_data);
            var countries = getArborCountryNodes(final_data);
            var nodes = merge(continents, countries);

            var continentToCountryEdges = getArborContinentEdges(continent_data);
            var continentEdges = {
                "World": {
                    "North America": {
                        length: .8
                    },
                    "South America": {
                        length: .8
                    },
                    "Europe": {
                        length: .8
                    },
                    "Africa": {
                        length: .8
                    },
                    "Asia": {
                        length: .8
                    },
                    "Oceania": {
                        length: .8
                    }
                }
            }
            var edges = merge(continentToCountryEdges, continentEdges);

            // var CLR = {
            //     branch: "#b2b19d",
            //     code: "orange",
            //     doc: "#922E00",
            //     demo: "#a7af00"
            // }

            // var theUI = {
            //     nodes: {
            //         "arbor.js": {
            //             color: "red",
            //             shape: "dot",
            //             alpha: 1
            //         },

            //         demos: {
            //             color: CLR.branch,
            //             shape: "dot",
            //             alpha: 1
            //         },
            //         halfviz: {
            //             color: CLR.demo,
            //             alpha: 0,
            //             link: '/halfviz'
            //         },
            //         atlas: {
            //             color: CLR.demo,
            //             alpha: 0,
            //             link: '/atlas'
            //         },
            //         echolalia: {
            //             color: CLR.demo,
            //             alpha: 0,
            //             link: '/echolalia'
            //         },

            //         docs: {
            //             color: CLR.branch,
            //             shape: "dot",
            //             alpha: 1
            //         },
            //         reference: {
            //             color: CLR.doc,
            //             alpha: 0,
            //             link: '#reference'
            //         },
            //         introduction: {
            //             color: CLR.doc,
            //             alpha: 0,
            //             link: '#introduction'
            //         },

            //         code: {
            //             color: CLR.branch,
            //             shape: "dot",
            //             alpha: 1
            //         },
            //         github: {
            //             color: CLR.code,
            //             alpha: 0,
            //             link: 'https://github.com/samizdatco/arbor'
            //         },
            //         ".zip": {
            //             color: CLR.code,
            //             alpha: 0,
            //             link: '/js/dist/arbor-v0.92.zip'
            //         },
            //         ".tar.gz": {
            //             color: CLR.code,
            //             alpha: 0,
            //             link: '/js/dist/arbor-v0.92.tar.gz'
            //         }
            //     },
            //     edges: {
            //         "arbor.js": {
            //             demos: {
            //                 length: .8
            //             },
            //             docs: {
            //                 length: .8
            //             },
            //             code: {
            //                 length: .8
            //             }
            //         },
            //         demos: {
            //             halfviz: {},
            //             atlas: {},
            //             echolalia: {}
            //         },
            //         docs: {
            //             reference: {},
            //             introduction: {}
            //         },
            //         code: {
            //             ".zip": {},
            //             ".tar.gz": {},
            //             "github": {}
            //         }
            //     }
            // }

            var theUI = {
                nodes: nodes,
                edges: edges
            }
            
            console.log(theUI);
            var sys = arbor.ParticleSystem()
            sys.parameters({
                stiffness: 900,
                repulsion: 2000,
                gravity: true,
                dt: 0.015
            })
            sys.renderer = Renderer("#sitemap")
            sys.graft(theUI)
        });

    })
})(this.jQuery)