//var VisObj = function(){

    var Width =  1200;   //$(window).width()
    var Height =   $(window).height() 
    
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
    var opacityScale = d3.scale.quantile();
    var mmm;
    var parseDate = d3.time.format("%x %H:%M").parse;
    aqparseDate = d3.time.format("%Y-%m-%dT%H:%M").parse;
    var datapoint;
    var datapoints;
    var datapointCF;
    dateFormat = d3.time.format('%d/%m/%Y');
    var numberFormat = d3.format('.2f');

    var dataCount  = dc.dataCount("#data-count");
    //var timeChart  = dc.barChart("#time-chart");
    var pm10Chart  = dc.barChart("#pm10-chart"); 
    var pm25Chart = dc.barChart('#pm25-chart');
    var tempChart = dc.barChart('#temp-chart');
    var humidityChart = dc.barChart('#hum-chart');
    var clChart = dc.barChart('#cl-chart');
    var csChart = dc.barChart('#cs-chart');
    var dimwidth = chartWidthDim+20;
    var dimheight=chartHeightDim +20;
    var pm10Chart2  = dc.barChart("#pm10-chart2"); 
    var pm25Chart2 = dc.barChart('#pm25-chart2');
    var chartWidthDim = 320; 
    var chartHeightDim = 107; 

    var linechartWidth = "90%"; //Math.round(Width*0.5); 
    var linechartHeight = 107; 

    var aqiText, aqiDisplay, aqiCircle, aqiTextDate;
    
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


    var radius = 50;	
    var aqiDisplay = d3.select('#aqi-display')
	.append('svg')
	.attr('width', radius*2)
	.attr('height', (radius*2)+12)	    
	.append("g");	    
    

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
	    d3.scale.linear().domain([250, 350]).range([401,500]),
	];
	
	if(d < 31) { return scale[0](d); } 
	if(d < 61) { return scale[1](d); }			    
	if(d < 91){ return scale[2](d);  }			    
	if(d < 121){return scale[3](d);  }			    
	if(d < 251){return scale[3](d);  }			    
	if(d >= 251){ return scale[4](d); }			    
    }

    function getAQI(t){
	pm25aqi = getpm25AQI(t.pm25);
	pm10aqi = getpm10AQI(t.pm10);
	if (pm10aqi <= pm25aqi) { return {'aqi': pm10aqi, 'pollutant':'pm10'  }; } 
	else { return {'aqi': pm25aqi, 'pollutant':'pm25' };} 
    }

    function processdata(tmpdatapoints, append){
	tmpdatapoints.forEach(function(t,i){
	    t['time'] = aqparseDate(t['created_on'].substr(0,16));
	    t['index'] = i;
	    a = getAQI(t);
	    t['aqi'] = a.aqi;
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
	console.log("InitDimensions called");
	datapointCF = crossfilter(datapoints);
	//console.log(datapoints);
	    //debugger;
	    all = datapointCF.groupAll();	    
	    dateDim = datapointCF.dimension(function(d) { return d.time;})
	    minDate = dateDim.bottom(1)[0].time;
	    maxDate = dateDim.top(1)[0].time;
	    prevDate = d3.time.day.offset(maxDate, -1);
	    prevWeekDate = d3.time.day.offset(new Date(), -7);
	    
	    //datapointIndex = datapointCF.dimension(function(d){ return d.index; });
	    //datapointIndexs = datapointIndex.group();

   	    //oldFilterObject = {};
	    //datapointIndexs.all().forEach(function(d){ oldFilterObject[d.key] = d.value; });

	    aqi = datapointCF.dimension(function(d){ return d.aqi; });
	    aqiGroup = aqi.group(Math.floor);

	    imei = datapointCF.dimension(function(d){ return d.imei; });
	    imeiGroup = imei.group(Math.floor);

	    pm10 = datapointCF.dimension(function(d){ return d.pm10; });
	    pm10s = pm10.group(Math.floor);
	    
	    pm25 = datapointCF.dimension(function(d){ return d.pm25; });
	    pm25s = pm25.group(Math.floor);
	    
	    temp = datapointCF.dimension(function(d){ return d.temperature; });
	    temps = temp.group(Math.floor);	   	    

	    humidity = datapointCF.dimension(function(d){ return d.humidity; });
	    hums = humidity.group(Math.floor);
	    	    
	    small_particle_count = datapointCF.dimension(function(d){ return d.count_small; });
	    small_particle_counts = small_particle_count.group(Math.floor);
	    
            large_particle_count = datapointCF.dimension(function(d){ return d.count_large; });
	    large_particle_counts = large_particle_count.group(Math.floor);	
	    
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
	    
	    aqiAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('aqi'), reduceRemoveAvg('aqi'), reduceInitAvg);
	    
	    pm10AvgGroupByHour = hourDim.group().reduce(reduceAddAvg('pm10'), reduceRemoveAvg('pm10'), reduceInitAvg);
	    
	    pm25AvgGroupByHour = hourDim.group().reduce(reduceAddAvg('pm25'), reduceRemoveAvg('pm25'), reduceInitAvg);

	    tempAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('temperature'), reduceRemoveAvg('temperature'), reduceInitAvg);

	    humidityAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('humidity'), reduceRemoveAvg('humidity'), reduceInitAvg);

	    csAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('count_small'), reduceRemoveAvg('count_small'), reduceInitAvg);

	    clAvgGroupByHour = hourDim.group().reduce(reduceAddAvg('count_large'), reduceRemoveAvg('count_large'), reduceInitAvg);

	    aqiAvgGroupByDay = dayDim.group().reduce(reduceAddAvg('aqi'), reduceRemoveAvg('aqi'), reduceInitAvg);
	    
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



	function setCharts(){

	    /*
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

	    
		timeChart.focusCharts = function (chartlist) {
		    if (!arguments.length) {
			return this._focusCharts;
		    }
		    this._focusCharts = chartlist; // only needed to support the getter above
		    this.on('filtered', function (range_chart) {			
			computeAverages();
				
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
		    .width(Width*0.70)
		    .height(80)
		    .dimension(hourDim)
		    .margins({top: 10, right: 100, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .y(d3.scale.linear().domain([0, 600]))
		    .elasticY(true)
		    .x(d3.time.scale().domain([prevWeekDate, maxDate]))
		    .gap(25)
		    .renderHorizontalGridLines(true)
		    .alwaysUseRounding(true)
		    .colors(function (a) {
			// AQI Color Standards
			//  var c = ['#00e400','#ffff00','#ff7e00','#ff0000','#99004c','#7e0023'];
			a = Math.round(a);
			var c = ['#00b050', '#92d050', '#ffff00', '#ff9900', '#ff0000', '#c00000'];
			if(a < 50 ){ return c[0];}
			else if(a < 101){ return c[1];}			    
			else if(a < 201){ return c[2];}			    
			else if(a < 301){ return c[3] ;}			    
			else if(a < 401){ return c[4] ;}			    
			else if(a > 400){ return c[5] ;}			    

		    })
		    .colorAccessor(function (d) { return d.value.average; })
		    .group(aqiAvgGroupByDay, 'Average AQI per Day')
		    .valueAccessor(function(p) {
			return p.value.average;
		    })
		    .title(function (d) {
			var value = d.value.average ? d.value.average : d.value;
			if (isNaN(value)) {
			    value = 0;
			}
			a = numberFormat(value) + '\n on \n' + dateFormat(d.key);
			//console.log(a);
			return a; //numberFormat(value);
		    })
		    .renderlet(function (chart) {		
			//Check if labels exist
			var gLabels = chart.select(".labels");
			if (gLabels.empty()){
			    gLabels = chart.select(".chart-body").append('g').classed('labels', true);
			}		
			var gLabelsData = gLabels.selectAll("text").data(chart.selectAll(".bar")[0]);		
			gLabelsData.exit().remove(); //Remove unused elements
			gLabelsData.enter().append("text") //Add new elements		
			gLabelsData
			    .attr('text-anchor', 'middle')
			    .attr('fill', 'black')		 
			    .text(function(d){
				return numberFormat(d3.select(d).data()[0].data.value.average);
			    })
			    .attr('x', function(d){
				return +d.getAttribute('x') + 20;
			    })
			    .attr('y', function(d){ 
				if (+d.getAttribute('height') < 18) {return +d.getAttribute('y')-1  ;} 
				else {return +d.getAttribute('y') + 15; }
			    })
			    .attr('style', function(d){
				if (+d.getAttribute('x') < 5)
				    return "display:none";
				if (+d.getAttribute('x') < 5)
				    return "display:none";
			    });			
		    });
		
	    timeChart.yAxis().ticks(3);
	    timeChart.xUnits(d3.time.days);
	    timeChart.focusCharts([pm10Chart, pm25Chart, tempChart, humidityChart]);		
	    */
		clChart
		    .width(Math.round(Width*0.3)).height(chartHeightDim)
		    .dimension(hourDim)
		    .group(clAvgGroupByHour)
		    .margins({top: 10, right: 50, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .x(d3.time.scale().domain([minDate,maxDate]))
		    .round(dc.round.floor)
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
		    .x(d3.time.scale().domain([minDate,maxDate]))
		    .round(dc.round.floor)
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
		    else if(a < 301){ return c[3] ;}			    
		    else if(a < 401){ return c[4] ;}			    
		    else if(a > 400){ return c[5] ;}			    
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
	    pm10Chart.yAxis().ticks(4);
	    pm10Chart.xUnits(d3.time.hours);	
	    
	    pm10Chart2 
		.width(Math.round(Width*0.3)).height(chartHeightDim)
		.dimension(pm10)
		    .group(pm10s)
		    .margins({top: 10, right: 50, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .elasticY(true)	  
		    .gap(2)
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
		    .gap(2)
		    .x(d3.scale.linear().domain([1, d3.min([pm25.top(1).pm25, 1500])]))
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
		

		pm25Chart
		    .width(Math.round(linechartWidth)).height(chartHeightDim)
		    .dimension(hourDim)
		    .group(pm25AvgGroupByHour)
		    .margins({top: 10, right: 50, bottom: 30, left: 50})
		    .transitionDuration(500)
		    .y(d3.scale.linear().domain([0, 1000]))
		    .x(d3.time.scale().domain([minDate,maxDate]))
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
		    .x(d3.time.scale().domain([minDate,maxDate]))
	            .elasticY(true)	   	    
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
		    .x(d3.time.scale().domain([minDate,maxDate]))
	            .elasticY(true)	   	    
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
	    
	     /* dc.dataCount('.dc-data-count', 'chartGroup'); */	
	    //console.log(datapointCF);
	    //console.log(all);

	    dataCount
		.dimension(datapointCF)
		.group(all)	   
		.html({
		    some: '<strong>%filter-count</strong> selected out of <strong>%total-count</strong> records' +
		    '<a href=\'javascript:dc.filterAll(); dc.renderAll();\'\'>Reset All</a>',
		    all:'All records selected.'
		});	

	    function initAQIChart(data){
		if(data == null){
		    data = _.max(aqiAvgGroupByDay.all(), function (d) { return d.key });
		}	  
		// requires data in key value format
		aqiCircle = aqiDisplay.selectAll("circle")
		    .attr("class", "bubble")
		    .data([data])
		    .enter()
		    .append("circle")
		    .attr("r", radius)
		    .attr("cx", radius)
		    .attr("cy", radius)
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
	    
		aqiText = aqiDisplay.selectAll("text")
		    .data([data])
		    .enter()
		    .append("text")
		    .attr("x", radius)
		    .attr("y", radius+8)
		    .attr("text-anchor", "middle")
		    .text(function(d){ 
			return numberFormat(d.value.average);
		    })
		    .attr("font-family", "'Aladin', cursive")
		    .attr("font-size", function(d) { return (d.value.average > 999) ? "27px":"40px";})
		    .attr("font-style", "bold")
		    .attr("fill", "#f0fcfc");	
		/*
		//debugger;
		aqiTextDate = aqiDisplay.selectAll("text")
		    .data([data])
		    .enter()
		    .append("text")
		    .attr("x", radius)
		    .attr("y", radius-8)
		    .attr("text-anchor", "middle")
		    .text(function(d){
			return dateFormat(d.key);
		    })
		    .attr("font-family", "'Lato', sans-serif")
		    .attr("font-size", "12px")
		    .attr("font-style", "bold")
		    .attr("fill", "#555555");		    
		*/
	    };
	    
	    initAQIChart();

	} // end of setCharts
    
    function updateAQIChart(data){		
	if(data == null){
	    var data = _.max(aqiAvgGroupByDay.all(), function (d) { return d.key });
	}	  
	
	var aqiCircle = aqiDisplay.selectAll("circle")
	    .data([data]);	    
	
	aqiCircle.exit().remove();		

	aqiCircle
	    .attr("r", radius)
	    .attr("cx", radius)
	    .attr("cy", radius)
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
	

	var aqiText = aqiDisplay.selectAll("text")
	    .data([data]);

	aqiText.exit()
	    .remove();
	
	aqiText
	    .attr("x", radius)
	    .attr("y", radius+8)
	    .attr("text-anchor", "middle")
	    .text(function(d){ 
		return numberFormat(d.value.average); 
	    })
	    .attr("font-family", "'Aladin', cursive")
	    .attr("font-size", "40px")
	    .attr("font-style", "bold")
	    .attr("fill", "#f0fcfc");	


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
