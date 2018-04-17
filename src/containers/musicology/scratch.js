var SVGNS = "http://www.w3.org/2000/svg";
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
}
function systemLabelBelow(meiThing, label){
	var measureCandidate = meiThing;
	while(measureCandidate.className.baseVal.split(" ").indexOf("measure")==-1) {
		measureCandidate = measureCandidate.parentNode;
	}
	var svgCandidate = measureCandidate;
	while(svgCandidate.NodeName.toLowerCase()!=="svg"){
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

var notes = document.getElementsByClassName('note');
systemLabelBelow(notes[23], "boogie");

function chordLabel(main, figures, top, left, SVG){
	var group = document.createElementNS(SVGNS, "g");
	SVG.appendChild(group);
	var main = svgText(group, left, top, false false, "font-size: 500px", main);
	var bbox = main.getBBox();
	main.setAttributeNS(null, 'y', top+height+figures.length*100);
	for(var i = 0; i<figures.length; i++){
		figures = svgText(group, left, top+i*100, false, false, "font-size: 100px", figures[i]);
	}
}
