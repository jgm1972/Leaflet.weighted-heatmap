Leaflet.weighted-heatmap
===============

Leaflet.weighted-heatmap is a simple and fast heatmap plugin for [Leaflet](https://leafletjs.com/). It is largely based on this [Leaflet inverse distance weighting plugin](https://github.com/spatialsparks/Leaflet.idw). This plugin is modified due to encountering numerous problems with current Leaflet heatmap plugins when trying to make a weighted heatmap based solely on value and not density.  The [Leaflet.heat plugin](https://github.com/Leaflet/Leaflet.heat) is also used. Additionally, a custom quadtree and [KNN nearest neighbors function](https://github.com/darkskyapp/sphere-knn) is utilized in an attempt to optimize performance.  It is included in the bundle.js script created with [Browserify](https://github.com/browserify/browserify).
This fork of [Maeve Smith's repository](https://github.com/smithmaeve/Leaflet.weighted-heatmap) was created solely to host a demo of her work.


## Usage

Leaflet.weighted-heatmap is only tested on Leaflet version 1.9.4.

Include `idw.js` from the src folder, then create a heatmap by calling
`L.idwLayer(latlngs, options)` where latlngs is an array of [lat, lng, intensity]. 


### Options

 - **max**: the highest intensity value in your dataset. optional, defaults to `1.0`
 - **cellSize**: height and width of each cell on the map. optional, defaults to `25`
 - **exp**: exponent used for weighting for idw map. optional, defaults to `25`
   control that you added manually and do not want a separate loading control.
 - **gradient**: color gradient configuration, `e.g. {0.4: 'blue', 0.65: 'yellow', 0.9: 'red'}`

    ```
    {
        cellSize: 8,
		exp: 2,
		max: 10,
		gradient: {0: "darkBlue", 0.2 :"cyan", 0.5: "lime", 0.7:"orange", 0.9:"red"}
    }
    ```



## Demos

See [Leaflet.weighted-heatmap](https://jgm1972.github.io/) in action (Click on Heatmap Layer, select location, and hit filter):


## License

Leaflet.weighted-heatmap is free software, and may be redistributed under the [MIT License](https://jgm1972.github.io/).


 [Leaflet](https://github.com/Leaflet/Leaflet)
 [Leaflet inverse distance weighting plugin](https://github.com/spatialsparks/Leaflet.idw)
 [Leaflet.heat plugin](https://github.com/Leaflet/Leaflet.heat)
 [KNN nearest neighbors function](https://github.com/darkskyapp/sphere-knn)
 [Browserify](https://github.com/browserify/browserify)
 [Leaflet.weighted-heatmap](https://github.com/smithmaeve/Leaflet.weighted-heatmap)
 [MIT License](https://spdx.org/licenses/MIT.html)
