import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
/*const { formatTime } = utils;*/

//import Score from 'meld-client/src/containers/score';
//import TEI from '../containers/tei';
import TEI from 'meld-clients-core/src/containers/tei';
import MyImage from 'meld-clients-core/src/containers/image';
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

function isElementInViewport(el){
	var rect = el.getBoundingClientRect();
  return (
    rect.top >= 110 && // Based on the TEI container's CSS 
      rect.left >= ((window.innerWidth || document.documentElement.clientWidth) / 2) - 350 &&
			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - 190 && 
			rect.right <= ((window.innerWidth || document.documentElement.clientWidth) /2) + 350
    // rect.top >= 0 &&
    //   rect.left >= 0 &&
    //   rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
    // rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
  );
}

export default class Essay extends Component {
  constructor(props) {
    super(props);
		
  }
	inViewRefs(){
		var refs=document.getElementsByTagName('tei-link');
		refs = Array.from(refs).filter(isElementInViewport);
		this.props.updateLinks(refs);
	}
	componentDidUpdate(){
		
	}
  render(){
    return (
			<TEI key="/Essay/AskingAForbiddenQuestion.tei"
			     uri="/Essay/AskingAForbiddenQuestion.tei"
					 // motif={ this.props.current }
					 scrollFun={this.inViewRefs.bind(this)}/>
    );
  }
}
