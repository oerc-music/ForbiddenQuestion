import React, { Component } from 'react';
import { nsResolver, svgLine, svgRoundedRect, svgGroup, svgSpan, svgText } from '../library/svgUtils.js';

///////
// Some MEI-related functions

function duration(event, MEIObject){
	// Get a duration as a number of crotchets from an MEI note or
	// rest. This is certainly too crude to be accurate.
  var base = event.getAttributeNS(null, 'dur');
  if(!base){
    // Probably a chord – get dur from parent
    base = MEIObject.evaluate('./ancestor::*[@dur][1]', event, nsResolver,
      XPathResult.NUMBER_TYPE, null).numberValue;
  }
  base = 1/Number(base);
  var dur = base;
  var dots = event.getAttributeNS(null, 'dots');
  if(dots) dur = base*(2 - (1 / (Math.pow(2, Number(dots)))));
  return dur*4;
}
function countMeasures(MEIObject){
  // Given parsed MEI, how many measures are there?
  var measureCount = MEIObject.evaluate('count(//mei:measure)', MEIObject, nsResolver, XPathResult.NUMBER_TYPE, null);
  return measureCount.numberValue;
}

function findInstruments(MEIObject){
  // Given parsed MEI, return objects for all instruments
  var staffDefs = MEIObject.evaluate('//mei:staffDef', MEIObject, nsResolver, XPathResult.ORDERED_NODE_ITERATORTYPE, null);
  var staffDef = staffDefs.iterateNext();
  var instruments = [];
  while(staffDef){
		// Constructor for Instrument is below
    instruments[staffDef.getAttributeNS(null, 'n')-1]=new Instrument(staffDef, MEIObject);
    staffDef = staffDefs.iterateNext();
  }
  return instruments;
}

function findMeasures(n, MEIObject){
  // Given parsed MEI, find all the bars with music in for staff/instrument n
  var staves = MEIObject.evaluate('//mei:staff[@n='+n+' and .//mei:note]', MEIObject, nsResolver, XPathResult.ORDERED_NODE_ITERATORTYPE, null);
  var staff = staves.iterateNext();
  var bars = [];
  while(staff){
		// Constructor for InstrumentMeasure is below
    bars.push(new InstrumentMeasure(staff, MEIObject));
    staff = staves.iterateNext();
  }
  return bars;
}
///////////////////
///
//  We don't care about separate notes, only blocks of continuous sound

function MeasureEventBlock(startTime, endTime, event){
  this.start = startTime;
  this.end = endTime;
  this.duration = endTime-startTime;
  this.sounding = event.nodeName=='note' || event.nodeName=='chord';
  this.events = [event];
	this.extend = function(startTime, endTime, event){
		this.events.push(event);
		this.start = Math.min(startTime, this.start);
		this.end = Math.max(endTime, this.end);
	};
	this.extends = function(event){
		// Is the new event of the same type as others in this object
		return (event.nodeName == 'note' && this.sounding)
      || (event.nodeName == 'note' && this.sounding)
      || (event.nodeName=='rest' && !this.sounding);
	};
}

function InstrumentMeasure(barStaff, MEIObject){
  // This object contains all the information for a bar of music
  // as played by one instrument on one staff
  this.MEIObject = MEIObject;
  this.barStaff = barStaff;
  this.barNo = this.MEIObject.evaluate('./ancestor::mei:measure/@n', barStaff,
    nsResolver, XPathResult.NUMBER_TYPE, null).numberValue;
  this.events = [];
  this.duration = 0;
  var eventObjs = this.MEIObject.evaluate('./mei:layer/mei:note | ./mei:layer/mei:rest | ./mei:layer/mei:chord', barStaff, nsResolver, XPathResult.ORDERED_NODE_ITERATORTYPE, null);
  var event = eventObjs.iterateNext();
  var t = 0;
  var newt = false;
  while(event){
    newt = t+duration(event);
    if(this.events.length && this.events[this.events.length-1].extends(event)){
      // Just extend the previous thing in events
      this.events[this.events.length-1].extend(t, newt, event);
    } else {
      this.events[this.events.length] = new MeasureEventBlock(t, newt, event);
    }
    t = newt;
    event = eventObjs.iterateNext();
  }
  this.duration = t;
}

//////////
//
// Some information about instruments
function InstrumentType(proto, name, shortname, section, shortplural){
  if(proto){
    this.name=proto.name;
    this.shortname=proto.shortname;
    this.section=proto.section;
		this.shortplural = proto.shortplural;
  } else {
    this.name=name;
    this.shortname=shortname;
    this.section=section;
		this.shortplural=shortplural;
  }
	this.eq = function(instType) {
		return this.name===instType.name;
	};
}

var Instruments = {
  "flute": new InstrumentType(false,'Flute', 'fl', 'Woodwind', 'fls'),
  "piccolo": new InstrumentType(false,'Piccolo', 'pic', 'Woodwind', 'pics'),
  "oboe": new InstrumentType(false,'Oboe', 'hb', 'Woodwind', 'hbs'),
  "cor anglais": new InstrumentType(false,'Cor anglais', 'ca', 'Woodwind', 'cas'),
  "english horn": new InstrumentType(false,'Cor anglais', 'ca', 'Woodwind', 'cas'),
  "a clarinet": new InstrumentType(false,'Clarinet in A', 'cl.A', 'Woodwind', 'cls.A'),
  "bassoon": new InstrumentType(false,'Bassoon', 'fg', 'Woodwind', 'fgs'),
  "horn in e": new InstrumentType(false,'Horn in E', 'cr.E', 'Brass', 'cr.E'),
  "violin": new InstrumentType(false,'Violin', 'vln', 'Strings', 'vlns'),
  "viola": new InstrumentType(false,'Viola', 'vla', 'Strings', 'vlas'),
  "cello": new InstrumentType(false,'Cello', 'vc', 'Strings', 'vcs'),
  "violoncello": new InstrumentType(false,'Cello', 'vc', 'Strings', 'vcs'),
  "elsa": new InstrumentType(false,'Elsa', 'E', 'Cast', 'Elsa'),
  "lohengrin": new InstrumentType(false,'Lohengrin', 'Lo', 'Cast', 'Loh')
};
// Working with InstrumentType objects
function instrumentMatch(type){
  if(Instruments[type.toLowerCase()]){
    return new InstrumentType(Instruments[type.toLowerCase()]);
  }
}
function getInstrumentType(instLabel){
	// find an InstrumentType to match the MEI label
  var type=instLabel;
  var no=false;
  var pos=instLabel.search(/ +[0-9]+/);
  if(pos>-1){
    type = instLabel.substring(0,pos);
    var noString = instLabel.substr(pos);
    pos = instLabel.search(/[0-9]/);
    no = parseInt(instLabel.substr(pos), 10);
  }
  var instr = instrumentMatch(type);
  if(!instr) return false;
  instr.no = no;
  return instr;
}
// An Instrument is a particular case of a type, e.g. Violin I is an Instrument with
// InstrumentType violin
function Instrument(staffDef, MEIObject){
  // Instrument object (includes activity info)
  this.MEIObject = MEIObject;
  this.name = staffDef.getAttributeNS(null, 'label');
  this.n = staffDef.getAttributeNS(null, 'n');
  this.type = getInstrumentType(this.name);
  this.number = false;
  this.measures = findMeasures(this.n, MEIObject);
	this.caption = function(SVG, x, y, active) {
		if(!this.type)  this.type=getInstrumentType(this.name);
		if(this.type){
			return(<text x={x} y={y}>{active ? this.name
																: this.type.shortname}</text>);
		} else {
			return(<div/>);
		}
	};
	this.classes = function(){
		if(!this.type) this.type=getInstrumentType(this.name);
		if(this.type) {
			return this.type.shortname+" "+this.type.section;
		}
		return '';
	};
	this.typeEq = function(otherInstrument){
		return this.type.name===otherInstrument.type.name;
	};
	this.onOffArray = function(){
		// A simple rhythm-only array of contiguous sounding block, of the
		// form [[<sounding-starts>, <soundingends>], [<sounding2-starts...]]
		var prevMeasure = false;
		var onOffArray = [];
		var prevn = false;
		var start = false;
		var startX = false;
		for(var i=0; i<this.measures.length; i++){
			var measure = this.measures[i];
			var n = measure.barNo-1;
			if(start && prevn && prevn<n-1){
				// There's been at least one empty bar. Need to close
				onOffArray.push([start, prevn+1]);
				start = false;
			}
			for(var j=0; j<measure.events.length; j++){
				var event = measure.events[j];
				if(event.sounding) {
					if(!start){
						start = n+(event.start/measure.duration);
					}
				} else {
					if(start){
						onOffArray.push([start, n+event.start/measure.duration]);
						start = false;
					}
				}
			}
			prevn = n;
		}
		if(start) {
			onOffArray.push([start, prevn+1]);
		}
		return onOffArray;
	};
}
export function mergedInstruments(instruments){
	var playingSets = [];
	var covered = [];
	var instrumentsPlaying = instruments.map(x => x.onOffArray());
	for(var i=0; i<instruments.length; i++){
		if(covered.indexOf(i)===-1){
			var playing = instrumentsPlaying[i];
			var playingSet = {playing: playing, instruments: [instruments[i]]};
			covered.push(i);
			for(var j=i+1; j<instruments.length; j++){
				if(onOffArrayEq(playing, instrumentsPlaying[j])){
					covered.push(j);
					playingSet.instruments.push(instruments[j]);
				}
			}
//			isAllOfInstrument(playingSet, instruments);
			playingSets.push(playingSet);
		}
	}
	return playingSets;
}
function singleInstrument(set){
	return set.every(x => x.type.name===set[0].type.name) ? set[0].type.name : false;
}
function singleSection(set){
	return set.every(x => x.type.section===set[0].type.section) ? set[0].type.section : false;
}
export function caption(set, orchestra, active, mover, mout, x, y, baseclass, n){
	var inst = singleInstrument(set);
	var section = singleSection(set);
	var cl = '';
	if(active){
		if (set.length===1){
			cl = section+" "+inst+" nnn"+n;
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{set[0].name}</text></g>,
							cl: cl};
		} else if(section && orchestra.filter(x => x.type.section===section).length===set.length){
			// This is the entire section at this point. FIXME, this is
			// broken logic (because it's so local). I may need to preset an
			// orchestra somehow.
			cl= section+" "+inst+" nnn"+n;
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{section}</text></g>,
							cl:cl};
		} else {
			var out=set[0].name;
			cl = (section? section : 'misc')
				+" "+(inst ? inst : 'miscinst') +" nnn"+n;
			for (var i=1; i<set.length-1; i++){
				out += ", "+set[0].name;
			}
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{out + " & "+set[set.length-1].name}</text></g>,
							cl: cl};
		}
	} else {
		if(set.length===1){
			cl = section+" "+inst+" nnn"+n;
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{set[0].type.shortname}</text></g>,
							cl:cl};
		} else if(section && orchestra.filter(x => x.type.section===section).length===set.length){
			cl = section+" "+inst+" nnn"+n;
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{section.substring(0,3)}</text></g>,
							cl:cl};
		} else if (inst && orchestra.filter(x => x.type.name===inst).length===set.length){
			cl= section+" "+inst+" nnn"+n;
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{set[0].type.shortplural}</text></g>,
							cl:cl};
		} else {
			cl=(section? section : 'misc') +" "+(inst ? inst : 'miscinst') +" nnn"+n;
			return {obj: <g onMouseOver={mover} onMouseOut={mout}>
							<text x={x} y={y} className={baseclass+cl}>{inst ? set[0].type.shortplural : 'misc'}</text></g>,
							cl:cl};
		}
	}
}

function isAllOfInstrument(set, orchestra){
	// returns true if all instruments of a given type in all are
	// represented in set. V fragile, not very musical, logic
	if(set.length){
		var instr = set[0].type.name;
		if(set.every(x => x.type.name===instr)){
			return orchestra.filter(x => x.type.name===instr).length===set.length;
		}
	}
	return false;
}
function entireSection(set, orchestra){
	// returns true if all instruments are from the same section and are
	// all of that section present. V fragile, not very musical, logic
	if(set.length){
		var section = set[0].type.section;
		if(set.every(x => x.type.section === section)){
			return orchestra.filter(x => x.type.section===section).length===set.length;
		}
	}
	return false;
}

function onOffArrayEq(arr1, arr2){
	if(arr1.length !==arr2.length) return false;
	for(var i=0; i<arr1.length; i++){
		if(arr1[i][0]!==arr2[i][0] || arr1[i][1]!==arr2[i][1]) return false;
	}
	return true;
}


////////
export function Orchestration (MEIString){
  // The Orchestration object holds a parsed MEI XML object
  // and then extracts various elements of the orchestration
  // for drawing.
  this.MEIString = MEIString;
  var p = new DOMParser();
  this.MEIObject = p.parseFromString(MEIString, "text/xml");
  this.measureCount = countMeasures(this.MEIObject);
  this.instruments = findInstruments(this.MEIObject);
}

export function drawRibbons(blobs, y, rowHeight, step, classes, mover, mout, i){
	var ribbons = [];
	for(var i=0;i<blobs.length; i++){
		ribbons.push(<rect y={y+rowHeight/8} x={blobs[i][0]*step}
								 width={step*(blobs[i][1]-blobs[i][0])}
								 height={rowHeight*3/4}
								 rx="5" ry="5" className={'box '+classes+' nnn'+i}
								 onMouseOver={mover} onMouseOut={mout}/>);
	}
	return <g>{ribbons}</g>;
}
export function drawBarLines(barcount, width, height){
	var x = 40;
	var lines = [];
	for(var i=0; i<barcount; i++){
		lines.push(<line x1={x} x2={x} y1="0" y2={height} className={"ribbon-barline bar"+i}/>);
		x+= (width-40) / barcount;
	}
	return lines;
}
