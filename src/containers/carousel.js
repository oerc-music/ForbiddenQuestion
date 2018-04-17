import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import Carousel from 'react-3d-carousel';

class MEICarousel extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            score: {},
          width: 350,
					motifSortFunction: sortByContainedNum,
            layout: this.props.layout,
            ease: 'linear',
            duration: 400
        };
    }

    /*
    componentWillMount() {
        this.onSides = function (event) {
            this.setState( { images: this.props.images }});
        }.bind(this);
        this.onLayout = function (event) {
            this.setState({layout: event.target.value});
        }.bind(this);
        this.onDuration = function (event) {
            this.setState({duration: parseInt(event.target.value) });
        }.bind(this);
       // this.onEase = function (event) {
       //     this.setState({ease:  event.target.value});
       // }.bind(this);
    }
		*/
	
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
                    <Carousel width={this.state.width}
                              images={ im }
                              motif={this.props.motif}
															onMotifChange={this.props.onMotifChange}
															position={this.props.position}
															supplements={this.props.supplements}
                              ease={this.state.ease}
                              duration={this.state.duration}
                              layout={this.state.layout}/>
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
