import React, { Component, createRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import OrchestralRibbon from '../containers/orchestralRibbon';
import Score from '../containers/score';
import TEI from 'meld-clients-core/src/containers/tei';
import Swiper from 'react-id-swiper';
import InlineSVG from 'svg-inline-react';
import {prefix} from 'meld-clients-core/src/library/prefixes';
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
	//	pageWidth: 1400
		pageWidth: 1300
}
class MEICarousel extends Component {
	constructor(props) {
		super(props);
		this.state = {
//			width: 600,
			motifSortFunction: sortByContainedNum,
			carouselParams: {
				grabCursor: true,
				spaceBetween: 60,
				centeredSlides: true,
				slideToClickedSlide: true,
				slidesPerView:3, 
				on:{
					slideChange: function (){
						var it = this.motifForIndex(this.refs.swiperWrapper.swiper.activeIndex);
						if(it){
							this.props.onMotifChange(it);
						}
						// var k = Object.keys(this.props.score.MEI).map(x=>x.substring(x.lastIndexOf("/")+1, x.lastIndexOf(".")));
						// k.sort(this.state.motifSortFunction);
						// this.props.onMotifChange(k[this.refs.swiperWrapper.swiper.activeIndex]);
					}.bind(this)
				}
			}
		}
	}
	pageClick(uri, e){
		if(e) e.stopPropagation();
		switch(this.props.view){
			case "orchestration":
				this.props.TMClick(this.props.iterations.find(x=>x.orchestralScore==uri)['@id']);
				break;
			case "score":
//				console.log("click "+this.props.iterations.find(x=>x.vocalScore==uri)['@id']);
			default:
				this.props.TMClick(this.props.iterations.find(x=>x.vocalScore==uri)['@id']);
		}
	}
	jumpTo(n){
		if (this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slideTo(n) }
	}
	// goNext() {
	// 	if (this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slideNext() }
	// }

	// goPrev() {
	// 	if (this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slidePrev() }
	// }

	// goTo(x) { 
	// 	if(this.refs.swiperWrapper) { this.refs.swiperWrapper.swiper.slideTo(x) }
	// }

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
		if(this.props.motif) {
			var slide=this.indexForMotif(this.props.motif);
			this.jumpTo(slide);
		}
	}
	fullScores() {
		var fs = [];
		if(this.props.iterations){
			for(var i=0; i<this.props.iterations.length; i++){
				if(this.props.iterations[i].orchestralScore){
					fs.push(this.props.iterations[i].orchestralScore);
				}
			}
		}
		return fs;
	}
	fullScoreIndexes(){
		var ixx = [];
		if(this.props.iterations){
			for(var i=0; i<this.props.iterations.length; i++){
				if(this.props.iterations[i].orchestralScore){
					ixx.push(i);
				}
			}
		}
		return ixx;
	}
	indexForMotif(motif){
		var iteration = this.props.iterations.find(x=>x['@id']==motif);
//		console.log(motif);
		if(!iteration) {
			var fullMotif = "https://meld.linkedmusic.org/companion/"+motif;
			iteration = this.props.iterations.find(x=>x['@id']==fullMotif);
			//			console.log(motif, this.props.iterations);
			if(!iteration) {
				console.log(motif, fullMotif);
			}
		}
		switch(this.props.view){
			case "orchestration":
				return this.fullScores().findIndex(x=>x==iteration.orchestralScore);
			case "libretto":
				return this.librettoElements().findIndex(x=>x.id===iteration['@id']);
			case "score":
			default:
				return this.vocalScores().findIndex(x=>x==iteration.vocalScore);
		}
	}
	motifForIndex(i){
		switch(this.props.view){
			case "orchestration":
				var fs = this.fullScores();
				return this.props.iterations.find(x=>x.orchestralScore==fs[i])['@id'];
			case "libretto":
//				console.log(i);
				var libs = this.librettoElements();
//				console.log(this.props.iterations, i, libs, libs[i].id);
//				console.log(this.props.iterations.find(x=>x['@id']===libs[i].id));
				return this.props.iterations.find(x=>x['@id']===libs[i].id)['@id'];
			case "score":
			default:
				var vs = this.vocalScores();
				return this.props.iterations.find(x=>x.vocalScore==vs[i])['@id'];



		}
	}
	vocalScores(){
		var vs = [];
		if(this.props.iterations){
			for(var i=0; i<this.props.iterations.length; i++){
				if(this.props.iterations[i].vocalScore){
					vs.push(this.props.iterations[i].vocalScore);
				}
			}
		} 
		return vs;
	}
	librettoElements(){
		if(this.props.iterations){
			var libs = [];
			for(var i=0; i<this.props.iterations.length; i++){
				var lib = {id:this.props.iterations[i]['@id']};
				if(this.props.iterations[i].de){
					lib.de = this.props.iterations[i].de;
				} else if(this.props.iterations[i].embodimentLists.de.length){
	//				lib.de = this.props.iterations[i].embodimentLists.de[0];
				}
				if(this.props.iterations[i].en){
					lib.en = this.props.iterations[i].en;
				} else if(this.props.iterations[i].embodimentLists.en.length){
	//				lib.en = this.props.iterations[i].embodimentLists.en[0];
				}
				if(lib.en || lib.de) libs.push(lib);
			}
			return libs;
		} else return [];
	}
	render() {
		//		console.log("Carousel sees :", this.props.score);
		//		console.log('----', this.props.view, this.props.score);
		if((!this.props.view || this.props.view==='score')){
			var vrvOptions = {	breaks:'auto', adjustPageHeight:1,
													spacingStaff: 0, spacingSystem: 12,
													spacingLinear: 0.2, spacingNonLinear: 0.55,
													noFooter: 1, noHeader: 1,
													scale: 24,
													pageHeight: 3200,
													//													pageWidth: 1400
													pageWidth: 1400
											 };
			var vs = this.vocalScores();
//			console.log('redrawing carousel for', this.props.motif);
			// var slide=false;
			if(!vs.length) return false;
			var params = this.state.carouselParams;
			var mIx = this.indexForMotif(this.props.motif);
			var it = this.props.iterations[mIx];
//			console.log(mIx, it, this.props.motif);
			// if(this.props.motif) {
			// 	slide=this.indexForMotif(this.props.motif);
			// }
			// console.log(params);
			// var newParams = {activeSlideKey: slide};
			// params = Object.assign(newParams, params);
//			var im = vs.map(k => k.replace(".mei", ".svg")); // FIXME: draw this
			return (
				<div className="carouselWrapper">
					<Swiper {...params} // activeSlideKey={slide}
									ref="swiperWrapper">
						{vs.map( (m, ix) => 
										 <div key={ix} onClick={this.pageClick.bind(this, m)}
		  	   									className="carouselItemWrapper">
												 <a onClick={this.pageClick.bind(this, m)}>
														 {ix===mIx ?
															 <div className="TMHeader">
																	 <span className="TMMIName">{it[prefix.rdfs+'label']}</span>
																	 – <span className="key">{keyString(it)}</span>
																	 <span className="form">( {formString(it, this.props.segmentLabels)} )</span>
																 </div> : false}
   													 <Score key={m+"-"+ix}
																		onClick={this.pageClick.bind(this, m)}
		  	   													options={vrvOptions}
			   														extraClasses="carousel" uri={m}/>
													 </a>
											 </div>
									 )}
				</Swiper>
					</div>
			);
			// return (
			// 	<div className="carouselWrapper">
			// 		<Swiper {...params} ref="swiperWrapper">
			// 			{im.map( (m, ix) => 
			// 							 <div key={ix}  className="carouselItemWrapper">
 			// 									 <a href={linkPrefix+imageToURIOrShorthand(m)+linkSuffix}>
			// 											 <img src={m} className="carouselItem"/>
			// 										 </a>
			// 								 </div>
			// 						 )}
			// 	</Swiper>
			// 		</div>
			// );
		} else if(this.props.view=='orchestration'){
			var fs = this.fullScores();
//			console.log('redrawing carousel for', this.props.motif, fs);
			var slide=false;
			if(!fs.length) return false;
			var fsixx = this.fullScoreIndexes();
			var params = this.state.carouselParams;
			var mIx = this.indexForMotif(this.props.motif);
			var it = this.props.iterations[mIx];
			// if(this.props.motif) {
			// 	slide=this.indexForMotif(this.props.motif);
			// }
//			var im = vs.map(k => k.replace(".mei", ".svg")); // FIXME: draw this
			return (
				<div className="carouselWrapper">
					<Swiper {...params} activeSlideKey={slide} shouldSwiperUpdate
									ref="swiperWrapper">
						{fs.map( (m, ix) => 
										 <div key={ix} onClick={this.pageClick.bind(this, m)}
		  	   									className="carouselItemWrapper">
														 {ix===mIx ?
															 <div className="TMHeader">
																	 <span className="TMMIName">{it[prefix.rdfs+'label']}</span>
																	 – <span className="key">{keyString(it)}</span>
																	 <span className="form">( {formString(it, this.props.segmentLabels)} )</span>
																 </div> : false}
   															 <OrchestralRibbon key={m+"-"+ix}
																										 width="350" height="400"
																										 barNo={this.props.iterations[fsixx[ix]][prefix.meld+"barNumberInAct"] ?
																														this.props.iterations[fsixx[ix]][prefix.meld+"barNumberInAct"]['@value'] : false}
			   																						 extraClasses="carousel" uri={m}/>
											 </div>
									 )}
				</Swiper>
					</div>
			);
		} else if(this.props.view==='orchestration' && this.fullScores().length) {
			// Never called?
			var toDraw = this.fullScores();
			return (
				<div className="carouselWrapper">
					<Swiper {...params} ref="swiperWrapper" shouldSwiperUpdate>
						{toDraw.map( (v, ix) =>
												 <div key={ix} className="carouselItemWrapper">
														 <OrchestralRibbon key={ v } uri={ v } width="350"
																							   height="600"/>
												 </div>)}
			</Swiper>
					</div>);
		} else if(this.props.view==='libretto'){
			var librettoToDraw = this.librettoElements();
			var mIx = this.indexForMotif(this.props.motif);
			var it = this.props.iterations[mIx];
			return (
				<div className="carouselWrapper">
					<Swiper {...params} ref="swiperWrapper" shouldSwiperUpdate>
						{librettoToDraw.map( function(v, ix)
																 {
																	 //																	 console.log(v);
																	 var enTEI = v['en'] ? <TEI key={ v['en'] } uri={ v['en']}/> : false;
																	 var deTEI = v['de'] ?<TEI key={ v['de'] } uri={ v['de'] } />: <div>No data</div>;
																	 return (<div key={ix} className="carouselItemWrapper">
																						 <div className="librettoContainer">
																							 {ix===mIx ?
																								<div className="TMHeader">
																									<span className="TMMIName">{it[prefix.rdfs+'label']}</span>
																									– <span className="key">{keyString(it)}</span>
																									<span className="form">( {formString(it, this.props.segmentLabels)} )</span>
																								</div> : false}
																						 {deTEI}{enTEI}
																					 </div>
																					 </div>)
																 }.bind(this))}
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
	
function mapStateToProps({ score , graph }) {
	return { score , graph};
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MEICarousel);

function imageToURIOrShorthand(filename){
  ///HACKHACKHACK
  var FNo = filename.match(/F[0-9]*[.]+/);
  if(FNo && FNo.length){
    return 'Frageverbot'+FNo[0].substring(1, FNo[0].length-1);
  } else {
    return filename;
  }
}
