import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import Swiper from 'react-id-swiper';
import Burger from '../containers/burger';

export default class Home extends Component {
	constructor(props) {
		super(props);
	}
	render() {
		var heightClass="smallest";
		var height=530;
		if(!this.props.height || this.props.height>=910){
			heightClass="normal";
			height=640;
		} else if(this.props.height>=870){
			heightClass="small";
			height = 600;
		} else if(this.props.height>=820){
			heightClass = "smaller";
			height=550;
		} 
		var picHeight = !this.props.height || this.props.height >= 910 ? 640
				: Math.max(this.props.height - 270, 530);
		var params = {
			grabCursor: true,
			spaceBetween: 30,
			centeredSlides: true,
			slideToClickedSlide: true,
			slidesPerView: 'auto',
			height: height,
			pagination: {
        el: '.swiper-pagination',
        clickable: true
      }
		}
		return (
			<div className="home">
				{this.props.burger}
				<div className="homeText">
					<div className="header">
						A <span className="hi">new view</span> of musical themes
						in Wagner’s <i>Lohengrin</i>
					</div>
					<div className="instruction">
						Begin by choosing a page to explore
					</div>
					<div className="introLink"><span className="space">or </span> <span onClick={this.props.video} className="link">watch an introductory video</span>
					</div>
				</div>
				<Swiper {...params}>
					<div>
						<img key="TMPage" onClick={this.props.TM} src="/style/images/Intro-TM-image.png" className={heightClass}/>
					</div>
					<div>
						<img key="Iteration" onClick={this.props.inspect} src="/style/images/Intro-Iteration-image.png" className={heightClass}/>
					</div>
					<div>
						<img key="Essay" onClick={this.props.essay} src="/style/images/Intro-Essay-image.png" className={heightClass}/>
					</div>
				</Swiper>
			</div>
		);
	}
}
