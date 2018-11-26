import React, { Component } from 'react';
import App from '../app';
import { Router, Link } from 'react-router'

function ensureURI(motif){
	if(motif.indexOf('http://')>-1 || motif.indexOf('https://')>-1){
		return motif;
	} else {
		return 'https://meld.linkedmusic.org/annotations/'+motif+'.json-ld';
	}
}
function ensureURIs(list){
	return list.map(ensureURI);
}
function twinURI(list){
	let n = /[0-9]+/.exec(list[1])[0];
	return 'https://meld.linkedmusic.org/annotations/'+list[0]+'-'+list[1]+'.json-ld';
}
function motifName(pageURI){
	// FIXME: hardwiring
	return pageURI.substring(41, pageURI.indexOf('.json-ld'));
	
}
function annotationName(pageURI){
	console.log('annotation:'+motifName(pageURI), pageURI);
	return 'annotation:'+motifName(pageURI);
}
function motifURI(pageURI){
	// Yes, I know this is stupid, but it made sense to me at the time
	var pagePrefix = 'https://meld.linkedmusic.org/annotations/Frageverbot';
	var pageSuffix = '.json-ld';
	var motifURIs = {};
	for(var i=1; i<18; i++){
		motifURIs[pagePrefix+i+pageSuffix] = 'https://meld.linkedmusic.org/companion/F'+i;
	}
	return motifURIs[pageURI];
}
export default class ForbiddenQuestion extends Component { 
	constructor(props) {
		super(props);
		this.state={
			librettoElements: []
		}
	}
	addLibrettoElements(elements){
		this.setState({librettoElements: elements});
	}
	clearLibrettoElements(){
		this.setState({librettoElements: []});
	}
	showLibretto(targets, bodies){
		let enterfun = this.addLibrettoElements.bind(this, bodies);
		let exitfun = this.clearLibrettoElements.bind(this);
		targets.forEach(x=> {
			x.onmouseenter = enterfun;
			x.onmouseleave = exitfun;
			x.ontouchstart = enterfun;
			x.ontouchend = exitfun;
		});
	}

	render() { 
		var motifs = ['https://meld.linkedmusic.org/annotations/Frageverbot1.json-ld'];
		if(this.props.location.query.motif){
			if(typeof(this.props.location.query.motif)==='string'){
				motifs = [ensureURI(this.props.location.query.motif)];
			} else if(this.props.location.query.motif.length===2) {
				motifs = ensureURIs(this.props.location.query.motif);
				let graphURI = twinURI(this.props.location.query.motif);
				let left = annotationName(motifs[0]);
				let right = annotationName(motifs[1]);
				return (
				  <div className="twins"> 
				  	<link rel="stylesheet" href="../../style/forbiddenQuestion.css" type="text/css" />
						<link rel="stylesheet" href="../../style/double.css" type="text/css" />
				  	<App graphUri={graphURI} twins="true" role="twins" location={this.props.location} librettoElements={this.state.librettoElements} showLibretto={this.showLibretto.bind(this)} leftMotif={left} rightMotif={right}/>
		      </div>
				);
			} else {
				motifs = ensureURIs(this.props.location.query.motif);
			}
		}
		return (
		  <div> 
		  	<link rel="stylesheet" href="../../style/forbiddenQuestion.css" type="text/css" />
		  	<App graphUri={motifs[0]} location={this.props.location} role="singlet" singlet={'true'} librettoElements={this.state.librettoElements} showLibretto={this.showLibretto.bind(this)}/>
      </div>
		);
	}
	
};



