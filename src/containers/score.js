import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { writeInfoToScore, boundingBoxesForElements, drawMotifBoxes } from '../containers/musicology/drawingAroundScores';
import { fetchScore, fetchGraph, scoreNextPage, scorePrevPage, HAS_BODY, HAS_TARGET } from 'meld-clients-core/lib/actions/index';
import { 
	MARKUP_EMPHASIS, 
	handleEmphasis,
	MARKUP_HIGHLIGHT,
	handleHighlight,  
	MARKUP_HIGHLIGHT2,
	handleHighlight2,  
	CUE_AUDIO, 
	handleCueAudio,
	handleQueueNextSession,
	handleIdentifyMuzicode,
	handleChoiceMuzicode,
	handleChallengePassed,
	handleDisklavierStart
} from 'meld-clients-core/src/actions/meldActions';


import InlineSVG from 'svg-inline-react';
const defaultVrvOptions = {
	breaks:'auto',
	adjustPageHeight:1,
	spacingStaff: 0,
	spacingSystem: 12,
	spacingLinear: 0.2,
	spacingNonLinear: 0.55,
	noFooter: 1,
	noHeader: 1,
	scale: 30,
	pageHeight: 3000,
	pageWidth: 1800
};

class Score extends Component { 
	constructor(props) { 
		super(props);

		this.state = { 
			score: {},
			MEI: false,
			SVG: false,
			options: false,
			// vrvTk: new verovio.toolkit(),
      annotations:{},
			currentProps: false
		};
	}
	optionsEq(op1, op2){
    for(var key in op1) {
        if(!(key in op2) || op1[key] !== op2[key]) {
            return false;
        }
    }
    for(var key in op2) {
        if(!(key in op1) || op1[key] !== op2[key]) {
            return false;
        }
    }
    return true;
	}
	render() {
		if(Object.keys(this.props.score).length) {
			if(!this.state.MEI || this.state.MEI!== this.props.score.MEI[this.props.uri] || (this.props.options && this.props.options!== this.state.options)){
				if(this.props.score.MEI[this.props.uri]) {
					var svg = '';
					var options = (this.props.longerOptions
												 && ((this.props.score.MEI[this.props.uri].match(/<measure/g) || []).length) >8)
							? this.props.longerOptions
							: (this.props.options || defaultVrvOptions);
					if(this.props.score.SVG[this.props.uri] && this.props.score.options && this.optionsEq(this.props.score.options[this.props.uri], options)) {
						svg = this.props.score.SVG[this.props.uri];
					} else {
						svg = this.props.score.vrvTk.renderData(this.props.score.MEI[this.props.uri], options);
						this.props.score.SVG[this.props.uri] = svg;
						if(!this.props.score.options) this.props.score.options = {};
						this.props.score.options[this.props.uri] = options;
					}
//					this.setState({MEI: this.props.score.MEI[this.props.uri], SVG: svg});
//					if(this.props.options) this.setState({options: this.props.options});
				} else /*if (this.props.score.SVG[this.props.uri]) {
					svg = this.props.score.SVG[this.props.uri];
					this.setState({SVG: svg});
				} else */{
					svg = '';
				}
			} else {
				svg = this.state.SVG;
			}
			var classes = this.props.className ? this.props.className+" scorepane" : "scorepane";
			if(this.props.extraClasses) classes += ' '+this.props.extraClasses;
			return (
				<div id={this.props.uri} className={classes}>
					<div className="controls" />
					<div className="annotations" />
					<InlineSVG className="score" src={svg }/>
				</div>
			);
		}
		return <div>Loading...</div>;
	}
	addExtras() {
		let ct = this.props.score.componentTargets;
		let ctKeys = Object.keys(ct);
		for(let i=0; i<ctKeys.length; i++){
			let MEITargets = ct[ctKeys[i]]['MEI'];
			let TEITargets = ct[ctKeys[i]]['TEI'];
			let lyricElements = [];
			if(TEITargets.length){
				for(let j=0; j<MEITargets.length; j++){
					if(MEITargets[j].substring(0, MEITargets[j].indexOf("#"))===this.props.uri){
						// This MEITarget is in this music example
						let el = document.getElementById(MEITargets[j].substring(MEITargets[j].indexOf("#")+1));
						if(el){
							let lyric = el.getElementsByClassName('verse');
							if(lyric){
								lyricElements = lyricElements.concat(Array.from(lyric));
							}
						}
					}
				}
				this.props.showLibretto(lyricElements, TEITargets);
			}
		}
	}
	componentDidMount() { 
		this.props.fetchScore(this.props.uri);
	}

	componentDidUpdate(prevProps, prevState) {
		let annotations = this.props.annotations;
		this.addExtras();
		if(!Array.isArray(annotations)) { 
			annotations = [annotations]
		}
		if(annotations.length && typeof annotations[0] !== "undefined" && "@type" in annotations[0] && annotations[0]["@type"].includes("meldterm:topLevel")) { 
//			console.log("Found old Larry-meld style topLevel annotation, converting...")
			annotations = annotations[0]["http://www.w3.org/ns/oa#hasBody"]
		}
		/*
		annotations.map( (annotation) => {
			//console.log("annotation is: ", annotation)
			if(typeof annotation === 'undefined') { return }
			// each annotation...
			var annotationset = annotation["http://www.w3.org/ns/oa#hasTarget"];
			if(!Array.isArray(annotationset)) annotationset = [annotationset];
			const frags = annotationset.map( (annotationTarget) => { 
				// each annotation target
				if(annotationTarget["@id"] in this.props.score.componentTargets) {
          // if this is my target, grab frag ids according to media type
          const mediaTypes = Object.keys(this.props.score.componentTargets[annotationTarget["@id"]]);
          let myFrags = {};
          mediaTypes.map( (type) => {
            if(type === "MEI") { 
              // only grab MY frag IDs, for THIS mei file
              myFrags[type] = this.props.score.componentTargets[annotationTarget["@id"]][type].filter( (frag) => {
                return frag.substr(0, frag.indexOf("#")) === this.props.uri;
              })
            } else {
              //TODO think about what to do here to filter (e.g. multiple audios) 
              myFrags[type] = this.props.score.componentTargets[annotationTarget["@id"]][type]; 
            }
          });
          // and apply any annotations
          this.handleMELDActions(annotation, myFrags);
				} else if(annotationTarget["@id"] == this.props.session) { 
					// this annotation applies to the *session*, e.g. a page turn
					this.handleMELDActions(annotation, null);
				} else {
				}
			});
			});*/
		if(!document.getElementsByClassName('systemSegmentInfo-'+this.props.position).length){
			this.drawInfo();
		}			
	}
	deleteOldLabels(){
		var labels = document.getElementsByClassName('infoLabel');
		while(labels && labels.length) {
			labels[0].remove();
		}
		var labels = document.getElementsByClassName('labelabove');
		while(labels && labels.length)	{
			labels[0].remove();
		}
	}
	embodybagContents(id){
		var segment = this.props.segmentLineMembers.find(x=>x['@id']==id);
		// var bits = segment.anchors[0].find(x=>(x['@type']=="https://meld.linkedmusic.org/terms/MEIEmbodiment"
		// 																			 || "https://meld.linkedmusic.org/terms/MEIEmbodiment" in x['@type']));
		return segment.anchors[0]['http://www.w3.org/2000/01/rdf-schema#member'].map(x=>x['@id']);
	}
	audioCue(id){
		var segment = this.props.segmentLineMembers.find(x=>x['@id']==id);
		if(segment && segment.audio && segment.audio.length) {
			return seqToArray(segment.audio[0]['http://www.w3.org/2000/01/rdf-schema#member']);
		} else {
			console.log(id, this.props.segmentLineMembers);
		}
	}
	drawInfo(){
		if(false && this.props.graph.info){
			// FIXME: I'm drawing on the score now, but this may not be the best place
			this.deleteOldLabels();
			var segments = Object.keys(this.props.graph.info);
			var segLabels = [];
			for(var i=0; i<segments.length; i++){
				if(segments[i] in this.props.score.componentTargets){
					if(!segLabels[this.props.graph.info[segments[i]]]) segLabels[this.props.graph.info[segments[i]]] = 1;
					var meiIds = this.props.score.componentTargets[segments[i]].MEI.map((x)=>x.split("#")).filter((x) => x[0]==this.props.uri).map((x) =>x[1]);
					if(meiIds && document.getElementById(meiIds[0])){
						var meiThings = meiIds.map((x) => document.getElementById(x));
						writeInfoToScore(this.props.graph.info[segments[i]], meiThings,
														 segLabels[this.props.graph.info[segments[i]]]);
					} 
					segLabels[this.props.graph.info[segments[i]]]++;
				}
			}
		}
		if(this.props.showSegments && this.props.segmentLabels && this.props.iterationSegments.length && this.props.segmentLineMembers.length){
			var fragments = {};
			var structures = [];
			for(i=0; i<this.props.iterationSegments.length; i++){
				var parts = seqToArray(this.props.iterationSegments[i]["http://purl.org/vocab/frbr/core#part"]);
				var madeOf = this.props.iterationSegments[i]["http://purl.org/vocab/frbr/core#realizationOf"]['@id'];
				var highlight = this.props.highlight == this.props.iterationSegments[i]['@id'];
				if(!fragments[madeOf]) {
					fragments[madeOf] = [];
					structures.push(madeOf);
				}
				var MEIElements = [].concat(...parts.map(x=>this.embodybagContents(x)));
				var elementIDs = MEIElements.map(x=>x.substring(x.indexOf('#')+1));
				var SVGElements = elementIDs.map(x=>document.getElementById(x));
				if(SVGElements[0]){ // null if SVG not yet drawn
					var systemBoxes = boundingBoxesForElements(SVGElements);
					//					drawMotifBoxes(this.props.iterationSegments[i], systemBoxes, this.props.segmentLabels);
					//					if(highlight) console.log(highlight, "****");
					var drawnBoxes = drawMotifBoxes(madeOf, systemBoxes, this.props.segmentLabels, highlight, "systemSegmentInfo systemSegmentInfo-"+this.props.position);
					var audioCue = this.audioCue(parts[0]);
					var callback = this.callbackForSegment(audioCue[0]);
					SVGElements.map(x=>(x ? x.onclick = callback : false));
					//						SVGElements.map(x=>(x.onClick = callback));
					drawnBoxes.map(x=>(x ? x.onclick=callback : false));
				}
				//svgElements.map(x=>x.
				fragments[madeOf].push(SVGElements);
			}
		}
	}
	callbackForSegment(audioFragment){
		return function(){
			var audioUriParts = audioFragment.split("#");
			var audioFragTime = parseFloat(audioUriParts[1].substr(audioUriParts[1].indexOf("t=")+2))
			var myPlayers = document.querySelectorAll("audio[src='" + audioUriParts[0] + "']");
//			console.log('cueing', myPlayers, audioUriParts);
			Array.prototype.map.call(myPlayers, p=>{p.currentTime=audioFragTime});
		}
	}
	handleMELDActions(annotation, fragments) { 
		//console.log("HANDLING MELD ACTION: ", annotation, fragments);
		if("http://www.w3.org/ns/oa#motivatedBy" in annotation) { 
			switch(annotation["http://www.w3.org/ns/oa#motivatedBy"]["@id"]) { 
			case "http://www.w3.org/ns/oa#highlighting":
				this.props.handleHighlight(ReactDOM.findDOMNode(this), annotation, this.props.uri, fragments["MEI"]);
			break;
			default:
				console.log("Unknown motivation: ", annotation["http://www.w3.org/ns/oa#motivatedBy"]);
			}
	 } else if('http://www.w3.org/ns/oa#hasBody' in annotation) { 
			annotation['http://www.w3.org/ns/oa#hasBody'].map( (b) => {
				// TODO convert to switch statement
				if(b["@id"] === MARKUP_EMPHASIS) {
					this.props.handleEmphasis(ReactDOM.findDOMNode(this), annotation, this.props.uri, fragments["MEI"]);
				} else if(b["@id"] === MARKUP_HIGHLIGHT) { 
					this.props.handleHighlight(ReactDOM.findDOMNode(this), annotation, this.props.uri, fragments["MEI"]);
				} else if(b["@id"] === MARKUP_HIGHLIGHT2) { 
					this.props.handleHighlight2(ReactDOM.findDOMNode(this), annotation, this.props.uri, fragments["MEI"]);
				}  else if(b["@id"] === CUE_AUDIO) { 
					this.props.handleCueAudio(ReactDOM.findDOMNode(this), annotation, b, this.props.uri, fragments);
				} else {
					console.log("Score component unable to handle meld action: ", b);
				}
			});
		// FIXME: the above should be phased out as we move into
		// using motivations instead of bodies for rendering instructions
	 } else { console.log("Skipping annotation without rendering instructions: ", annotation) }
	}
}

function seqToArray(seq){
	if(seq['@type'] && seq['@type']=="http://www.w3.org/1999/02/22-rdf-syntax-ns#Seq"){
		var arr = [];
		var i=1;
		while(seq['http://www.w3.org/1999/02/22-rdf-syntax-ns#_'+i]){
			arr.push(seq['http://www.w3.org/1999/02/22-rdf-syntax-ns#_'+i]['@id']);
			i++;
		}
		return arr;
	} else return [seq['@id']];
}

function mapStateToProps({ graph, score }) {
	return { graph, score };
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ fetchScore, fetchGraph, handleEmphasis, handleHighlight, handleHighlight2, handleCueAudio, scorePrevPage, scoreNextPage, handleQueueNextSession, handleIdentifyMuzicode, handleChoiceMuzicode, handleChallengePassed, handleDisklavierStart}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Score);
