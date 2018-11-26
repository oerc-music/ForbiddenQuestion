import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import Swiper from 'react-id-swiper';
import InlineSVG from 'svg-inline-react';
const defaultVrvOptions = {
	ignoreLayout:1,
	adjustPageHeight:1,
	spacingStaff: 0,
	spacingSystem: 4,
	spacingLinear: 0.2,
	spacingNonLinear: 0.55,
	noFooter: 1,
	noHeader: 1,
	scale: 30,
	pageHeight: 3000,
	pageWidth: 1800
}
class MEICarousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
//			width: 600,
			motifSortFunction: sortByContainedNum,
			vrvTk: new verovio.toolkit(),
			carouselParams: {
				effect: 'coverflow',
				grabCursor: true,
				centeredSlides: true,
				slideToClickedSlide: true,
				slidesPerView:3,
				coverflowEffect: {
					rotate: -20,
					stretch: 0,
					depth: 10,
					modifier: 1,
					slideShadows:false
				},
				on:{
					slideChange: function (){
						var k = Object.keys(this.props.score.MEI).map(x=>x.substring(x.lastIndexOf("/")+1, x.lastIndexOf(".")));
						k.sort(this.state.motifSortFunction);
						this.props.onMotifChange(k[this.refs.swiperWrapper.swiper.activeIndex]);
					}.bind(this)
				},
				// pagination: {
				// 	el: '.swiper-pagination',
				// 	clickable: true
				// },
				navigation: {
					nextEl: '.swiper-button-next',
					prevEl: '.swiper-button-prev'
				}
			}
		}
	}
	
	goNext() {
		if (this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slideNext() }
	}

	goPrev() {
		if (this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slidePrev() }
	}

	goTo(x) { 
		if(this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slideTo(x) }
	}

	goToURI(uri) { 
		if(this.refs.swiperWrapper) { 
			const ix = this.state.images.findIndex((imgUri) => { return imgUri === uri });
//			console.log("ix was ", ix);
			if(ix > -1) {
				this.goTo(ix);
			}
		}
	}

	getActiveIndex() { 
			if(this.refs.swiperWrapper) { 
				return this.refs.swiperWrapper.swiper.activeIndex;
			} else { 
				return -1
			}
	}

	getActiveURI() { 
		const ix = this.getActiveIndex();
		return ix > -1 ? this.state.images[ix] : false
	}

	componentDidUpdate() {
		// Turn the carousel to a motif chosen from outside the component
		if(this.props.motif && this.refs.swiperWrapper){
			var k = Object.keys(this.props.score.MEI);			
			k.sort(this.state.motifSortFunction);
			this.refs.swiperWrapper.swiper.slideTo(k.indexOf('https://meld.linkedmusic.org/companion/mei/'
																											 + this.props.motif + ".mei"));
		}
	}

	render() {
		//		console.log("Carousel sees :", this.props.score);
		if("MEI" in this.props.score && Object.keys(this.props.score.MEI).length && Object.keys(this.props.score.scoreMapping).length) { 
			var k = Object.keys(this.props.score.MEI);
			var vs = k.filter((k) => { return !this.props.score.scoreMapping[k] || "http://id.loc.gov/authorities/performanceMediums/2013015550" in this.props.score.scoreMapping[k];}, this);
			var params = this.state.carouselParams;
			k.sort(this.state.motifSortFunction);
			if(this.props.motif){
				params.activeSlideKey = k.indexOf('https://meld.linkedmusic.org/companion/mei/'
																					+ this.props.motif + ".mei");
			}
			var im = vs.map(k => k.replace(".mei", ".svg"));
//			im.push("http://localhost:8080/companion/mei/blank.svg");
//			im.push("http://localhost:8080/companion/mei/blank.svg");
//			im.push("http://localhost:8080/companion/title-page-top.png");
			//			console.log("pix are", im);
			var linkPrefix = 'ForbiddenQuestion?motif=';
			var linkSuffix = '';
			if(this.props.position==='left'){
				linkSuffix = '&motif='+this.props.supplements;
			} else if(this.props.position==='right'){
				linkPrefix += this.props.supplements+'&motif=';
			}
			return (
					<div className="carouselWrapper">
						<Swiper {...params} ref="swiperWrapper">
						{im.map( (m, ix) => 
							  <div key={ix} className="carouselItemWrapper">
 								  <a href={linkPrefix+imageToURIOrShorthand(m)+linkSuffix}>
								    <img src={m} className="carouselItem"/>
								  </a>
								</div>
						)}
						</Swiper>
					</div>
			);
		}
		return <div />
	}
}

function sortByContainedNum(x, y){
	var nosx = /[0-9]+[.]?/.exec(x);
	var nosy = /[0-9]+[.]?/.exec(y);
	if(nosx.length && nosy.length){
		return parseInt(nosx) - parseInt(nosy);
	} else {
		return x<y;
	}
}


	function mapStateToProps({ score }) {
		return { score };
	}

	function mapDispatchToProps(dispatch) { 
		return bindActionCreators({ }, dispatch);
	}

export default connect(mapStateToProps, mapDispatchToProps)(MEICarousel);

function imageToURIOrShorthand(filename){
  ///HACKHACKHACK
  var FNo = filename.match(/F[0-9]*[.]+/);
  if(FNo.length){
    return 'Frageverbot'+FNo[0].substring(1, FNo[0].length-1);
  } else {
    return filename;
  }
}
