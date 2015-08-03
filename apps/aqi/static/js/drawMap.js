function p(name){
    return function(d){ return d[name]; }
}
function toPositiveRadian(r){ return r > 0 ? r : r + Math.PI*2; }
function toDegree(r){ return r*180/Math.PI; }


var Width = $(window).width() 
var Height = $(window).height() 

var mapwidth = Math.round(Width*0.3);
mapheight = 600,
centered = true;
zoomRender = false;

var varWidth = Math.round(Width*0.5);
var varHeight = Math.round(Width*0.3);


var proj = d3.geo.azimuthalEqualArea()
    .scale(mapwidth)
    .translate([33.5, 262.5])
    .rotate([100, -45])
    .center([-17.6076, -4.7913]) // rotated [-122.4183, 37.7750]
    .scale(1297);

var path = d3.geo.path().projection(proj);


var svg = d3.select("#map").append("svg")
    .attr("width", mapwidth)
    .attr("height", mapheight)

var g = svg.append("g");
//d3=d3;

// Leaflet
var OpenWeatherMap_Clouds = L.tileLayer('http://{s}.tile.openweathermap.org/map/clouds/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
});
var OpenWeatherMap_Rain = L.tileLayer('http://{s}.tile.openweathermap.org/map/rain/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
});
var OpenWeatherMap_PressureContour = L.tileLayer('http://{s}.tile.openweathermap.org/map/pressure_cntr/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
});

var OpenWeatherMap_Wind = L.tileLayer('http://{s}.tile.openweathermap.org/map/wind/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
});

var OpenWeatherMap_Temperature = L.tileLayer('http://{s}.tile.openweathermap.org/map/temp/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Map data &copy; <a href="http://openweathermap.org">OpenWeatherMap</a>',
    opacity: 0.5
});

var OpenStreetMap_Mapnik = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var OpenStreetMap_Mapquest = L.tileLayer('http://oatile{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg', {
    attribution : 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency',
    subdomains : '1234'
});

var OpenTopoMap = L.tileLayer('http://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 16,
    attribution: 'Map data: &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var NASAGIBS_ViirsEarthAtNight2012 = L.tileLayer('http://map1.vis.earthdata.nasa.gov/wmts-webmerc/VIIRS_CityLights_2012/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}', {
    attribution: 'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System (<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
    bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
    minZoom: 1,
    maxZoom: 8,
    format: 'jpg',
    time: '',
    tilematrixset: 'GoogleMapsCompatible_Level'
});
// https: also suppported.
var Stamen_TonerHybrid = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-hybrid/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});
var MapQuestOpen_HybridOverlay = L.tileLayer('http://otile{s}.mqcdn.com/tiles/1.0.0/{type}/{z}/{x}/{y}.{ext}', {
    type: 'hyb',
    ext: 'png',
    attribution: 'Tiles Courtesy of <a href="http://www.mapquest.com/">MapQuest</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: '1234',
    opacity: 0.9
});

var Stamen_TonerLines = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-lines/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});
// https: also suppported.
var Stamen_TonerLabels = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toner-labels/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
});

var Stamen_TopOSMFeatures = L.tileLayer('http://stamen-tiles-{s}.a.ssl.fastly.net/toposm-features/{z}/{x}/{y}.png', {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png',
    bounds: [[22, -132], [51, -56]],
    opacity: 0.9
});

var OpenMapSurfer_AdminBounds = L.tileLayer('http://openmapsurfer.uni-hd.de/tiles/adminb/x={x}&y={y}&z={z}', {
    maxZoom: 19,
    attribution: 'Imagery from <a href="http://giscience.uni-hd.de/">GIScience Research Group @ University of Heidelberg</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var map = L.map('mappa', {
    center: [20,72],
    zoom: 7,
    layers: [OpenTopoMap, Stamen_TonerLabels]
});

var baseMaps = {
    "Default": OpenTopoMap,
    "Political": OpenStreetMap_Mapnik,
    "Satellite": OpenStreetMap_Mapquest,
    "Night": NASAGIBS_ViirsEarthAtNight2012,
};

var overlayMaps = {
    "OverlayBoundaries": OpenMapSurfer_AdminBounds,
    "Temperature":OpenWeatherMap_Temperature,
    "Wind":  OpenWeatherMap_Wind,
    "Air Pressure": OpenWeatherMap_PressureContour,
    "Rain": OpenWeatherMap_Rain,
    "Clouds": OpenWeatherMap_Clouds,
    "Topography":Stamen_TopOSMFeatures,
    "OverlayHybrid1": Stamen_TonerHybrid,
    "OverlayHybrid2": MapQuestOpen_HybridOverlay,
    "OverlayLines": Stamen_TonerLines,
    "OverlayLabels": Stamen_TonerLabels,
    
};   

L.control.layers(baseMaps, overlayMaps).addTo(map);

// when map is clicked, toggle zoom in and zoom out
function clicked(d) {

    if (d && centered !== d) {
	centroid = path.centroid(d);
	x = centroid[0];
	y = centroid[1] - 40;
	k = (d.id == "48" || d.id == "06") ? 2 : 4;
	centered = d;
    } else {
	x = width / 2;
	y = height / 2;
	k = 1;
	centered = null;
    }

    g.selectAll("path")
	.classed("active", centered && function(d) { return d === centered; });

    g.transition().duration(500)
  	.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")");

    d3.selectAll(".border")
	.transition().duration(500).style("stroke-width", .25 / k + "px");

    g.selectAll("path")
	.classed("active", centered && function(d) { return d === centered; });

    zoomRender = true;
}


var stateNametoAbv1 = {'Andaman and Nicobar': 'AN', 'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', 'Assam': 'AS', 'Bihar': 'BR', 'Chandigarh': 'CH', 'Chhattisgarh': 'CT', 'Dadra and Nagar Haveli': 'DN', 'Daman and Diu': 'DD', 'Delhi': 'DL', 'Goa': 'GA', 'Gujarat': 'GJ', 'Haryana': 'HR', 'Himachal Pradesh': 'HP', 'Jammu and Kashmir': 'JK', 'Jharkhand': 'JH', 'Karnataka': 'KA', 'Kerala': 'KL', 'Lakshadweep': 'LD', 'Madhya Pradesh': 'MP', 'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML', 'Mizoram': 'MZ', 'Nagaland': 'NL', 'Orissa': 'OR', 'Puducherry': 'PY', 'Punjab': 'PB', 'Rajasthan': 'RJ', 'Sikkim': 'SK', 'Tamil Nadu': 'TN', 'Telengana': 'TS', 'Tripura': 'TR', 'Uttar Pradesh': 'UP', 'Uttarakhand': 'UT', 'West Bengal': 'WB'}

var lastStreamTimeStamp;
var timerId; // current timer if started                                                      
function streamStart(){
    if (timerId) return;
    timerId = setInterval( streamUpdate, 30000);
    //streamUpdate();
    console.log('Stream started');
}

function streamStop() {
    clearInterval(timerId);
    timerId = null;
    console.log('Stream stopped');
}

function streamUpdate()
{
    if (!lastStreamTimeStamp) { return };
    now = new Date();
    queue()
	.defer(d3.json, "/airquality/api/aqfeed/"+lastStreamTimeStamp.toISOString().substr(0,19) + "/"+ now.toISOString().substr(0,19)+ "?format=json")
	.await(dataUpdate);        
}


function dataUpdate(error, newdatapoints){    
    if(newdatapoints.length != 0){
	processdata(newdatapoints);
	console.log(newdatapoints);	
	console.log('Stream updated');
	datapointCF.add(newdatapoints);
	dc.renderAll();
	console.log('Charts updated from stream');
    }
    else{
	console.log('Nothing to add from stream ');
    }   
    lastStreamTimeStamp = new Date();
}


var begin = setTimeout(function(){
   //streamStart();
}, 10000);


var widthScale = d3.scale.pow().exponent(.5);
var colorScale = d3.scale.linear();
var opacityScale = d3.scale.quantile();
var mmm;
var parseDate = d3.time.format("%x %H:%M").parse;
aqparseDate = d3.time.format("%Y-%m-%dT%H:%M").parse;
var datapoint;
var datapointCF;
var dateFormat = d3.time.format('%m/%d/%Y');
var numberFormat = d3.format('.2f');

var getpm10AQI = function(d){    
    scale = [
	d3.scale.linear().domain([0, 30]).range([0,50]),
	d3.scale.linear().domain([30, 60]).range([51,100]),
	d3.scale.linear().domain([60, 100]).range([101,150]),
	d3.scale.linear().domain([100, 200]).range([150,200]),
	d3.scale.linear().domain([200, 300]).range([200,300]),
    ];

    if(d < 31) { return scale[0](d); }
    if(d < 61) { return scale[1](d); }			    
    if(d < 101){ return scale[2](d); }			    
    if(d < 201){return scale[3](d);  }			    
    if(d > 200){ return scale[4](d); }			    
}


var getpm25AQI = function(d){    
    scale = [
	d3.scale.linear().domain([0, 20]).range([0,50]),
	d3.scale.linear().domain([20, 40]).range([51,100]),
	d3.scale.linear().domain([40, 60]).range([101,150]),
	d3.scale.linear().domain([60, 100]).range([150,200]),
	d3.scale.linear().domain([100, 200]).range([200,300]),
    ];

    if(d < 21) { return scale[0](d); }
    if(d < 41) { return scale[1](d); }			    
    if(d < 61){ return scale[2](d); }			    
    if(d < 101){return scale[3](d);  }			    
    if(d > 100){ return scale[4](d); }			    
}

function getAQI(t){
    pm25aqi = getpm25AQI(t.pm25);
    pm10aqi = getpm10AQI(t.pm10);
    if (pm10aqi <= pm25aqi){ return {'aqi': pm10aqi, 'pollutant':'pm10'  }; } 
    else { return {'aqi': pm25aqi, 'pollutant':'pm25' };} 
}

//    .defer(d3.json, "/static/data/india-topo.json")
//    .defer(d3.json, "/static/data/in-states-topo.json")
//    .defer(d3.json, "/static/data/india-states-gramener.json")

function processdata(datapoints){
    console.log(datapoints.length);
    datapoints.forEach(function(t,i){
	t['time'] = aqparseDate(t['created_on'].substr(0,16));
	t['index'] = i;
	a = getAQI(t);
	t['aqi'] = a.aqi;
	t['pollutant'] = a.pollutant;
	t['day']= t.time.getDay();
	t['month']= t.time.getMonth();
	t['year']= t.time.getFullYear();
    })	
}


queue()
    .defer(d3.json, "/airquality/api/aqfeed/?format=json")
    .defer(d3.json, "/airquality/api/devices/?format=json")
    .await(intialLoad);


function intialLoad(error, /*intopo, instatestopo, instategram,*/ datapoints, aqdevices){    
    lastStreamTimeStamp = new Date();    
    datapoint = datapoints;
    picker = d3.select("#devicePicker");
    devices = picker.selectAll("option")
        .data(aqdevices)
        .enter()
        .append("option")
        .attr("value", function(d){ return d['imei'];})
        .text(function (d) { return d['title'];}) ;
       
        //.onclick( d3.json('/api/aqfeed/'imei+'?format=json', function(data) {...}; )

    aqdevices.forEach(function(d,i){
	marker = L.marker([d.lat,d.lon],{
	    'imei':d.imei
	}).addTo(map);

	marker.on('mouseout', function(e) {
	    //open popup;
	    var popup = L.popup()
		.setLatLng(e.latlng) 
		.setContent("<b>" + d.title + "</b><hr/>"+ d.desc + "")
		.openOn(map);
	});

	//marker.bindPopup("<b>" + d.title + "</b><hr/><br>"+ d.desc + "");
	marker.on('click', function(d){ 
	    imei.filterAll();
	    imei.filter(this.options.imei);
	    console.log(this.options.imei);
	});	
    })

    // datapoints;    
    processdata(datapoints);   

    drawCharts();

    function drawCharts(){
	
	
	datapointCF = crossfilter(datapoints);
	all = datapointCF.groupAll();

	dateDim = datapointCF.dimension(function(d) { return d.time;})
	    /*
	hourdateDimG = dateDim.group(d3.time.hour);
	daydateDimG = dateDim.group(d3.time.day);
	monthdateDimG = dateDim.group(d3.time.month);
	yeardateDimG = dateDim.group(d3.time.year);
	hour = datapointCF.dimension(function(d) { return d.time.getHours() + d.time.getMinutes() / 60; }); 
	hours = hour.group(Math.floor);	
	day = datapointCF.dimension(function(d) { return d.time; });
	days = day.group(d3.time.day);
	month = datapointCF.dimension(function(d){ return d.time.getMonth(); });
	months = month.group();
	year = datapointCF.dimension(function(d){ return Math.floor(d.time.getFullYear()/1)*1; });
	years = year.group();
	*/
	var minDate = dateDim.bottom(1)[0].time;
	var maxDate = dateDim.top(1)[0].time;
	var prevDate =  new Date(maxDate - 180000000)

	datapointIndex = datapointCF.dimension(function(d){ return d.index; });
	datapointIndexs = datapointIndex.group();

	temp = datapointCF.dimension(function(d){ return d.temperature; });
	temps = temp.group(Math.floor);
	
	imei = datapointCF.dimension(function(d){ return d.imei; });
	imeiGroup = imei.group(Math.floor);

	humidity = datapointCF.dimension(function(d){ return d.humidity; });
	hums = humidity.group(Math.floor);

	pm10 = datapointCF.dimension(function(d){ return d.pm10; });
	pm10s = pm10.group(Math.floor);

	pm25 = datapointCF.dimension(function(d){ return d.pm25; });
	pm25s = pm25.group(Math.floor);

	small_particle_count = datapointCF.dimension(function(d){ return d.count_small; });
	small_particle_counts = small_particle_count.group(Math.floor);

        large_particle_count = datapointCF.dimension(function(d){ return d.count_large; });
	large_particle_counts = large_particle_count.group(Math.floor);	



	/*
	var quarter = ndx.dimension(function (d) {
            var month = d.dd.getMonth();
            if (month <= 2) {
		return 'Q1';
            } else if (month > 2 && month <= 5) {
		return 'Q2';
            } else if (month > 5 && month <= 8) {
		return 'Q3';
            } else {
		return 'Q4';
            }
	});
	var quarterGroup = quarter.group().reduceSum(function (d) {
            return d.volume;
	}); 


	var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return day + '.' + name[day];
	});
	var dayOfWeekGroup = dayOfWeek.group();

	*/

	var chartDim = Math.min(document.getElementById('mappa').clientWidth, window.innerHeight) - 20;	    
	var chartWidthDim = 320; //Math.min(document.getElementById('mappa').clientWidth, window.innerHeight ) - 20;
	var chartHeightDim = 96; //(window.innerHeight)/6;

	//ndx = crossfilter(datapoints);

	    /*
	function reduceAddAvg(attr) {
	    return function(p,v) {
		++p.count
		p.sum += v[attr];
		p.avg = p.sum/p.count;
		p.imei= v['imei'];
		return p;
	    };
	}
	function reduceRemoveAvg(attr) {
	    return function(p,v) {
		--p.count
		p.sum -= v[attr];
		p.avg = p.sum/p.count;
		p.imei= v['imei'];
		return p;
	    };
	}
	function reduceInitAvg() {
	    return {count:0, sum:0, avg:0, imei:0};
	}

	*/
        function reduceAddAvg(attr) {
	    return function(p,v) {		
		if (_.isNumber(v[attr])) {
		    ++p.count;
		    p.sum += v[attr];
		    p.avg = (p.count === 0) ? 0 : p.sum/p.count; 
		    p.imei= v['imei'];
		    p.attr = v[attr]
		    // guard against dividing by zero
		}
		else if (_.isNumber(p.attr)){	
		    // smoothen out NaN/ values by replacing them with previous values.. 
		     v[attr] = p.attr 
		}
		else
		{ // initial p is itself NaN
		    v[attr]= 0
		}

		return p;
	    };
	}
	function reduceRemoveAvg(attr) {
	    return function(p,v) {
		--p.count;
		if (_.isNumber(v[attr])) {
		    p.sum -= v[attr];
		    p.avg = (p.count === 0) ? 0 : p.sum/p.count;
		    p.imei= v['imei'];
		}
		return p;
	    };
	}
	function reduceInitAvg() {
	    return {count:0, sum:0, avg:0, imei:0, attr:0}; 
	}
	
	pm10AvgGroup = pm10.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);

	    /*
	var deviceDim = datapointCF.dimension(function(d) { return d.imei; });   
	var csDim = datapointCF.dimension(function(d) { return d.count_small; });   
	var clDim  = datapointCF.dimension(function(d) { return d.count_large; });   
	var humidityDim = datapointCF.dimension(function(d) { return d.humidity; });   
	var tempDim = datapointCF.dimension(function(d) { return d.temperature; });   
	var pm25Dim = datapointCF.dimension(function(d) { return d.pm25; });   
	var pm10Dim = datapointCF.dimension(function(d) { return d.pm10; });   
	*/

	// jdims 
	dayDim = datapointCF.dimension(function(d) {return d3.time.day(d.time)});
	hourDim = datapointCF.dimension(function(d) {return d3.time.hour(d.time)});
	hourpm10Dim = datapointCF.dimension(function(d) {return d3.time.hour(d.time)});
	hourpm25Dim = datapointCF.dimension(function(d) {return d3.time.hour(d.time)});
	hourtempDim = datapointCF.dimension(function(d) {return d3.time.hour(d.time)});
	hourhumDim = datapointCF.dimension(function(d) {return d3.time.hour(d.time)});

	aqiAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('aqi'), reduceRemoveAvg('aqi'), reduceInitAvg);
	pm10AvgGroupByHour = hourDim.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);
	pm10AvgGroupByTime =  dateDim.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);
	pm10AvgGroupByDay =  dayDim.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);

	pm25AvgGroupByHour = hourpm25Dim.group().reduce(reduceAddAvg('pm25'), reduceRemoveAvg('pm25'), reduceInitAvg);
	tempAvgGroupByHour = hourtempDim.group().reduce(reduceAddAvg('temperature'), reduceRemoveAvg('temperature'), reduceInitAvg);
	humidityAvgGroupByHour = hourhumDim.group().reduce(reduceAddAvg('humidity'), reduceRemoveAvg('humidity'), reduceInitAvg);

	aqiAvgGroupByDay0 = dayDim.group().reduce(reduceAddAvg('aqi'), reduceRemoveAvg('aqi'), reduceInitAvg);
	var count_smallGroup = dateDim.group().reduceSum(function(d) {return d.count_small;}); 
	var count_largeGroup = dateDim.group().reduceSum(function(d) {return d.count_large;}); 

        aqiAvgGroupByHour2  = hourDim.group(function(d) {return d3.time.day(d);} ).reduce(
        //add
            function(p,v){
		++p.count;
		p.sum += v.aqi;
		p.avg = p.sum / p.count;
		return p;
            },
        //remove
            function(p,v){
		--p.count;
		p.sum -= v.aqi;
		p.avg = p.sum / p.count;
		return p;
            },
        //init
            function(p,v){
		return {count:0, avg: 0, sum: 0};
            }
	);

	var dayOfWeek = datapointCF.dimension(function(d) {
	    var day = d.time.getDay();
	    var name=["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
	    return day+"."+name[day];
	});
	
	/*
        var numEntriesByDevice = deviceDim.group();
        var numEntriesByCS = csDim.group();
        var numEntriesByCL = clDim.group();
        var numEntriesByHumidity = humidityDim.group();
        var numEntriesByTemp = tempDim.group();
        var numEntriesByPM25 = pm25Dim.group();
        var numEntriesByPM10 = pm10Dim.group();		        
	
        var totalPM25ByDevice = deviceDim.group().reduceSum(function(d){return d.pm25;})
	var totalPM10ByDevice = deviceDim.group().reduceSum(function(d){return d.pm10;})
	var minPM10ByHour = dateDim.group().reduceSum(function(d){return d.pm10;})
	var minPM25ByDate = dateDim.group().reduceSum(function(d){return d.pm25;})
	var maxPM10ByDate = dateDim.group().reduceSum(function(d){return d.pm10;})
	var maxPM25ByDate = dateDim.group().reduceSum(function(d){return d.pm25;})
	var avgPM10ByDate = dateDim.group().reduceSum(function(d){return d.pm10;})
	var avgPM25ByDate = dateDim.group().reduceSum(function(d){return d.pm25;})	 
	*/
	/*
	var bCharts = [
	    
	    barChart()
		.dimension(day)
		.group(days)
		.round(d3.time.day.round)
		.tickFormat(d3.time.format('%a %d'))
		.x(d3.time.scale()
		   .domain([minDate, maxDate])
		   .rangeRound([0, 10 * 90])),
		//.filter([minDate, maxDate]),
		//.barWidth(5),		

	    barChart()
		.dimension(year)
		.group(years)
		.tickFormat(d3.format(''))
		.x(d3.scale.linear()
		   .domain([2014, 2020])
		   .rangeRound([0,200]))
		.barWidth(5),		


	    barChart()
		.dimension(pm10)
		.group(pm10s)
		.x(d3.scale.linear()
		   .domain([0, 100])
		   .rangeRound([0, 130]))
		.barWidth(10),

	    barChart()
		.dimension(pm25)
		.group(pm25s)
		.x(d3.scale.linear()
		   .domain([0, 150])
		   .rangeRound([0, 200]))
		.barWidth(10),

	    barChart()
		.dimension(temp)
		.group(temps)
		.x(d3.scale.linear()
		   .domain([0, 110])
		   .rangeRound([0, 110]))
		.barWidth(10),	    
	    
	    barChart()
		.dimension(humidity)
		.group(hums)
		.x(d3.scale.linear()
		   .domain([0, 100])
		   .rangeRound([0, 130]))
		.barWidth(10),

	    
	];

	cCharts = [
	    circleChart()
		.dimension(hour)
		.group(hours)
		.label(['12AM', '6AM', '12PM', '6PM']),		

	    circleChart()
		.dimension(month)
		.group(months)
		.label(['JAN', 'APR', 'JUL', 'OCT']),		

	    circleChart()
		.dimension(day)
		.group(days)
		.label(d3.range(0,31)),		

	];
	*/

	d3.selectAll("#total")
	    .text(datapointCF.size());

	function render(method){
	    d3.select(this).call(method);
	}
	
	var oldFilterObject = {};
	datapointIndexs.all().forEach(function(d){ oldFilterObject[d.key] = d.value; });
	
	renderAll = function(){
	    //bChart.each(render);
	    //cChart.each(render);
	    zoomRender = false;
	    newFilterObject = {};
	    datapointIndexs.all().forEach(function(d){ newFilterObject[d.key] = d.value; });

	    //exit animation
	    /*lines.filter(function(d){ return oldFilterObject[d.index] > newFilterObject[d.index]; })
	      .transition().duration(1400)
	      .attr("x1", function(d){ return d.x2; })
	      .attr("y1", function(d){ return d.y2; })
	      .transition().delay(1450).duration(0)
	      .attr('opacity', 0)
	      .attr("x1", function(d){ return d.x1; })
	      .attr("y1", function(d){ return d.y1; })
	      .attr("x2", function(d){ return d.x1; })
	      .attr("y2", function(d){ return d.y1; });

	      //enter animation
	      lines.filter(function(d){ return oldFilterObject[d.index] < newFilterObject[d.index]; })
	      .attr('opacity', function(d, i){ return opacityScale(d.fscale); })
	      .transition().duration(1400)
	      .attr("x2", function(d){ return d.x2; })
	      .attr("y2", function(d){ return d.y2; })
	    */

	    oldFilterObject = newFilterObject;
	    
	    // update humidity/temp, etc
	    visible = datapoints.filter(function(d){ return newFilterObject[d.index] == 1; });
	    // Cumulative numbers
	    
	    d3.select("#total").text(
		d3.format(',')(all.value()));
	  //  d3.select("#avg").text(
	//	d3.format(',')(d3.avg(visible.map(function(d, i){ return d.pm10; })))); 
	 //   d3.select("#min").text(
	//	d3.format(',.0f')(d3.min(visible.map(function(d, i){ return d.pm10; }))));
	    d3.select("#max").text(
		d3.format(',')(d3.max(visible.map(function(d, i){ return d.pm10; }))));	
	}

	/*
	window.breset = function(i){
	    bCharts[i].filter(null);
	    zoomRender = true;
	    renderAll();
	}

	window.creset = function(i){
	    cCharts[i].filter(null);
	    zoomRender = true;
	    renderAll();
	}

	var bChart = d3.selectAll(".bChart")
	    .data(bCharts)
	    .each(function(chart){ chart.on("brush", renderAll).on("brushend", renderAll) });
	
	var cChart = d3.selectAll(".cChart")
	    .data(cCharts)
	    .each(function(chart){ chart.on("brush", renderAll).on("brushend", renderAll) });
	    */
	renderAll();

	//remove extra width ticks (there is a better way of doing this!)
	
	d3.select('#width-chart').selectAll('.major')
	    .filter(function(d, i){ return i % 2; })
	    .selectAll('text')
	    .remove();

	d3.select('#inj-chart').selectAll('.major')
	    .filter(function(d, i){ return !(i % 2); })
	    .selectAll('text')
	    .remove(); 
	
	/* document.getElementById('devicePicker').onchange = function() {
	    console.log("Changed AQDevice :" );
            // Get the values as an array
	    var mySelectBoxArray = d3.select("#devicePicker").val();
            // if the array is NOT empty then filter the global dimension
	    if (mySelectBoxArray!==null) {
		filterDeviceDimension.filter(function(d) { 
		    return mySelectBoxArray.indexOf(d) >= 0; });
		// Otherwise, reset filters to null (this also works if the user deletes 
		// all the options in the dropdown select and presses the button to 
		// send zero countries to the filter
	    } else {
		filterDeviceDimension.filter(null);		             
	    }
	    dc.redrawAll();}; */
	
	function rangesEqual(range1, range2) {
            if (!range1 && !range2) {
		return true;
            }
            else if (!range1 || !range2) {
		return false;
            }
            else if (range1.length === 0 && range2.length === 0) {
		return true;
            }
            else if (range1[0].valueOf() === range2[0].valueOf() &&
		     range1[1].valueOf() === range2[1].valueOf()) {
		return true;
            }
            return false;
	}
	
	// Charts
	var dataCount  = dc.dataCount("#data-count");
	var timeChart  = dc.barChart("#time-chart");
	var pm10Chart  = dc.barChart("#pm10-chart"); 
	var pm25Chart = dc.barChart('#pm25-chart');
	var tempChart = dc.barChart('#temp-chart');
	var humidityChart = dc.barChart('#hum-chart');
	var clChart = dc.barChart('#cl-chart');
	var csChart = dc.barChart('#cs-chart');

	var dimwidth = chartWidthDim+20;
	var dimheight=chartHeightDim +20;
	totalDim = datapointCF.dimension(function(d) { return d.count_large; });   


	//var pm10Chart2  = dc.barChart("#pm10-chart2"); 
	//var pm25Chart2 = dc.barChart('#pm25-chart2');
	//var tempChart2 = dc.barChart('#temp-chart2');
	//var humidityChart2 = dc.barChart('#hum-chart2');

	//var yearRingChart   = dc.pieChart("#chart-ring-year");
	

	timeChart.focusCharts = function (chartlist) {
		if (!arguments.length) {
		    return this._focusCharts;
		}
		this._focusCharts = chartlist; // only needed to support the getter above
		this.on('filtered', function (range_chart) {
		    if (!range_chart.filter()) {
			dc.events.trigger(function () {
			    chartlist.forEach(function(focus_chart) {
				focus_chart.x().domain(focus_chart.xOriginalDomain());
			    });
			});
		    } else chartlist.forEach(function(focus_chart) {
			if (!rangesEqual(range_chart.filter(), focus_chart.filter())) {
			    dc.events.trigger(function () {
				focus_chart.focus(range_chart.filter());
			    });
			}
		    });
		});
		return this;
	    };
	

	timeChart
	    .width(Width*0.95)
	    .height(80)
	    .dimension(hourDim)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .transitionDuration(500)
	    .y(d3.scale.linear().domain([0, 600]))
	    .elasticY(true)
	    .x(d3.time.scale().domain([new Date("2015-07-20"), maxDate]))
	    .centerBar(true)
	    .gap(4)
	    .renderHorizontalGridLines(true)
	    .alwaysUseRounding(true)
	    .colors(function (a) {
		// AQI Color Standards
		var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];	
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}			    
		else if(a < 201){ return c[2];}			    
		else if(a < 301){ return c[3] ;}			    
		else if(a < 401){ return c[4] ;}			    
		else if(a > 400){ return c[5] ;}			    
	    })
	    .colorAccessor(function (d) { return d.value.avg; })
	    .group(aqiAvgGroupByDay0, 'Average AQI per Day')
	    //.filter([prevDate, maxDate])
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .title(function (d) {
		var value = d.value.avg ? d.value.avg : d.value;
		if (isNaN(value)) {
                    value = 0;
		}
		return numberFormat(value) + '\n on \n' + dateFormat(d.key);
            })	   
	    .xAxisLabel("Time");
	timeChart.yAxis().ticks(3);
	timeChart.xUnits(d3.time.days);
	
	timeChart.focusCharts([pm10Chart, pm25Chart, tempChart, humidityChart]);

	

	/*
	yearRingChart
	    .width(chartWidthDim).height(chartHeightDim)
	    .radius(80)
	    .dimension(month)
	    .group(months)
	    .transitionDuration(500)
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .colorAccessor(function (d,i) {
		if(d.value.avg < 200) { return "yellow";}			    
		if(d.value.avg < 400) { return "blue";}			    
		if(d.value.avg < 500 ){ return "green";}			    
		if(d.value.avg < 1000){ return "red";}			    
	    })
	    .label("PIE");
	    */
	/*
            .elasticY(true)
	    .x(d3.time.scale().domain([minDate,maxDate]))
	    .yAxisLabel("Just checking");
	    */


	clChart
	    .width(Math.round(Width*0.3)).height(chartHeightDim)
	    .dimension(dateDim)
	    .group(count_largeGroup)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .barPadding(0.5)
            .elasticY(true)
	    .outerPadding(0.1)
	    .colorDomain([0,1000])
	    .colorAccessor(function (d,i) {
		if(d.value < 200){ return "yellow";}			    
		if(d.value < 400){ return "blue";}			    
		if(d.value < 500 ){ return "green";}			    
		if(d.value < 1000){ return "red";}			    
	    })
	    .x(d3.time.scale().domain([minDate,maxDate])); 


	csChart
	    .width(Math.round(Width*0.3)).height(chartHeightDim)
	    .dimension(dateDim)
	    .group(count_smallGroup)
	    .barPadding(0.5)
            .elasticY(true)
	    .outerPadding(0.1)
	    .colorAccessor(function (d,i) {
		if(d.value < 200){ return "yellow";}			    
		if(d.value < 400){ return "blue";}			    
		if(d.value < 500 ){ return "green";}			    
		if(d.value < 1000){ return "red";}			    
	    })
	    .x(d3.time.scale().domain([minDate,maxDate])); 



	/*
	pm10Chart
	    .width(Math.round(Width*0.5)).height(chartHeightDim)
	    .dimension(hourDim)
	    .group(pm10AvgGroupByHour)
	    .brushOn(false)
	    .y(d3.scale.linear().domain([0, 500]))
	    .colors(function (a) {
		// AQI Color Standards
		var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];	
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}			    
		else if(a < 201){ return c[2];}			    
		else if(a < 301){ return c[3] ;}			    
		else if(a < 401){ return c[4] ;}			    
		else if(a > 400){ return c[5] ;}			    
	    })
	    .colorAccessor(function (d) { return getpm10AQI(d.value.avg); })
	    .x(d3.time.scale().domain([minDate,maxDate]))
            .elasticX(true)
	    .centerBar(true)
            .elasticY(true)
	    .gap(1)
	    .renderHorizontalGridLines(true)
	    .alwaysUseRounding(true)
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .transitionDuration(500);
	    */
	pm10Chart
	    .width(Math.round(Width*0.5)).height(chartHeightDim)
	    .dimension(hourDim)
	    .group(pm10AvgGroupByHour)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .transitionDuration(500)
	    .y(d3.scale.linear().domain([0, 300]))
	    .x(d3.time.scale().domain([minDate,maxDate]))
	    .round(dc.round.floor)
            .alwaysUseRounding(true)
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .colors(function (a) {
		// AQI Color Standards
		var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];	
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}			    
		else if(a < 201){ return c[2];}			    
		else if(a < 301){ return c[3] ;}			    
		else if(a < 401){ return c[4] ;}			    
		else if(a > 400){ return c[5] ;}			    
	    })
	    .colorAccessor(function (d) { return getpm10AQI(d.value.avg); })
	    .brushOn(false)
	    .label(function (d) {
		return d3.time.day(d.key).substr(0,12);
            }) 
            .title(function (d) {
		return d.value.avg.toString().substr(0,5);
            })
	    .renderLabel(true)
	    .yAxisLabel("PM 10");
	pm10Chart.yAxis().ticks(4);
	pm10Chart.xUnits(d3.time.hours);	
	

	/*pm10Chart2
	    .width(chartWidthDim).height(chartHeightDim)
	    .dimension(pm10)
	    .group(pm10AvgGroupByHour)
	    .transitionDuration(500)
            .elasticY(true)
	//	    .x(d3.linear.scale().domain([pm10AvgGroupByHour.top(1),pm10AvgGroupByHour.bottom(1)]))
	    .elasticX(true)
	    .x(d3.scale.linear().domain([0, 1000]))
	   .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .colorAccessor(function (d,i) {
		if(d.value.avg < 200) { return "yellow";}			    
		if(d.value.avg < 400) { return "blue";}			    
		if(d.value.avg < 500 ){ return "green";}			    
		if(d.value.avg < 1000){ return "red";}			    
	    })
	    .yAxisLabel("PM 10");
	pm10Chart2.yAxis().ticks(4);
	*/
	/*
	pm25Chart	
	    .width(Math.round(Width*0.5)).height(chartHeightDim)
	    .dimension(hourDim)
	    .group(pm25AvgGroupByHour)
	    .transitionDuration(500)
	    .y(d3.scale.linear().domain([0, 1000]))
            .elasticY(true)
	    .x(d3.time.scale().domain([minDate,maxDate]))
	    .elasticX(true)
	    .centerBar(true)
	    .gap(1)
	    .renderHorizontalGridLines(true)
	    .alwaysUseRounding(true)
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .colors(function (a) {
		// AQI Color Standards
		var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];	
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}			    
		else if(a < 201){ return c[2];}			    
		else if(a < 301){ return c[3] ;}			    
		else if(a < 401){ return c[4] ;}			    
		else if(a > 400){ return c[5] ;}			    
	    })
	    .colorAccessor(function (d) { return getpm25AQI(d.value.avg); })
     	    .xAxis().ticks(8);
	    */

	pm25Chart
	    .width(Math.round(Width*0.5)).height(chartHeightDim)
	    .dimension(hourDim)
	    .group(pm25AvgGroupByHour)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .transitionDuration(500)
	    .y(d3.scale.linear().domain([0, 1000]))
	    .x(d3.time.scale().domain([minDate,maxDate]))
	    .round(dc.round.floor)
            .alwaysUseRounding(true)
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .colors(function (a) {
		// AQI Color Standards
		var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];	
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}			    
		else if(a < 201){ return c[2];}			    
		else if(a < 301){ return c[3] ;}			    
		else if(a < 401){ return c[4] ;}			    
		else if(a > 400){ return c[5] ;}			    
	    })
	    .colorAccessor(function (d) { return getpm25AQI(d.value.avg); })
	    .brushOn(false)
	    .label(function (d) {
		return d3.time.day(d.key).substr(0,12);
            }) 
            .title(function (d) {
		return d.value.avg.toString().substr(0,5);
            })
	    .renderLabel(true)
	    .yAxisLabel("PM 25");
	pm25Chart.yAxis().ticks(4);
	pm25Chart.xUnits(d3.time.hours);

	tempChart
	    .width(Math.round(Width*0.5)).height(chartHeightDim)
	    .dimension(hourDim)
	    .group(tempAvgGroupByHour)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .transitionDuration(500)
	    .y(d3.scale.linear().domain([0, 60]))
	    .x(d3.time.scale().domain([minDate,maxDate]))
	    .round(dc.round.floor)
            .alwaysUseRounding(true)
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .colorAccessor(function (d,i) {
		if(d.value.avg < 20) { return "blue";}			    
		if(d.value.avg < 26) { return "yellow";}			    
		if(d.value.avg < 32 ){ return "orange";}			    
		if(d.value.avg > 31){ return "red";}			    
	    })
	    .brushOn(false)
	    .label(function (d) {
		return d3.time.day(d.key).substr(0,12);
            }) 
            .title(function (d) {
		return d.value.avg.toString().substr(0,5);
            })
	    .renderLabel(true)
	    .yAxisLabel("Temp")
	tempChart.yAxis().ticks(4);
	tempChart.xUnits(d3.time.hours);

	humidityChart
	    .width(Math.round(Width*0.5)).height(chartHeightDim)
	    .dimension(hourDim)
	    .group(humidityAvgGroupByHour)
	    .margins({top: 10, right: 50, bottom: 30, left: 50})
	    .transitionDuration(500)
	    .y(d3.scale.linear().domain([0, 100]))
	    .x(d3.time.scale().domain([minDate,maxDate]))
	    .valueAccessor(function(p) {
		return p.value.avg;
	    })
	    .brushOn(false)
	    .label(function (d) {
		return d3.time.day(d.key).substr(0,12);
            }) 
            .title(function (d) {
		return d.value.avg.toString().substr(0,5);
            })
	    .colorAccessor(function (d,i) {
		if(d.value.avg < 20) { return "yellow";}			    
		if(d.value.avg < 40) { return "blue";}			    
		if(d.value.avg < 50 ){ return "green";}			    
		if(d.value.avg < 100){ return "red";}			    
	    })
	    .yAxisLabel("Humidity");
	humidityChart.yAxis().ticks(4);
	humidityChart.xUnits(d3.time.hours);


	
	dataCount /* dc.dataCount('.dc-data-count', 'chartGroup'); */
            .dimension(datapointCF)
            .group(all)	   
            .html({
		some:'<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
                    ' | <a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
		all:'All records selected. Please click on the graph to apply filters.'
            });
	
	dc.renderAll();

    d3.select('#devicePicker').on('change', function(){ 	
	imei.filterAll();
	imei.filter(this.value);
	//pm10AvgGroupByHour.filter(this.value); 
	//pm25AvgGroupByHour.filter(this.value); 
	//tempAvgGroupByHour.filter(this.value);
	//humidityAvgGroupByHour.filter(this.value);
	dc.redrawAll(); 
    })

    }
}





function print_filter(filter){
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 


(function(){
    //getData(baseUrl+defaultDevice);    
})();
