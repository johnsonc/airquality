var topoJsonUrl = "/static/data/india-topo.json";
//console.log(document.getElementById('body').clientWidth, window.innerHeight);
var mapDim = Math.min(window.innerWidth*0.8/2, window.innerHeight);	    
var width = mapDim;
var height = mapDim;

//create unit projection
var projection = d3.geo.mercator()
    .scale(1)
    .translate([0,0]);

// create the path
var path = d3.geo.path()
    .projection(projection);

var varmx;
var varind;

d3.json(topoJsonUrl, function(error, mx) {
    var svg = d3.select("#map2").append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("preserveAspectRatio","xMidYMid meet").attr("viewBox","0 0 600 450");

    varmx=mx;

    console.log(mx);
    
    var ind = topojson.feature(mx, mx.objects.india);
    varind=ind;

    // see http://stackoverflow.com/questions/14492284/center-a-map-in-d3-given-a-geojson-object
    var b = path.bounds(ind),
    s = .95 / Math.max((b[1][0] - b[0][0]) / width, (b[1][1] - b[0][1]) / height),
    t = [(width - s * (b[1][0] + b[0][0])) / 2, (height - s * (b[1][1] + b[0][1])) / 2];

    // Update the projection to use computed scale & translate.
    projection
        .scale(s)
        .translate(t);
    
    var geoPaths = svg.append("g")
	.attr("class", "states")
	.selectAll("path")
	.data(topojson.feature(mx, mx.objects.india).features);
      
    geoPaths.enter().append("path")
    	.attr("d", path);
    
    // not sure what this code was supposed to do
    var p =svg.append("path")
            .datum(topojson.mesh(mx, mx.objects.india))    
});





