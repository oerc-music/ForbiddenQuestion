import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import Swiper from 'react-id-swiper';

class MEICarousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
			images: ["http://meld.linkedmusic.org/companion/mei/F1.svg","http://meld.linkedmusic.org/companion/mei/F2.svg","http://meld.linkedmusic.org/companion/mei/F3.svg","http://meld.linkedmusic.org/companion/mei/F4.svg","http://meld.linkedmusic.org/companion/mei/F5.svg","http://meld.linkedmusic.org/companion/mei/F6.svg","http://meld.linkedmusic.org/companion/mei/F7.svg","http://meld.linkedmusic.org/companion/mei/F8.svg","http://meld.linkedmusic.org/companion/mei/F9.svg","http://meld.linkedmusic.org/companion/mei/F10.svg"]
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
			


	componentDidMount() { 
		this.goToURI("http://meld.linkedmusic.org/companion/mei/F5.svg")
	}

	render() {
		if(this.refs.swiperWrapper) { console.log("NOW ON: ", this.refs.swiperWrapper.activeIndex) }
		const params = {
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
el: '.swiper-pagination'
			}
		};
		//if("MEI" in this.props.score && Object.keys(this.props.score["MEI"]).length ) { 



			return (
					<div className="carouselWrapper">
					<Swiper {...params} ref="swiperWrapper">
					{this.state.images.map( (m, ix) => 
							<div key={ix}><img src={m} width="400px"/></div>
							)}
					</Swiper>
					</div>
				   );
		//}
		//return <div />
	}
}


function mapStateToProps({ score }) {
	return { score };
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MEICarousel);
