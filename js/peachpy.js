var peachpyReady = false;

var hideOverlay = function() {
	var overlay = $("#overlay");
	overlay.fadeTo(300, 0.0, function() {
		overlay.hide(0);
	});
	$("#showhidelog").text("Show Log").unbind("click").click(function() { showOverlay(false); });
};

var showOverlay = function(clearOverlay) {
	var overlay = $("#overlay");
	if (clearOverlay) {
		overlay.html("");
	}
	overlay.show(0).fadeTo(300, 0.9);
	$("#showhidelog").removeAttr("disabled").text("Hide Log").unbind("click").click(hideOverlay);
};

var setProgressIndicator = function(selector, progress) {
	if (typeof progress === "undefined") {
		progress = "";
	}
	if (progress === true) {
		selector.html("&#x2714;");
	} else if (progress === false) {
		selector.html("&#x2718;").addClass("failed");
	} else {
		selector.text(progress);
	}
}

var setProgressStatus = function(text, progress) {
	var progressElement = null;
	if ($("#status p").first().text() != text) {
		$("#status").html("");
		var statusElement = $("<p>").text(text);
		progressElement = $("<p>").addClass("progress");
		statusElement.append(progressElement);
		$("#status").append(statusElement);
	} else {
		progressElement = $("#status p.progress");
	}
	setProgressIndicator(progressElement, progress);
}

var addProgressMessage = function(text, progress) {
	var progressElement = $("<p>").addClass("progress");
	var messageElement = $("<p>").text(text);
	setProgressIndicator(progressElement, progress);
	messageElement.append(progressElement);
	var overlay = $("#overlay");
	overlay.append(messageElement);
	overlay.scrollTop(overlay.prop("scrollHeight"));
	return progressElement;
}

var addOverlayReport = function(text) {
	var reportElement = $("<p>").addClass("report").text(text);
	var overlay = $("#overlay");
	overlay.append(reportElement);
	overlay.scrollTop(overlay.prop("scrollHeight"));
}

var ggplotColor = function(i, n) {
	var hue = Math.round(360.0 * i / n + 15);
	return d3.hcl(hue, 100, 65);
}

var addOverlayBarPlot = function(dataset, label, title, options) {
	if (typeof options === "undefined") {
		options = {};
	}
	var titleNewLines = (title.match(/\n/g) || []).length + 1;
	var margin = {
		top: 5 + 25 * titleNewLines,
		bottom: 20,
		left: 20,
		right: 0
	};

	var columnCount = dataset.length;
	var columnWidth = options.columnWidth | 45;
	var columnSeparator = options.columnSeparator | 2;
	var plotWidth = columnWidth * columnCount + columnSeparator * (columnCount - 1);
	var svgWidth = margin.left + plotWidth + margin.right;

	var svgHeight = 300;
	var plotHeight = svgHeight - margin.bottom - margin.top;

	var barplot = d3.select("#overlay")
		.append("svg")
		.attr("width", svgWidth)
		.attr("height", svgHeight)

	var barplotColumns = barplot.selectAll("rect")
		.data(dataset)
		.enter();

	var maxValue = d3.max(dataset, function(d) { return d.value; });
	var scale = d3.scale.linear()
		.domain([0, maxValue])
		.range([0, plotHeight]);

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([40, 0])
		.html(function(d) {
			return "<strong>" + d.tipname +":</strong> <span style='color:red'>" + d.value + "</span>";
		})
	  
 	barplot.call(tip);

	barplotColumns.append("rect")
		.attr("x", function(d, i) { return margin.left + i * (columnWidth + columnSeparator); })
		.attr("y", function(d) { return plotHeight + margin.top - scale(d.value); })
		.attr("class", "bar")
		.attr("width", columnWidth)
		.attr("height", function(d) { return scale(d.value); })
		.on('mouseover', function(d, i) {
			var name = dataset[i].name
			barplot.selectAll(".bar").style("opacity", function(d) {
				return d.name === name ? 1 : 0.5;
          		})
		  	var tooltips = document.getElementsByClassName("d3-tip");
			for (var i = 0; i < tooltips.length; i++) {
				  tooltips[i].style.marginTop = "0px";
			}
			tip.show(d,i);
		})
		.on('mouseout', function(d, i) {
			var value = dataset[i].value
			barplot.selectAll(".bar").style("opacity", 0.5)
			tip.hide(d,i);
		})
		.style("fill", function(d, i) { return ggplotColor(i, dataset.length); })

	barplotColumns.append("text")
		.attr("x", function(d, i) { return margin.left + i * (columnWidth + columnSeparator) + 0.5 * columnWidth; })
		.attr("y", svgHeight - 0.3 * margin.bottom)
		.style("fill", function(d, i) { return ggplotColor(i, dataset.length); })
		.style("text-anchor", "middle")
		.on('mouseover', function(d, i) {
			var name = dataset[i].name
			barplot.selectAll(".bar").style("opacity", function(d) {
				return d.name === name ? 1 : 0.5;
			})
			var tooltips = document.getElementsByClassName("d3-tip");
			for (var i = 0; i < tooltips.length; i++) {
				var val = d.value;
				if (d.value == 0) {
					val = 1;
				}
				tooltips[i].style.marginTop = -(d.value % 200) - 40 + "px";
			}
			tip.show(d, i);
		})
		.on('mouseout', function(d, i) {
			var value = dataset[i].value
			barplot.selectAll(".bar").style("opacity", 0.5);
			tip.hide(d, i);
		})
		.text(function(d) { return d.name; });

	barplot.selectAll("text.title")
		.data(title.split(/\n/g))
		.enter()
			.append("text")
			.attr("class", "title")
			.attr("x", 0.5 * svgWidth)
			.attr("y", function(d, i) { return 5 + (i + 0.5) * 25; } )
			.style("fill", "white")
			.style("text-anchor", "middle")
			.style("font-size", "x-large")
			.text(function(d) { return d; });

	barplot.append("text")
		.attr("y", 0.7 * margin.left)
		.attr("x", -(margin.top + 0.5 * plotHeight))
		.attr("transform", "rotate(-90)")
		.style("fill", "white")
		.style("text-anchor", "middle")
		.style("font-size", "large")
		.text(label);
	var overlay = $("#overlay");
	overlay.scrollTop(overlay.prop("scrollHeight"));
}

var formatLoadProgress = function(event) {
	if (event.lengthComputable) {
		return (event.loaded / event.total * 100.0).toFixed(1) + "%";
	} else if (event.loaded > 1048576) {
		return (event.loaded / 1048576.0).toFixed(1) + " MB";
	} else if (event.loaded > 1024) {
		return (event.loaded / 1024).toFixed(1) + " KB";
	} else {
		return event.loaded + " bytes";
	}
}

var getRelativePath = function(url) {
	var protocolSeparator = url.indexOf("://");
	if (protocolSeparator != -1) {
		url = url.substring(protocolSeparator + 3);
	}
	var hostnameSeparator = url.indexOf("/");
	if (hostnameSeparator != -1) {
		url = url.substring(hostnameSeparator + 1);
	}
	return url;
}

var analyzePerformanceCounters = function(counters, orderedCountersNames) {
	if ("Instructions" in counters && "Cycles" in counters) {
		var ipc = counters["Instructions"] / counters["Cycles"];
		addOverlayReport(counters["Cycles"] + " cycles (" + ipc.toFixed(2) + " IPC)");
		setProgressStatus($("#target-label").text() + ": " + counters["Cycles"] + " cycles (" + ipc.toFixed(2) + " IPC)");
		orderedCountersNames.splice(orderedCountersNames.indexOf("Instructions"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("Cycles"), 1);
	}

	/* Analyze and visualize port pressure */
	if ("UOPS_EXECUTED_PORT.PORT_0" in counters &&
		"UOPS_EXECUTED_PORT.PORT_1" in counters &&
		"UOPS_EXECUTED_PORT.PORT_2" in counters &&
		"UOPS_EXECUTED_PORT.PORT_3" in counters &&
		"UOPS_EXECUTED_PORT.PORT_4" in counters &&
		"UOPS_EXECUTED_PORT.PORT_5" in counters &&
		"UOPS_EXECUTED_PORT.PORT_6" in counters &&
		"UOPS_EXECUTED_PORT.PORT_7" in counters)
	{
		var portPressure = [
			{name: "Port 0", tipname: "UOPS_EXECUTED_PORT.PORT_0", value: counters["UOPS_EXECUTED_PORT.PORT_0"]},
			{name: "Port 1", tipname: "UOPS_EXECUTED_PORT.PORT_1", value: counters["UOPS_EXECUTED_PORT.PORT_1"]},
			{name: "Port 2", tipname: "UOPS_EXECUTED_PORT.PORT_2", value: counters["UOPS_EXECUTED_PORT.PORT_2"]},
			{name: "Port 3", tipname: "UOPS_EXECUTED_PORT.PORT_3", value: counters["UOPS_EXECUTED_PORT.PORT_3"]},
			{name: "Port 4", tipname: "UOPS_EXECUTED_PORT.PORT_4", value: counters["UOPS_EXECUTED_PORT.PORT_4"]},
			{name: "Port 5", tipname: "UOPS_EXECUTED_PORT.PORT_5", value: counters["UOPS_EXECUTED_PORT.PORT_5"]},
			{name: "Port 6", tipname: "UOPS_EXECUTED_PORT.PORT_6", value: counters["UOPS_EXECUTED_PORT.PORT_6"]},
			{name: "Port 7", tipname: "UOPS_EXECUTED_PORT.PORT_7", value: counters["UOPS_EXECUTED_PORT.PORT_7"]},
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_0"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_1"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_2"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_3"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_4"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_5"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_6"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_EXECUTED_PORT.PORT_7"), 1);
		addOverlayBarPlot(portPressure, "Executed \u00B5ops", "Port Pressure");
	}
	if ("UOPS_DISPATCHED_PORT.PORT_0" in counters &&
		"UOPS_DISPATCHED_PORT.PORT_1" in counters &&
		"UOPS_DISPATCHED_PORT.PORT_2" in counters &&
		"UOPS_DISPATCHED_PORT.PORT_3" in counters &&
		"UOPS_DISPATCHED_PORT.PORT_4" in counters &&
		"UOPS_DISPATCHED_PORT.PORT_5" in counters)
	{
		var portPressure = [
			{name: "Port 0", tipname: "UOPS_DISPATCHED_PORT.PORT_0", value: counters["UOPS_DISPATCHED_PORT.PORT_0"]},
			{name: "Port 1", tipname: "UOPS_DISPATCHED_PORT.PORT_1", value: counters["UOPS_DISPATCHED_PORT.PORT_1"]},
			{name: "Port 2", tipname: "UOPS_DISPATCHED_PORT.PORT_2", value: counters["UOPS_DISPATCHED_PORT.PORT_2"]},
			{name: "Port 3", tipname: "UOPS_DISPATCHED_PORT.PORT_3", value: counters["UOPS_DISPATCHED_PORT.PORT_3"]},
			{name: "Port 4", tipname: "UOPS_DISPATCHED_PORT.PORT_4", value: counters["UOPS_DISPATCHED_PORT.PORT_4"]},
			{name: "Port 5", tipname: "UOPS_DISPATCHED_PORT.PORT_5", value: counters["UOPS_DISPATCHED_PORT.PORT_5"]},
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_0"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_1"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_2"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_3"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_4"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_5"), 1);
		if ("UOPS_DISPATCHED_PORT.PORT_6" in counters) {
			orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_6"), 1);
			portPressure.push({name: "Port 6", tipname: "UOPS_DISPATCHED_PORT.PORT_6",value: counters["UOPS_DISPATCHED_PORT.PORT_6"]});
		}
		if ("UOPS_DISPATCHED_PORT.PORT_7" in counters) {
			orderedCountersNames.splice(orderedCountersNames.indexOf("UOPS_DISPATCHED_PORT.PORT_7"), 1);
			portPressure.push({name: "Port 7", tipname: "UOPS_DISPATCHED_PORT.PORT_7",value: counters["UOPS_DISPATCHED_PORT.PORT_7"]});
		}
		addOverlayBarPlot(portPressure, "Dispatched \u00B5ops", "Port Pressure");
	}
	if ("DISPATCHED_FPU_OPS.PIPE_0" in counters &&
		"DISPATCHED_FPU_OPS.PIPE_1" in counters)
	{
		var pipePressure = [
			{name: "Pipe 0", tipname:"DISPATCHED_FPU_OPS.PIPE_0", value: counters["DISPATCHED_FPU_OPS.PIPE_0"]},
			{name: "Pipe 1", tipname:"DISPATCHED_FPU_OPS.PIPE_1", value: counters["DISPATCHED_FPU_OPS.PIPE_1"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCHED_FPU_OPS.PIPE_0"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCHED_FPU_OPS.PIPE_1"), 1);
		var title = "Pipe\nPressure";
		if ("DISPATCHED_FPU_OPS.PIPE_2" in counters) {
			pipePressure.push({name: "Pipe 2", tipname:"DISPATCHED_FPU_OPS.PIPE_2", value: counters["DISPATCHED_FPU_OPS.PIPE_2"]});
			orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCHED_FPU_OPS.PIPE_2"), 1);
			title = "Pipe Pressure";
			if ("DISPATCHED_FPU_OPS.PIPE_3" in counters) {
				pipePressure.push({name: "Pipe 3", tipname:"DISPATCHED_FPU_OPS.PIPE_3", value: counters["DISPATCHED_FPU_OPS.PIPE_3"]});
				orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCHED_FPU_OPS.PIPE_3"), 1);
			}
		}
		addOverlayBarPlot(pipePressure, "Dispatched \u00B5ops", title);
	}

	/* Analyze and visualize decoder performance */
	if ("IDQ.MITE_UOPS" in counters &&
		"IDQ.DSB_UOPS" in counters &&
		"LSD.UOPS" in counters &&
		"IDQ.MS_DSB_UOPS" in counters &&
		"IDQ.MS_MITE_UOPS" in counters &&
		"IDQ.MS_UOPS" in counters)
	{
		var uopsSupplied = [
			{name: "MS", tipname: "IDQ.MS_UOPS", value: counters["IDQ.MS_UOPS"]},
			{name: "MITE",tipname: "IDQ.MS_UOPS - IDQ.MS_MITE_UOPS", value: counters["IDQ.MITE_UOPS"] - counters["IDQ.MS_MITE_UOPS"]},
			{name: "DSB", tipname: "IDQ.DSB_UOPS - IDQ.MS_DSB_UOPS", value: counters["IDQ.DSB_UOPS"] - counters["IDQ.MS_DSB_UOPS"]},
			{name: "LSD", tipname: "LSD.UOPS", value: counters["LSD.UOPS"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("IDQ.MITE_UOPS"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("IDQ.DSB_UOPS"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("LSD.UOPS"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("IDQ.IDQ_MS_MITE_UOPS"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("IDQ.IDQ_MS_DSB_UOPS"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("IDQ.MS_UOPS"), 1);
		addOverlayBarPlot(uopsSupplied, "Supplied \u00B5ops", "Front-End\nPerformance");
	}
	if ("MACRO_INSTS.CISC_DECODED" in counters &&
		"MACRO_INSTS.ALL_DECODED" in counters)
	{
		var uopsDecoded = [
			{name: "Simple", tipname: "MACRO_INSTS.ALL_DECODED - MACRO_INSTS.CISC_DECODED", value: counters["MACRO_INSTS.ALL_DECODED"] - counters["MACRO_INSTS.CISC_DECODED"]},
			{name: "Complex", tipname: "MACRO_INSTS.CISC_DECODED", value: counters["MACRO_INSTS.CISC_DECODED"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("MACRO_INSTS.CISC_DECODED"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("MACRO_INSTS.ALL_DECODED"), 1);
		addOverlayBarPlot(uopsDecoded, "Decoded \u00B5ops", "Front-End\nPerformance", {columnWidth: 60});
	}

	/* Analyze and visualize stalls */
	if ("INSTRUCTION_FETCH_STALL" in counters &&
		"MEM_STALL_CYCLES.RSQ_FULL" in counters)
	{
		var cycles = [
			{name: "Execution", value: counters["Cycles"]},
			{name: "RSQ Full", value: counters["MEM_STALL_CYCLES.RSQ_FULL"]},
			{name: "Instr Fetch", value: counters["INSTRUCTION_FETCH_STALL"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("MEM_STALL_CYCLES.RSQ_FULL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("INSTRUCTION_FETCH_STALL"), 1);
		addOverlayBarPlot(cycles, "Cycles", "Stalls", {columnWidth: 62});
	}
	if ("DISPATCH_STALL.ALL" in counters &&
		"MICROSEQUENCER_STALL.SERIALIZATION" in counters &&
		"DISPATCH_STALL.RETIRE_QUEUE_FULL" in counters &&
		"DISPATCH_STALL.INT_SCHEDULER_QUEUE_FULL" in counters &&
		"DISPATCH_STALL.FP_SCHEDULER_QUEUE_FULL" in counters &&
		"DISPATCH_STALL.LDQ_FULL" &&
		"MICROSEQUENCER_STALL.WAIT_ALL_QUIET")
	{
		var dispatchStalls = [
			{name: "Total", value: counters["DISPATCH_STALL.ALL"]},
			{name: "Serial", value: counters["MICROSEQUENCER_STALL.SERIALIZATION"]},
			{name: "Wait Quiet", value: counters["MICROSEQUENCER_STALL.WAIT_ALL_QUIET"]},
			{name: "Retire Q", value: counters["DISPATCH_STALL.RETIRE_QUEUE_FULL"]},
			{name: "Int Q", value: counters["DISPATCH_STALL.INT_SCHEDULER_QUEUE_FULL"]},
			{name: "FP Q", value: counters["DISPATCH_STALL.FP_SCHEDULER_QUEUE_FULL"]},
			{name: "LD Q", value: counters["DISPATCH_STALL.LDQ_FULL"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCH_STALL.ALL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("MICROSEQUENCER_STALL.SERIALIZATION"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCH_STALL.RETIRE_QUEUE_FULL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCH_STALL.INT_SCHEDULER_QUEUE_FULL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCH_STALL.FP_SCHEDULER_QUEUE_FULL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("DISPATCH_STALL.LDQ_FULL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("MICROSEQUENCER_STALL.WAIT_ALL_QUIET"), 1);
		addOverlayBarPlot(dispatchStalls, "Cycles", "Dispatch Stalls", {columnWidth: 60});
	}

	/* Instructions/uops type statistics */
	if ("RETIRED_SSEAVX_FLOPS.SP_ADDSUB" in counters &&
		"RETIRED_SSEAVX_FLOPS.SP_MUL" in counters &&
		"RETIRED_SSEAVX_FLOPS.SP_DIVSQRT" in counters)
	{
		var spSseAvxFlops = [
			{name: "Add/Sub", value: counters["RETIRED_SSEAVX_FLOPS.SP_ADDSUB"]},
			{name: "Mul", value: counters["RETIRED_SSEAVX_FLOPS.SP_MUL"]},
			{name: "Div/Sqrt", value: counters["RETIRED_SSEAVX_FLOPS.SP_DIVSQRT"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.SP_ADDSUB"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.SP_MUL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.SP_DIVSQRT"), 1);
		var title = "Single-Precision\nSSE Operations";
		if ("RETIRED_SSEAVX_FLOPS.SP_FMA" in counters) {
			spSseAvxFlops.push({name: "FMA", value: counters["RETIRED_SSEAVX_FLOPS.SP_FMA"]});
			orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.SP_FMA"), 1);
			title = "Single-Precision\nSSE/AVX Operations";
		}
		if (counters["RETIRED_SSEAVX_FLOPS.SP_ADDSUB"] ||
			counters["RETIRED_SSEAVX_FLOPS.SP_MUL"] ||
			counters["RETIRED_SSEAVX_FLOPS.SP_DIVSQRT"] ||
			counters["RETIRED_SSEAVX_FLOPS.SP_FMA"])
		{
			addOverlayBarPlot(spSseAvxFlops, "SP FLOPS", title, {columnWidth: 50});
		}
	}
	if ("RETIRED_SSEAVX_FLOPS.DP_ADDSUB" in counters &&
		"RETIRED_SSEAVX_FLOPS.DP_MUL" in counters &&
		"RETIRED_SSEAVX_FLOPS.DP_DIVSQRT" in counters)
	{
		var dpSseAvxFlops = [
			{name: "Add/Sub", value: counters["RETIRED_SSEAVX_FLOPS.DP_ADDSUB"]},
			{name: "Mul", value: counters["RETIRED_SSEAVX_FLOPS.DP_MUL"]},
			{name: "Div/Sqrt", value: counters["RETIRED_SSEAVX_FLOPS.DP_DIVSQRT"]}
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.DP_ADDSUB"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.DP_MUL"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.DP_DIVSQRT"), 1);
		var title = "Double-Precision\nSSE Operations";
		if ("RETIRED_SSEAVX_FLOPS.DP_FMA" in counters) {
			dpSseAvxFlops.push({name: "FMA", value: counters["RETIRED_SSEAVX_FLOPS.DP_FMA"]});
			orderedCountersNames.splice(orderedCountersNames.indexOf("RETIRED_SSEAVX_FLOPS.DP_FMA"), 1);
			title = "Double-Precision\nSSE/AVX Operations";
		}
		if (counters["RETIRED_SSEAVX_FLOPS.DP_ADDSUB"] ||
			counters["RETIRED_SSEAVX_FLOPS.DP_MUL"] ||
			counters["RETIRED_SSEAVX_FLOPS.DP_DIVSQRT"] ||
			counters["RETIRED_SSEAVX_FLOPS.DP_FMA"])
		{
			addOverlayBarPlot(dpSseAvxFlops, "DP FLOPS", title, {columnWidth: 50});
		}
	}
	if ("SIMD_COMP_INST_RETIRED.PACKED_SINGLE" in counters &&
		"SIMD_COMP_INST_RETIRED.SCALAR_SINGLE" in counters &&
		"SIMD_COMP_INST_RETIRED.PACKED_DOUBLE" in counters &&
		"SIMD_COMP_INST_RETIRED.SCALAR_DOUBLE" in counters)
	{
		var computationalInstructions = [
			{name: "PS", value: counters["SIMD_COMP_INST_RETIRED.PACKED_SINGLE"]},
			{name: "SS", value: counters["SIMD_COMP_INST_RETIRED.SCALAR_SINGLE"]},
			{name: "PD", value: counters["SIMD_COMP_INST_RETIRED.PACKED_DOUBLE"]},
			{name: "SD", value: counters["SIMD_COMP_INST_RETIRED.SCALAR_DOUBLE"]},
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_COMP_INST_RETIRED.PACKED_SINGLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_COMP_INST_RETIRED.SCALAR_SINGLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_COMP_INST_RETIRED.PACKED_DOUBLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_COMP_INST_RETIRED.SCALAR_DOUBLE"), 1);
		if (counters["SIMD_COMP_INST_RETIRED.PACKED_SINGLE"] ||
			counters["SIMD_COMP_INST_RETIRED.SCALAR_SINGLE"] ||
			counters["SIMD_COMP_INST_RETIRED.PACKED_DOUBLE"] ||
			counters["SIMD_COMP_INST_RETIRED.SCALAR_DOUBLE"])
		{
			addOverlayBarPlot(computationalInstructions, "Retired Instructions", "Computational\nFloating-Point\nSSE Instructions");
		}
	}
	if ("SIMD_INST_RETIRED.PACKED_SINGLE" in counters &&
		"SIMD_INST_RETIRED.SCALAR_SINGLE" in counters &&
		"SIMD_INST_RETIRED.PACKED_DOUBLE" in counters &&
		"SIMD_INST_RETIRED.SCALAR_DOUBLE" in counters &&
		"SIMD_INST_RETIRED.VECTOR" in counters)
	{
		var sseInstructions = [
			{name: "PS", value: counters["SIMD_INST_RETIRED.PACKED_SINGLE"]},
			{name: "SS", value: counters["SIMD_INST_RETIRED.SCALAR_SINGLE"]},
			{name: "PD", value: counters["SIMD_INST_RETIRED.PACKED_DOUBLE"]},
			{name: "SD", value: counters["SIMD_INST_RETIRED.SCALAR_DOUBLE"]},
			{name: "INT", value: counters["SIMD_INST_RETIRED.VECTOR"]},
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_INST_RETIRED.PACKED_SINGLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_INST_RETIRED.SCALAR_SINGLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_INST_RETIRED.PACKED_DOUBLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_INST_RETIRED.SCALAR_DOUBLE"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_INST_RETIRED.VECTOR"), 1);
		if (counters["SIMD_INST_RETIRED.PACKED_SINGLE"] ||
			counters["SIMD_INST_RETIRED.SCALAR_SINGLE"] ||
			counters["SIMD_INST_RETIRED.PACKED_DOUBLE"] ||
			counters["SIMD_INST_RETIRED.SCALAR_DOUBLE"] ||
			counters["SIMD_INST_RETIRED.VECTOR"])
		{
			addOverlayBarPlot(sseInstructions, "Retired Instructions", "SSE Instructions");
		}
	}
	if ("SIMD_UOP_TYPE_EXEC.MUL.S" in counters &&
		"SIMD_UOP_TYPE_EXEC.SHIFT.S" in counters &&
		"SIMD_UOP_TYPE_EXEC.PACK.S" in counters &&
		"SIMD_UOP_TYPE_EXEC.UNPACK.S" in counters &&
		"SIMD_UOP_TYPE_EXEC.LOGICAL.S" in counters &&
		"SIMD_UOP_TYPE_EXEC.ARITHMETIC.S" in counters)
	{
		var packedSseInstructions = [
			{name: "Mul", value: counters["SIMD_UOP_TYPE_EXEC.MUL.S"]},
			{name: "Shift", value: counters["SIMD_UOP_TYPE_EXEC.SHIFT.S"]},
			{name: "Pack", value: counters["SIMD_UOP_TYPE_EXEC.PACK.S"]},
			{name: "Unpack", value: counters["SIMD_UOP_TYPE_EXEC.UNPACK.S"]},
			{name: "Bool", value: counters["SIMD_UOP_TYPE_EXEC.LOGICAL.S"]},
			{name: "Arith", value: counters["SIMD_UOP_TYPE_EXEC.ARITHMETIC.S"]},
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.MUL.S"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.SHIFT.S"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.PACK.S"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.UNPACK.S"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.LOGICAL.S"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.ARITHMETIC.S"), 1);
		if (counters["SIMD_UOP_TYPE_EXEC.MUL.S"] ||
			counters["SIMD_UOP_TYPE_EXEC.SHIFT.S"] ||
			counters["SIMD_UOP_TYPE_EXEC.PACK.S"] ||
			counters["SIMD_UOP_TYPE_EXEC.UNPACK.S"] ||
			counters["SIMD_UOP_TYPE_EXEC.LOGICAL.S"] ||
			counters["SIMD_UOP_TYPE_EXEC.ARITHMETIC.S"])
		{
			addOverlayBarPlot(packedSseInstructions, "Executed \u00B5ops", "Packed SSE Instructions");
		}
	}
	if ("SIMD_UOP_TYPE_EXEC.MUL.AR" in counters &&
		"SIMD_UOP_TYPE_EXEC.SHIFT.AR" in counters &&
		"SIMD_UOP_TYPE_EXEC.PACK.AR" in counters &&
		"SIMD_UOP_TYPE_EXEC.UNPACK.AR" in counters &&
		"SIMD_UOP_TYPE_EXEC.LOGICAL.AR" in counters &&
		"SIMD_UOP_TYPE_EXEC.ARITHMETIC.AR" in counters)
	{
		var packedSseInstructions = [
			{name: "Mul", value: counters["SIMD_UOP_TYPE_EXEC.MUL.AR"]},
			{name: "Shift", value: counters["SIMD_UOP_TYPE_EXEC.SHIFT.AR"]},
			{name: "Pack", value: counters["SIMD_UOP_TYPE_EXEC.PACK.AR"]},
			{name: "Unpack", value: counters["SIMD_UOP_TYPE_EXEC.UNPACK.AR"]},
			{name: "Bool", value: counters["SIMD_UOP_TYPE_EXEC.LOGICAL.AR"]},
			{name: "Arith", value: counters["SIMD_UOP_TYPE_EXEC.ARITHMETIC.AR"]},
		];
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.MUL.AR"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.SHIFT.AR"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.PACK.AR"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.UNPACK.AR"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.LOGICAL.AR"), 1);
		orderedCountersNames.splice(orderedCountersNames.indexOf("SIMD_UOP_TYPE_EXEC.ARITHMETIC.AR"), 1);
		if (counters["SIMD_UOP_TYPE_EXEC.MUL.AR"] ||
			counters["SIMD_UOP_TYPE_EXEC.SHIFT.AR"] ||
			counters["SIMD_UOP_TYPE_EXEC.PACK.AR"] ||
			counters["SIMD_UOP_TYPE_EXEC.UNPACK.AR"] ||
			counters["SIMD_UOP_TYPE_EXEC.LOGICAL.AR"] ||
			counters["SIMD_UOP_TYPE_EXEC.ARITHMETIC.AR"])
		{
			addOverlayBarPlot(packedSseInstructions, "Retired \u00B5ops", "Packed SSE Instructions");
		}
	}

	if (orderedCountersNames.length) {
		console.log("Unprocessed " + $("#target-label").text() + " counters:")
		orderedCountersNames.forEach(function(key) {
			console.log(key + ": " + counters[key]);
		});
	}
}

var getParameters = function() {
	var n = $("#n-value").val()|0;
	var incx = $("#incx-value").val()|0;
	var incy = $("#incy-value").val()|0;
	var offx = $("#offx-value").val()|0;
	var offy = $("#offy-value").val()|0;
	return {n:n, incx: incx, incy: incy, offx: offx, offy: offy};
}

var encodeParameters = function(kernel, parameters) {
	var urlString = "?kernel=" + kernel;
	for (key in parameters) {
		if (parameters.hasOwnProperty(key)) {
			urlString += "&" + key + "=" + parameters[key];
		}
	}
	return urlString;
}

var submitKernel = function(binary) {
	var target = $("#target-label");
	var targetDescription = target.text();
	var targetId = target.data("target");
	var parameters = getParameters();
	var progressMessage = "Running on " + targetDescription + " server"
	progressMessage += " with n=" + parameters.n + " incx=" + parameters.incx + " incy=" + parameters.incy + " offx=" + parameters.offx + " offy=" + parameters.offy;
	runProgress = addProgressMessage(progressMessage, "");
	$.ajax({
		url: 'http://run.peachpy.io/' + targetId + "/run" + encodeParameters("sdot", getParameters()),
		type: 'POST',
		contentType: 'application/octet-stream',
		data: new Uint8Array(binary),
		processData: false
	}).done(function(response) {
		setProgressIndicator(runProgress, true);
		runProgress = null;
		var counters = {};
		var orderedCountersNames = [];
		var lines = response.split("\n");
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			var key = line.split(": ")[0];
			if (key) {
				var value = +line.split(": ")[1];
				orderedCountersNames.push(key);
				counters[key] = value;
			}
		}
		analyzePerformanceCounters(counters, orderedCountersNames);
	}).fail(function() {
		setProgressIndicator(runProgress, false);
		runProgress = null;
	});
}

var peachpy = null;
var compilationProgress = null;
var executionProgress = null;
var lastCode = null;
var lastBinary = null;

$(document).keyup(function(e) {
	if (e.keyCode == 27) {
		/* Escape */
		hideOverlay();
	}
});

var initPeachPy = function(filesystem) {
	setProgressStatus("Initialize PeachPy");
	peachpy.postMessage({
		"command": "init",
		"filesystem": filesystem
	});
}

var loadFileSystem = function() {
	var request = new XMLHttpRequest();
	request.open("GET", "/pydata.tar", true);
	request.responseType = "arraybuffer";

	var statusText = "Load PeachPy file system";
	request.addEventListener("progress", function(event) {
		setProgressStatus(statusText, formatLoadProgress(event));
	});
	request.addEventListener("load", function(event) {
		setProgressStatus(statusText, true);
		initPeachPy(this.response);
	});
	request.addEventListener("error", function(event) {
		setProgressStatus(statusText, false);
	});
	request.addEventListener("abort", function(event) {
		setProgressStatus(statusText, false);
	});

	request.send(null);
}

var loadPeachPy = function() {
	if ("application/x-pnacl" in navigator.mimeTypes) {
		peachpy = document.createElement("object");
		peachpy.width = 0;
		peachpy.height = 0;
		peachpy.data = "peachpy.nmf";
		peachpy.type = "application/x-pnacl";
		peachpy.id = "peachpy";

		var initPeachPyText = "Initialize PeachPy";
		peachpy.addEventListener("progress", function(event) {
			if (!event.url)
				return;

			setProgressStatus("Load " + getRelativePath(event.url), formatLoadProgress(event));
		});
		peachpy.addEventListener("loadend", function(event) {
			setProgressStatus("Load " + getRelativePath(event.url), true);
			loadFileSystem();
		});
		peachpy.addEventListener("crash", function(event) {
			$("#status").html("");
			var statusElement = $("<p>").text("PNaCl module crashed").addClass("failed");
			$("#status").append(statusElement);
		});
		peachpy.addEventListener("message", function(event) {
			var response = event.data;
			if (response.status === "init") {
				setProgressStatus(initPeachPyText, true);
				$("#quickrun").removeAttr("disabled");
				peachpyReady = true;
			} else if (response.status === "success") {
				setProgressIndicator(compilationProgress, true);
				compilationProgress = null;
				lastBinary = response.binary;
				submitKernel(response.binary);
			} else if (response.status === "error") {
				setProgressIndicator(compilationProgress, false);
				compilationProgress = null;
			} else if (response.status === "stdout") {
				if (peachpyReady) {
					var overlay = $("#overlay");
					overlay.append($("<p>").addClass("stdout").text(response.text));
				} else {
					var text = response.text.replace("/lib/python2.7/", "");
					if (text) {
						text = text.substring(0, 1).toLowerCase() + text.substring(1);
						setProgressStatus(initPeachPyText + ": " + text);
					}
				}
			} else {
				console.log("Unexpected message from PNaCl: " + response);
				console.log(response);
			}
		});
		peachpy.addEventListener("error", function(event) {
			setProgressStatus(initPeachPyText, false);
		});
		document.body.appendChild(peachpy);
	} else {
		var request = new XMLHttpRequest();
		request.open("GET", "peachpy.asm.js", true);
		request.responseType = "blob";

		var loadPythonText = "Load Python";
		var initPeachPyText = "Initialize PeachPy";
		request.addEventListener("progress", function(event) {
			setProgressStatus(loadPythonText, formatLoadProgress(event));
		});
		request.addEventListener("load", function(event) {
			setProgressStatus(loadPythonText, true);
			peachpy = new Worker(window.URL.createObjectURL(this.response));
			peachpy.addEventListener("error", function(event) {
				$("#status").html("");
				var statusElement = $("<p>").text("Asm.js Worker crashed").addClass("failed");
				$("#status").append(statusElement);
			});
			peachpy.addEventListener("message", function(event) {
				var response = event.data;
				if (response.status === "init") {
					setProgressStatus(initPeachPyText, true);
					$("#quickrun").removeAttr("disabled");
					peachpyReady = true;
				} else if (response.status === "success") {
					setProgressIndicator(compilationProgress, true);
					compilationProgress = null;
					lastBinary = response.binary;
					submitKernel(response.binary);
				} else if (response.status === "error") {
					setProgressIndicator(compilationProgress, false);
					compilationProgress = null;
				} else if (response.status === "stdout") {
					if (peachpyReady) {
						var overlay = $("#overlay");
						overlay.append($("<p>").addClass("stdout").text(response.text));
					} else {
						var text = response.text.replace("/lib/python2.7/", "");
						if (text) {
							text = text.substring(0, 1).toLowerCase() + text.substring(1);
							setProgressStatus(initPeachPyText + ": " + text);
						}
					}
				} else {
					console.log("Unexpected message from PeachPy: " + response);
					console.log(response);
				}
			});
			loadFileSystem();
		});
		request.addEventListener("error", function(event) {
			setProgressStatus(loadPythonText, false);
		});
		request.addEventListener("abort", function(event) {
			setProgressStatus(loadPythonText, false);
		});
		request.send(null);
	}
}

$(document).ready(function(e) {
	$("#quickrun").click(runCode);
	$("#n-slider")
		.slider({
			scale: 'logarithmic',
			step: 10,
			tooltip: "hide",
		}).on("slide", function(event) {
			$("#n-value").text(event.value);
		});
	$("#incx-slider")
		.slider({tooltip: "hide"})
		.on("slide", function(event) {
			$("#incx-value").text(event.value);
		});
	$("#incy-slider")
		.slider({tooltip: "hide"})
		.on("slide", function(event) {
			$("#incy-value").text(event.value);
		});
	$("#offx-slider")
		.slider({tooltip: "hide"})
		.on("slide", function(event) {
			$("#offx-value").text(event.value);
		});
	$("#offy-slider")
		.slider({tooltip: "hide"})
		.on("slide", function(event) {
			$("#offy-value").text(event.value);
		});
	loadPeachPy();
});

$("#target-menu a").click(function(e) {
	$("#target-label")
		.text($(this).text())
		.data("target", $(this).data("target"));
});

var runCode = function() {
	var code = editor.getValue();
	if ((code === lastCode) && lastBinary) {
		showOverlay(false);
		submitKernel(lastBinary);
	} else {
		showOverlay(true);
		lastCode = code;
		lastBinary = null;
		compilationProgress = addProgressMessage("Run PeachPy", "");
		peachpy.postMessage({
			"command": "compile",
			"target": "haswell",
			"code": code
		});
	}
}
