function p(name){
	return function(d){ return d[name]; }
}
function toPositiveRadian(r){ return r > 0 ? r : r + Math.PI*2; }
function toDegree(r){ return r*180/Math.PI; }

var width = 960,
	height = 600,
	centered;
	zoomRender = false;

var proj = d3.geo.azimuthalEqualArea()
    .scale(width)
    .translate([33.5, 262.5])
    .rotate([100, -45])
    .center([-17.6076, -4.7913]) // rotated [-122.4183, 37.7750]
    .scale(1297);

var path = d3.geo.path().projection(proj);


var svg = d3.select("#map").append("svg")
		.attr("width", width)
		.attr("height", height)

var g = svg.append("g");

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

var stateNameToAbv = {"Alabama":"AL","Alaska":"AK","American Samoa":"AS","Arizona":"AZ","Arkansas":"AR","California":"CA","Colorado":"CO","Connecticut":"CT","Delaware":"DE","District Of Columbia":"DC","Federated States Of Micronesia":"FM","Florida":"FL","Georgia":"GA","Guam":"GU","Hawaii":"HI","Idaho":"ID","Illinois":"IL","Indiana":"IN","Iowa":"IA","Kansas":"KS","Kentucky":"KY","Louisiana":"LA","Maine":"ME","Marshall Islands":"MH","Maryland":"MD","Massachusetts":"MA","Michigan":"MI","Minnesota":"MN","Mississippi":"MS","Missouri":"MO","Montana":"MT","Nebraska":"NE","Nevada":"NV","New Hampshire":"NH","New Jersey":"NJ","New Mexico":"NM","New York":"NY","North Carolina":"NC","North Dakota":"ND","Northern Mariana Islands":"MP","Ohio":"OH","Oklahoma":"OK","Oregon":"OR","Palau":"PW","Pennsylvania":"PA","Puerto Rico":"PR","Rhode Island":"RI","South Carolina":"SC","South Dakota":"SD","Tennessee":"TN","Texas":"TX","Utah":"UT","Vermont":"VT","Virgin Islands":"VI","Virginia":"VA","Washington":"WA","West Virginia":"WV","Wisconsin":"WI","Wyoming":"WY"};


var stateNametoAbv1 = {'Andaman and Nicobar': 'AN', 'Andhra Pradesh': 'AP', 'Arunachal Pradesh': 'AR', 'Assam': 'AS', 'Bihar': 'BR', 'Chandigarh': 'CH', 'Chhattisgarh': 'CT', 'Dadra and Nagar Haveli': 'DN', 'Daman and Diu': 'DD', 'Delhi': 'DL', 'Goa': 'GA', 'Gujarat': 'GJ', 'Haryana': 'HR', 'Himachal Pradesh': 'HP', 'Jammu and Kashmir': 'JK', 'Jharkhand': 'JH', 'Karnataka': 'KA', 'Kerala': 'KL', 'Lakshadweep': 'LD', 'Madhya Pradesh': 'MP', 'Maharashtra': 'MH', 'Manipur': 'MN', 'Meghalaya': 'ML', 'Mizoram': 'MZ', 'Nagaland': 'NL', 'Orissa': 'OR', 'Puducherry': 'PY', 'Punjab': 'PB', 'Rajasthan': 'RJ', 'Sikkim': 'SK', 'Tamil Nadu': 'TN', 'Telengana': 'TS', 'Tripura': 'TR', 'Uttar Pradesh': 'UP', 'Uttarakhand': 'UT', 'West Bengal': 'WB'}


var widthScale = d3.scale.pow().exponent(.5);
var colorScale = d3.scale.linear();
var opacityScale = d3.scale.quantile();
var mmm;
var parseDate = d3.time.format("%x %H:%M").parse;
var aqparseDate = d3.time.format("%Y-%m-%dT%H:%M:%S").parse;
var datapoint;

queue()
	.defer(d3.json, "/static/data/us-states.json")
	.defer(d3.csv, "/static/data/filteredTornados.csv")
	.defer(d3.json, "/static/data/us.json")
        .defer(d3.json, "/static/data/india-topo.json")
        .defer(d3.json, "/static/data/in-states-topo.json")
        .defer(d3.json, "/static/data/india-states-gramener.json")
        .defer(d3.json, "/api/aqfeed/?format=json")
        .defer(d3.json, "/api/devices/?format=json")
	.await(intialLoad);

function intialLoad(error, topology, tornados, usGrey, intopo, instatestopo, instategram, datapoints, aqdevices){
    picker = d3.select("#devicePicker")
    devices =  picker.selectAll("option")
        .data(aqdevices)
        .enter()
        .append("option")
        .attr("value", function(d){ return d['imei'];})
        .text(function (d) { return d['title'];})        

    datapoint = datapoints;

    datapoints.forEach(function(t,i){
	t['time'] = aqparseDate(t['created_on']);
	t['index'] = i;
	t['x'] = proj([t.lon, t.lat])[0];
	t['y'] = proj([t.lon, t.lat])[1];	
    })
        //draw tornados
	/*tornados.forEach(function(t, i){
		['inj', 'fat', 'elat', 'elon', 'slat', 'slon', 'fscale', 'length', 'width'].forEach(function(field){
			t[field] = +t[field];});
		t['index'] = i;
		t['time'] = parseDate(t['time']);

		t['x1'] = proj([t.slon, t.slat])[0];
		t['y1'] = proj([t.slon, t.slat])[1];
		t['x2'] = proj([t.elon, t.elat])[0];
		t['y2'] = proj([t.elon, t.elat])[1];

		t['angle'] = Math.atan2(t.x2 - t.x1, -(t.y2 - t.y1));
		t['angle'] = toDegree(toPositiveRadian(t['angle']));
	});

	//remove those w/o angle
	tornados = tornados.filter(function(d){ return d.angle != 180; });
	vtornados = tornados.filter(function(d){ return d.length > 20; });

	widthScale.range([.25, 2.6])
	    .domain(d3.extent(vtornados.map(function(d){ return d.width; })));

	colorScale.range(['blue', 'red'])
			.domain(d3.extent(vtornados.map(function(d){ return d.fscale; })));

	opacityScale.range(d3.range(.3, .8, .1))
	    .domain(vtornados.map(function(d){ return d.fscale; }));

	var defs = g.append("defs");
        mmm = usGrey;
	defs.append("path")
	  .datum(topojson.feature(usGrey, usGrey.objects.land))
	  .attr("id", "land")
	  .attr("d", path);

	g.append("clipPath")
	  .attr("id", "clip")
	.append("use")
	  .attr("xlink:href", "#land");

	g.append("image")
	  .attr("clip-path", "url(#clip)")
	  .attr("xlink:href", "/static/img/shaded-relief.png")
	  .attr("width", width)
	  .attr("height", height);

	g.append("use")
	  .attr("xlink:href", "#land");

	stateBorders = g.selectAll(".border")
		.data(topology.features)
	.enter()
		.append("svg:path")
		.attr("d", path)
		.attr("class", "border")
		.on("click", function(d){ 
			var abv = stateNameToAbv[d.properties.name];
			clicked(d);
			state.filter( function(stateList){ 
				if(centered == null){ return true; }
				return stateList.indexOf(abv) != -1;
			});
			setTimeout(renderAll, 500); 
		});


               lines = g.selectAll("line").data(vtornados).enter().append("line")
			.attr("x1", p('x1'))
			.attr("y1", p('y1'))
			.attr("x2", p('x1'))
			.attr("y2", p('y1'))
			.attr("stroke-width", function(d){ return widthScale(d.width); })
			//.attr("id", function(d, i){ return "TNum" + i; })
			.attr("stroke", function(d){ return colorScale(d.fscale); })
			.attr("opacity", function(d){ return opacityScale(d.fscale); })
			.attr("stroke-linecap", "butt")
			.style("pointer-events", "none")

	lines.transition().duration(3000)
			.attr("x2", function(d){ return d.x2 })
			.attr("y2", function(d){ return d.y2; })

				*/
	tornadoCF = crossfilter(tornados);
    
        datapointCF = crossfilter(datapoints);
	all = datapointCF.groupAll();

	datapointIndex = datapointCF.dimension(function(d){ return d.index; });
	datapointIndexs = datapointIndex.group();

	//state = datapointCF.dimension(function(d){ return d.states; });
	//states = state.group();

	temp = datapointCF.dimension(function(d){ return d.temperature; });
	temps = temp.group();

	humidity = datapointCF.dimension(function(d){ return d.humidity; });
	hums = humidity.group();

	pm10 = datapointCF.dimension(function(d){ return d.pm10; });
	pm10s = pm10.group();

	pm25 = datapointCF.dimension(function(d){ return d.pm25; });
	pm25s = pm25.group();

	small_particle_count = datapointCF.dimension(function(d){ return d.count_small; });
	small_particle_counts = small_particle_count.group();

        large_particle_count = datapointCF.dimension(function(d){ return d.count_large; });
	large_particle_counts = large_particle_count.group();

	hour = datapointCF.dimension(function(d){ return d.time.getHours(); });
	hours = hour.group();

	month = datapointCF.dimension(function(d){ return d.time.getMonth(); });
	months = month.group();

	year = datapointCF.dimension(function(d){ return Math.floor(d.time.getFullYear()/1)*1; });
	years = year.group();

	var bCharts = [
		barChart()
			.dimension(temp)
			.group(temps)
			.x(d3.scale.linear()
				.domain([0, 100])
			   .rangeRound([0, 130]))
			.barWidth(10),
	    
		barChart()
			.dimension(humidity)
			.group(hums)
			.x(d3.scale.linear()
			   .domain([0, 100])
		           .rangeRound([0, 130]))
			.barWidth(10),


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
			.dimension(small_particle_count)
			.group(small_particle_counts)
			.x(d3.scale.linear()
			   .domain([0,100])
		           .rangeRound([0, 130]))
			.barWidth(10),

		barChart()
			.dimension(large_particle_count)
			.group(large_particle_counts)
			.x(d3.scale.linear()
			   .domain([0, 100])
		           .rangeRound([0, 130]))
			.barWidth(10),

		barChart()
			.dimension(year)
			.group(years)
			.tickFormat(d3.format(''))
			.x(d3.scale.linear()
				.domain([2014, 2020])
			   .rangeRound([0,210]))
			   .barWidth(5),			   
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

	];

	d3.selectAll("#total")
			.text(datapointCF.size());

	function render(method){
		d3.select(this).call(method);
	}

	var oldFilterObject = {};
	datapointIndexs.all().forEach(function(d){ oldFilterObject[d.key] = d.value; });

	renderAll = function(){
	    bChart.each(render);
	    cChart.each(render);
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
	    
		d3.select("#num").text(
			d3.format(',')(all.value()));
		d3.select("#miles").text(
			d3.format(',.0f')(d3.sum(visible.map(function(d, i){ return d.length; }))));
		d3.select("#inj").text(
			d3.format(',')(d3.sum(visible.map(function(d, i){ return d.inj; }))));			
	}


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


    drawCharts();


                function drawCharts(){
		    var chartDim = Math.min(document.getElementById('mappa').clientWidth, window.innerHeight) - 20;	    
		    var chartWidthDim = Math.min(document.getElementById('mappa').clientWidth, window.innerHeight ) - 20;
		    var chartHeightDim =  (window.innerHeight)/6;


		ndx = crossfilter(datapoint);
		dateDim = ndx.dimension(function(d) { return d.time;});
		var concDim = ndx.dimension(function(d) { return d.count_small; });   
		var clDim  = ndx.dimension(function(d) { return d.count_large; });   
		var humidityDim = ndx.dimension(function(d) { return d.humidity; });   
		var tempDim = ndx.dimension(function(d) { return d.temperature; });   
		var minDate = dateDim.bottom(1)[0].time;
		var maxDate = dateDim.top(1)[0].time;

		// Charts

		var conclineChart  = dc.lineChart("#chart-line-concperday"); 
		var concfluctuationChart = dc.barChart('#conc-fluctuation-chart');
		var clChart = dc.barChart('#cl-chart');
		var tempfluctuationChart = dc.barChart('#temp-fluctuation-chart');
		var humfluctuationChart = dc.barChart('#hum-fluctuation-chart');

		var dimwidth = chartWidthDim+20;
		var dimheight=chartHeightDim +20;

		totalDim = ndx.dimension(function(d) { return d.count_large; });   
		var concGroup = dateDim.group().reduceSum(function(d) {return d.count_small;}); 
		var tempGroup = dateDim.group().reduceSum(function(d) {return d.temperature;}); 
		var humidityGroup = dateDim.group().reduceSum(function(d) {return d.humidity;}); 
		var count_largeGroup = dateDim.group().reduceSum(function(d) {return d.count_large;}); 

		    /*
		var yearDim  = ndx.dimension(function(d) {return +d.Year;});
		var year_total = yearDim.group().reduceSum(function(d) {return d.count_large;});
		var yearRingChart   = dc.pieChart("#chart-ring-year");
		*/
			//.colorAccessor(function (d, i){return i;})
		clChart
		    .width(500).height(200)
		    .dimension(dateDim)
		    .group(count_largeGroup)
		    .barPadding(0.5)
		    .outerPadding(0.1)
			.colorDomain([0,1000])
			.colorAccessor(function (d,i) {
			    if(d.value < 200){ return "yellow";}			    
			    if(d.value < 400){ return "blue";}			    
			    if(d.value < 500 ){ return "green";}			    
			    if(d.value < 1000){ return "red";}			    
			})
		    

		    .x(d3.time.scale().domain([minDate,maxDate])); 

		conclineChart
		    .width(chartWidthDim).height(chartHeightDim)
		    .dimension(dateDim)
		    .group(concGroup)
		    .x(d3.time.scale().domain([minDate,maxDate]))
		    .xAxisLabel("Time")
			.yAxisLabel("PM 10");

		concfluctuationChart
		    .width(chartWidthDim).height(chartHeightDim)
		    .dimension(dateDim)
		    .group(concGroup)
		    .x(d3.time.scale().domain([minDate,maxDate]))
		    .xAxisLabel("Time")
		    .yAxisLabel("PM 2.5");

		tempfluctuationChart
		    .width(chartWidthDim).height(chartHeightDim)
		    .dimension(dateDim)
		    .group(tempGroup)
		    .x(d3.time.scale().domain([minDate,maxDate]))
		    .xAxisLabel("Time")
		    .yAxisLabel("Temperature")
		    .y(d3.scale.linear().domain([-10, 60]));
			 
		humfluctuationChart
		    .width(chartWidthDim).height(chartHeightDim)
		    .dimension(dateDim)
		    .group(humidityGroup)
		    .x(d3.time.scale().domain([minDate,maxDate]))
		    .xAxisLabel("Time")
		    .y(d3.scale.linear().domain([0, 100]))
		    .yAxisLabel("Humidity");

		dc.renderAll();

	    }

}

    function print_filter(filter){
		var f=eval(filter);
		if (typeof(f.length) != "undefined") {}else{}
		if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
		if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
		console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
	    } 
