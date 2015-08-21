//var VisObj = function(){

var DeviceWidth  = $(window).width();
var Width =  1200;   
var Height = $(window).height() 
    
var mapwidth = Math.round(Width*0.3);
mapheight = 600,
centered = true;
zoomRender = false;
    
    var varWidth = Math.round(Width*0.5);
    var varHeight = Math.round(Width*0.3);    

    var lastStreamTimeStamp;
    var timerId; // current timer if started
    var widthScale = d3.scale.pow().exponent(.5);
    var colorScale = d3.scale.linear();
    var mmm;
    var parseDate = d3.time.format("%x %H:%M").parse;
    aqparseDate = d3.time.format("%Y-%m-%dT%H:%M").parse;
    aqparseDateUtc = d3.time.format.utc("%Y-%m-%dT%H:%M").parse;
    var datapoint;
    var datapoints;
    var datapointCF;
    dateFormat = d3.time.format('%d/%m/%Y');
    var numberFormat = d3.format('.2f');

    //var timeChart  = dc.barChart("#time-chart");
    var pm10Chart  = dc.lineChart("#pm10-chart"); 
    var pm25Chart = dc.barChart('#pm25-chart');
    var tempChart = dc.barChart('#temp-chart');
    var humidityChart = dc.barChart('#hum-chart');
    var clChart = dc.barChart('#cl-chart');
    var csChart = dc.barChart('#cs-chart');
    var dimwidth = chartWidthDim+20;
    var dimheight=chartHeightDim +20;
    var pm10Chart2  = dc.barChart("#pm10-chart2"); 
    var pm25Chart2 = dc.barChart('#pm25-chart2');
    var csChart2  = dc.barChart("#cs-chart2"); 
    var clChart2 = dc.barChart('#cl-chart2');
    //var pollutantChart = dc.

    var chartWidthDim = 320; 
    var chartHeightDim = 107; 

    var linechartWidth = "90%"; //Math.round(Width*0.5); 
    var linechartHeight = 107; 
    
    var d3pm10max = d3.select("#pm10-max");
    var d3pm10min = d3.select("#pm10-min");
    var d3pm10avg = d3.select("#pm10-avg");

    var d3pm25max = d3.select("#pm25-max");
    var d3pm25min = d3.select("#pm25-min");
    var d3pm25avg = d3.select("#pm25-avg");

    var d3tempmax = d3.select("#temp-max");
    var d3tempmin = d3.select("#temp-min");
    var d3tempavg = d3.select("#temp-avg");

    var d3hummax = d3.select("#humidity-max");
    var d3hummin = d3.select("#humidity-min");
    var d3humavg = d3.select("#humidity-avg");

var aqiText, aqiDisplay, aqiCircle, aqiTextDate;


var margin = 30; //DeviceWidth*0.05,
w = 200 - margin * 2, // DeviceWidth
h = w,
radius = w/2,
strokeWidth = 4,
hyp2 = Math.pow(radius, 2),
nodeBaseRad = 5;

var aqiradius = 70;
var AQIDisp = d3.select('#aqi-display')
    .append('svg')
    .attr('width', w)
    .attr('height', h+12)
    .attr('class', 'img-rounded aqi-disp')
    .call(responsivefy);

var aqiDisplay = AQIDisp
    .append("g");

var aqiDisplay2 = AQIDisp
    .append("g")
    .attr('transform', 'translate(' + '2' + ',' + '2' + ')');	    


//.attr('transform', 'translate(' + '' + ',' + margin + ')');	    
//d3.select('#aqi-display2')
//    .append('svg')
//   .attr('width', w)
//   .attr('height', h)	    

var aqiIndicators = [
    {"id":1,
     "remark":"Good",
     "color":"#00B050",
     "uplimit":50,
     "description":"Minimal impact"},
    {"id":2,
     "remark":"Satisfactory",
     "color":"#92D050",
     "uplimit":100,
     "description":"Minor breathing discomfort to sensitive people"},
    {"id":3,
     "remark":"Moderate",
     "color":"#FFFF00",
     "uplimit":200,
     "description":"Breathing discomfort to the people with lung, asthma and heart diseases"},
    {"id":4,
     "remark":"Poor",
     "color":"#FF9900",
     "uplimit":300,
     "description":"Breathing discomfort to most people on prolonged exposure"},
    {"id":5,
     "remark":"Very Poor",
     "color":"#FF0000",
     "uplimit":400,
     "description":"Respiratory illness on prolonged exposure"},
    {"id":6,
     "remark":"Severe",
     "color":"#C00000",
     "uplimit":500,
     "description":"Affects healthy people and seriously impacts those with existing diseases"}
]


    function streamStart(){
    if (timerId) return;
    timerId = setInterval( streamUpdate, 30000);
	// lazy loading... do not stream immediately, only start timer.
	// so no click surging
	console.log('Stream started');
    }

    function streamStop() {
	clearInterval(timerId);
	timerId = null;
	console.log('Stream stopped');
    }


function responsivefy(svg) {
    // get container + svg aspect ratio
    var container = d3.select(svg.node().parentNode),
    width = parseInt(svg.style("width")),
    height = parseInt(svg.style("height")),
    aspect = width / height;

    // add viewBox and preserveAspectRatio properties,
    // and call resize so that svg resizes on inital page load
    svg.attr("viewBox", "0 0 " + width + " " + height)
        .attr("perserveAspectRatio", "xMinYMid")
        .call(resize);

    // to register multiple listeners for same event type, 
    // you need to add namespace, i.e., 'click.foo'
    // necessary if you call invoke this function for multiple svgs
    // api docs: https://github.com/mbostock/d3/wiki/Selections#on
    d3.select(window).on("resize." + container.attr("id"), resize);

    // get width of container and resize svg to fit it
    function resize() {
        var targetWidth = parseInt(container.style("width"));
        svg.attr("width", targetWidth);
        svg.attr("height", Math.round(targetWidth / aspect));
    }
}

    
function streamUpdate()
{
	if (!lastStreamTimeStamp) { return };
	now = new Date();
	queue()
	    .defer(d3.json, "http://aqi.indiaspend.org/aq/api/aqfeed/"+lastStreamTimeStamp.toISOString().substr(0,19) + "/"+ now.toISOString().substr(0,19)+ "?format=json")
	    .await(dataUpdate);        
    }
        
    function dataUpdate(error, newdatapoints, append){	
	if(newdatapoints.length != 0){	    
	    processdata(newdatapoints);
	    console.log(newdatapoints);	
	    console.log('Data stream updated');
	    if (append == true) {
		datapoints.push(newdatapoints);
		datapointCF.add(newdatapoints);
	    }
	    else{
		datapoints = newdatapoints;
		datapointCF  = crossfilter(datapoints);		
	    }
	    renderAll();
	}
	else{
	    //console.log('Nothing to add from stream ');
	}   
	lastStreamTimeStamp = new Date();
    }
        
    var begin = setTimeout(function(){
	//streamStart();
    }, 10000);    


    var getpm10AQI = function(d){    
	scale = [
	    d3.scale.linear().domain([0, 50]).range([0,50]),
	    d3.scale.linear().domain([51, 100]).range([51,100]),
	    d3.scale.linear().domain([101, 250]).range([101,200]),
	    d3.scale.linear().domain([251, 350]).range([201,300]),
	    d3.scale.linear().domain([351, 430]).range([301,400]),
	    d3.scale.linear().domain([430, 500]).range([401,500]),
    ];
	
	if(d < 51) { return scale[0](d); }
	if(d < 101) { return scale[1](d); }			    
	if(d < 251){ return scale[2](d); }			    
	if(d < 351){return scale[3](d);  }			    
	if(d < 431){ return scale[4](d); }			    
	if(d >= 431){ return scale[5](d); }			    
    }
    
    
    var getpm25AQI = function(d){    
	scale = [
	    d3.scale.linear().domain([0, 30]).range([0,50]),
	    d3.scale.linear().domain([31, 60]).range([51,100]),
	    d3.scale.linear().domain([61, 90]).range([101,200]),
	    d3.scale.linear().domain([91, 120]).range([201,300]),
	    d3.scale.linear().domain([121, 250]).range([301,400]),
	    d3.scale.linear().domain([250, 500]).range([401,500]),
	];
	
	if(d < 31) { return scale[0](d); } 
	if(d < 61) { return scale[1](d); }			    
	if(d < 91){ return scale[2](d);  }			    
	if(d < 121){return scale[3](d);  }			    
	if(d < 251){return scale[4](d);  }			    
	if(d >= 251){ return scale[5](d); }			    
    }

    function getAQI(t){
	pm25aqi = getpm25AQI(t.pm25);
	pm10aqi = getpm10AQI(t.pm10);
	if (pm10aqi >= pm25aqi) { return {'aqi': pm10aqi, 'pollutant':'pm10'  }; } 
	else { return {'aqi': pm25aqi, 'pollutant':'pm25' };} 
    }

    function processdata(tmpdatapoints, append){
	tmpdatapoints.forEach(function(t,i){
	    var tmp1  =  t['pm10'];
	    t['pm10']   =  t['count_large'];
	    t['count_large']  =  tmp1;
	    tmp1  =  t['pm25'];
	    t['pm25']   =  t['count_small'];
	    t['count_small']   =  tmp1;	
	    /*
	      var tmp1  =  t['pm25'];
	      var tmp2  =  t['count_small'];	    
	      t['count_small']   =  tmp1;
	      t['pm25']   =  tmp2;	   
	    */
	    //debugger;
	    t['time'] = aqparseDateUtc(t['created_on'].substr(0,16));
	    //t['created_on'] = d3.time.minute.offset(t['time'], 330);
	    t['index'] = i;
	    a = getAQI(t);
	    t['aqi'] = _.min([a.aqi, 500]); 
	    t['pollutant'] = a.pollutant;
	    t['hour'] = d3.time.hour(t.time);
	    //t['day']= t.time.getHour();
	    //t['month']= t.time.getMonth();
	    //t['year']= t.time.getFullYear();
	})	
	//console.log("Old data size:" + datapoints.size());
	datapoints = [];
	datapoints = tmpdatapoints;
	console.log("Data processed New data size:") 
	console.log(datapoints);	
	updateDimensions();
    }

    function updateDimensions(){
	if (datapointCF == null){
	    console.log("datapointCF is not initialized!.. Initializing!")
	    console.log(datapointCF);
	    initDimensions();
	    return;
	}
	dc.filterAll();
	//datapointCF = new crossfilter([]);
	datapointCF.remove();
	initDimensions();
	/*
	datapointCF = new crossfilter(datapoints);
	console.log("removed datapoints from crossfilter, new data: ");
	console.log(datapoints);
	*/
    }    

    function initDimensions() {		
	 //if (datapointCF != null){
	 //    return updateDimension
	// }
	//     console.log("Called initDimensions");
	//     console.log(datapointCF);		
	//     dc.filterAll(); 
	//     console.log("removed datapoints from crossfilter ");
	//     datapointCF.remove();
	// }
	datapointCF = crossfilter(datapoints);
	all = datapointCF.groupAll();
	dateDim = datapointCF.dimension(function(d) { return d.time;})
	minDate = dateDim.bottom(1)[0].time;
	maxDate = dateDim.top(1)[0].time;
	if (d3.time.day(new Date())==d3.time.day(maxDate)){
	    prevDate = d3.time.day.offset(maxDate, -1);	    
	    // Toggle live streaming if date is current date here. 
	    streamStart();
	}
	else{
	    prevDate = d3.time.day(maxDate);
	    maxDate = d3.time.day.offset(prevDate, +1);
	    streamStop();
	}
	prevWeekDate = d3.time.day.offset(new Date(), -7);

	
	console.log("minDate:");
	console.log(minDate);
	console.log("maxDate:");
	console.log(maxDate);
	console.log("prevDate:");
	console.log(prevDate);
	
	//datapointIndex = datapointCF.dimension(function(d){ return d.index; });
	//datapointIndexs = datapointIndex.group();

   	//oldFilterObject = {};
	//datapointIndexs.all().forEach(function(d){ oldFilterObject[d.key] = d.value; });

	aqi = datapointCF.dimension(function(d){ return d.aqi; });
	aqiGroup = aqi.group(Math.floor);

	imei = datapointCF.dimension(function(d){ return d.imei; });
	imeiGroup = imei.group(Math.floor);

	pm10 = datapointCF.dimension(function(d){ return d.pm10; });
	//pm10s = pm10.group(Math.floor);
	
	pm25 = datapointCF.dimension(function(d){ return d.pm25; });
	//pm25s = pm25.group(Math.floor);
	
	temp = datapointCF.dimension(function(d){ return d.temperature; });
	//temps = temp.group(Math.floor);	   	    

	humidity = datapointCF.dimension(function(d){ return d.humidity; });
	//hums = humidity.group(Math.floor);
	
	small_particle_count = datapointCF.dimension(function(d){ return d.count_small; });
	//small_particle_counts = small_particle_count.group(Math.floor);
	
        large_particle_count = datapointCF.dimension(function(d){ return d.count_large; });
	//large_particle_counts = large_particle_count.group(Math.floor);	
	    
        pollutant = datapointCF.dimension(function(d){ return d.pollutant; });
	pollutants = pollutant.group();	


	    var totalDim = datapointCF.dimension(function(d) { return d.count_large; });       
    
	    // generic reduce functions
            function reduceAddAvg(attr) {
		return function(p,v) {		
		    if (_.isNumber(v[attr])) {
			++p.count;
			p.sum += v[attr];
			p.average = (p.count === 0) ? 0 : p.sum/p.count; 		   
			p.attr = v[attr]		    
			// guard against dividing by zero
		    }
		    else if (_.isNumber(p.attr)){	
			// smoothen out NaN/zero values by replacing them with previous values.
			// guard against parse sensor data!
			v[attr] = p.attr 
		    }
		    else
		    { // if initial p is itself NaN
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
			p.average = (p.count === 0) ? 0 : p.sum/p.count;
		    }
		    return p;
		};
	    }
	    function reduceInitAvg() {
		return { count:0, sum:0, average:0, imei:0, attr:0/*, min:500, max:0*/}; 
	    }
	    
	    //pm10AvgGroup = pm10.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);

	    dayDim = datapointCF.dimension(function(d) {return d3.time.day(d.time)});
	    hourDim = datapointCF.dimension(function(d) { return d.hour });//     d3.time.hour(d.time)});

	    aqiAvgGroupByDay = dayDim.group().reduce(reduceAddAvg('aqi'), reduceRemoveAvg('aqi'), reduceInitAvg);	    
	    aqiAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('aqi'), reduceRemoveAvg('aqi'), reduceInitAvg);	    
	    pm10AvgGroupByHour = hourDim.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);	    
	    pm25AvgGroupByHour = hourDim.group().reduce(reduceAddAvg('pm25'), reduceRemoveAvg('pm25'), reduceInitAvg);
	    tempAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('temperature'), reduceRemoveAvg('temperature'), reduceInitAvg);
	    humidityAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('humidity'), reduceRemoveAvg('humidity'), reduceInitAvg);
	    csAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('count_small'), reduceRemoveAvg('count_small'), reduceInitAvg);
	    clAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('count_large'), reduceRemoveAvg('count_large'), reduceInitAvg);


	    pm10s = pm10.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);	    
	    pm25s = pm25.group().reduce(reduceAddAvg('pm25'), reduceRemoveAvg('pm25'), reduceInitAvg);
	    temps = temp.group().reduce(reduceAddAvg('temperature'), reduceRemoveAvg('temperature'), reduceInitAvg);
	    hums = humidity.group().reduce(reduceAddAvg('humidity'), reduceRemoveAvg('humidity'), reduceInitAvg);
	    small_particle_counts = small_particle_count.group().reduce(reduceAddAvg('count_small'), reduceRemoveAvg('count_small'), reduceInitAvg);
	    large_particle_counts = large_particle_count.group().reduce(reduceAddAvg('count_large'), reduceRemoveAvg('count_large'), reduceInitAvg);


	    
	    /*
	    var count_smallGroup = dateDim.group().reduceSum(function(d) {return d.count_small;}); 
	    var count_largeGroup = dateDim.group().reduceSum(function(d) {return d.count_large;}); 
	    */

	}

	    //var tempChart2 = dc.barChart('#temp-chart2');
	    //var humidityChart2 = dc.barChart('#hum-chart2');
	    //var yearRingChart   = dc.pieChart("#chart-ring-year");


function computeAverages(){		
    d3pm10max.text("Max: " + numberFormat(_.max(pm10AvgGroupByHour.all(), function (d){ return d.value.average}).value.average));
    
    d3pm10min.text("Min: " + numberFormat(_.min(pm10AvgGroupByHour.all(), function (d){ return d.value.average}).value.average)); 
	    
    d3pm10avg.text("Avg: " + numberFormat(_.reduce(_.map(pm10AvgGroupByHour.all(), function(d){return d.value.average; }), function(memo,num){ return memo+ num; }, 0)/(pm10AvgGroupByHour.size() === 0 ? 1 :pm10AvgGroupByHour.size())));
	   	    	  	    
    d3pm25max.text("Max: " + numberFormat(_.max(pm25AvgGroupByHour.all(), function (d){ return d.value.average}).value.average));
	
    d3pm25min.text("Min: " + numberFormat(_.min(pm25AvgGroupByHour.all(), function (d){ return d.value.average}).value.average)); 
	
    d3pm25avg.text("Avg: " + numberFormat(_.reduce(_.map(pm25AvgGroupByHour.all(), function(d){return d.value.average; }), function(memo,num){ return memo+ num; }, 0)/(pm25AvgGroupByHour.size() === 0 ? 1 :pm10AvgGroupByHour.size())));

    d3tempmax.text("Max: " + numberFormat(_.max(tempAvgGroupByHour.all(), function (d){ return  d.value.average}).value.average));
	
    d3tempmin.text("Min: " + numberFormat(_.min(tempAvgGroupByHour.all(), function (d){ return d.value.average}).value.average)); 
	
    d3tempavg.text("Avg: " + numberFormat(_.reduce(_.map(tempAvgGroupByHour.all(), function(d){return d.value.average; }), function(memo,num){ return memo+ num; }, 0)/(tempAvgGroupByHour.size() === 0 ? 1 :pm10AvgGroupByHour.size())));

    d3hummax.text("Max: " + numberFormat(_.max(humidityAvgGroupByHour.all(), function (d){ return d.value.average}).value.average));
		    
    d3hummin.text("Min: " + numberFormat(_.min(humidityAvgGroupByHour.all(), function (d){ return d.value.average}).value.average)); 
    
    d3humavg.text("Avg: " + numberFormat(_.reduce(_.map(humidityAvgGroupByHour.all(), function(d){return d.value.average; }), function(memo,num){ return memo+ num; }, 0)/(humidityAvgGroupByHour.size() === 0 ? 1 :pm10AvgGroupByHour.size())));
	
};


function getAQIDesc(v){
    for (var i in aqiIndicators){
	if (v < aqiIndicators[i].uplimit+1){
	    return aqiIndicators[i];
	}		    
    }
    return aqiIndicators[i];
}


function setCharts(){
    
	    pm10Chart
		.width(Math.round(linechartWidth)).height(chartHeightDim)
		.dimension(hourDim)
		.group(pm10AvgGroupByHour)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.transitionDuration(500)
		.y(d3.scale.linear().domain([0, 300]))
		.x(d3.time.scale().domain([prevDate,maxDate]))
	        .elasticY(true)	   	    
		.round(dc.round.floor)
		.renderHorizontalGridLines(true)
		.valueAccessor(function(p) {
		    return p.value.average;
		})
		.colors(function (a) {
		    // AQI Color Standards
		    //var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];
			a = Math.round(a);
		    var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
		    if(a < 50 ){ return c[0];}
		    else if(a < 101){ return c[1];}			    
		    else if(a < 201){ return c[2];}			    
		    else if(a < 301){ return c[3] ;}			    
		    else if(a < 401){ return c[4] ;}			    
		    else if(a > 400){ return c[5] ;}			    
		    })
	//.colorAccessor(function (d) { globald = d; return getpm10AQI(globald.data.value.average); })
		.brushOn(false)
		.label(function (d) {
		    return d3.time.day(d.key).substr(0,12);
		}) 
		.title(function (d) {
		    return d.value.average.toString().substr(0,5);
		})
		.renderLabel(true)
		.yAxisLabel("PM 10");
	    pm10Chart.yAxis().ticks(4);
	    pm10Chart.xUnits(d3.time.hours);	
	    

		pm25Chart
		    .width(Math.round(linechartWidth)).height(chartHeightDim)
		    .dimension(hourDim)
		    .group(pm25AvgGroupByHour)
		    .margins({top: 10, right: 50, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .y(d3.scale.linear().domain([0, 1000]))
		    .x(d3.time.scale().domain([prevDate,maxDate]))
	            .elasticY(true)	   	    
		    .round(dc.round.floor)
		    .renderHorizontalGridLines(true)
		    .alwaysUseRounding(true)
		    .valueAccessor(function(p) {
			return p.value.average;
		    })
		    .colors(function (a) {
			//var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];
			// AQI Color Standards
			a = Math.round(a);
			var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
			if(a < 50 ){ return c[0];}
			else if(a < 101){ return c[1];}			    
			else if(a < 201){ return c[2];}			    
			else if(a < 301){ return c[3] ;}			    
			else if(a < 401){ return c[4] ;}			    
			else if(a > 400){ return c[5] ;}			    
		    })
		    .colorAccessor(function (d) { return getpm25AQI(d.value.average); })
		    .brushOn(false)
		    .label(function (d) {
			return d3.time.day(d.key).substr(0,12);
		    }) 
		    .title(function (d) {
			return d.value.average.toString().substr(0,5);
		    })
		    .renderLabel(true)
		    .yAxisLabel("PM 25");
		pm25Chart.yAxis().ticks(4);
		pm25Chart.xUnits(d3.time.hours);

		tempChart
		    .width(Math.round(linechartWidth)).height(chartHeightDim)
		    .dimension(hourDim)
		    .group(tempAvgGroupByHour)
		    .margins({top: 10, right: 50, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .y(d3.scale.linear().domain([0, 60]))
		    .x(d3.time.scale().domain([prevDate,maxDate]))
		    .renderHorizontalGridLines(true)
		    .round(dc.round.floor)
		    .alwaysUseRounding(true)
		    .valueAccessor(function(p) {
			return p.value.average;
		    })
		    .colorAccessor(function (d,i) {
			if(d.value.average < 20) { return "blue";}			    
			if(d.value.average < 26) { return "yellow";}			    
			if(d.value.average < 32 ){ return "orange";}			    
			if(d.value.average > 31){ return "red";}			    
		    })
		    .brushOn(false)
		    .label(function (d) {
			return d3.time.day(d.key).substr(0,12);
		    }) 
		    .title(function (d) {
			return d.value.average.toString().substr(0,5);
		    })
		    .renderLabel(true)
		    .yAxisLabel("Temp")
		tempChart.yAxis().ticks(4);
		tempChart.xUnits(d3.time.hours);

		humidityChart
		    .width(Math.round(linechartWidth)).height(chartHeightDim)
		    .dimension(hourDim)
		    .group(humidityAvgGroupByHour)
		    .margins({top: 10, right: 50, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .renderHorizontalGridLines(true)
		    .y(d3.scale.linear().domain([0, 100]))
		    .x(d3.time.scale().domain([prevDate,maxDate]))
		    .valueAccessor(function(p) {
			return p.value.average;
		    })
		    .brushOn(false)
		    .label(function (d) {
			return d3.time.day(d.key).substr(0,12);
		    }) 
		    .title(function (d) {
			return d.value.average.toString().substr(0,5);
		    })
		    .colorAccessor(function (d,i) {
			if(d.value.average < 20) { return "yellow";}			    
			if(d.value.average < 40) { return "blue";}			    
			if(d.value.average < 50 ){ return "green";}			    
			if(d.value.average < 100){ return "red";}			    
		    })
		    .yAxisLabel("Humidity");
		humidityChart.yAxis().ticks(4);
		humidityChart.xUnits(d3.time.hours);


	    clChart
		.width(Math.round(Width*0.3)).height(chartHeightDim)
		.dimension(hourDim)
		.group(clAvgGroupByHour)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.transitionDuration(500)
		.x(d3.time.scale().domain([prevDate,maxDate]))
		.round(dc.round.floor)
		.elasticY(true)
		.alwaysUseRounding(true)
		.renderHorizontalGridLines(true)
		.valueAccessor(function(p) {
		    return p.value.average;
		    })
		    .colors(function (a) {
			// AQI Color Standards
			//var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];
			a = Math.round(a);
			var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
			if(a < 50 ){ return c[0];}
			else if(a < 101){ return c[1];}
			else if(a < 201){ return c[2];}		    
			else if(a < 301){ return c[3];}			    
			else if(a < 401){ return c[4];}			    
			else if(a > 400){ return c[5];}			    
		    })
		.colorAccessor(function (d) { return getpm10AQI(d.value.average); })
		.brushOn(false)
		.label(function (d) {
		    return d3.time.day(d.key).substr(0,12);
		}) 
		.title(function (d) {
		    return d.value.average.toString().substr(0,5);
		})
		.renderLabel(true)
		.yAxisLabel("PM 10");
	    clChart.yAxis().ticks(4);
	    clChart.xAxis().ticks(8);
	    clChart.xUnits(d3.time.hours);	
	    

	    csChart
		.width(Math.round(Width*0.3)).height(chartHeightDim)
		.dimension(hourDim)
		.group(csAvgGroupByHour)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.transitionDuration(500)
		.x(d3.time.scale().domain([prevDate,maxDate]))
		.round(dc.round.floor)
		.alwaysUseRounding(true)
		.elasticY(true)
		.renderHorizontalGridLines(true)
		.valueAccessor(function(p) {
		    return p.value.average;
		})
		.colors(function (a) {
		    // AQI Color Standards
		    //var c =	['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];
		    a = Math.round(a);
		    var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
		    if(a < 50 ){ return c[0];}
		    else if(a < 101){ return c[1];}
		    else if(a < 201){ return c[2];}		    
		    else if(a < 301){ return c[3];}			    
		    else if(a < 401){ return c[4];}			    
		    else if(a > 400){ return c[5];}			    
		})
		.colorAccessor(function (d) { return getpm25AQI(d.value.average); })
		.brushOn(false)
		.label(function (d) {
		    return d3.time.day(d.key).substr(0,12);
		}) 
		.title(function (d) {
		    return d.value.average.toString().substr(0,5);
		})
		.renderLabel(true)
		.yAxisLabel("PM 2.5");
	    csChart.yAxis().ticks(4);
	    csChart.xAxis().ticks(8);
	    csChart.xUnits(d3.time.hours);	
	    

	    pm10Chart2 
		.width(Math.round(Width*0.3)).height(chartHeightDim)
		.dimension(pm10)
		.group(pm10s)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.transitionDuration(500)
		.gap(2)
		.keyAccessor(function(p) {
		    return p.key;
		})
	    	.valueAccessor(function(p) {
		    return p.value.count;
		})
		.x(d3.scale.linear().domain([1, d3.min([pm10.top(1).pm10, 600])]))            		   .round(dc.round.floor)
	.alwaysUseRounding(true)
		.renderHorizontalGridLines(true)
		.yAxisLabel("PM 10");
	    pm10Chart2.yAxis().ticks(4);
	    pm10Chart2.xUnits(function range(x0, x1, dx) {
		    var x = Math.ceil(x0), xs = [];
		    if (dx > 1) {
			while (x < x1) {
			    if (!(number(x) % dx)) xs.push(x);
			    step(x, 1);
			}
		    } else {
			while (x < x1) xs.push(x), x+=10;
		    }
		    return xs;
		    
		}); 	

    pm25Chart2 
	.width(Math.round(Width*0.3)).height(chartHeightDim)
	.dimension(pm25)
	.group(pm25s)
	.margins({top: 10, right: 50, bottom: 30, left: 50})
	.transitionDuration(500)
	.elasticY(true)	  
	.keyAccessor(function(p) {
	    return p.key;
	})
	.valueAccessor(function(p) {
	    return p.value.count;
	})
	.gap(2)
	.x(d3.scale.linear().domain([1, d3.min([pm25.top(1).pm25, 1500])]))
        .elasticX(true)    
	.round(dc.round.floor)
	.alwaysUseRounding(true)
	.renderHorizontalGridLines(true)
	.yAxisLabel("PM 2.5");
    pm25Chart2.yAxis().ticks(4);
    pm25Chart2.xUnits(function range(x0, x1, dx) {
	var x = Math.ceil(x0), xs = [];
	if (dx > 1) {
	    while (x < x1) {
		if (!(number(x) % dx)) xs.push(x);
		step(x, 1);
	    }
	} else {
	    while (x < x1) xs.push(x), x+=10;
	}
	return xs;	    
    }); 	
    

	    csChart2 
		.width(Math.round(Width*0.3)).height(chartHeightDim)
		.dimension(small_particle_count)
		.group(small_particle_counts)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.transitionDuration(500)
		.keyAccessor(function(p) {
		    return p.key;
		})
	    	.valueAccessor(function(p) {
		    return p.value.count;
		})
		.gap(2)
		.x(d3.scale.linear().domain([1, d3.min([large_particle_count.top(1).count_small, 1000])])).round(dc.round.floor)
		.y(d3.scale.linear().domain([0, 300]))
	        .elasticY(true)
		.alwaysUseRounding(true)
		.renderHorizontalGridLines(true);
	    csChart2.yAxisLabel("PM 25");
	    //clChart2.xAxisLabel("Frequency of occurence");
	    csChart2.yAxis().ticks(4);
	    csChart2.xUnits(function range(x0, x1, dx) {
		var x = Math.ceil(x0), xs = [];
		if (dx > 1) {
		    while (x < x1) {
			if (!(number(x) % dx)) xs.push(x);
			step(x, 1);
		    }
		} else {
		    while (x < x1) xs.push(x), x+=10;
		}
		return xs;
		
	    }); 	


	    clChart2 
		.width(Math.round(Width*0.3)).height(chartHeightDim)
		.dimension(large_particle_count)
		.group(large_particle_counts)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.transitionDuration(500)
		.keyAccessor(function(p) {
		    return p.key;
		})
	    	.valueAccessor(function(p) {
		    return p.value.count;
		})
		.gap(2)
		.x(d3.scale.linear().domain([1, d3.min([large_particle_count.top(1).count_large, 1000])])).round(dc.round.floor)
		.y(d3.scale.linear().domain([0, 300]))
	        .elasticY(true)
		.alwaysUseRounding(true)
		.renderHorizontalGridLines(true);
	    clChart2.yAxisLabel("PM 10");
	    //clChart2.xAxisLabel("Frequency of occurence");
	    clChart2.yAxis().ticks(4);
	    clChart2.xUnits(function range(x0, x1, dx) {
		var x = Math.ceil(x0), xs = [];
		if (dx > 1) {
		    while (x < x1) {
			if (!(number(x) % dx)) xs.push(x);
			step(x, 1);
		    }
		} else {
		    while (x < x1) xs.push(x), x+=10;
		}
		return xs;
		
	    }); 	
	    

	    function initAQIChart(data){
	 	if(data == null){
		    data = _.max(aqiAvgGroupByDay.all(), function (d) { return d.key });
		    data['desc'] = getAQIDesc(data.value.average);
		}		
		// requires data in key value format
		aqiCircle = aqiDisplay.selectAll("circle")
		    .attr("class", "bubble")
		    .data([data])
		    .enter()
		    .append("circle")
		    .attr("r", aqiradius-4)
		    .attr("cx", aqiradius)
		    .attr("cy", aqiradius)
		    .attr("fill",  function (d) {
			// AQI Color Standards
			a = Math.round(d.value.average);
			var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
			if(a < 50 ){ return c[0];}
			else if(a < 101){ return c[1];}
			else if(a < 201){ return c[2];}		    
			else if(a < 301){ return c[3];}			    
			else if(a < 401){ return c[4];}			    
			else if(a > 400){ return c[5];}			    
		    });
		
		// air bubbles
		/*
		function randomNodes(n, cs, cl) {
		    var mydata = [],
		    range = d3.range(n);		    
		    for (var i = range.length - 1; i >= 0; i--) {
			mydata.push({
			    rad: Math.floor(Math.random() * 3)
			});
		    }
		    return mydata;
		}
		
		nodeData = randomNodes(80);
		
		force = d3.layout.force()
		    .charge(-3)
		    .gravity(0.05)
		    .nodes(nodeData)
		    .friction(0.98)
		    .size([w,h]);
		
		var nodes =  aqiDisplay2.selectAll('.nodes')
		    .data(nodeData)
		    .enter().append('circle')
		    .attr({
			class: 'nodes',
			r: function (d) { return d.rad + nodeBaseRad; },
			fill: "rgba(30,30,30,0.2)",
			//stroke:'#000000'
		    })

		function pythag(r, b, coord) {
		    r += nodeBaseRad;
		    // force use of b coord that exists in circle to avoid sqrt(x<0)
		    b = Math.min(w - r - strokeWidth, Math.max(r + strokeWidth, b));
		    var b2 = Math.pow((b - radius), 2),
		    a = Math.sqrt(hyp2 - b2);
		    // radius - sqrt(hyp^2 - b^2) < coord < sqrt(hyp^2 - b^2) + radius
		    coord = Math.max(radius - a + r + strokeWidth,
				     Math.min(a + radius - r - strokeWidth, coord));
		    return coord;
		}
		*/
		/*
		function tick() {
		    //debugger;
		    nodes.attr('cx', function (d) { return d.x = pythag(d.rad, d.y, d.x); })
			.attr('cy', function (d) { return d.y = pythag(d.rad, d.x, d.y); });
		}
		*/
		/*
		function tick(e) {
		    nodes		    
			.each(collide(.5))
			.attr("cx", function(d) { return d.x = pythag(d.rad, d.y, d.x); })
			.attr("cy", function(d) { return d.y  = pythag(d.rad, d.x, d.y); });
		}
		
		nodes.call(force.drag);		
		force.on('tick', tick)
		    .start();
		

		function collide(alpha) {
		    var padding = 1.5, // separation between same-color nodes
		    clusterPadding = 6, // separation between different-color nodes
		    maxRadius = 7;
		    var quadtree = d3.geom.quadtree(nodeData);
		    return function(d) {
			var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
			nx1 = d.x - r,
			nx2 = d.x + r,
			ny1 = d.y - r,
			ny2 = d.y + r;
			quadtree.visit(function(quad, x1, y1, x2, y2) {
			    if (quad.point && (quad.point !== d)) {
				var x = d.x - quad.point.x,
				y = d.y - quad.point.y,
				l = Math.sqrt(x * x + y * y),
				r = d.radius + quad.point.radius
				if (l < r) {
				    l = (l - r) / l * alpha;
				    d.x -= x *= l;
				    d.y -= y *= l;
				    quad.point.x += x;
				    quad.point.y += y;
				}
			    }
			    return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
			});
		    }
		} // end collide
		*/
		
		aqiText = aqiDisplay.selectAll("text.title")
		    .data([data])
		    .enter()
		    .append("text")
		    .attr("x", aqiradius)
		    .attr("y", aqiradius+8+5)
		    .attr("text-anchor", "middle")
		    .attr("class", "title aqinumber")
		    .text(function(d){ 
			return numberFormat(d.value.average).substr(0,5);
		    })
		    .attr("font-family", "'Lato', sans-serif")
		    .attr("font-size", function(d) {
			return "4.0em";
			//return Math.min(2 * aqiradius, (2 * aqiradius - 8) / numberFormat(d.value.average).length * 24) + "px";
			//return (d.value.average > 999) ? "27px":"40px";})
		    })  
		    .attr("font-style", "bold")
		    .attr("fill",   function (d) {
			// AQI Color Standards
			//return "#111111";
			a = Math.round(d.value.average);
			var c = ['aliceblue', 'aliceblue', '#009900', '#0000aa',  'aliceblue', 'aliceblue'];
			if(a < 50 ){ return c[0];}
			else if(a < 101){ return c[1];}
			else if(a < 201){ return c[2];}		    
			else if(a < 301){ return c[3];}			    
			else if(a < 401){ return c[4];}			    
			else if(a > 400){ return c[5];}			    
		    });	
		  
		/*
		aqiText2 = aqiDisplay.selectAll("text.value")
		    .data([data])
		    .enter()
		    .append("text")
		    .attr("x", 200)
		    .attr("y", aqiradius+18)
		    .attr("class", "value remark")
		    .text(function(d){ 
			return d.desc.remark;
		    })
		    .attr("font-family", "'Lato', sans-serif")
		    .attr("font-size", function(d) { return "24px";   return Math.min(2 * aqiradius, (2 * aqiradius - 8) / d.desc.remark.length * 24) + "px";})   
		//(d.value.average > 999) ? "27px":"40px";})
		    .attr("font-style", "bold")
		    .attr("fill",   function (d) {
			// AQI Color Standards
			a = Math.round(d.value.average);
			var c = ['#c00000', '#ff0000', '#ff9900', '#ffff00',  '#92d050', '#00b050' ];
			if(a < 50 ){ return c[0];}
			else if(a < 101){ return c[1];}
			else if(a < 201){ return c[2];}		    
			else if(a < 301){ return c[3];}			    
			else if(a < 401){ return c[4];}			    
			else if(a > 400){ return c[5];}			    
		    });	
		    */
	    };
	    
	    initAQIChart();

	} // end of setCharts



    
    function updateAQIChart(data){		
	if(data == null){
	    var data = _.max(aqiAvgGroupByDay.all(), function (d) { return d.key });
	    data['desc'] = getAQIDesc(data.value.average);	    
z	}
		
	var aqiCircle = aqiDisplay.selectAll("circle")
	    .data([data]);	    
	
	aqiCircle.exit().remove();		

	aqiCircle
	    .attr("r", aqiradius-4)
	    .attr("cx", aqiradius)
	    .attr("cy", aqiradius)
	    .attr("fill",  function (d) {
		// AQI Color Standards
		a = Math.round(d.value.average);
		var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}
		else if(a < 201){ return c[2];}		    
		else if(a < 301){ return c[3];}			    
		else if(a < 401){ return c[4];}			    
		else if(a > 400){ return c[5];}			    
	    });
	
	
	var aqiText = aqiDisplay.selectAll("text.title")
	    .data([data]);

	aqiText.exit()
	    .remove();
	
	aqiText
	    .attr("x", radius)
	    .attr("y", radius+8+5)
	    .attr("text-anchor", "middle")
	    .text(function(d){ 
		return numberFormat(d.value.average).substr(0,5); 
	    })
	    .attr("font-family", "'Aladin', cursive")
	    .attr("font-size", "4.0em")
	    .attr("font-style", "bold")
	    .attr("fill",   function (d) {
		// AQI Color Standards
		//return "#111111";	
		a = Math.round(d.value.average);		
		var c = ['aliceblue', 'aliceblue', '#009900', '#0000aa',  'aliceblue', 'aliceblue'];
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}
		else if(a < 201){ return c[2];}		    
		else if(a < 301){ return c[3];}			    
		else if(a < 401){ return c[4];}			    
		else if(a > 400){ return c[5];}			    		

	    });	
		  

	/*
	var aqiText2 = aqiDisplay.selectAll("text.value")
	    .data([data]);
	
	aqiText2.exit()
	    .remove();
	    */
	/*
	aqiText2	
	    .attr("x", 200)
	    .attr("y", aqiradius)
	    .attr("class", "value remark")
	    .text(function(d){ 
		return d.desc.remark;
	    })
	    .attr("font-family", "'Lato', sans-serif")
	    .attr("font-size", function(d) { return "27px";   return Math.min(2 * aqiradius, (2 * aqiradius - 8) / d.desc.remark.length * 24) + "px";})   
	//(d.value.average > 999) ? "27px":"40px";})
	    .attr("font-style", "bold")
	    .attr("fill",   function (d) {
		// AQI Color Standards
		return "#000000";
		a = Math.round(d.value.average);
		var c = ['#c00000', '#ff0000', '#ff9900', '#ffff00',  '#92d050', '#00b050' ];
		if(a < 50 ){ return c[0];}
		else if(a < 101){ return c[1];}
		else if(a < 201){ return c[2];}		    
		else if(a < 301){ return c[3];}			    
		else if(a < 401){ return c[4];}			    
		else if(a > 400){ return c[5];}			    
	    });	
	    */
	var aqiTextDate = d3.select("#aqiDate")
	    .data([data])
	    .html(function(d){ 		
		return "on: " + dateFormat(d.key);
	    });

	

	var aqiTextRemark = d3.select(".switch-label")
	    .data([data])
	    .attr("aqi",function(d){ 
		return d.desc.remark;
	    });
	
	/*
	var aqiTextDate = aqiDisplay.selectAll("text")
	    .data([data]);
	
	aqiTextDate.exit().remove();
	
	aqiTextDate 
	    .data([data])
	    .enter()
	    .append("text")
	    .attr("x", radius)
	    .attr("y", radius-8)
	    .attr("text-anchor", "middle")
	    .text(function(d){ 
		console.log("date key::");
		console.log(dateFormat(d.key));
		return dateFormat(d.key);
	    })
	    .attr("font-family", "'Lato', sans-serif")
	    .attr("font-size", "12px")
	    .attr("font-style", "bold")
	    .attr("fill", "#555555");		
	    */
	    
    }
    
    
    function render(method){
	d3.select(this).call(method);
    }
	
	
    function renderAll(){
	updateAQIChart();		
	computeAverages();        
	dc.renderAll();

	//bChart.each(render);
	//cChart.each(render);
	//newFilterObject = {};
	//datapointIndexs.all().forEach(function(d){ newFilterObject[d.key] = d.value; });
	//oldFilterObject = newFilterObject;
	
	// update humidity/temp, etc
	//visible = datapoints.filter(function(d){ return newFilterObject[d.index] == 1; });
	// Cumulative numbers
        /*
	d3.select("#total").text(
	    d3.format(',')(all.value()));

	d3.select("#max").text(
	    d3.format(',')(d3.max(visible.map(function(d, i){ return d.pm10; }))));	
	*/
	//dc.redrawAll();
    }

    function initialLoad(error, aqdevices){  
	lastStreamTimeStamp = new Date();    	
	//datapoints = tmpdatapoints;
	aqdevices.forEach(function(d,i){
	    map.markDevice(d);
	})				
	//var append=true;
	//processdata(datapoints, append);
	//setCharts();
	//renderAll();
    }

    //dc.renderAll();	    
    this.setCharts = setCharts;
    this.renderAll = renderAll;
    this.streamStart = streamStart;
    this.streamStop = streamStop;
    this.initialLoad = initialLoad;
    this.processdata = processdata;
    this.initDimensions = initDimensions;
    this.datapoints = datapoints;
    this.datapointCF = datapointCF;    
//}

//aqi.indiaspend.org/aq
//127.0.0.1:8000
//vis = new VisObj();
  //.defer(d3.json, "http://aqi.indiaspend.org/aq/api/aqfeed/?format=json")
queue()  
    .defer(d3.json, "http://aqi.indiaspend.org/aq/api/devices/?format=json")
    .await(initialLoad);


function print_filter(filter){
    var f=eval(filter);
    if (typeof(f.length) != "undefined") {}else{}
    if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
    if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
    console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
} 
