// Leaflet


var Map = function() { 
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

    var thismap =  L.map('mappa', {
	center: [20,72],
	zoom: 7,
	layers: [OpenStreetMap_Mapnik, Stamen_TonerLabels],
	touchZoom:false,
	tap:false,
	dragging:false
    });

    L.control.layers(baseMaps, overlayMaps).addTo(thismap);


    function markDevice(d){
	marker = L.marker([d.lat,d.lon],{
	    'imei':d.imei
	}).addTo(thismap);
		
	marker.on('mouseout', function(e) {
	    //open popup;	    
	    var popup = L.popup()
		.setLatLng(e.latlng) 
		.setContent("<b>" + d.title + "</b><hr/>"+ d.desc + "<hr/>" + d.city + ","+d.state)
		.openOn(thismap);
	});
	
	
	//marker.bindPopup("<b>" + d.title + "</b><hr/>"+ d.desc + "<hr/>" + d.city + ","+d.state);
	//"<b>" + d.title + "</b><hr/><br>"+ d.desc + "");
	/*
	marker.on('mouseout', function(d){ 
	    this.openPopup();
	    setTimeout(this.closePopup(), 3000);
	});			
	*/
	
	marker.on('click', function(d){ 
	    imei.filterAll();
	    imei.filter(this.options.imei);
	    console.log(this.options.imei);
	});			
	   
    }

    function markDevices(devices){
	_.each(devices, function(device){ 
	    this.markDevice(device)
	});
    }

    function showState(state) {	
	map.panTo(L.latLng(state.lat, state.lon));
	map.setZoom(self.config.mapStateZoom);
    }

    function showCity(city) {
	map.panTo(L.latLng(city.lat, city.lon));
	map.setZoom(self.config.mapCityZoom);
    }

    function showStation(station) {	
	map.panTo(L.latLng(station.lat, station.lon));
	map.setZoom(self.config.mapStationZoom);
    }

    function panTo(lat, lon){
	thismap.panTo(L.latLng(lat, lon));		      
    } 

    function setZoom(zoomlevel){
	thismap.setZoom(zoomlevel)
    }       

    function configure(config) {
	/*if( !isVisible() ) {
	    makeHollow();
	    return;
	}*/
    /* Check if all required fields are present in config */  
	self.config = config;
	self.config.mapStationZoom =  parseInt(self.config.mapStationZoom);
 	self.config.mapStateZoom =  parseInt(self.config.mapStateZoom);
	self.config.mapCityZoom =  parseInt(self.config.mapCityZoom);
	self.config.mapZoom =  parseInt(self.config.mapZoom);

	/*
	 
                "mapCenterLat":"21.15",
                "mapCenterLng":"79.09",
                "mapMumCenterLat":"20.00",
                "mapMumCenterLng":"72.00",
 
	 */
    }
            
    var requiredFields = ['mapCenterLat', 'mapCenterLng', 'mapZoom', 'mapStateZoom', 'mapCityZoom', 'mapStationZoom'];
    var loaded = false;    
    this.markDevice = markDevice;
    this.markDevices = markDevices;
    this.configure = configure;
    this.panTo = panTo;
    this.setZoom = setZoom;
    this.showStation = showStation;
    this.showCity = showCity;
    this.showState = showState;
    
};


