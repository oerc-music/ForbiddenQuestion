import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { writeInfoToScore } from '../containers/musicology/drawingAroundScores';
import { fetchScore, fetchGraph, scoreNextPage, scorePrevPage, HAS_BODY, HAS_TARGET } from 'meld-clients-core/src/actions/index';
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
	spacingSystem: 13,
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
			vrvTk: new verovio.toolkit(),
      annotations:{}
		};
	}

	render() {
		if(Object.keys(this.props.score).length) {
			if(!this.state.MEI || this.state.MEI!== this.props.score.MEI[this.props.uri] || (this.props.options && this.props.options!== this.state.options)){
				if(this.props.score.MEI[this.props.uri]) {
					var svg = this.state.vrvTk.renderData(this.props.score.MEI[this.props.uri], this.props.options ? this.props.options : defaultVrvOptions);
					this.setState({MEI: this.props.score.MEI[this.props.uri], SVG: svg});
					if(this.props.options) this.setState({options: this.props.options});
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

	componentDidUpdate() {
		let annotations = this.props.annotations;
		this.addExtras();
		if(!Array.isArray(annotations)) { 
			annotations = [annotations]
		}
		if(annotations.length && typeof annotations[0] !== "undefined" && "@type" in annotations[0] && annotations[0]["@type"].includes("meldterm:topLevel")) { 
//			console.log("Found old Larry-meld style topLevel annotation, converting...")
			annotations = annotations[0]["oa:hasBody"]
		}
		annotations.map( (annotation) => {
//			console.log("annotation is: ", annotation)
			if(typeof annotation === 'undefined') { return }
			// each annotation...
			const frags = annotation["oa:hasTarget"].map( (annotationTarget) => { 
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
				} 
			});
			this.drawInfo();
		});
			
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
	drawInfo(){
		if(this.props.graph.info){
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
	}

	handleMELDActions(annotation, fragments) { 
		console.log("HANDLING MELD ACTION: ", annotation, fragments);
		if("oa:motivatedBy" in annotation) { 
			switch(annotation["oa:motivatedBy"]["@id"]) { 
			case "oa:highlighting":
				this.props.handleHighlight(ReactDOM.findDOMNode(this), annotation, this.props.uri, fragments["MEI"]);
			break;
			default:
				console.log("Unknown motivation: ", annotation["oa:motivatedBy"]);
			}
	 } else if(HAS_BODY in annotation) { 
			annotation[HAS_BODY].map( (b) => {
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

function mapStateToProps({ graph, score }) {
	return { graph, score };
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ fetchScore, fetchGraph, handleEmphasis, handleHighlight, handleHighlight2, handleCueAudio, scorePrevPage, scoreNextPage, handleQueueNextSession, handleIdentifyMuzicode, handleChoiceMuzicode, handleChallengePassed, handleDisklavierStart}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Score);
