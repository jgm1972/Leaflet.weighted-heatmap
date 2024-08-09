Leaflet.weighted-heatmap
===============

Leaflet.weighted-heatmap is a simple and fast heatmap plugin for [Leaflet][]. It is largely based on this [Leaflet inverse distance weighting plugin][]. This plugin is modified due to encountering numerous problems with current Leaflet heatmap plugins when trying to make a weighted heatmap based solely on value and not density.  The [Leaflet.heat plugin][] is also used. Additionally, a custom quadtree and [KNN nearest neighbors function][] is utilized in an attempt to optimize performance.  It is included in the bundle.js script created with [Browserify][].


## Usage

Leaflet.weighted-heatmap is only tested on Leaflet version 1.9.4.

Include `maeve-idw.js` from the src folder, then create a heatmap by calling
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

See [Leaflet.weighted-heatmap][] in action (Click on Heatmap Layer, select location, and hit filter):


## License

Leaflet.weighted-heatmap is free software, and may be redistributed under the [MIT License][].


 [Leaflet]: https://github.com/Leaflet/Leaflet
 [Leaflet inverse distance weighting plugin]: https://github.com/spatialsparks/Leaflet.idw
 [Leaflet.heat plugin]: https://github.com/Leaflet/Leaflet.heat
 [KNN nearest neighbors function]: https://github.com/darkskyapp/sphere-knn
 [Browserify]: https://github.com/browserify/browserify
 [Leaflet.weighted-heatmap]: http://opsauto/aerosat_test_maeve/maeve.html
 [MIT License]: https://spdx.org/licenses/MIT.html
