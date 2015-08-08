/*
Parts of this code have been taken from Sagar Parihar and Swapnil Mahajan's work 
for the National Air Quality website. 

*/

var Loader = function() {           
      function configure(config) {
	  // Required fields in configuration object 
	  var requiredFields = [];
	  // Check if all required fields are present in config   
	  _.each(requiredFields, function(field){
	      if ( !_.has(config, field) ) return null;
	  });
	  self.config = config;
      }
    

  function loadStations() {
    $.getJSON("/aq/api/devices/locations/?format=json", function(data) {
	if ( !data ) return null;
	self.data = data;
	self.emit('stationsLoaded');
    });
  }

  function stationsLoaded() {
    getAllStations();
    getAllCities();
    getAllStates();
    self.emit('ready');
  }

  function getStationMetrics(imei, startdate, enddate) {

      if (startdate && enddate == null){
	  return $.getJSON(
	      "/aq/api/aqfeed/"+imei 	      
	  );
      }
      return $.getJSON(
	  "/aq/api/aqfeed/"+imei +"/" + startdate + "/" + enddate
	  //{ d: date , h: hours}
      );
  }

  function getCityMetrics(id, date, hours) {
    return $.getJSON(
      "/metrics/city/"+id,
      { d: date, h: hours}
    );    
  }
  
  function run() {
    self.on('stationsLoaded', stationsLoaded)
    loadStations();
  }

  function getStation(id) {
    for ( i in self.data.allStations ) {
      if ( id == self.data.allStations[i].imei )
        return self.data.allStations[i];
    }
    return null;
  }

  function getCurrentStation() {
  }

  function getAllStations() {
      if ( self.data.allStations ) return self.data.allStations;
      //console.log("Stations:");
      //console.log(self.data.stations);

      self.data.allStations = [];      
      for(i in self.data.stations) {
	  self.data.allStations = self.data.allStations.concat(self.data.stations[i].devicesInCity);
      }
      self.data.allStations = self.data.allStations.sort(comparator);
      //console.log("getAllStations:");
      //console.log(self.data.allStations);
      return self.data.allStations;
  }
    
  function getStationsByCity(cityID) {
      for(i in self.data.stations) {
	  if ( cityID == self.data.stations[i].cityID )	  
              return self.data.stations[i].devicesInCity[0];
      }
    return [];
  }

  function getStationsByState(stateID) {

  }

  function getCity(id) {
    for(i in self.data.allCities) {
      if ( id == self.data.allCities[i].id )
        return self.data.allCities[i];
    }
    return null;
  }

  function getCurrentCity() {
  }

  function getAllCities() {
    if ( self.data.allCities ) return self.data.allCities;
    self.data.allCities = [];
    for ( i in self.data.cities ) {
      self.data.allCities = self.data.allCities.concat(self.data.cities[i].citiesInState);
    }
    self.data.allCities = self.data.allCities.sort(comparator);
    return self.data.allCities;
  }

  function comparator(a, b) {
    if ( a.name > b.name ) return 1;
    return -1;
  }

  function getCitiesByState(stateID) {
    for(i in self.data.cities) {	
      if ( stateID == self.data.cities[i].stateID )
        return self.data.cities[i].citiesInState;
    }
    return [];    
  }

  function getState(id) {
    for(i in self.data.states) {
      if ( self.data.states[i].id == id )
        return self.data.states[i];
    }
    return null;
  }

  function getCurrentState() {

  }

  function getAllStates() {
    if (self.data.allStates) return self.data.allStates;
    self.data.allStates = self.data.states.sort(comparator);
    return self.data.allStates;
  }

  function on(event, callback) {
    signal.on(event, callback);
  }

  function emit(event, arg) {
    signal.emit(event, arg);
  }
  
  /* All accessible properties of air will go below this line */
  /* Inheriting from EventEmitter2 to be able to emit and listen to events*/
  //EventEmitter2.call(this);
  var signal = new EventEmitter2();
  this.on = on;
  this.emit = emit;
  this.run = run;
  this.configure = configure;
  this.getStation = getStation;
  this.getAllStations = getAllStations;
  this.getStationsByCity = getStationsByCity;
  this.getStationsByState = getStationsByState;
  this.getCity = getCity;
  this.getAllCities = getAllCities;
  this.getCitiesByState = getCitiesByState;
  this.getState = getState;
  this.getAllStates = getAllStates;  
  this.currentStation = null;
  this.currentCity = null;
  this.currentState = null;
  this.getStationMetrics = getStationMetrics;
  this.getCityMetrics = getCityMetrics;
 // this.getCityRankings = getCityRankings;    

  /* For context issues */
  var self = this;
};

var ui = function(configObj){
    if ( !configObj ) return null;
    var air = configObj;
    var states, cities, stations;

    var datepickerOptions =  {
	format: "dd/mm/yyyy",
	startDate: "01/08/2015",
	endDate: new Date(),
	setDate: new Date(),
	startView: 0,
	todayBtn: "linked",
	autoclose: true,
	todayHighlight: true,
	orientation: "top auto"
    };


    function configure(config) {
	/* Required fields in configuration object */
	var requiredFields = [];
	/* Check if all required fields are present in config */
	_.each(requiredFields, function(field){
	    if ( !_.has(config, field) ) {
		console.log("Field" + field + " not found in config");
		return null;
	    }
	});
	self.config = config;
	//map.configure(config);
    }

    function initChoices() {
	$states = $("#statePicker");
	$cities = $("#cityPicker");
	$stations = $("#devicePicker");
	$date = $("#datePicker");
	//console.log($date);	
	//console.log(datepickerOptions);	
	//$date.datepicker(datepickerOptions);	
	//$date.date('setDate', d3.time.format("%Y-%m-%dT%H:%M").parse);
	initializeDatepicker(datepickerOptions);
	//map.initialize();
	//map.pinStations(air.getAllStations());
	resetDropdowns();
	//drawCharts();
	//populateAQIDescTable(self.config.breakpoints);
	bindEvents();
    }

    function initializeDatepicker(options) {
	$date.datepicker(options);
	$date.datepicker('setDate', dateFormat(new Date()));
    }

    /*
    function stationClicked(id) {
	//window.quickfix(id);
	var station = air.getStation(id);
	setDropdowns(station.stateID, station.cityID, station.id);
    }
    */

    function setDropdowns(stateID, cityID, stationID) {
	clearStates();
	populateStates();
	$states.val(stateID);    
	clearCities();
	populateCities();
	$cities.val(cityID);    
	clearStations();
	populateStations();
	$stations.val(stationID);
	//map.showStation(air.getStation(stationID));    
	stationSet(stationID);
    }

    /* The 'this' context in below 3 function will belong
       to the dropdown element
    */
    function stateSelected() {
	//map.showState(air.getState($(this).val()));
	//console.log("state selected")
	clearCities();
	clearStations();
	populateCities();
    }
    
    function citySelected() {
	//map.showCity(air.getCity($(this).val()));
	clearStations();
	populateStations();
    }
    
    function stationSelected() {
	var id = $(this).val();
	if ( "0" != id ) {
	    //map.showStation(air.getStation(id));
	}
	window.quickfix(id);
	stationSet(id);
    }
    
    function beforeStationSet() {
	$("#aqi-info").empty();
	$("#no-response-panel").clone().appendTo("#aqi-info");
	$("#aqi-info-wrapper").addClass("loading");
	$("#aqi-info").removeClass("no-data");
	$("#aqi-info").removeClass("no-response");
    }

    function afterStationSet() {
	$("#aqi-info-wrapper").removeClass("loading");    
    }

    function stationSet(id) {
	beforeStationSet();
	var hours = 23;
	var date = $date.find("input").val();
	if ( "0" != id ) {
	    air.getStationMetrics(id, date, hours)
		.done(drawPanel) 
		.fail(onJSONFail)
		.always(afterStationSet);
	} else {
	    air.getCityMetrics($cities.find(":selected").val(), date, hours) 
		.done(drawPanel)
		.fail(onJSONFail)
		.always(afterStationSet);
	}
	
    }

    function dateChanged(e) {
	var stationID = $stations.find(":selected").val();
	if ( stationID == -1) return;
	stationSet(stationID);
    }

    function bindEvents() {
	/* Map event binding */
	//map.on('stationClick', stationClicked);
	/* Dropdown event binding */
	$states.change(stateSelected);
	$cities.change(citySelected);
	//$stations.change(stationSelected);
	$date.datepicker().on('changeDate', dateChanged);
    }

    function resetDropdowns() {
	clearStates();
	populateStates(air.getAllStates());
	clearCities();
	clearStations();
    }

    function clearStates() {
	$states.empty();
	$states.append($("<option>", {
	    text: "__Select State__",
	    value: -1,
	    disabled: "disabled",
	    selected: "selected"
	}));
    }

    function populateStates() {
	_.each(
	    air.getAllStates(),
	    function(state) {
		if(state.live != "false") $states.append($("<option />", {
		    value: state.id,
		    text: state.name
		}));
	    }
	);
    }

    function clearCities() {
	$cities.empty();
	$cities.append($("<option>", {
	    text: "__Select City__",
	    value: -1,
	    disabled: "disabled",
	    selected: "selected"
	}));
    }

    function populateCities() {
	_.each(
	    air.getCitiesByState($states.find(":selected").val()),
	    function(city) {
		if(city.live !="false") $cities.append($("<option />", {
		    value: city.id,
		    text: city.name
		}));
	    }
	);
    }

    function clearStations() {
	$stations.empty();
	$stations.append($("<option>", {
	    text: "__Select Device__",
	    value: -1,
	    disabled: "disabled",
	    selected: "selected"
	}));    
    }

    function populateStations() {
	/*
	  $stations.append($("<option />", {
	  value: 0,
	  text: "CITY AVERAGE"
	  }));
    	*/
	//console.log($cities.find(":selected").val());
	console.log("Stations:");
	console.log(air.getStationsByCity($cities.find(":selected").val()));	    	    
	_.each(	    
	    air.getStationsByCity($cities.find(":selected").val()),	    	    
	    function(station) {
		if(!station.live) 
		    $stations.append($("<option />", {
			value: station.imei,
			text: station.title,
		    }));
	    }
	);
    }


    function onJSONFail() {
	$("#aqi-info").addClass("no-response");
    }

    function run() {
	air.on('ready', initChoices)
    }

    function on(event, callback) {
	signal.on(event, callback);
    }

    function emit(event, arg) {
	signal.emit(event, arg);
    }

    function getConfig() {
	return $.getJSON("/aq/api/config");
    }

    
    /* All accessible properties of airui will go below this line */
    /* Inheriting from EventEmitter2 to be able to emit and listen to events*/
    //EventEmitter2.call(this);
    this.configure = configure;
    this.initChoices = initChoices;
    this.initializeDatepicker = initializeDatepicker;
    this.getConfig = getConfig;
    var signal = new EventEmitter2();
    this.on = on;
    this.emit = emit;
    this.run = run;
    //this.configure = configure;
    this.onJSONFail = onJSONFail;
    //this.drawPanel = drawPanel;
    //this.afterStationSet = afterStationSet;
    //this.stationClicked = stationClicked;    
    /* For context issues */
    var self = this;
};

//$(function() {
    //$(".loader-inner").removeClass("ball-grid-pulse");
    //$("pulsar").removeClass("vjs-loading-spinner");
    var air = new Loader();
    var airui = new ui(air);
    //var map = new Map();
    $.getJSON("/api/config", function(config) {
	air.configure(config);
	airui.configure(config);
	//map.configure(config);
	air.run();
	airui.run();
	//air.on('stationsLoaded', function() {airui.stationClicked(798)});
    });
//});




