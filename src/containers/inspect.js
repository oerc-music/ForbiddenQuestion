import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import MediaPlayer from '../components/mediaPlayer';
import AudioPlayer from '../components/audioPlayer';
import { Media, Player, controls, utils } from 'react-media-player';
const { defaultPlayPause, CurrentTime, Progress, SeekBar, Duration, MuteUnmute, Volume, Fullscreen } = controls;
import CustomPlayPause from '../containers/react-media-player-play-pause';
import {prefix} from 'meld-clients-core/src/library/prefixes';
const { formatTime } = utils;

//import Score from 'meld-client/src/containers/score';
import Score from '../containers/score';
import Burger from '../containers/burger';
import OrchestralRibbon from '../containers/orchestralRibbon';
//import TEI from '../containers/tei';
import TEI from 'meld-clients-core/src/containers/tei';
import MyImage from 'meld-clients-core/src/containers/image';
import MEICarousel from '../containers/new-carousel';
import MEITimeline from '../containers/timeline';
import TwinControls from '../containers/controls';
import SingleControls from '../containers/single-view-controls';
import { fetchGraph } from 'meld-clients-core/src/actions/index';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

const MEIManifestation = "meldterm:MEIManifestation";
const TEIManifestation = "meldterm:TEIManifestation";
const IIIFManifestation = "meldterm:IIIFManifestation";
const VideoManifestation = "meldterm:VideoManifestation";
const AudioManifestation = "meldterm:AudioManifestation";
const ImageManifestation = "meldterm:ImageManifestation";
const Carousel= "meldterm:MEICarousel";
const CarouselClassic= "meldterm:MEIClassicCarousel";
const FOR_ORCHESTRA = "http://id.loc.gov/authorities/performanceMediums/2013015516";
const HAS_PIANO = "http://id.loc.gov/authorities/performanceMediums/2013015550";

export default class InspectPane extends Component {
  constructor(props) {
    super(props);
		this.state={
			showOrchestrationProse: false
		}
  }
	mediaController(){
		return (
			<div className="inspectCommentary" onClick={function(e){e.stopPropagation();}}>
  				<Media key={ this.props.audiouri }>
						<div className="media">
							<div className="media-player">
								<Player src={ this.props.audiouri }/>
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
					<button onClick={this.props.toggleCommentary}
									className="commentaryToggleButton">Commentary</button>
				</div>
		);
	}
	toggleProse(){
		this.setState({showOrchestrationProse: !this.state.showOrchestrationProse});
	}
	orchestralProseButton(){
		return (
			<div className={"orchestralProseButton "
					 +( this.state.showOrchestrationProse ? 'active' : 'passive')}
					 onClick={this.toggleProse.bind(this)}>Description</div>
		);
	}
	librettoPanel(){
		if(this.props.librettoTexts){
			var buttonAction = this.props.showEnglish ? this.props.hideTranslation : this.props.showTranslation;
			return (
				<TabPanel>
					<div className="librettoTab">
						<div className="inspectLibretto">
							<TEI key={this.props.position+"-"+this.props.libretto}
									 annotations={this.props.annotations} uri={this.props.librettoTexts.de} />
						</div>
						{this.props.showEnglish ?
							( <div className="English inspect dark">
								<TEI key={this.props.position+"-"+this.props.libretto}
											 annotations={this.props.annotations} uri={this.props.librettoTexts.en} />
								</div>
							) : null }
					<button className="translationButton" onClick={buttonAction}>Translation</button>
					{this.props.toggleCommentary ? this.mediaController() : false}
				</div>
				</TabPanel>
			);
		} else if(this.props.libretto){
			var deDiv,enDiv;
			if(this.props.language=='de'){
				deDiv = <div className='option active'>German</div>;
				enDiv = <div className='option clickable' onClick={this.props.toggleLanguage}>English</div>;
			} else if (this.props.language=='en'){
				deDiv = <div className='option clickable' onClick={this.props.toggleLanguage}>German</div>;
				enDiv = <div className='option active'>English</div>;
			}
			return (
				<TabPanel>
					<div className="librettoTab">
						<div className="optionBlock">
							{deDiv}
							<div className='separator'/>
							{enDiv}
						</div>
						<div className="inspectLibretto">
							<TEI key={this.props.position+"-"+this.props.libretto}
									 annotations={this.props.annotations} uri={this.props.libretto} />
						</div>
						{this.props.toggleCommentary ? this.mediaController() : false}
					</div>
				</TabPanel>
			);
		} else return <TabPanel/>;
	}
	componentDidUpdate(){
		var URI = this.motifScrollURI();
		if(!URI) return;
		var frag = URI.substring(URI.indexOf('#')+1);
		var el = document.getElementById(frag);
		if(el){
			var parent=el.parentNode;
			while(parent && parent.tagName!=="DIV"){
				parent = parent.parentNode;
			}
			if(parent){
				parent.scrollTop = el.offsetTop - parent.offsetTop + (parent.clientHeight/2);
			}
		}
	}
	motifScrollURI(){
		if(this.props.segments){
			var starts = this.props.segments[0];
			if(starts){
				var embods = starts['http://purl.org/vocab/frbr/core#embodiment'];
				if(!embods){
					return false;
				}
				for(var i=0; i<embods.length; i++){
					if(embods[i]['@type'].indexOf("https://meld.linkedmusic.org/terms/TEIEmbodiment")>-1){
						var members = embods[i]['http://www.w3.org/2000/01/rdf-schema#member'];
						if(members && !Array.isArray(members)) members = [members];
						if(members[0]['@id'].startsWith(this.props.libretto)){
							return members[0]['@id'];
						}
					}
				}
			}
		}
		return false;
	}
  render(){
		var librettoHead = <Tab>Poem</Tab>;
		var paradigmHead = this.props.paradigm ? <Tab>Paradigm</Tab> : false;
		var vsHead = this.props.vocalScore ? <Tab>Vocal Score</Tab> : false;
		var orchHead = this.props.orchestralScore ? <Tab>Orchestration</Tab> : false;
		var librettoTab = (this.props.libretto || this.props.librettoTexts) ? this.librettoPanel() : <TabPanel/> ;
		var vrvOptions = {	breaks:'auto', adjustPageHeight:1,
												spacingStaff: 0, spacingSystem: 12,
												spacingLinear: 0.2, spacingNonLinear: 0.55,
												noFooter: 1, noHeader: 1,
												scale: 24,
												pageHeight: 3000 * ((this.props.height-170) / 586),
												pageWidth: 1800 * (this.props.width / 470)
										 };
		var vrvOptionsLonger = {	breaks:'auto', adjustPageHeight:1,
															spacingStaff: 0, spacingSystem: 12,
															spacingLinear: 0.2, spacingNonLinear: 0.55,
															noFooter: 1, noHeader: 1, unit: 8,
															scale: 24,
															pageHeight: 3000 * ((this.props.height-170) / 586),
															pageWidth: 1800 * (this.props.width / 470)
										 };
		var paradigmTab = this.props.paradigm ? <TabPanel><Score key={this.props.position+"-"+this.props.paradigm} uri={this.props.paradigm} position={this.props.position}/></TabPanel> : false;
		var slm = this.props.details.segmentLineMembers.map(
			function(x){
				var em = x[prefix.frbr+'embodiment'];
				if(!Array.isArray(em)) em = [em];
				return {'@id':x['@id'],
								'anchors':em.filter(y=>memberFragment(y, this.props.vocalScore)),
								'audio':em.filter(y=>y['@type']==prefix.meld+'AudioEmbodiment' || y['@type'].indexOf(prefix.meld+'AudioEmbodiment')>-1)}}.bind(this));
		var vsTab = this.props.vocalScore ?
				(<TabPanel>
				   <Score key={this.props.position+"-"+this.props.vocalScore}
				          options={vrvOptions}
									longerOptions={vrvOptionsLonger}
				          extraClasses="inspect" uri={this.props.vocalScore}
                  annotations={this.props.annotations}
                  segmentLabels={this.props.segmentLabels}
         				  showSegments={true}
									highlight={this.props.highlight}
				          iterationSegments={this.props.details.iterationSegments}
									segmentLineMembers={slm}
									position={this.props.position}
				          details={this.props.details}
				 />
				 {this.props.toggleCommentary ? this.mediaController() : false}
				 </TabPanel>)
				: false;
		var orchTab = this.props.orchestralScore ?
				(<TabPanel><OrchestralRibbon key={this.props.position+"-"+this.props.orchestralScore} uri={this.props.orchestralScore} width={this.props.width-10} height={this.props.height - (this.props.hasPlayer ? 300 : 260)} barNo={this.props.details[prefix.meld+"barNumberInAct"] ? this.props.details[prefix.meld+"barNumberInAct"]['@value'] : false}/>
				 { this.props.orchestrationProse ?
					 (<div className={this.props.hasPlayer ? "shorter inspect orchestrationProse"
														: "inspect orchestrationProse"}>
						<TEI key={this.props.orchestrationProse} showAnnotations={false}
					       uri={this.props.orchestrationProse}/>
						</div>) : false}
				 {this.props.toggleCommentary ? this.mediaController() : false}
				 </TabPanel > )
				: false;
				 // { this.props.orchestrationProse ? this.orchestralProseButton() : false }
		var index = 0;
		if(this.props.view){
			switch(this.props.view){
				case 'score':
					index = 1;
					break;
				case 'orchestration':
					index = 2;
					break;
				case 'paradigm':
					index = 3;
					break;
				default:
					index = 0;
					break;
			}
		}
    return (
      <div className={this.props.position+" inspector"+(this.hasPlayer ? " hasPlayer" : "")}>
				<Tabs defaultIndex={index}>
					<TabList>
						{librettoHead}
						{paradigmHead}
						{vsHead}
						{orchHead}
					</TabList>
					{librettoTab}
					{paradigmTab}
					{vsTab}
					{orchTab}
				</Tabs>
				{this.props.commentary ? this.props.commentary : false}
      </div>
    );
  }
}
function memberFragment(el, uri){
	if(!uri) return false;
	var ms = el['http://www.w3.org/2000/01/rdf-schema#member']
	var matchend = uri.length;
	for(var i=0; i<ms.length; i++){
		if(ms[i]['@id']==uri) return true;
		if(ms[i]['@id'].indexOf(uri)==0 && (ms[i]['@id'].substring(matchend, matchend+1)=='#' || ms[i]['@id'].substring(matchend, matchend+1)=='?')) return true;
	}
	return false;
}
