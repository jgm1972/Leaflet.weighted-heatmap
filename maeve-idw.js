/*
(c) 2016, Manuel Bär (www.geonet.ch)
Leaflet.idw, a tiny and fast inverse distance weighting plugin for Leaflet.
Largely based on the source code of Leaflet.heat by Vladimir Agafonkin (c) 2014
https://github.com/Leaflet/Leaflet.heat
version: 0.0.2
*/
!function() {
    "use strict";

    function simpleidw(canvas) {
    if (!(this instanceof simpleidw))
    return new simpleidw(canvas);

    this._canvas = canvas = typeof canvas === 'string' ? document.getElementById(canvas) : canvas;

    this._ctx = canvas.getContext('2d');
    this._width = canvas.width;
    this._height = canvas.height;

    this._max = 1;
    this._data = [];

    // this.knn_count = 0;

    
    }

    simpleidw.prototype = {

    defaultCellSize: 25,

    defaultGradient: {
    0.0: '#000066',
    0.1: 'blue',
    0.2: 'cyan',
    0.3: 'lime',
    0.4: 'yellow',
    0.5: 'orange',
    0.6: 'red',
    0.7: 'Maroon',
    0.8: '#660066',
    0.9: '#990099',
    1.0: '#ff66ff'
    },

    data: function(data) {
    this._data = data;
    return this;
    },

    max: function(max) {
    this._max = max;
    return this;
    },

    add: function(point) {
    this._data.push(point);
    return this;
    },

    clear: function() {
    this._data = [];
    return this;
    },

    cellSize: function(r) {
    // create a grayscale blurred cell image that we'll use for drawing points
    var cell = this._cell = document.createElement("canvas")
    , ctx = cell.getContext('2d');
    this._r = r;

    cell.width = cell.height = r;

    ctx.beginPath();
    ctx.rect(0, 0, r, r);
    ctx.fill();
    ctx.closePath();

    return this;
    },

    resize: function() {
    this._width = this._canvas.width;
    this._height = this._canvas.height;
    },

    gradient: function(grad) {
        //adjust the gradient dictionary for the max value passed in
        this._grad = grad

        return this;
    },

    findColor: function(value) {
        var prev_key = 0;
        var count = 0;
        var percent = value / this._max; //need to compare the percentage to the gradient

        //in this._grad key is the numeric value and value is color
        //we want to take the value and return the corresponding color

        for (let key in this._grad) {
            if (count == Object.keys(this._grad).length) {
                //if this is the last key in the dictionary return this value
                return this._grad[key];
            } else if (percent == key) {
                return this._grad[key];
            } else if (percent > prev_key && percent < key) {
                return this._grad[prev_key]
            } else {
                prev_key = key;
                count++;
            }
        } 

    },

    findOpacity: function(value) {
        //opacity is their percentage. 
        var percent = value / this._max;
        percent = percent + 0.1;

        if (percent < 0.2) {
            return 0.2
        } else {
            return percent;
        }
        
    },

    draw: function(opacity) {
        var ctx = this._ctx;

        ctx.clearRect(0, 0, this._width, this._height); //make sure that blank slate when color
        
        for (let i=0; i<this._data.length; i++) {
            //loop through data that is passed in from redraw
            var p = this._data[i];

            if (p[2]) {

                var color = this.findColor(p[2]); //take the intensity value and find the color based on gradient
                var opacity = this.findOpacity(p[2]); //take the intensity value and find the opacity 
                ctx.fillStyle = color;
                ctx.globalAlpha = opacity;

                // Shadow
                ctx.shadowColor = color;
                ctx.shadowBlur = 25;
                

                ctx.beginPath(); //begin a path
                ctx.fillRect(p[0], p[1], this._r, this._r); //draw rectangle in this cell. 
    
            }
        }

        return this;
    },

   


    },
    window.simpleidw = simpleidw
    }(),

    L.IdwLayer = (L.Layer ? L.Layer : L.Class).extend({
    /*
                options: {
                    opacity: 0.5,
                    maxZoom: 18,
                    cellSize: 1,
                    exp: 2,
                    max: 100
                },
                */
                initialize: function(latlngs, options) {
                    this._latlngs = latlngs;
                    L.setOptions(this, options);
                },

                setLatLngs: function(latlngs) {
                    this._latlngs = latlngs;
                    return this.redraw();
                },

                addLatLng: function(latlng) {
                    this._latlngs.push(latlng);
                    return this.redraw();
                },

                setOptions: function(options) {
                    L.setOptions(this, options);
                    if (this._idw) {
                        this._updateOptions();
                    }
                    return this.redraw();
                },

                redraw: function() {
                    if (this._idw && !this._frame && !this._map._animating) {
                        this._frame = L.Util.requestAnimFrame(this._redraw, this);
                    }
                    return this;
                },

                onAdd: function(map) {
                    this._map = map;

                    if (!this._canvas) {
                        this._initCanvas();
                    }

                    map._panes.overlayPane.appendChild(this._canvas);

                    map.on('moveend', this._reset, this);

                    if (map.options.zoomAnimation && L.Browser.any3d) {
                        map.on('zoomanim', this._animateZoom, this);
                    }

                    this._reset();
                },

                onRemove: function(map) {
                    map.getPanes().overlayPane.removeChild(this._canvas);

                    map.off('moveend', this._reset, this);

                    if (map.options.zoomAnimation) {
                        map.off('zoomanim', this._animateZoom, this);
                    }
                },

                addTo: function(map) {
                    map.addLayer(this);
                    return this;
                },
                fix_lng: function(lng){
                    //get the remainder from division
                    var fixed_lng = Math.abs(lng)%180;
                    //rotations is actually 1/2 rotations.
                    var rotations = Math.floor(Math.abs(lng)/180);
                    //if the lng is in the correct -180 to 180 range
                    if (Math.abs(lng) <180){
                        fixed_lng = lng
                    }
                    //For positive lngs, if the modulo is 1, get the distance from the antemeridian
                    else if (rotations % 2){
                        if (lng <-180){ 
                           fixed_lng = 180-fixed_lng
                        }
                        else{
                          fixed_lng = fixed_lng-180
                        }
                    }
                    //If modulo of rotations is 0, get distance from 0, the prime meridian
                    else{
                        if (lng > 180){ 
                           fixed_lng = fixed_lng
                        }
                        else{
                          fixed_lng = fixed_lng*-1
                        }
                    }
                    return fixed_lng
                  },
                  getDistance: function(origin, destination) {
                    function toRadian(degree) {
                        return degree*Math.PI/180;
                    } 
                    // return distance in meters
                    var lon1 = toRadian(origin[1]),
                        lat1 = toRadian(origin[0]),
                        lon2 = toRadian(destination[1]),
                        lat2 = toRadian(destination[0]);
                
                    var deltaLat = lat2 - lat1;
                    var deltaLon = lon2 - lon1;
                
                    var a = Math.pow(Math.sin(deltaLat/2), 2) + Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(deltaLon/2), 2);
                    var c = 2 * Math.asin(Math.sqrt(a));
                    var EARTH_RADIUS = 6371;
                    return c * EARTH_RADIUS * 1000;
                },

                quadify(x, y, width, height, topleft, array, count) {
                    // //this function checks to see how many points are within rectangle using quadtree and then based on this result decides to spilt rectangle or not. 

                    var ctx = this._canvas.getContext('2d');

   
                    var topleft_latlng = map.containerPointToLatLng(topleft); //find the latlng of the topleft corner of the rectangle. this is furtherst point from center. 


                    var cp = L.point(x, y); //find center point
                    var latlon = map.containerPointToLatLng(cp); //convert to latlng
                    

                    var pixelDistance =  topleft.distanceTo(cp); //point distance to point returns pixel distance between center and topleft 
                    var meterDistance = map.distance(latlon, topleft_latlng); //meter distance between two latlngs. 

                    if (!array) {
                        array = [];
                    }
                    if (!count) {
                        count = 0;
                    }

                    var points = lookup(latlon['lat'], this.fix_lng(latlon['lng']), 1, meterDistance); //find if there is a latlng in the meter distance from the center. stop once it has found one. 
                    // this._idw.knn_count++;

                    
                    if (points.length != 0) {
                        //if there is a latlng within this distance, want to subdivide the quadtree
                        
                        if (count < 3) {
                            count++; //we only want to subdivide three times
                            this.quadify(x+width/2, y-height/2, width/2, height/2, L.point(x,y-height), array, count); //ne
                            this.quadify(x-width/2, y-height/2, width/2, height/2, L.point(x-width, y-height), array, count); //nw
                            this.quadify(x+width/2, y+height/2, width/2, height/2, L.point(x,y), array, count); //se
                            this.quadify(x-width/2, y+height/2, width/2, height/2, L.point(x-width, y), array, count); //sw
                            count--;
                        } else {
                            array.push([x, y, width, height, topleft, pixelDistance, points]) //if we are at max count, add info to array of this rectangle
                            return array;
                        }

                    } else {
                        return;
                    }

                    return array; //finally return array to the redraw function. 

                },
                _initCanvas: function() {
                    var canvas = this._canvas = L.DomUtil.create('canvas', 'leaflet-idwmap-layer leaflet-layer');

                    var originProp = L.DomUtil.testProp(['transformOrigin', 'WebkitTransformOrigin', 'msTransformOrigin']);
                    canvas.style[originProp] = '50% 50%';

                    var size = this._map.getSize();
                    canvas.width = size.x;
                    canvas.height = size.y;

                    var animated = this._map.options.zoomAnimation && L.Browser.any3d;
                    L.DomUtil.addClass(canvas, 'leaflet-zoom-' + (animated ? 'animated' : 'hide'));

                    this._idw = simpleidw(canvas);
                    this._updateOptions();
                },

                _updateOptions: function() {
                    this._idw.cellSize(this.options.cellSize || this._idw.defaultCellSize);
                    if (this.options.max) {
                        this._idw.max(this.options.max);
                    } else {
                        this._idw.max(this._idw._max);
                    }

                    if (this.options.gradient) {
                        this._idw.gradient(this.options.gradient);
                    } else {
                        this._idw.gradient(this._idw.defaultGradient);
                    }
                    
                },

                _reset: function() {
                    var topLeft = this._map.containerPointToLayerPoint([0, 0]);
                    L.DomUtil.setPosition(this._canvas, topLeft);

                    var size = this._map.getSize();

                    if (this._idw._width !== size.x) {
                        this._canvas.width = this._idw._width = size.x;
                    }
                    if (this._idw._height !== size.y) {
                        this._canvas.height = this._idw._height = size.y;
                    }

                    this._redraw();
                },

                _redraw: function() {
                    if (!this._map) {
                        return;
                    }
                    var data = [], r = this._idw._r, size = this._map.getSize(), bounds = new L.Bounds(L.point([-r, -r]),size.add([r, r])),
                    exp = this.options.exp === undefined ? 1 : this.options.exp, max = this.options.max === undefined ? 1 : this.options.max, maxZoom = this.options.maxZoom === undefined ? this._map.getMaxZoom() : this.options.maxZoom, v = 1, cellCen = r / 2, grid = [], panePos = this._map._getMapPanePos(), i, len, p, cell, x, y, j, len2, k;
                    
                    // this._idw.knn_count = 0; //reset the knn count every time before redraw

                    //makes sures there are points that we are trying to plot
                    if (this._latlngs.length != 0) {

                        // console.time('process');

                        lookup = sphereKnn(this._latlngs); //adds points to the function for later use
                    

                        //pixel number in order to center the rectangle
                        var x_coordinate = bounds.getCenter().x;
                        var y_coordinate = bounds.getCenter().y;

                        var width = x_coordinate; //width and height are from center to edge so half of the screen
                        var height = y_coordinate;

                        // console.time('quadtree');
                        
                        var rectangles = this.quadify(x_coordinate, y_coordinate, width, height, bounds.getTopLeft()); //this is entirety of screen based on bounds.

                        // console.timeEnd('quadtree');


                        var checked_cells = {}; //dictionary to make sure we are not repeating cell lookup 

                        if (rectangles) {

                        

                            for (var m =0; m < rectangles.length; m++) {
                                //each rectangle is [x, y, width, height, topleft, pixelDistance] x and y is center coordinates of the rectangle
                                var curr_rectangle = rectangles[m];

                                var topx = curr_rectangle[0] - curr_rectangle[5]; //find outer edge of the circle
                                var topy = curr_rectangle[1] - curr_rectangle[5]; 

                                var nCellX = Math.ceil((curr_rectangle[5]*2/ r)) + 1; //should be pixelDistance*2 in order to find dimensions of circle
                                var nCellY = Math.ceil((curr_rectangle[5]*2 / r)) + 1; 

                                
                                //loop through the cells in the rectangle
                                for (i = 0,len = nCellY; i < len; i++) {
                                    for (j = 0,len2 = nCellX; j < len2; j++) {

                                        var x = j * r + topx; //find the x and y coordinate of the topleft point of the cell
                                        var y = i * r + topy;

                                        x = x - x%r; //make sure we are starting at the same pixel location in increments of the radius
                                        y = y - y%r;

                                        checker = x.toString() + y.toString(); //creates unique id for the cells

                                        if (checker in checked_cells) {
                                            continue; //if the cell is already in our dictionary, it has been processed so skip
                                        } else {
                                            checked_cells[checker] = 1; //otherwise add cell to the dictionary
                                        
                                            var numerator = 0, denominator = 0;
                                            var numerator_idw = 0, denominator_idw = 0;
                                            var cp = L.point(x, y); //get the point of the topleft corner of the cell
                                            latlon = map.containerPointToLatLng(cp); //get the latlng of the topleft corner of the cell
                                            fixed_lng = this.fix_lng(latlon['lng']);
                                            points = lookup(latlon['lat'], this.fix_lng(latlon['lng']), 100, 90000); //use knn function to find latlngs in 90000 meters of this latlng
                                            // this._idw.knn_count++;



                                            for (const cell of points){
                                                //for each latlng that is returned from knn function

                                                var dist = this.getDistance([cell[0], cell[1]], [latlon['lat'], fixed_lng]); //get the distance from the cell
                                                val = cell[2];
                                                if(dist===0){ //if the distance is 0, this is exact location of latlng so value is exact
                                                    numerator = val;
                                                    denominator = 1;
                                                    break;
                                                }
                                            
                                                //otherwise calculate the idw value
                                                var dist2 = Math.pow(dist, exp);
                                                
                                                numerator += (val/dist2);
                                                denominator += (1/dist2);
                                                
                                            }

                                            if (denominator != 0) {
                                                //if the denomainator has been modified, add the cell to data 
                                                const interpolVal = numerator/denominator;
                                                cell = [x, y, interpolVal];
                                                
                                                if (cell) {
                                                    data.push([
                                                        Math.round(cell[0]),
                                                        Math.round(cell[1]),
                                                        Math.min(cell[2], max),
                                                    ]);
                                                }
                                            }
                                        }
                                    
                                    }
                                }
                            }

                        }
                        
                        // console.log(this._idw.knn_count);
                        // console.timeEnd('process');
                        // console.time('draw ' + data.length);
                        this._idw.data(data).draw(this.options.opacity); //call the draw function to color the cells that are in data. 
                        // console.timeEnd('draw ' + data.length);
                        

                        this._frame = null;
                        
                    }

                    
                },

                _animateZoom: function(e) {
                    var scale = this._map.getZoomScale(e.zoom)
                        , offset = this._map._getCenterOffset(e.center)._multiplyBy(-scale).subtract(this._map._getMapPanePos());

                    if (L.DomUtil.setTransform) {
                        L.DomUtil.setTransform(this._canvas, offset, scale);

                    } else {
                        this._canvas.style[L.DomUtil.TRANSFORM] = L.DomUtil.getTranslateString(offset) + ' scale(' + scale + ')';
                    }
                }
            });

            L.idwLayer = function(latlngs, options) {
                return new L.IdwLayer(latlngs, options);
            }
            ;