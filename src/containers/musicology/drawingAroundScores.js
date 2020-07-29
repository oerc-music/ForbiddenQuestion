import {svgRoundedRect, svgText, nsResolver, svgGroup} from '../../library/svgUtils';
var SVGNS = "http://www.w3.org/2000/svg";
/*
function svgText(svgEl, x, y, cname, id, style, content){
  var el = document.createElementNS(SVGNS, "text");
  if(content) var textNode = document.createTextNode(content);
  if(cname) el.setAttributeNS(null, "class", cname);
  if(id) el.id = id;
  if(x) el.setAttributeNS(null, "x", x);
  if(y) el.setAttributeNS(null, "y", y);
  if(style) el.setAttributeNS(null, "style", style);
  if(content) el.appendChild(textNode);
  if(svgEl) svgEl.appendChild(el);
  return el;
}*/
function groupByMeasures(meiThings){
	var measures = [];
	var systems = [];
	for(var i=0; i<meiThings.length; i++){
		var thing = meiThings[i];
		var measureCandidate = thing;
		while(measureCandidate.className.baseVal.split(" ").indexOf("measure")==-1) {
			measureCandidate = measureCandidate.parentNode;
			if(!measureCandidate) console.log("Error: unmeasured thing", thing);
		}
		var barNo = parseInt(measureCandidate.id.substring(measureCandidate.id.indexOf("-measure-")+9), 10);
		if(measureCandidate==thing) {
			measures[barNo] = {bar: measureCandidate, system: measureCandidate.parentNode};
		} else if (measures[barNo]){
			measures[barNo].bits.push(thing);
		} else {
			measures[barNo] = {bar: measureCandidate, bits: [thing], system: measureCandidate.parentNode};
		}
	}
	return measures;
}

function groupBySystemsAndMeasures(meiThings){
	var systems = {};
	var measures = groupByMeasures(meiThings);
	for(var barNo in measures){
		var sysId = measures[barNo].system.id;
		if(systems[sysId]){
			systems[sysId].push(measures[barNo]);
		} else {
			systems[sysId] = [measures[barNo]];
		}
	}
	return systems;
}

function elementBBoxReducer(size, el){
	var bbox = el.getBBox();
	var l = bbox.x;
	var r =  bbox.x+bbox.width;
	if(size){
		return {left: Math.min(l, size.left), right: Math.max(r, size.right)};
	} else {
		return {left: l, right: r};
	}
}

function mergeBar(soFar, measure){
	// Given current left, right and top limits, compare with provided
	// measure structure (not the real measure element) and see if
	// limits need adjusting.
	var thisSize = {left: false, right: false, top: false};
	var barBox = measure.bar.getBBox();
	thisSize.top = barBox.y;
	if(measure.bits){
		var measureBox = measure.bits.reduce(elementBBoxReducer, false);
		thisSize.left = measureBox.left;
		thisSize.right = measureBox.right;
	} else {
		thisSize.left = barBox.x;
		thisSize.right = barBox.x+barBox.width;
	}
	if(soFar) {
		return {left: Math.min(thisSize.left, soFar.left),
						right: Math.max(thisSize.right, soFar.right),
						top: Math.min(thisSize.top, soFar.top)};
	} else {
		return thisSize;
	} 
}
function chordToString(harmony){
	switch(harmony['@id']){
		case "http://dbpedia.org/resource/Root_position":
			return "5/3";
		case "http://dbpedia.org/resource/Second_inversion":
			return "6/4";
		default:
			return harmony['@id'];
	} 
}
function cadenceToString(degree, type){
	var basicDegree = ['i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii'][degree-1];
	var alteration = '';
	switch (type){
		case "http://dbpedia.org/resource/Major_chord":
			return "→"+ alteration+basicDegree.toUpperCase()+" Major";
		case "http://dbpedia.org/resource/Minor_chord":
			return "→"+ alteration+basicDegree+" Minor";
		case "http://dbpedia.org/resource/Diminished_seventh_chord":
			return "→"+ alteration+basicDegree+" dim7";
		default:
			var chord = /\/(.*)$/.exec(type);
			return "→"+alteration+basicDegree+" "+chord[1].replace('_', ' ');
	}
}

export function writeInfoToScore(info, meiThings, segmentn){
	var isx = info.segment.indexOf("frageverbot-x")>-1;
	var label = {height: 600, className: 'info'+(isx ? ' x' : ''), label:info};
	return rangeLabelAbove(meiThings, label);
}
function writeInfoToPlace(x, y, SVG, info){
	var group = document.createElementNS(SVGNS, "g");
	group.setAttributeNS(null, 'class', 'infoLabel');
	SVG.appendChild(group);
	var segmentInfo = svgText(group, x, y, false, false, false,
														/frageverbot-(.*)/.exec(info.segment) ? /frageverbot-(.*)/.exec(info.segment)[1]+'-segment ' : '');
	x += segmentInfo.getBBox().width;
	if(info.chords){
		for(var i=0; i<info.chords.length; i++){
			x = chordToSVG(x, y, group, info.chords[i]);
		}
	}
	if(info.cadence){
		svgText(group, x, y, false, false, false, cadenceToString(info.cadence.degree, info.cadence.chordType));
	}
}
function rangeLabelAbove(meiThings, label){
	var systems = groupBySystemsAndMeasures(meiThings);
	var svgCandidate = document.getElementById(Object.keys(systems)[0]);
	/*while(svgCandidate.nodeName.toLowerCase()!=="svg"){
		svgCandidate = svgCandidate.parentNode;
		}*/
	while(svgCandidate.nodeName.toLowerCase()!=="g" || svgCandidate.className.baseVal!=="page-margin"){
		svgCandidate = svgCandidate.parentNode;
	}
	var top = false;
	var topv = false;
	for(var sysid in systems){
		var soFar = false;
		// assume contiguousness
		for(var bno in systems[sysid]){
			soFar = mergeBar(soFar, systems[sysid][bno]);
		}
		svgRoundedRect(svgCandidate, Math.max(0, soFar.left), soFar.top-label.height,
									 soFar.right - soFar.left, label.height,
									 label.height/3, label.height/3, "labelabove "+label.className, false);
		if(!topv || soFar.top < topv) {
			topv = soFar.top;
			top = [sysid, soFar.left, soFar.right, soFar.top];
		}
	}
	if(typeof(label.label)=='string'){
		svgText(svgCandidate, top[1], topv, "label", false, "", label.label);
	} else {
		writeInfoToPlace(Math.max(100, top[1]), topv, svgCandidate, label.label);
	}
}
	
function systemLabelBelow(meiThing, label){
	var measureCandidate = meiThing;
	while(measureCandidate.className.baseVal.split(" ").indexOf("measure")==-1) {
		measureCandidate = measureCandidate.parentNode;
	}
	var svgCandidate = measureCandidate;
	while(svgCandidate.nodeName.toLowerCase()!=="svg"){
		svgCandidate = svgCandidate.parentNode;
	}
	var bbox = measureCandidate.getBBox();
  var y = bbox.y+bbox.height;
	if(typeof(label)==="string"){
		var text = svgText(measureCandidate, meiThing.getBBox().x, y, 
          false, false, "font-size: 500px; fill: purple", label);
		bbox = text.getBBox();
		text.setAttributeNS(null, "y", (2*bbox.height)+y);
	} else if (label.main) {
		chordLabel(label.main, label.figures, y, meiThing.getBBox().x, svgCandidate);
	}
}
function chordToSVG(x, y, SVG, chord){
	var group = document.createElementNS(SVGNS, "g");
	group.setAttributeNS(null, 'class', 'chordType');
	SVG.appendChild(group);
	var figures = [];
	switch(chord['@id']){
		case "http://dbpedia.org/resource/Root_position":
			figures = [5, 3];
			break;
		case "http://dbpedia.org/resource/Second_inversion":
			figures =  [6, 4];
			break;
		default:
			var t = svgText(group, x, y, false, false, false, chord['@id']);
			return x + t.getBBox().width;
	}
	var newx = x;
	for(var i=0; i<figures.length; i++){
		var figtext = svgText(group, x, y-270+(i*270), "figure", false, false, figures[i]);
		newx = Math.max(newx, x+figtext.getBBox().width);
	}
	return newx;
}

function chordLabel(main, figures, top, left, SVG){
	var group = document.createElementNS(SVGNS, "g");
	group.setAttributeNS(null, 'class', 'chordLabel');
	SVG.appendChild(group);
	var main = svgText(group, left, top, false, false, "font-size: 500px; font-family: serif; font-style: normal", main);
	var bbox = main.getBBox();
	main.setAttributeNS(null, 'y', top+bbox.height+(figures.length+1)*290);
	for(var i=0; i<figures.length; i++){
		svgText(group, left+bbox.width, top+(bbox.height/2)+(i+2)*290, false, false, "font-style: normal; font-family: serif; font-size: 300px", figures[i]);
	}
}
function getSystem(element){
	var sysObj = element.closest('.system');
//	var sysObj = element.evaluate('./ancestor::g[@class="system"][1]', element, nsResolver, XPathResult.singleNodeValue);
	return sysObj.id;
}
export function boundingBoxesForElements(elements) {
	var systems = {};
	for(var i=0; i<elements.length; i++){
		if(!elements[i]) continue;
		var elementRect = elements[i].getBBox();
		var system = getSystem(elements[i]);
		if(systems[system]) {
			systems[system].top = (systems[system].top || systems[system.top]===0) ? Math.min(elementRect.y, systems[system].top) : elementRect.y;
			systems[system].bottom = systems[system].bottom ? Math.max(elementRect.y+elementRect.height, systems[system].bottom) : elementRect.height+elementRect.y;
			systems[system].left = (systems[system].left || systems[system].left===0) ? Math.min(elementRect.x, systems[system].left) : elementRect.x;
			systems[system].right = systems[system].right ? Math.max(elementRect.x+elementRect.width, systems[system].right) : elementRect.x+elementRect.width;
		} else {
			systems[system] = {top: elementRect.y, bottom: elementRect.y+elementRect.height,
												 left: elementRect.x, right: elementRect.x+elementRect.width};
		}
	}
	return systems;
}
export function drawMotifBoxes(segment, systemBoxes, segmentLabels, highlight, classString="systemSegmentInfo"){
	var drawn = [];
	Object.keys(systemBoxes).forEach((sys, i)=>
																	 {var box=systemBoxes[sys];
																		var sysG = document.getElementById(sys);
																		var boxG = svgGroup(sysG, classString);
																		drawn.push(boxG);
																		svgRoundedRect(boxG, box.left - 15, box.top - 500,
																									 box.right - box.left + 30,
																									 box.bottom - box.top + 550, 4, 4, 'segment'+(highlight ? ' highlight' : ''));
																		svgText(boxG, box.left+50, box.top-50, 'segmentInfo', false, false, segmentLabels[segment]+((i>0) ? ' (contd.)' : ''));
																	 });
	return drawn;			 
}
