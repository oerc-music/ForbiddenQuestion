import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import { registerTraversal, traverse, setTraversalObjectives, checkTraversalObjectives } from 'meld-clients-core/lib/actions/index';
import { Media, Player, controls, utils } from 'react-media-player';
import CustomPlayPause from '../containers/react-media-player-play-pause';
//import { projectAnnotations } from '../actions/graph.js';
import {prefix} from 'meld-clients-core/lib/library/prefixes';

import Burger from '../containers/burger';
import Home from '../containers/landing';
import Popup from '../containers/popup';
import InspectPane from '../containers/inspect';
import TEI from 'meld-clients-core/lib/containers/tei';
import MEICarousel from '../containers/new-carousel';
import MEITimeline from '../containers/timeline';
import Essay from 'meld-clients-core/lib/containers/essay';
import EssayLinks from 'meld-clients-core/lib/containers/essayLinks';
import Video from 'meld-clients-core/lib/containers/video';
import VideoLinks from 'meld-clients-core/lib/containers/videoLinks';

const { defaultPlayPause, CurrentTime, Progress, SeekBar, Duration, MuteUnmute, Volume, Fullscreen } = controls;
const { formatTime } = utils;
const MEIEm = "https://meld.linkedmusic.org/terms/MEIEmbodiment";
const TEIEm = "https://meld.linkedmusic.org/terms/TEIEmbodiment";
const AuEm = prefix.meldterm+"AudioEmbodiment";
const ImageManifestation = prefix.meldterm+"ImageManifestation";
const FOR_ORCHESTRA = "http://id.loc.gov/authorities/performanceMediums/2013015516";
const HAS_PIANO = "http://id.loc.gov/authorities/performanceMediums/2013015550";
const VIDEOURI = "https://lohengrin.linkedmusic.org/Essay/rethinkingWagnersLeitmotif.mp4";
const MAX_TRAVERSERS = 30;

const donotfollow = ["https://meld.linkedmusic.org/terms/",
										 "https://meld.linkedmusic.org/annotations/AskingForbidden_",
										 "https://meld.linkedmusic.org/companion/lyr",
										 "https://meld.linkedmusic.org/companion/3",
										 "https://meld.linkedmusic.org/companion/1",
										 "https://meld.linkedmusic.org/companion/0",
										 "https://meld.linkedmusic.org/companion/2",
//										 "https://meld.linkedmusic.org/annotations/",
										 "https://meld.linkedmusic.org/companion/add-",
										 "https://meld.linkedmusic.org/companion/cdr",
										 "https://meld.linkedmusic.org/companion/stage",
										 "https://meld.linkedmusic.org/companion/lohengrinSegmentLine.nq#",
										 "https://meld.linkedmusic.org/resources/lohengrin/libretto#"];

function avoidThesePatterns(uri) {
	if(uri.indexOf('Context')>-1 || uri.indexOf('Embodiment')>-1 || uri.indexOf('/orch')>-1|| uri.indexOf('/sg')>-1){
		return true;
	} else {
		return false;
	}
}
const lohengrinStructures = [['overture', 'Vorspiel', 75, false],
                             ['act', 'One', [['scene', 1, 262],
																						 ['scene', 2, 397],
																						 ['scene', 3, 587]],
                              [['F1', 777], ['F2', 789]]],
                             ['act', 'Two', [['scene', 1, 423],
																						 ['scene', 2, 443],
																						 ['scene', 3, 479],
																						 ['scene', 4, 283],
																						 ['scene', 5, 478]],
                              [['F3', 18], ['F4', 31], ['F5', 288], ['F6', 767], ['F7', 1875], ['F8', 1949], ['F9', 2098]]],
                             ['act', 'Three', [
//														 ['Einleitung', 1, 131],
															 //															 ['scene', 1, 174],
															 ['scene', 1, 305],
																							 ['scene', 2, 553],
																							 ['scene', 3, 845]],
															[['F10', 494], ['F11', 621], ['F12', 737], ['F13',739], ['F14', 824], ['F15', 832], ['F16',836], ['F17', 1062], ['F18', 874, 'unperformed']]]];

class App extends Component { 
  constructor(props) {
    super(props);
    this.state = {
			currentMotif: this.props.motif || false,
			highlight: false,
			showCommentaryL: false,
			showCommentaryR: false,
			showTranslation: true,
			popup: false,
			language: 'en',
			visibleLinks: []
		};
  }
  
  componentDidMount() {
		if(this.props.graphUri || true) { 
//		if(this.props.graphUri || this.props.route.graphUri) { 
			//const graphUri = (this.props.graphUri || this.props.route.graphUri );
			//const graphUri = "/Essay/data.json-ld";
			const graphUri = "https://meld.linkedmusic.org/annotations/AskingForbidden.json-ld";
			this.props.registerTraversal(graphUri,
//																	 {numHops: 3,
																	 {numHops: 4,
																		extendObjectPrefix: ["https://meld.linkedmusic.org", "http://localhost"],
																		ignoreObjectPrefix: donotfollow,
																		// propertyPrefixBlacklist: ["http://www.linkedmusic.org/ontologies/segment/"],
																		// objectBlacklistTest: avoidThesePatterns
																	 });
			//this.props.fetchGraph(graphUri);
			window.addEventListener("resize", this.updateDimensions.bind(this));
		}
  }
  handleMotifChange(motif){
    this.setState({currentMotif: motif});
  }
	setVisibleLinks(links){
		this.setState({visibleLinks: links});
	}
  handleTMClick(motif){
		switch(this.state.submode){
			case 'addRight':
				this.setState({mode: 'IterationCompare', submode: false, currentMotif:[this.state.leftMotif, this.state.currentMotif]});
				break;
			case 'addLeft':
				this.setState({mode: 'IterationCompare', submode: false, currentMotif:[this.state.currentMotif, this.state.rightMotif]});
				break;
			case 'replaceSingle':
			default:
				this.setState({mode: 'IterationInspect', submode: false, currentMotif: motif});
				break;
		}
	}
	handleTimelineClickInCompare(motif){
		// Three interpretations available:
		//   1. Remember which motif was added to the compare most recently and swap that out
		//   2. Always swap out right (or left)
		//   3. Switch to inspect
		// To me, 3 feels tidiest, but 1 or 2 allow flicking through comparisons rapidly,
		// which is useful functionality. This is not something we've discussed, so I'm
		// plumping for 2, but coding all options.
		var behaviour = 'right';
		switch(behaviour){
			case 'right':
				this.setState({currentMotif:[this.state.currentMotif[0], motif]});
				break;
			case 'left':
				this.setState({currentMotif:[motif, this.state.currentMotif[1]]});
				break;
			case 'remember':
				// ??
				if(this.state.rightMotif){
					this.setState({currentMotif:[motif, this.state.currentMotif[1]]});
				} else {
					this.setState({currentMotif:[this.state.currentMotif[0], motif]});
				}
				break;
			case 'inspect':
				this.setState({mode: 'IterationInspect', currentMotif: motif, leftMotif: false, rightMotif: false});
				// no default
		}
	}
	waiter(){
		var newState = this.state.waiting ? this.state.waiting + 1 : 1;
		this.setState({waiting:  newState});
	}
  updateDimensions() {
		this.setState({width: document.documentElement.clientWidth,
									 height: document.documentElement.clientHeight});
  }
  componentWillMount() {
		this.props.setTraversalObjectives([
			{
				"@type": "https://meld.linkedmusic.org/companion/vocab/MotifIteration"
			},
			{
				"@type": "https://www.linkedmusic.org/ontologies/segment/Segment",
			},
			{
				"@type": "https://meld.linkedmusic.org/companion/vocab/MotifSegment"
			},
			{
				"@type": "https://meld.linkedmusic.org/companion/vocab/VideoAnnotation"
			}
		]);
    this.updateDimensions();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
	commentaryForMotif(motif){
		if(this.state.iterations){
			var motifInfo = this.state.iterations.find(x=>x['@id']===motif);
			if(motifInfo) return motifInfo.commentary;
			return false;
		} else {
			return false;
		}
	}
	componentDidUpdate(prevProps, prevState){
		if(prevProps && "graph" in prevProps) {
			if(prevProps.traversalPool.running===1 && this.props.traversalPool.running===0){
				// check our traversal objectives if the graph has updated
//				if(prevProps.graph.graph.length !== this.props.graph.graph.length) {
				//					console.log('checking graph');
				// console.log(this.props.graph.graph.length)
//				if(this.props.graph.graph.length<400) return;
				console.log("updating – it's finished traversing");
				this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
				this.updateLists();
				return;
			} else if(Object.keys(this.props.traversalPool.pool).length && this.props.traversalPool.running < MAX_TRAVERSERS){
				var uri = Object.keys(this.props.traversalPool.pool)[0];
				this.props.traverse(uri, this.props.traversalPool.pool[uri]);
			} else if(this.props.traversalPool.running===0){
				if(prevProps.graph.outcomesHash !== this.props.graph.outcomesHash) {
//					console.log('rebuilding structures');
					// outcomes have changed, need to update our projections!
					this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
					this.updateLists();
				} else {
				}
				
//				console.log(prevProps.traversalPool);				
			} else if(!Object.keys(this.props.traversalPool.pool).length) {
				console.log("Nothing left, though some traversers still running");
				// this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
				// this.updateLists();
			}
		}
	}
	matchSegment(target){
		return segment=>segment['@id']===target['@id'];
	}
	commentaryClicked(e){
		if(e.target.tagName==="TEI-REF"){
			e.stopPropagation();
			this.setState({popup: e.target.getAttributeNS(null, 'target')});
		}
	}
	clearAllPopups(){
		this.setState({popup: false,
									 showCommentaryL: false,
									 showCommentaryR: false,
									 showTranslation: false});
	}
	clearPopup(){
		this.setState({popup: false});
	}/*
	showPopup(uri){
		e.stopPropagation();
		this.setState({popup: uri});
	}*/
	toggleLCommentary(e){
		e.stopPropagation();
		this.setState({showCommentaryL: !this.state.showCommentaryL});
	}
	toggleRCommentary(e){
		e.stopPropagation();
		this.setState({showCommentaryR: !this.state.showCommentaryR});
	}
	timelineForVideoLinks(videoLinks){
		for(var i=0; i<videoLinks.length; i++){
			var targets = videoLinks[i][prefix.oa+"hasTarget"];
			var body = videoLinks[i][prefix.oa+"hasBody"];
			if(!Array.isArray(targets)) targets = [targets];
			var bodyURI = new URL(body['@id']);
			var bodyMedia = bodyURI.origin+bodyURI.pathname;
			var fragment = bodyURI.hash.substring(3);
			var times = fragment.split(',');
			var start = times[0];
			var end = times.length>1 ? times[1] : false;
			if(!this.props.timesync || !"mediaResources" in this.props.timesync) this.props.timesync.mediaResources = {};
			if(!this.props.timesync.mediaResources[bodyMedia]) {
				this.props.timesync.mediaResources[bodyMedia] = {times:{}};
			}
			this.props.timesync.mediaResources[bodyMedia]['times'][start] = {targets:targets, body: body,
																																			 start: start, end: end,
																																			 bodyMedia: bodyMedia, annotation: videoLinks[i]};
		}
	}

	updateLists(){
		var mi, seg, videoLinks, segItems;
		const POF = "http://purl.org/vocab/frbr/core#part";
		const EMBOD = "http://purl.org/vocab/frbr/core#embodiment";
		if(Object.keys(this.props.graph.outcomes).length< this.props.graph.outcomes.length){
			// Still processing objectives
			return;
		}
		// [mi, seg, meis, teis, segItems] = this.props.graph.outcomes;
		[mi, seg, segItems, videoLinks] = this.props.graph.outcomes;
		if(!mi || !seg || !segItems || !videoLinks
			 || !('@graph' in mi) || !('@graph' in seg) || !('@graph' in segItems) || !('@graph' in videoLinks) 
			 || !mi['@graph'].length || !seg['@graph'].length || !segItems['@graph'].length || !videoLinks['@graph'].length) {
			return;
		} else {
		}
		var iterations = mi['@graph'].slice(0).sort((x, y) =>
																								(JSONLDInt(y[prefix.meld+'actNumber'])< JSONLDInt(x[prefix.meld+'actNumber']))
																								|| (JSONLDInt(x[prefix.meld+'actNumber']) === JSONLDInt(y[prefix.meld+'actNumber'])
																										&& JSONLDInt(y[prefix.meld+'barNumberInAct']) < JSONLDInt(x[prefix.meld+'barNumberInAct'])));
		if(videoLinks && videoLinks['@graph'].length) this.timelineForVideoLinks(videoLinks['@graph']);
		for(var i=0; i<iterations.length; i++){
//			console.log('looking at iteration', i);
			var mii = iterations[i];
			var context;
			iterations[i].segmentLineMembers = [];
			iterations[i].iterationSegments = [];
			iterations[iterations[i]['@id']] = mii;
			mii.embodimentLists = {MEI: [], en: [], de:[], MP3: []};
			if(mii[prefix.compVocab+'hasCommentary'] && mii[prefix.compVocab+'hasContext']){
				mii.commentary = mii[prefix.compVocab+'hasCommentary']['@id'];
				context = mii[prefix.compVocab+'hasContext'];
				if(context && "@id" in context && !("@type" in context))
					context = this.props.graph.graph.find(x=>(x["@id"]===context["@id"]));
				if(context[EMBOD]){
					mii.embodiments = Array.isArray(context[EMBOD]) ? context[EMBOD].slice() : [context[EMBOD]];
				}
			} 
			if(mii.embodiments){
				for(var emi=0; emi<mii.embodiments.length; emi++){
					if(!('@type' in mii.embodiments[emi])) {
						// The framing hasn't worked
						var embo = this.props.graph.graph.find(x=>x['@id']===mii.embodiments[emi]['@id']);
						var embomore = this.props.graph.graph.filter(x=>x['@id']===mii.embodiments[emi]['@id']);
						if(embomore.length){
							embo = embomore[0];
							for(var graphi=1; graphi<embomore.length; graphi++){
								let keys = Object.keys(embomore[graphi]);
								for(var k=0; k<keys.length; k++){
									let key = keys[k];
									let embentry = embomore[graphi][keys[k]];
									if(key==='@id') continue;
									if(key in embo) {
										if(Array.isArray(embo[key])) {
											if(Array.isArray(embentry)){
												embo[key] = embo[key].concat(embentry);
											} else {
												embo[key].push(embentry);
											}
										} else {
											if(Array.isArray(embentry)){
												embo[key] = [embo[key]].concat(embentry);
											} else {
												embo[key] = [embo[key], embentry];
											}
										}
										console.log(embo);
									} else {
										embo[key] = embentry;
										console.log(embo);
									}
								}
							}
							mii.embodiments[emi] = embo;
						} 
					}
					// 	if(embo && '@type' in embo) {
					// 		console.log("JSON-LD missed one:", embo, mii.embodiments[emi], embomore);
					// 		mii.embodiments[emi] = embo;
					// 	}
					// }
					if(mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']
						 && (mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']['@id']===FOR_ORCHESTRA
								 ||
								 (Array.isArray(mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'])
									&& '@id' in mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'][0]
									&& mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'][0]['@id']===FOR_ORCHESTRA))){
						mii.orchestralScore = mii.embodiments[emi]['@id'];
					} else if(mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']
										&& mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']['@id']===HAS_PIANO
										||
										(Array.isArray(mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'])
										 && '@id' in mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'][0]
										 && mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'][0]['@id']===HAS_PIANO)){
						mii.vocalScore = mii.embodiments[emi]['@id'];
					}	else if(mii.embodiments[emi]['@type']==="https://meld.linkedmusic.org/terms/TEIEmbodiment"
									  && mii.embodiments[emi]['http://schema.org/inLanguage']==='de') {
						mii.de = mii.embodiments[emi]['@id'];
					} else if(mii.embodiments[emi]['@type']==="https://meld.linkedmusic.org/terms/TEIEmbodiment"
									  && mii.embodiments[emi]['http://schema.org/inLanguage']==='en') {
						mii.en = mii.embodiments[emi]['@id'];
					} 
				}
			}
			if(mii[POF]){
				for(var p=0; p<mii[POF].length; p++){
					// Parts
					var part = mii[POF][p];
					var peli = 1;
					var partel, miseg;
					while((partel=part['http://www.w3.org/1999/02/22-rdf-syntax-ns#_'+peli])){
						// Are they segments?
						var sls = seg['@graph'].find(this.matchSegment(partel));
						if(!sls && partel && partel['@id'] && partel['@id'].indexOf('-') > -1) console.log('fail', partel['@id'], seg);
						if(sls) {
							iterations[i].segmentLineMembers[peli-1] = sls;
							var segembs = sls['http://purl.org/vocab/frbr/core#embodiment'];
							for(var embi=0; embi<segembs.length; embi++){
								addEmbodimentToIteration(segembs[embi], mii);
							}
						} else if(partel['@type'] && partel['@type'].indexOf("https://meld.linkedmusic.org/companion/vocab/MotifIterationSegment")>-1) {
							iterations[i].iterationSegments[peli-1] = partel;
						}
						peli+=1;
					}
				}
			}
//			if(!iterations[i].segmentLineMembers.length) console.log('fail', mii[POF]);
		}
		var segmentLabels = {};
		if(segItems['@graph'].length){
			for(var i=0; i<segItems['@graph'].length; i++){
				
				segmentLabels[segItems['@graph'][i]['@id']] = segItems['@graph'][i][prefix.rdfs+"label"];
			}
		}
		this.setState({iterations:iterations, segmentLabels: segmentLabels});
	}
	audioForMotif(motif){
		if(this.state.iterations){
			var motifInfo = this.state.iterations.find(x=>x['@id']===motif);
			if(motifInfo && motifInfo.embodimentLists.MP3.length) return motifInfo.embodimentLists.MP3[0];
			return false;
		} else {
			return false;
		}
	}
	librettoTextForMotif(motif, language){
		if(this.state.iterations && motif){
			var motifInfo = this.state.iterations.find(x=>x['@id']===motif);
			if(language) return motifInfo[language];
			var texts = {de: false, en:false};
			if(motifInfo && motifInfo.de) texts.de = motifInfo.de;
			if(motifInfo && motifInfo.en) texts.en = motifInfo.en;
			return texts;
		}
	}
	scoreMode(){
		this.setState({preferredView:'score'});
	}
	orchestrationMode(){
		this.setState({preferredView: 'orchestration'});
	}
	librettoMode(){
		this.setState({preferredView: 'libretto'});
	}
	textForMotif(motifname){
		
	}
	compareFromScratch(motifL, motifR){
		this.setState({mode: 'IterationCompare', currentMotif: [motifL, motifR]});
	}
	compareMotifs(motif){
		this.setState({mode: 'TimeMachine', submode: 'addRight', leftMotif: motif});
	}
	prepareForCompare(motif){
		this.setState({mode: 'readyForCompare', submode: 'addRight', leftMotif: motif});
	}
	compareRightMotif(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'TimeMachine', submode: 'addLeft', rightMotif: this.state.currentMotif[1]});
	}
	compareLeftMotif(e){
		var newMotif = Array.isArray(this.state.currentMotif) ? this.state.currentMotif[0] : this.state.currentMotif;
		if(e) e.stopPropagation();
		this.setState({mode: 'TimeMachine', submode: 'addRight', leftMotif: newMotif});
	}
	compareCollapseViaTM(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'TimeMachine', submode: 'replaceSingle', currentMotif: this.state.currentMotif[0]});
	}
	returnToInspect(e){
		if(e) e.stopPropagation();
		var newMotif = Array.isArray(this.state.currentMotif) ? this.state.currentMotif[0] : this.state.currentMotif;
		this.setState({mode: 'IterationInspect', submode: false, currentMotif: newMotif});
	}
	inspectMotif(motif, highlight){
		if(highlight){
			this.setState({mode: 'IterationInspect', submode: false, currentMotif: motif, highlight: highlight});
		} else {
			this.setState({mode: 'IterationInspect', submode: false, currentMotif: motif});
		}
	}
	swapMotif(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'TimeMachine', submode: 'replaceSingle'});
	}
	essayMode(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'Essay'});
	}
	homeMode(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'Home'});
	}
	introMode(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'Intro'});
	}
	aboutMode(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'About'});
	}
	videoMode(e){
		if(e) e.stopPropagation();
		this.setState({mode: 'Video'});
	}
	toggleLanguage(e){
		if(e) e.stopPropagation();
		this.setState({language: (this.state.language==='de' ? 'en' : 'de')});
	}
	showTranslation(e){
		if(e) e.stopPropagation();
		this.setState({showTranslation: true});
	}
	hideTranslation(e){
		if(e) e.stopPropagation();
		this.setState({showTranslation: false});
	}
	render() { 
		// Build an array of JSX objects corresponding to the annotation
		// targets in our topLevel
		if(!this.state.iterations) return (<div className="wrapper">Loading...</div>);
		var current = this.state.currentMotif || 'https://meld.linkedmusic.org/companion/F1';
		//		var mode = this.state.mode || this.props.route.mode || 'Home'; //IterationInspect';
		var mode = this.state.mode || 'Home'; //IterationInspect';
		var view = this.state.preferredView || 'score';
		var popup = null;
		var commentaryuri, audiouri, miInfo, language, lib, liblang;
		if(this.state.popup) {
//			console.log("pop");
			popup = <Popup key={this.state.popup} uris={this.state.popup.split(' ')}/>;
		}
//		if(this.props.route.mode=="TimeMachine" || this.state.mode=="TimeMachine"){
		if(mode==="TimeMachine"){
			if(Array.isArray(current)){
				if(this.state.submode === 'addLeft'){
					current=current[0];
				} else if (this.state.submode === 'addRight'){
					current=current[1];
				}
			}
			commentaryuri = this.commentaryForMotif(current);
			audiouri = this.audioForMotif(current);
			return (
				<div className="wrapper" onClick={this.clearAllPopups.bind(this)}>
					<Burger className="burg" id="theburg" TM={function(e){e.stopPropagation(); return;}}
									isOpen={false} video={this.videoMode.bind(this)} Home={this.homeMode.bind(this)} about={this.aboutMode.bind(this)}
									iteration={this.returnToInspect.bind(this)} essay={this.essayMode.bind(this)}/>
					<div className="topMenu">
						<div className="title"><div className="icon timemachine"><img alt="Interactive timeline of the opera" src="/style/icons/timemachine.svg"/></div><span>{this.state.submode==='addLeft' || this.state.submode==='addRight' ? 'Choose an iteration to compare...' : 'Time Machine'}</span></div>
						<div className="optionBlock">
							{view==='score'
								? <div className='option active'>Vocal Score</div>
							: <div className='option clickable' onClick={this.scoreMode.bind(this)}>Vocal Score</div>}
							<div className='separator'/>
							{view==='orchestration'
								? <div className='option active'>Orchestration</div>
							: <div className='option clickable' onClick={this.orchestrationMode.bind(this)}>Orchestration</div>}
							<div className='separator'/>
							<div className={view==='libretto' ?  'option active'
									 : 'option clickable' } onClick={this.librettoMode.bind(this)}>Poem</div>
						</div>
					</div>
					  <MEICarousel motif={current} view={view}
				                 onMotifChange={this.handleMotifChange.bind(this)}
												 TMClick={this.handleTMClick.bind(this)}
												 segmentLabels={this.state.segmentLabels}
// 												 position={this.props.location.query.position}
// 												 supplements={this.props.location.query.supplements}
												 iterations={this.state.iterations}
 												 layout="classic"/>
						<div className="TMcommentary carousel dark" onClick={this.commentaryClicked.bind(this)}>
							{commentaryuri ?
							 <TEI key={ commentaryuri } uri={ commentaryuri } motif={ current } 
//							 handleTEIRef={this.showPopup.bind(this)}
											 title={"Commentary"}/>
								: <div className="emptyCommentary"/>}
								{audiouri ?
									<Media key={ audiouri }>
												<div className="media">
														<div className="media-player">
																<Player src={audiouri}/>
															</div>
															<div className="media-controls">
																	<CustomPlayPause/>
																		<SeekBar/>
																			<div className="media-info">
																					<CurrentTime/>
																						<span>/</span>
																							<Duration/>
																				</div>
																</div>
													</div>
										</Media>
									: <div className="noMedia"/> }
								</div>
						<div className="timelineFooter">
							<MEITimeline key="UniqueTimeline"
													 // height={Math.max(this.state.height - 790, 150)}
													 height={167}
													 width={this.state.width -40}
													 structures={lohengrinStructures}
													 foostructures={MEITimeline.defaultStructures}
													 onMotifChange={this.handleMotifChange.bind(this)}
													 motif={current}
													 iterations={this.state.iterations}
													 />
						</div>
					{popup}
				</div>
			);					
		} else if(mode==="IterationInspect") {
			if(Array.isArray(current)) {
				current = current[0];
			}
			commentaryuri = this.commentaryForMotif(current);
			audiouri = this.audioForMotif(current);
			miInfo = this.state.iterations ? this.state.iterations.find(x=>x['@id']===current) : false;
			language = this.state.language ? this.state.language : 'en';
			//			console.log(this.state.iterations, current, miInfo, miInfo[prefix.compVocab+'hasOrchestrationDescription']);
			lib = this.librettoTextForMotif(current);
			liblang = lib[language];
			if(miInfo){
				return (
					<div className="wrapper" onClick={this.clearAllPopups.bind(this)}>
						<Burger className="burg" id="theburg" iteration={function(){return}} isOpen={false} video={this.videoMode.bind(this)}
										TM={this.swapMotif.bind(this)} essay={this.essayMode.bind(this)} Home={this.homeMode.bind(this)} about={this.aboutMode.bind(this)}/>
						<div className="topMenu">
							<div className="title"><div className="icon timemachine"><img alt="" src="/style/icons/iteration.svg"/></div><span>Iteration</span></div>
							<div className="optionBlock">
								<div className="option active">Inspect</div>
								<div className='separator'/>
								<div className="option clickable" onClick={this.prepareForCompare.bind(this, current)}>Compare</div>	
							</div>
						</div>
						<div className="inspectorwrapper wrapper">
							<div className="motifHead">
								<div className="motifName">{miInfo['http://www.w3.org/2000/01/rdf-schema#label']}</div>
								– <span className="key">{keyString(miInfo)}</span>
								<span className="form">( {formString(miInfo, this.state.segmentLabels)} )</span>
								<div className="motifPicker" onClick={this.swapMotif.bind(this)}>Change motif
									iteration</div>
							</div>
							<InspectPane motifs={current} view={view} position="left"
													 hasPlayer={true}
													 toggleLanguage={this.toggleLanguage.bind(this)}
													 language={language}
													 toggleCommentary={this.toggleLCommentary.bind(this)}
													 orchestrationProse={miInfo[prefix.compVocab+'hasOrchestrationDescription'] ? miInfo[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
													 audiouri={audiouri}
													 annotations={this.props.graph.outcomes && this.props.graph.outcomes.length
																				&& '@graph' in this.props.graph.outcomes[0] ? this.props.graph.outcomes[0]['@graph'] : false}
													 segments={miInfo.segmentLineMembers}
													 segmentLabels={this.state.segmentLabels}
													 showTranslation={this.showTranslation.bind(this)}
													 hideTranslation={this.hideTranslation.bind(this)}
													 showEnglish={this.state.showTranslation}
													 librettoTexts={lib}
													 highlight={this.state.highlight}
													 libretto={lib ? (Array.isArray(liblang) ? liblang[0] : liblang) : false}
													 orchestralScore={miInfo.orchestralScore}
					                 vocalScore={miInfo.vocalScore}
                  				 details={miInfo}
													 height={this.state.height - 84 - 197}
													 width={this.state.width*0.4}/>
								<InspectPane motifs={current} position="right"
														 hasPlayer={false}
														 toggleLanguage={this.toggleLanguage.bind(this)}
														 language={language}
														 annotations={this.props.graph.outcomes && this.props.graph.outcomes.length
																					&& '@graph' in this.props.graph.outcomes[0] ? this.props.graph.outcomes[0]['@graph'] : false}
														 highlight={this.state.highlight}
														 segments={miInfo.segmentLineMembers}
														 segmentLabels={this.state.segmentLabels}
														 showTranslation={this.showTranslation.bind(this)}
														 hideTranslation={this.hideTranslation.bind(this)}
														 showEnglish={this.state.showTranslation}
														 librettoTexts={lib}
														 libretto={lib ? (Array.isArray(liblang) ? liblang[0] : liblang) : false}
														 orchestralScore={miInfo.orchestralScore}
														 orchestrationProse={miInfo[prefix.compVocab+'hasOrchestrationDescription']
														   ? miInfo[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
														 vocalScore={miInfo.vocalScore}
														 height={this.state.height -84 -197}
														 width={this.state.width*0.4}
                             details={miInfo}
														 commentary={this.state.showCommentaryL && commentaryuri ?
																				 <div className="inspect commentary dark"  onClick={this.commentaryClicked.bind(this)}>
																					 <TEI key={ commentaryuri } showAnnotations={false} 
																									 onClick={function(e){console.log('ok', e.target)}}
//																								handleTEIRef={this.showPopup.bind(this)}
																									uri={ commentaryuri } motif={ current }/>
																				 </div>
																			 : false}/>
							<div className="timelineFooter">
								<MEITimeline key="UniqueTimeline"
														 // height={Math.max(this.state.height - 790, 150)}
														 height={167}
														 width={this.state.width - 40}
														 structures={lohengrinStructures}
														 foostructures={MEITimeline.defaultStructures}
														 onMotifChange={this.handleMotifChange.bind(this)}
														 motif={current}
														 iterations={this.state.iterations}
														 />
							</div>
							{popup}
						</div>
					</div>
				);
			} else {
				return (
					<div>Loading data...</div>
				);
			}
		} else if(mode==="readyForCompare") {
			commentaryuri = this.commentaryForMotif(current);
			audiouri = this.audioForMotif(current);
			miInfo = this.state.iterations ? this.state.iterations.find(x=>x['@id']===current) : false;
			language = this.state.language ? this.state.language : 'en';
			//			console.log(this.state.iterations, current, miInfo, miInfo[prefix.compVocab+'hasOrchestrationDescription']);
			lib = this.librettoTextForMotif(current);
			liblang = lib[language];
			if(miInfo){
				return (
					<div className="wrapper">
						<Burger className="burg" id="theburg" iteration={function(){return}} isOpen={false} video={this.videoMode.bind(this)} Home={this.homeMode.bind(this)} about={this.aboutMode.bind(this)}
										TM={this.swapMotif.bind(this)} essay={this.essayMode.bind(this)}/>
						<div className="topMenu">
							<div className="title"><div className="icon timemachine"><img alt="" src="/style/icons/iteration.svg"/></div><span>Iteration</span></div>
							<div className="optionBlock">
								<div className="option clickable" onClick={this.returnToInspect.bind(this)}>Inspect</div>
								<div className='separator'/>
								<div className="option active">Compare</div>	
							</div>
						</div>
						<div className="inspectorwrapper wrapper">
							<div className="motifHead">
								<div className="motifName">{miInfo['http://www.w3.org/2000/01/rdf-schema#label']}</div>
								– <span className="key">{keyString(miInfo)}</span>
								<span className="form">( {formString(miInfo, this.state.segmentLabels)} )</span>
								<div className="motifPicker" onClick={this.swapMotif.bind(this)}>Change motif
									iteration</div>
							</div>
							<InspectPane motifs={current} view={view} position="left"
													 hasPlayer={true}
													 toggleLanguage={this.toggleLanguage.bind(this)}
													 language={language}
													 toggleCommentary={this.toggleLCommentary.bind(this)}
													 orchestrationProse={miInfo[prefix.compVocab+'hasOrchestrationDescription'] ? miInfo[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
													 audiouri={audiouri}
													 annotations={this.props.graph.outcomes[0]['@graph']}
													 segments={miInfo.segmentLineMembers}
													 segmentLabels={this.state.segmentLabels}
													 showTranslation={this.showTranslation.bind(this)}
													 hideTranslation={this.hideTranslation.bind(this)}
													 highlight={this.state.highlight}
													 showEnglish={this.state.showTranslation}
													 librettoTexts={lib}
													 libretto={lib ? (Array.isArray(liblang) ? liblang[0] : liblang) : false}
													 orchestralScore={miInfo.orchestralScore}
					                 vocalScore={miInfo.vocalScore}
                  				 details={miInfo}
													 height={this.state.height - 84 - 197}
													 width={this.state.width*0.4}
													 commentary={this.state.showCommentaryL && commentaryuri ?
																			 <div className="inspect commentary dark"  onClick={this.commentaryClicked.bind(this)}>
																				 <TEI key={ commentaryuri } showAnnotations={false} 
																									uri={ commentaryuri } motif={ current }/>
																				 </div>
																			 : false}/>
							<div className="blankPane right inspector" onClick={this.compareMotifs.bind(this, current)}>
								<div className="caption">
									+
									<p>Add a Motif Iteration to compare from the Time Machine</p>
								</div>
							</div>
							<div className="timelineFooter">
								<MEITimeline key="UniqueTimeline"
														 // height={Math.max(this.state.height - 790, 150)}
														 height={167}
														 width={this.state.width - 40}
														 structures={lohengrinStructures}
														 foostructures={MEITimeline.defaultStructures}
														 onMotifChange={this.handleMotifChange.bind(this)}
														 motif={current}
														 iterations={this.state.iterations}
														 />
							</div>
						</div>
					</div>
				);
			} else {
				return (
					<div>Loading data...</div>
				);
			}
		} else if(mode==="IterationCompare") {
			var miInfoL = this.state.iterations ? this.state.iterations.find(x=>x['@id']===current[0]) : false;
			var miInfoR = this.state.iterations ? this.state.iterations.find(x=>x['@id']===current[1]) : false;
			var commentaryuriL = this.commentaryForMotif(current[0]);
//			console.log(commentaryuriL, current[0]);
			var audiouriL = this.audioForMotif(current[0]);
			var commentaryuriR = this.commentaryForMotif(current[1]);
			var audiouriR = this.audioForMotif(current[1]);
			language = this.state.language ? this.state.language : 'en';			
			var libforL = this.librettoTextForMotif(current[0]);
			var libforR = this.librettoTextForMotif(current[1]);
			// var libforL = this.librettoTextForMotif(current[0], language);
			// var libforR = this.librettoTextForMotif(current[1], language);
//			if(libforL && Array.isArray(libforL)) libforL = libforL[0];
//			if(libforR && Array.isArray(libforR)) libforR = libforR[0];
			if(miInfoL && miInfoR){
				return (
					<div className="wrapper" onClick={this.clearAllPopups.bind(this)}>
						<Burger className="burg" id="theburg"
										// iteration={function(){return;}}
										iteration={this.returnToInspect.bind(this)}
										isOpen={false} video={this.videoMode.bind(this)}
										essay={this.essayMode.bind(this)}
										// TM={this.compareRightMotif.bind(this)}
										// TM={this.swapMotif.bind(this)}
										TM={this.compareCollapseViaTM.bind(this)}
										Home={this.homeMode.bind(this)} about={this.aboutMode.bind(this)}/>
						<div className="topMenu">
							<div className="title"><div className="icon timemachine"><img alt="" src="/style/icons/iteration.svg"/></div><span>Iteration</span></div>
							<div className="optionBlock">
								<div className="option clickable" onClick={this.returnToInspect.bind(this)}>Inspect</div>
								<div className='separator'/>
								<div className="option active">Compare</div>							
							</div>
						</div>
						<div className="inspectorwrapper wrapper">
							<div className="motifHead left">
								<div className="motifName">{miInfoL['http://www.w3.org/2000/01/rdf-schema#label']}</div>
								<div className="motifPicker"
										 onClick={this.compareRightMotif.bind(this)}
										 >Change motif iteration</div>
							</div>
							<div className="motifHead right">
								<div className="motifName">{miInfoR['http://www.w3.org/2000/01/rdf-schema#label']}</div>
								<div className="motifPicker"
										 onClick={this.compareLeftMotif.bind(this)}
										 >Change motif iteration</div>
							</div>
							<InspectPane motif={current} view={view} position="left"
													 hasPlayer={true}
													 orchestralScore={miInfoL.orchestralScore}
													 vocalScore={miInfoL.vocalScore}
													 height={this.state.height - 84 - 197}
													 annotations={this.props.graph.outcomes[0]['@graph']}
													 segments={miInfoL.segmentLineMembers}
													 segmentLabels={this.state.segmentLabels}
													 width={this.state.width*0.4}
													 toggleLanguage={this.toggleLanguage.bind(this)}
													 showTranslation={this.showTranslation.bind(this)}
													 hideTranslation={this.hideTranslation.bind(this)}
													 language={language}
//													 libretto={libforL}
													 librettoTexts={libforL}
													 showEnglish={this.state.showTranslation}
													 details={miInfoL}
													 toggleCommentary={this.toggleLCommentary.bind(this)}
													 audiouri={audiouriL}
													 orchestrationProse={miInfoL[prefix.compVocab+'hasOrchestrationDescription'] ? miInfoL[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
													 highlight={this.state.highlight}
													 commentary={this.state.showCommentaryL && commentaryuriL ?
																			 <div className="inspect commentary dark"  onClick={this.commentaryClicked.bind(this)}>
																				 <TEI key={ commentaryuriL } annotations={[]}
																									uri={ commentaryuriL } motif={ current[0] }/>
																				 </div>
																			 : false}/>
								<InspectPane motif={current} position="right"
														 hasPlayer={true} view={view}
														 orchestralScore={miInfoR.orchestralScore}
														 vocalScore={miInfoR.vocalScore}
														 height={this.state.height - 84 - 197}
														 width={this.state.width*0.4}
														 highlight={this.state.highlight}
														 toggleLanguage={this.toggleLanguage.bind(this)}
														 showTranslation={this.showTranslation.bind(this)}
														 hideTranslation={this.hideTranslation.bind(this)}
														 segments={miInfoR.segmentLineMembers}
														 segmentLabels={this.state.segmentLabels}
														 language={language}
														 annotations={this.props.graph.outcomes[0]['@graph']}
														 librettoTexts={libforR}
														 showEnglish={this.state.showTranslation}
//														 libretto={libforR}
														 details={miInfoR}
														 toggleCommentary={this.toggleRCommentary.bind(this)}
														 audiouri={audiouriR}
														 orchestrationProse={miInfoR[prefix.compVocab+'hasOrchestrationDescription'] ? miInfoR[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
														 commentary={this.state.showCommentaryR ?
																			 <div className="inspect commentary dark"  onClick={this.commentaryClicked.bind(this)}>
																				 <TEI key={ commentaryuriR } annotations={[]}
																									uri={ commentaryuriR } motif={ current[1] }/>
																				 </div>
																			 : false}/>
								{false ? <div className="inspectCommentary right">
									<Media key={ audiouriR }>
										<div className="media">
											<div className="media-player">
												<Player src={audiouriR}/>
											</div>
											<div className="media-controls">
												<CustomPlayPause/>
												<SeekBar/>
												<div className="media-info">
													<CurrentTime/>
													<span>/</span>
													<Duration/>
												</div>
											</div>
										</div>
									</Media>
									<button onClick={this.toggleRCommentary.bind(this)}
													className="commentaryToggleButton">Commentary</button>
								</div> : false }
							<div className="timelineFooter">
								<MEITimeline key="UniqueTimeline"
														 // height={Math.max(this.state.height - 790, 150)}
														 height={167}
														 width={this.state.width - 40}
														 structures={lohengrinStructures}
														 foostructures={MEITimeline.defaultStructures}
														 onMotifChange={this.handleTimelineClickInCompare.bind(this)}
														 motif={current}
														 iterations={this.state.iterations}
														 />
							</div>
							{popup}
						</div>
					</div>
				);
			} else {
				return (
					<div>Loading data...</div>
				);
			}
		} else if(mode==="Essay"){
			return (
				<div className="wrapper essay">
					<Burger className="burg" id="theburg"  essay={function(){return}} isOpen={false} video={this.videoMode.bind(this)}
									iteration={this.returnToInspect.bind(this)}
									TM={this.swapMotif.bind(this)} Home={this.homeMode.bind(this)} about={this.aboutMode.bind(this)}/>
					<div className="topMenu">
						<div className="title"><div className="icon essay"><img alt="" src="/style/icons/essay.svg"/></div><span>Essay</span></div>
					</div>
					<Essay current={ current } updateLinks={ this.setVisibleLinks.bind(this) }
					       uri={"/Essay/AskingAForbiddenQuestion.tei"}/>
					<EssayLinks visible={ this.state.visibleLinks }
											advanceTime={this.waiter.bind(this)}
											iterations={ this.state.iterations }
											inspectFun={ this.inspectMotif.bind(this) }/>
					<div className="timelineFooter">
						<MEITimeline key="UniqueTimeline"
												 // height={Math.max(this.state.height - 790, 150)}
												 height={167}
												 width={this.state.width -40}
												 structures={lohengrinStructures}
												 foostructures={MEITimeline.defaultStructures}
												 onMotifChange={this.inspectMotif.bind(this)}
												 motif={current}
													 iterations={this.state.iterations}
												 />
					</div>					
				</div>
				
			)
		} else if(mode==="Video"){
			return (
				<div className="wrapper essay">
					<Burger className="burg" id="theburg"  essay={this.essayMode.bind(this)} isOpen={false} video={()=>null}  Home={this.homeMode.bind(this)} about={this.aboutMode.bind(this)}
									iteration={this.returnToInspect.bind(this)}
									TM={this.swapMotif.bind(this)}/>
					<div className="topMenu">
						<div className="title"><div className="icon essay"><img alt="" src="/style/icons/video.svg"/></div><span>Video</span></div>
					</div>
					<Video current={ current } uri={VIDEOURI}/>
					<VideoLinks uri={VIDEOURI}
					            iterations={this.state.iterations} inspectMotive={this.inspectMotif.bind(this)}
											timeMachine={this.swapMotif.bind(this)}
											compare={this.compareFromScratch.bind(this)}
											/>
					<div className="timelineFooter">
						<MEITimeline key="UniqueTimeline"
												 // height={Math.max(this.state.height - 790, 150)}
												 height={167}
												 width={this.state.width -40}
												 structures={lohengrinStructures}
												 foostructures={MEITimeline.defaultStructures}
												 onMotifChange={this.inspectMotif.bind(this)}
												 motif={current}
													 iterations={this.state.iterations}
												 />
					</div>					
				</div>
				
			)
		} else if (mode==="Home"){
			var burg = (<Burger className="burg" id="theburg" iteration={this.inspectMotif.bind(this, current)} isOpen={false} video={this.videoMode.bind(this)} TM={this.swapMotif.bind(this)} essay={this.essayMode.bind(this)} Home={()=>null} about={this.aboutMode.bind(this)}/>);
			return (
				<Home burger={burg}
				      intro={this.introMode.bind(this)}
				      TM={this.swapMotif.bind(this)}
				      inspect={this.inspectMotif.bind(this, current)}
							video={this.videoMode.bind(this)}
							about={this.aboutMode.bind(this)}
							height={this.state.height}
							width={this.state.width}
				      essay={this.essayMode.bind(this)}/>
			);
		} else if(mode==="Intro"){
			return (
				<div className="intro">
					<div className="closeButton" onClick={this.homeMode.bind(this)}>Close</div>
					<div className="body">
						<div className="pre-intro">Asking the Forbidden Question</div>
						<h1>Introductory notes</h1>
						<p>This is some text</p>
						<h2>Credits</h2>
						<p>More text</p>
					</div>
				</div>
			)
		} else if(mode==="About"){
			return (
				<div className="intro">
					<div className="closeButton" onClick={this.homeMode.bind(this)}>Close</div>
					<div className="body">
						<div className="pre-intro">The Lohengrin TimeMachine</div>
						<h1>About</h1>
						<p>This prototype app was built as a part of the {' '}
							<a
								href="https://um.web.ox.ac.uk" target="_blank"
								rel="noopener noreferrer">Unlocking Musicology</a> {' '}
							project, in which Keven Page and David Lewis worked with four collaborative partners
						  to bring digital tools for musicology to a wider audience. This app, and its
							accompanying video are the result of one of these collaborations.
						</p>
						<h2>Instructions and caveats</h2>
						<p>The Lohengrin TimeMachine Digital Companion is a web-based application
							designed for touch-screen tablet devices. As a research prototype, it is
							intended to provide a preview demonstration of new technologies, and while
							every effort has been made to create a consistent user experience within
							the constraints of our small project, we cannot guarantee the robustness
							of the implementation or the absence of faults. Please note:</p>
						<ul>
							<li>The app has been tested on a third-generation (2018) 11-inch iPad Pro
							  using the Safari web browser. The app makes heavy use of this processor
							(A12X) and RAM (4GB) this tablet model provides.</li>
							<li>The app has been developed according to web standards, so should be usable
								on other web browsers, however this has not been extensively tested. Also note
								the hardware requirements above, which may limit the apps utility on lower
								specification devices; and that interactions have been designed assuming use
							of a touchscreen.</li>
							<li><b>Note that the app is slow to load - this can take a 1-2 minutes</b>, so
								please be patient! (For the technically interested: the app initialises by
								loading and walking the knowledge graph describing the musicological evidence,
							condensing this into a relatively large in-memory JSON data structures).</li>
							<li>If you are experiencing problems with the app, try clearing the Safari
							  browser copy of website data before reloading the app ("Clear History and Website Data"
							under Safari Settings).</li>
							<li>To add the Lohengrin TimeMachine as an app on your iPad home screen, first
								open the link below in the Safari browser, then tap on the ‘Share’ icon. Tap
								‘Add to Home Screen’, customise the link name (e.g. “Lohengrin Digital
							Companion”), and finish by tapping ‘Add’.</li>
							<li>Please email us on unlockingmusicology@gmail.com with comments regarding
								the content and visualisations within the app, or if you would like to collaborate
								with us on new applications of this technology. However, we are unable to provide
								general technical support for installing and running the app on alternative devices,
								and are unable to respond to queries of this nature.</li>
						</ul>
						<h2>Credits</h2>
						<p>The concept and execution of the Lohengrin TimeMachine prototype is by
							Laurence Dreyfus, David Lewis and Kevin Page, and the musicological content
							including commentary material, essay and video are all written
							by Prof. Dreyfus, who also presents the video.
						</p>
						<p>
							This research was funded by the UK Arts and Humanities Research Council
							through the Unlocking Musicology: Digital Engagement for Digital Research
							project (AH/R004803/1), Principal Investigator Dr Kevin Page, University
							of Oxford.
						</p>
						<p>
							The essay builds upon earlier collaboration in the Transforming
							Musicology project (AH/L006820/1) funded by the UK Arts and Humanities
							Research Council.
						</p>
						<p>
							The Lohengrin TimeMachine app uses the MELD (Music Encoding and Linked Data)
							framework developed at the University of Oxford e-Research Centre during the
							FAST IMPaCT project - Fusing Audio and Semantic Technologies for Intelligent
							Music. Production and Consumption project, funded by the UK Engineering and
							Physical Sciences Research Council under grant number EP/L019981/1, a
							collaboration between Queen Mary University of London, the University of
							Nottingham, and the University of Oxford. The code is available on{' '}
							<a href="https://github.com/oerc-music/meld" target="_blank"
								 rel="noopener noreferrer">GitHub</a>.
						</p>
						<div className="ackGroup">Additional acknowledgements:
							<ul>
								<li>David Weigl, MELD lead developer, University of Oxford, FAST project</li>
								<li>Carolin Rindfleisch, University of Oxford, Transforming Musicology project</li>
								<li>Will Elsom, TimeMachine App graphic design</li>
								<li>Ralph Woodward, music engraving</li>
								<li>FilmShed, video production</li>
							</ul>
						</div>
						<p>Our thanks to Magdalen College, and to its Informator Choristarum, Mark Williams,
							for the use of his rooms for filming.
						</p>
						<p>All in-app music examples are from Wiener Philharmoniker,
							Warner Classics (recorded 1964, remastered 2000): Rudolf Kempe (conductor); Jess Thomas (Lohengrin);
							Elisabeth Grümmer (Elsa); Christa Ludwig (Ortrud). In addition to these, the video
							includes clips from the Bayreuther Festspiel, 1954: Eugen Jochum (Conductor); Birgit Nilsson (Elsa)
						</p>
					</div>
				</div>
			)
		} else {
			return (
				<div>Loading...</div>
			);
		}
	}	
};
function typeTest(type, jldObj){
	if(jldObj['@type']){
		if(typeof(jldObj['@type'])==='string'){
			return jldObj['@type']===type;
		} else {
			return jldObj['@type'].indexOf(type)>-1;
		}
	} else 
		return false;
}
function JSONLDInt(obj){
	// FIXME: test type
	if(!obj || !('@value' in obj)) {
//		console.log('Missed for Object: ', obj);
		return 0;
	}
	return Number(obj['@value']);
}

function URIFragment(URIString){
	var result = /#(.*)$/.exec(URIString);
	if(result && result.length){
		return result[1];
	} else {
		return false;
	}
}

function keyString(iteration){
	if(iteration[prefix.mo+'key']){
		return URIFragment(iteration[prefix.mo+'key']['@id']).replace(/(.)([A-Z])/g, "$1 $2");
	} else {
		console.log('failed to get key for', iteration);
		return '';
	}
}

function formString(iteration, segmentLabels){
	return iteration.iterationSegments.map(x=>segmentLabels[x[prefix.frbr+'realizationOf']['@id']]).join('-')
}


function addEmbodimentToIteration(segmentEmbodiment, iteration){
	var members = segmentEmbodiment['http://www.w3.org/2000/01/rdf-schema#member'];
	var key;
	if(typeTest(TEIEm, segmentEmbodiment)){
		key = segmentEmbodiment['http://schema.org/inLanguage'] ? segmentEmbodiment['http://schema.org/inLanguage'] : 'de';
	} else if(typeTest(MEIEm, segmentEmbodiment)){
		key = 'MEI';
	} else if (typeTest(AuEm, segmentEmbodiment)){
		key = 'MP3';
	}
	var embodimentSet = new Set(iteration.embodimentLists[key]);
	if(members){
		if(Array.isArray(members)){
			var bits = segmentEmbodiment['http://www.w3.org/2000/01/rdf-schema#member'].map((x)=>x['@id']);
			if(bits){
				bits.forEach(bit=>embodimentSet.add(bit.split('#')[0]));
			}
		} else if(members['@id']){
			embodimentSet.add(members['@id'].split('#')[0]);
		}
	}
	iteration.embodimentLists[key] = Array.from(embodimentSet);
}

function mapStateToProps({ graph , score, objectives, timesync, traversalPool}) {
  return { graph , score , objectives , timesync, traversalPool } ;
}

function mapDispatchToProps(dispatch) { 
  return bindActionCreators({ registerTraversal, traverse,
															setTraversalObjectives,
															checkTraversalObjectives }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);
