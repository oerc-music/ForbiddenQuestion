import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import { registerTraversal, traverse, setTraversalObjectives, checkTraversalObjectives } from 'meld-clients-core/src/actions/index';
import MediaPlayer from '../components/mediaPlayer';
import AudioPlayer from '../components/audioPlayer';
import { Media, Player, controls, utils } from 'react-media-player';
const { defaultPlayPause, CurrentTime, Progress, SeekBar, Duration, MuteUnmute, Volume, Fullscreen } = controls;
import CustomPlayPause from '../containers/react-media-player-play-pause';
//import { projectAnnotations } from '../actions/graph.js';
const { formatTime } = utils;
import {prefix} from 'meld-clients-core/src/library/prefixes';

//import Score from 'meld-client/src/containers/score';
import Score from '../containers/score';
import Burger from '../containers/burger';
import InspectPane from '../containers/inspect';
import OrchestralRibbon from '../containers/orchestralRibbon';
//import TEI from '../containers/tei';
import TEI from 'meld-clients-core/src/containers/tei';
import MyImage from 'meld-clients-core/src/containers/image';
import MEICarousel from '../containers/new-carousel';
import MEITimeline from '../containers/timeline';
import Essay from '../containers/essay';
import EssayLinks from '../containers/essayLinks';
import TwinControls from '../containers/controls';
import SingleControls from '../containers/single-view-controls';
//import { fetchGraph } from 'meld-clients-core/src/actions/index';

const MEIManifestation = prefix.meldterm+"MEIManifestation";
const MEIEm = "https://meld.linkedmusic.org/terms/MEIEmbodiment";
const TEIEm = "https://meld.linkedmusic.org/terms/TEIEmbodiment";
const TEIM = "https://meld.linkedmusic.org/terms/TEIManifestation";
const TEIManifestation = prefix.meldterm+"TEIManifestation";
const IIIFManifestation = prefix.meldterm+"IIIFManifestation";
const VideoManifestation = prefix.meldterm+"VideoManifestation";
const AudioManifestation = prefix.meldterm+"AudioManifestation";
const AuEm = prefix.meldterm+"AudioEmbodiment";
const ImageManifestation = prefix.meldterm+"ImageManifestation";
const Carousel= prefix.meldterm+"MEICarousel";
const CarouselClassic= "meldterm:MEIClassicCarousel";
const FOR_ORCHESTRA = "http://id.loc.gov/authorities/performanceMediums/2013015516";
const HAS_PIANO = "http://id.loc.gov/authorities/performanceMediums/2013015550";
const MAX_TRAVERSERS = 30;

const donotfollow = ["https://meld.linkedmusic.org/terms/",
										 "https://meld.linkedmusic.org/annotations/AskingForbi",
										 "https://meld.linkedmusic.org/companion/lyr",
										 "https://meld.linkedmusic.org/companion/3",
										 "https://meld.linkedmusic.org/companion/1",
										 "https://meld.linkedmusic.org/companion/0",
										 "https://meld.linkedmusic.org/companion/2",
										 "https://meld.linkedmusic.org/annotations/",
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
			showCommentaryL: false,
			showCommentaryR: false,
			language: 'en',
			visibleLinks: []
		};
  }
  
  componentDidMount() {
		if(this.props.graphUri || this.props.route.graphUri) { 
			const graphUri = (this.props.graphUri || this.props.route.graphUri );
			this.props.registerTraversal(graphUri,
																	 {numHops: 3,
																		objectPrefixWhitelist: ["https://meld.linkedmusic.org", "http://localhost"],
																		objectPrefixBlacklist: donotfollow,
																		propertyPrefixBlacklist: ["http://www.linkedmusic.org/ontologies/segment/"],
																		objectBlacklistTest: avoidThesePatterns
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
			// {
			// 	"@type": "http://www.w3.org/ns/oa#Annotation"
			// },
			{
				"@type": "https://meld.linkedmusic.org/companion/vocab/MotifIteration"/*,
				"http://purl.org/vocab/frbr/core#part": {
					
				 },
				 "https://meld.linkedmusic.org/companion/vocab/hasContext": {
				 }*/
			},
			{
				"@type": "https://www.linkedmusic.org/ontologies/segment/Segment",
			},
			// {
			// 	"@type": "https://meld.linkedmusic.org/terms/MEIManifestation"
			// },
			// {
			// 	"@type": "https://meld.linkedmusic.org/terms/TEIManifestation"
			// },
			// {
			// 	"@type": "https://meld.linkedmusic.org/companion/vocab/MotifIterationContext",
			// },
			{
				"@type": "https://meld.linkedmusic.org/companion/vocab/MotifSegment"
			}
		]);
    this.updateDimensions();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
	commentaryForMotif(motif){
		if(this.state.iterations){
			var motifInfo = this.state.iterations.find(x=>x['@id']==motif);
			if(motifInfo) return motifInfo.commentary;
			return false;
		} else {
			return false;
		}
	}
	componentDidUpdate(prevProps, prevState){
//		console.log('updating');
		if(prevProps && "graph" in prevProps) {
//			console.log('updating');
			if(prevProps.traversalPool.running == 1 && this.props.traversalPool.running ==0){
				// check our traversal objectives if the graph has updated
//				if(prevProps.graph.graph.length !== this.props.graph.graph.length) {
				//					console.log('checking graph');
				// console.log(this.props.graph.graph.length)
				if(this.props.graph.graph.length<400) return;
				console.log("updating – it's finished traversing");
				this.props.checkTraversalObjectives(this.props.graph.graph, this.props.graph.objectives);
				return;
				//				}
				if(prevProps.graph.outcomesHash !== this.props.graph.outcomesHash) {
//					console.log('rebuilding structures');
					// outcomes have changed, need to update our projections!
					this.updateLists();
				} else {
				}
			} else if(Object.keys(this.props.traversalPool.pool).length && this.props.traversalPool.running < MAX_TRAVERSERS){
				var uri = Object.keys(this.props.traversalPool.pool)[0];
				this.props.traverse(uri, this.props.traversalPool.pool[uri]);
			} else if(this.props.traversalPool.running===0){
				if(prevProps.graph.outcomesHash !== this.props.graph.outcomesHash) {
//					console.log('rebuilding structures');
					// outcomes have changed, need to update our projections!
					this.updateLists();
				} else {
				}
//				console.log("done?");
//				console.log(prevProps.traversalPool);				
			}
		}
	}
	matchSegment(target){
		return segment=>segment['@id']===target['@id'];
	}
	toggleLCommentary(){
		this.setState({showCommentaryL: !this.state.showCommentaryL});
	}
	toggleRCommentary(){
		this.setState({showCommentaryR: !this.state.showCommentaryR});
	}
	updateLists(){
		var annot, mi, seg, meis, teis, mic, segItems;
		const POF = "http://purl.org/vocab/frbr/core#part";
		const ASSOC = "http://example.com/must-revisit-these/associatedWith";
		const EMBOD = "http://purl.org/vocab/frbr/core#embodiment";
		console.log("updating lists", this.props.graph.outcomes.map(x=>x['@graph']));
		if(Object.keys(this.props.graph.outcomes).length< this.props.graph.outcomes.length){
			// Still processing objectives
			return;
		}
		// [mi, seg, meis, teis, segItems] = this.props.graph.outcomes;
		[mi, seg, segItems] = this.props.graph.outcomes;
		if(!mi || !seg || !mi['@graph'].length || !seg['@graph'].length) {
			return;
		} else {
		}
		var iterations = mi['@graph'].slice(0).sort((x, y) =>
																								(JSONLDInt(y[prefix.meld+'actNumber'])< JSONLDInt(x[prefix.meld+'actNumber']))
																								|| (JSONLDInt(x[prefix.meld+'actNumber']) == JSONLDInt(y[prefix.meld+'actNumber'])
																										&& JSONLDInt(y[prefix.meld+'barNumberInAct']) < JSONLDInt(x[prefix.meld+'barNumberInAct'])));
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
				if(context[EMBOD]){
					mii.embodiments = Array.isArray(context[EMBOD]) ? context[EMBOD] : [context[EMBOD]];
				}
			} 
			if(mii.embodiments){
				for(var emi=0; emi<mii.embodiments.length; emi++){
					if(mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']
						 && mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']['@id']==FOR_ORCHESTRA){
						mii.orchestralScore = mii.embodiments[emi]['@id'];
					} else if(mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215'] && mii.embodiments[emi]['http://rdaregistry.info/Elements/e/p20215']['@id']==HAS_PIANO){
						mii.vocalScore = mii.embodiments[emi]['@id'];
					}	else if(mii.embodiments[emi]['@type']=="https://meld.linkedmusic.org/terms/TEIEmbodiment"
									  && mii.embodiments[emi]['http://schema.org/inLanguage']=='de') {
						mii.de = mii.embodiments[emi]['@id'];
					} else if(mii.embodiments[emi]['@type']=="https://meld.linkedmusic.org/terms/TEIEmbodiment"
									  && mii.embodiments[emi]['http://schema.org/inLanguage']=='en') {
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
						if(!sls && partel && partel['@id'].indexOf('-') > -1) console.log('fail', partel['@id'], seg);
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
			var motifInfo = this.state.iterations.find(x=>x['@id']==motif);
			if(motifInfo && motifInfo.embodimentLists.MP3.length) return motifInfo.embodimentLists.MP3[0];
			return false;
		} else {
			return false;
		}
	}
	librettoTextForMotif(motif, language){
		if(this.state.iterations && motif){
			var motifInfo = this.state.iterations.find(x=>x['@id']==motif);
//			console.log(motifInfo, '----------------------');
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
	compareMotifs(motif){
		this.setState({mode: 'TimeMachine', submode: 'addRight', leftMotif: motif});
	}
	compareRightMotif(){
		this.setState({mode: 'TimeMachine', submode: 'addLeft', rightMotif: this.state.currentMotif[1]});
	}
	compareLeftMotif(){
		this.setState({mode: 'TimeMachine', submode: 'addRight', leftMotif: this.state.currentMotif[0]});
	}
	returnToInspect(){
		console.log(this.state);
		this.setState({mode: 'IterationInspect', submode: false, currentMotif: this.state.currentMotif[0]});
	}
	inspectMotif(motif){
		console.log(this, motif);
		this.setState({mode: 'IterationInspect', submode: false, currentMotif: motif});
	}
	swapMotif(){
		this.setState({mode: 'TimeMachine', submode: 'replaceSingle'});
	}
	essayMode(){
		this.setState({mode: 'Essay'});
	}
	toggleLanguage(){
		this.setState({language: (this.state.language=='de' ? 'en' : 'de')});
	}
	render() { 
		// Build an array of JSX objects corresponding to the annotation
		// targets in our topLevel
		if(!this.state.iterations) return (<div className="wrapper">Loading...</div>);
		var current = this.state.currentMotif || 'https://meld.linkedmusic.org/companion/F1';
		var mode = this.state.mode || this.props.route.mode || 'IterationInspect';
		var view = this.state.preferredView || 'score';
//		if(this.props.route.mode=="TimeMachine" || this.state.mode=="TimeMachine"){
		if(mode=="TimeMachine"){
			if(Array.isArray(current)){
				if(this.state.submode == 'addLeft'){
					current=current[0];
				} else if (this.state.submode == 'addRight'){
					current=current[1];
				}
			}
			var commentaryuri = this.commentaryForMotif(current);
			var audiouri = this.audioForMotif(current);
			return (
				<div className="wrapper">
					<Burger className="burg" id="theburg" TM={function(){return}} isOpen={false}
									iteration={this.returnToInspect.bind(this)} essay={this.essayMode.bind(this)}/>
					<div className="topMenu">
						<div className="title"><div className="icon timemachine"><img src="/style/icons/timemachine.svg"/></div>Time Machine</div>
						<div className="optionBlock">
							{view=='score'
								? <div className='option active'>Vocal Score</div>
							: <div className='option clickable' onClick={this.scoreMode.bind(this)}>Vocal Score</div>}
							<div className='separator'/>
							{view=='orchestration'
								? <div className='option active'>Orchestration</div>
							: <div className='option clickable' onClick={this.orchestrationMode.bind(this)}>Orchestration</div>}
							<div className='separator'/>
							<div className={view=='libretto' ?  'option active'
									 : 'option clickable' } onClick={this.librettoMode.bind(this)}>Poem</div>
						</div>
					</div>
					  <MEICarousel motif={current} view={view}
				                 onMotifChange={this.handleMotifChange.bind(this)}
												 TMClick={this.handleTMClick.bind(this)}
												 segmentLabels={this.state.segmentLabels}
 												 position={this.props.location.query.position}
 												 supplements={this.props.location.query.supplements}
												 iterations={this.state.iterations}
 												 layout="classic"/>
						<div className="TMcommentary carousel dark">
							{commentaryuri ?
								<TEI key={ commentaryuri } uri={ commentaryuri } motif={ current }
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
					</div>
			);					
		} else if(mode=="IterationInspect") {
			var commentaryuri = this.commentaryForMotif(current);
			var audiouri = this.audioForMotif(current);
			var miInfo = this.state.iterations ? this.state.iterations.find(x=>x['@id']==current) : false;
			var language = this.state.language ? this.state.language : 'en';
//			console.log(this.state.iterations, current, miInfo, miInfo[prefix.compVocab+'hasOrchestrationDescription']);
			if(miInfo){
				return (
					<div className="wrapper">
						<Burger className="burg" id="theburg" iteration={function(){return}} isOpen={false}
										TM={this.swapMotif.bind(this)} essay={this.essayMode.bind(this)}/>
						<div className="topMenu">
							<div className="title"><div className="icon timemachine"><img src="/style/icons/iteration.svg"/></div>Iteration</div>
							<div className="optionBlock">
								<div className="option active">Inspect</div>
								<div className='separator'/>
								<div className="option clickable" onClick={this.compareMotifs.bind(this, current)}>Compare</div>	
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
													 libretto={this.librettoTextForMotif(current) ?
																		 (Array.isArray(this.librettoTextForMotif(current, language)) ? this.librettoTextForMotif(current, language)[0] : this.librettoTextForMotif(current, language)) :
													 false}
													 orchestralScore={miInfo.orchestralScore}
					                 vocalScore={miInfo.vocalScore}
                  				 details={miInfo}
													 height={this.state.height - 84 - 197}
													 width={this.state.width*0.4}/>
								<InspectPane motifs={current} position="right"
														 hasPlayer={false}
														 toggleLanguage={this.toggleLanguage.bind(this)}
														 language={language}
														 annotations={this.props.graph.outcomes[0]['@graph']}
														 segments={miInfo.segmentLineMembers}
														 segmentLabels={this.state.segmentLabels}
														 libretto={Array.isArray(this.librettoTextForMotif(current, language)) ? this.librettoTextForMotif(current, language)[0]: this.librettoTextForMotif(current, language)}
														 orchestralScore={miInfo.orchestralScore}
														 orchestrationProse={miInfo[prefix.compVocab+'hasOrchestrationDescription']
														   ? miInfo[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
														 vocalScore={miInfo.vocalScore}
														 height={this.state.height -84 -197}
														 width={this.state.width*0.4}
                             details={miInfo}
														 commentary={this.state.showCommentaryL ?
																			 <div className="inspect commentary dark">
																				 <TEI key={ commentaryuri } showAnnotations={false}
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
						</div>
					</div>
				);
			} else {
				return (
					<div>Loading data...</div>
				);
			}
		} else if(mode=="IterationCompare") {
			var miInfoL = this.state.iterations ? this.state.iterations.find(x=>x['@id']==current[0]) : false;
			var miInfoR = this.state.iterations ? this.state.iterations.find(x=>x['@id']==current[1]) : false;
			var commentaryuriL = this.commentaryForMotif(current[0]);
//			console.log(commentaryuriL, current[0]);
			var audiouriL = this.audioForMotif(current[0]);
			var commentaryuriR = this.commentaryForMotif(current[1]);
			var audiouriR = this.audioForMotif(current[1]);
			var language = this.state.language ? this.state.language : 'en';			
			var libforL = this.librettoTextForMotif(current[0], language);
			var libforR = this.librettoTextForMotif(current[1], language);
			if(libforL && Array.isArray(libforL)) libforL = libforL[0];
			if(libforR && Array.isArray(libforR)) libforR = libforR[0];
//			console.log(libforL, libforR);
			if(miInfoL && miInfoR){
				return (
					<div className="wrapper">
						<Burger className="burg" id="theburg" iteration={function(){return;}} isOpen={false}
										essay={this.essayMode.bind(this)} TM={this.compareRightMotif.bind(this)}/>
						<div className="topMenu">
							<div className="title"><div className="icon timemachine"><img src="/style/icons/iteration.svg"/></div>Iteration</div>
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
													 language={language}
													 libretto={libforL}
													 details={miInfoL}
													 toggleCommentary={this.toggleLCommentary.bind(this)}
													 audiouri={audiouriL}
													 orchestrationProse={miInfoL[prefix.compVocab+'hasOrchestrationDescription'] ? miInfoL[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
													 commentary={this.state.showCommentaryL ?
																			 <div className="inspect commentary dark">
																			 <TEI key={ commentaryuriL } 
																									uri={ commentaryuriL } motif={ current[0] }/>
																				 </div>
																			 : false}/>
								<InspectPane motif={current} position="right"
														 hasPlayer={true} view={view}
														 orchestralScore={miInfoR.orchestralScore}
														 vocalScore={miInfoR.vocalScore}
														 height={this.state.height - 84 - 197}
														 width={this.state.width*0.4}
														 toggleLanguage={this.toggleLanguage.bind(this)}
														 segments={miInfoR.segmentLineMembers}
														 segmentLabels={this.state.segmentLabels}
														 language={language}
														 annotations={this.props.graph.outcomes[0]['@graph']}
														 libretto={libforR}
														 details={miInfoR}
														 toggleCommentary={this.toggleRCommentary.bind(this)}
														 audiouri={audiouriL}
														 orchestrationProse={miInfoR[prefix.compVocab+'hasOrchestrationDescription'] ? miInfoR[prefix.compVocab+'hasOrchestrationDescription']['@id'] : false}
														 commentary={this.state.showCommentaryR ?
																			 <div className="inspect commentary dark">
																					 <TEI key={ commentaryuriR }
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
		} else if(mode==="Essay"){
			return (
				<div className="wrapper essay">
					<Burger className="burg" id="theburg"  essay={function(){return}} isOpen={false}
									iteration={this.returnToInspect.bind(this)}
									TM={this.swapMotif.bind(this)}/>
					<div className="topMenu">
						<div className="title"><div className="icon essay"><img src="/style/icons/essay.svg"/></div>Essay</div>
					</div>
					<Essay current={ current } updateLinks={ this.setVisibleLinks.bind(this) }/>
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
												 onMotifChange={this.handleMotifChange.bind(this)}
												 motif={current}
													 iterations={this.state.iterations}
												 />
					</div>					
				</div>
				
			)
		} else {
			return (
				<div>Loading...</div>
			);
		}
// 		var textBoxHeight = Math.max(this.state.height/5, 200);
// 		if(this.props.graph.targetsById) { 
// //			console.log("Props: ", this.props);
//             const byId = this.props.graph.targetsById;
// 			return ( 
// 				<div className="wrapper">
// 					<link rel="stylesheet" href="../style/style.css"/>
// 					<link rel="stylesheet" href="../style/CETEIcean.css"/>
// 					<div className="controls" />
// 					{ this.props.twins ?
// 						<TwinControls location={this.props.location} /> :
// 						( this.props.singlet ?
// 							<SingleControls location={this.props.location} /> : false )
// 					}
// 						{ 
// 							this.props.motif && <MEITimeline key="UniqueTimeline"
// 														structures={MEITimeline.defaultStructures}
// 														motif={this.state.currentMotif}
// 														onMotifChange={this.handleMotifChange.bind(this)}/>
// 							}

//                 {/*		{this.props.graph.annoGraph["@graph"]["ldp:contains"][0]["oa:hasTarget"].map(function (t) { */}
//         {Object.keys(byId).map( (id) => {
// 						switch(byId[id]["type"]) { 
// 							case CarouselClassic:
// 								return(<div>
// 											 <MEICarousel motif={this.state.currentMotif}
// 											 onMotifChange={this.handleMotifChange.bind(this)}
// 											 position={this.props.location.query.position}
// 											 supplements={this.props.location.query.supplements}
// 											 layout="classic"/>
// 											 </div>);
// 						case Carousel:
// 							return(<div>
// 								<MEICarousel layout="prism"/>
// 										 </div>);
// 							case MEIManifestation:
// 								if(this.props.score.scoreMapping[id] && !this.props.role!=="carousel"){
// 									if(FOR_ORCHESTRA in this.props.score.scoreMapping[id]){
// 										return <OrchestralRibbon key={ id+"ribbon" } uri={ id } width={400} height={this.state.height - textBoxHeight - 50}/>;
// 									} else if (HAS_PIANO in this.props.score.scoreMapping[id]){
// 										return <Score key={ id } uri={ id } annotations={ byId[id]["annotations"] }
// 										showLibretto={this.props.showLibretto} />;
// 									} else {
// 										return;
// //									return <Score key={ id } uri={ id } annotations={ byId[id]["annotations"] } />;
// 								}
// 							} else {
// 								//console.log("No performance medium at all!", id);
// 								return;
// //								return <Score key={ id } uri={ id } annotations={ byId[id]["annotations"] } />;
// 							}
// 							case TEIManifestation:
								
// //								if(id.indexOf('libretto')>-1) return false;
// 							if(this.props.motif){
// 								return <TEI key={ id } uri={ id } motif={this.state.currentMotif}
// 								height={textBoxHeight}
// 														onMotifChange={this.handleMotifChange.bind(this)}
// 							            	annotations={ byId[id]["annotations"] } />;
// 							} else {
// 								return <TEI key={ id } uri={ id } annotations={ byId[id]["annotations"] }
// 								librettoElements={this.props.librettoElements} />;
// 							}/**/
// 						case VideoManifestation: 
// 							return <MediaPlayer key={ id } uri={ id } />;
// 						case AudioManifestation: 
//                             return <AudioPlayer key={ id } uri={ id } />;
// 						case ImageManifestation: 
//                             return <MyImage key={ id } uri={ id } />;
// 						default: 
// 							return <div key={ id }>Unhandled target type: { byId[id]["type"] }</div>
// 						}
// 					})}
// 				</div>
// 			);
// 		}
// 		return (<div> Loading...  </div>);
	}
	
};
function typeTest(type, jldObj){
	if(jldObj['@type']){
		if(typeof(jldObj['@type'])=='string'){
			return jldObj['@type']==type;
		} else {
			return jldObj['@type'].indexOf(type)>-1;
		}
	} else 
		return false;
}
function JSONLDInt(obj){
	// FIXME: test type
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
				var uris = bits.forEach(bit=>embodimentSet.add(bit.split('#')[0]));
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
