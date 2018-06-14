import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import Swiper from 'react-id-swiper';

class MEICarousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			width: 350,
			motifSortFunction: sortByContainedNum,
			carouselParams: {
					effect: 'coverflow',
					grabCursor: true,
					centeredSlides: true,
					slideToClickedSlide: true,
					slidesPerView:3, 
					coverflowEffect: {
									rotate: -30,
									stretch: 0,
									depth: 10,
									modifier: 1,
									slideShadows:false
					},
					pagination: {
							el: '.swiper-pagination',
							clickable: true
					},
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
			console.log("ix was ", ix);
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

//	componentDidMount() { 
//		this.refs.swiperWrapper.swiper.on('slideChange', () => { 
//			console.log("slide changed: ", this.getActiveURI())
//		})
//	}

	render() {
		console.log("Carousel sees :", this.props.score);
		if("MEI" in this.props.score && Object.keys(this.props.score.MEI).length && Object.keys(this.props.score.scoreMapping).length) { 
			var k = Object.keys(this.props.score.MEI);
			var vs = k.filter((k) => { return !this.props.score.scoreMapping[k] || "http://id.loc.gov/authorities/performanceMediums/2013015550" in this.props.score.scoreMapping[k];}, this);
			k.sort(this.state.motifSortFunction);
			var im = vs.map(k => k.replace(".mei", ".svg"));
			im.push("http://localhost:8080/companion/mei/blank.svg");
			im.push("http://localhost:8080/companion/mei/blank.svg");
			im.push("http://localhost:8080/companion/title-page-top.png");
			console.log("pix are", im);
			return (
					<div className="carouselWrapper">
						<Swiper {...this.state.carouselParams} ref="swiperWrapper">
						{im.map( (m, ix) => 
								<div key={ix} className="carouselItemWrapper">
									<img src={m} className="carouselItem"/>
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
	var nosx = /[0-9]+[.]/.exec(x);
	var nosy = /[0-9]+[.]/.exec(y);
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
