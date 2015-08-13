
/*
-Parts of this code have been taken from Sagar Parihar and Swapnil Mahajan's work 
-for the National Air Quality website. 
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
    

  function loadDevices() {
    $.getJSON("/aq/api/devices/locations/?format=json", function(data) {
	if ( !data ) return null;
	self.data = data;
	self.emit('devicesLoaded');
    });
  }

  function devicesLoaded() {
    getAllDevices();
    getAllCities();
    getAllStates();
    self.emit('ready');
  }

    function getDeviceMetrics(imei, startdate, enddate) {
	var res;	
	if (enddate  == null){	    
	    var dateFormat = d3.time.format('%d/%m/%Y');
	    enddate = dateFormat(new Date());
	    $date.datepicker('setDate', enddate);
	     // resp =  $.getJSON(
	    //	"/aq/api/aqfeed/" + imei 	      
	   // );
	}
	
	resp = $.getJSON(
	    "/aq/api/aqfeed/" + imei +"/" + enddate.replace(/\//g, '-') //+ "/" // + enddate
	);	
	// sanity check
	//console.log(resp.responseJSON);
	if (resp.responseJSON == null){
	} 
	return resp;				
    }

  function getCityMetrics(id, date, hours) {
    return $.getJSON(
      "/metrics/city/"+id,
	{ d: date, h: hours}
    );    
  }
  
  function run() {
    self.on('devicesLoaded', devicesLoaded)
    loadDevices();
  }

  function getDevice(id) {
      for ( i in self.data.allDevices ) {
	  if ( id == self.data.allDevices[i].imei )
              return self.data.allDevices[i];
      }
      return null;
  }

  function getCurrentDevice() {
  }

  function getAllDevices() {
      if ( self.data.allDevices ) return self.data.allDevices;
      //console.log("Devices:");
      //console.log(self.data.devices);

      self.data.allDevices = [];      
      for(i in self.data.devices) {
	  self.data.allDevices = self.data.allDevices.concat(self.data.devices[i].devicesInCity);
      }
      self.data.allDevices = self.data.allDevices.sort(comparator);
      //console.log("getAllDevices:");
      //console.log(self.data.allDevices);
      return self.data.allDevices;
  }
    
  function getDevicesByCity(cityID) {
      for(i in self.data.devices) {
	  if ( cityID == self.data.devices[i].cityID )	  
              return self.data.devices[i].devicesInCity;
      }
    return [];
  }


  function getDevicesByState(stateID) {

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
  this.getDevice = getDevice;
  this.getAllDevices = getAllDevices;
  this.getDevicesByCity = getDevicesByCity;
  this.getDevicesByState = getDevicesByState;
  this.getCity = getCity;
  this.getAllCities = getAllCities;
  this.getCitiesByState = getCitiesByState;
  this.getState = getState;
  this.getAllStates = getAllStates;  
  this.currentDevice = null;
  this.currentCity = null;
  this.currentState = null;
  this.getDeviceMetrics = getDeviceMetrics;
  this.getCityMetrics = getCityMetrics;
 // this.getCityRankings = getCityRankings;    

  /* For context issues */
  var self = this;
};

var ui = function(configObj){
    if ( !configObj ) return null;

    var AQIVis = configObj;
    var states, cities, devices;
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
    }

    function initChoices() {
	$states = $("#statePicker");
	$cities = $("#cityPicker");
	$devices = $("#devicePicker");
	$date = $("#datePicker");
	initializeDatepicker(datepickerOptions);
	//map.initialize();
	//map.pinDevices(AQIVis.getAllDevices());
	resetDropdowns();
	//drawCharts();
	bindEvents();
    }

    function initializeDatepicker(options) {	
	$date.datepicker(options);
	var dateFormat = d3.time.format('%d/%m/%Y');
	$date.datepicker('setDate', dateFormat(new Date()));
    }
    
    function deviceClicked(id) {
	var device = AQIVis.getDevice(id);
	console.log("clicked device:");
	setDropdowns(device.stateID, device.cityID, device.imei);
    }
    

    function setDropdowns(stateID, cityID, deviceID) {
	clearStates();
	populateStates();
	$states.val(stateID);    
	clearCities();
	populateCities();
	$cities.val(cityID);    
	clearDevices();
	populateDevices();
	$devices.val(deviceID);
	map.showDevice(AQIVis.getDevice(deviceID));    
	deviceSet(deviceID);
    }

    /* The 'this' context in below 3 function will belong
       to the dropdown element
    */

    function stateSelected() {
	map.showState(AQIVis.getState($(this).val()));
	clearCities();
	clearDevices();
	populateCities();
    }
    
    function citySelected() {
	map.showCity(AQIVis.getCity($(this).val()));
	clearDevices();
	populateDevices();
    }
    
    function deviceSelected() {	
	//debugger;
	var id = $(this).val();
	if ( "0" != id ) {
	    map.showDevice(AQIVis.getDevice(id));
	    deviceSet(id);
	}	
	
    }
    
    function beforeDeviceSet() {
	$("#aqi-info").empty();
	$("#no-response-panel").clone().appendTo("#aqi-info");
	$("#aqi-info-wrapper").addClass("loading");
	//$(".chart-stage").addClass("display-hide");
	$("#aqi-info").removeClass("no-data");
	$("#aqi-info").removeClass("no-response");
    }

    function afterDeviceSet() {
	$("#aqi-info-wrapper").removeClass("loading");    
    }

    function deviceSet(id) {
	beforeDeviceSet();
	//var hours = 23;
	//var startdate = $date.find("input").val();
	var enddate = $date.find("input").val();
	if ( "0" != id ) {
	    AQIVis.getDeviceMetrics(id, null, enddate)	    
		.done(updateVis) 
		.fail(onJSONFail)
		.always(afterDeviceSet);
	} else {	  
	    /*
	    AQIVis.getCityMetrics($cities.find(":selected").val(), null,null) 
		.done(updateVis)
		.fail(onJSONFail)
		.always(afterDeviceSet);
		*/
	}
	
    }
    
    function updateVis(datapoints){
	//debugger;
	processdata(datapoints, append=false);
	setCharts();
	renderAll();
	
	// in case we need city level filtering we can do that via imei.filter()
	//processdata(datapoints, append);
	//vis.imei.filterAll();
	//vis.imei.filter(this.value);
	//dc.redrawAll(); 	    
    }

    function dateChanged(e) {
	var deviceID = $devices.find(":selected").val();
	if ( deviceID == -1) return;
	//debugger;
	//deviceSet(deviceID);
	deviceClicked(deviceID);
    }

    function bindEvents() {
	/* Map event binding */
	// map.on('deviceClick', deviceClicked);
	/* Dropdown event binding */
	$states.change(stateSelected);
	$cities.change(citySelected);
	$devices.change(deviceSelected);
	$date.datepicker().on('changeDate', dateChanged);
	//$enddate.datepicker().on('changeDate', dateChanged);
    }

    function resetDropdowns() {
	clearStates();
	populateStates(AQIVis.getAllStates());
	clearCities();
	clearDevices();
    }

    function clearStates() {
	$states.empty();
	$states.append($("<option>", {
	    text: "Select State",
	    value: -1,
	    disabled: "disabled",
	    selected: "selected"
	}));
    }

    function populateStates() {
	_.each(
	    AQIVis.getAllStates(),
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
	    text: "Select City",
	    value: -1,
	    disabled: "disabled",
	    selected: "selected"
	}));
    }

    function populateCities() {
	_.each(
	    AQIVis.getCitiesByState($states.find(":selected").val()),
	    function(city) {
		if(city.live !="false") $cities.append($("<option />", {
		    value: city.id,
		    text: city.name
		}));
	    }
	);
    }

    function clearDevices() {
	$devices.empty();
	$devices.append($("<option>", {
	    text: "Select Device",
	    value: -1,
	    disabled: "disabled",
	    selected: "selected"
	}));    
    }

    function populateDevices() {
	/*
	  $devices.append($("<option />", {
	  value: 0,
	  text: "CITY AVERAGE"
	  }));
    	*/
	//console.log($cities.find(":selected").val());
	//console.log("Devices:");
	//console.log(AQIVis.getDevicesByCity($cities.find(":selected").val()));	    	    
	_.each(	    
	    AQIVis.getDevicesByCity($cities.find(":selected").val()),	    	    
	    function(device) {
		//if(!device.live) 
		$devices.append($("<option />", {
		    value: device.imei,
		    text: device.title,
		}));
	    }
	);
    }


    function onJSONFail() {
	$("#aqi-info").addClass("no-response");
    }

    function run() {
	AQIVis.on('ready', initChoices)
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

    
    /* All accessible properties of aqiVizObj will go below this line */
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
    this.onJSONFail = onJSONFail;
    this.updateVis = updateVis;
    this.afterDeviceSet = afterDeviceSet;
    this.deviceClicked = deviceClicked;    
    /* For context issues */
    var self = this;
};

//$(function() {
    //$(".loader-inner").removeClass("ball-grid-pulse");
    //$("pulsar").removeClass("vjs-loading-spinner");
    var AQIVis = new Loader();
    var aqiVizObj = new ui(AQIVis);

    $.getJSON("/aq/api/config", function(config) {
	AQIVis.configure(config);
	aqiVizObj.configure(config);
	map.configure(config);
	AQIVis.run();
	aqiVizObj.run();
	AQIVis.on('devicesLoaded', function() {aqiVizObj.deviceClicked("865190016042411")});
    });
//});




