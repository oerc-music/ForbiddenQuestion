import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { fetchRibbonContent } from 'meld-client/src/actions/index';
import { Orchestration, mergedInstruments, caption, drawBarLines, drawRibbons } from '../library/meiUtils';

import InlineSVG from 'svg-inline-react';

class OrchestralRibbon extends Component {
	constructor(props) {
		super(props);
		console.log(props);
		this.state = { active: false };
	}

	showLongName(e){
		var cl = e.target.className.baseVal;
		var i = cl.substr(cl.indexOf('nnn')+3);
		this.setState({active: parseInt(i)});
	}
	showShortName(e){
		this.setState({active: false});
	}
  render(){
    if(Object.keys(this.props.score).length) {
			if(this.props.score["MEIfile"] && this.props.score["MEIfile"][this.props.uri]){
				var orch = new Orchestration(this.props.score["MEIfile"][this.props.uri]);
				var mergedInst = mergedInstruments(orch.instruments);
				var height = Math.min(this.props.height, window.innerHeight - 200);
				var width = this.props.width;
				var rowHeight = height / mergedInst.length;
				var boxes = [];
				var captions = [];
				var startx = 0;
				for(var i=0; i<mergedInst.length; i++){
					var xpos = 0;
					var ypos = rowHeight*(i+0.875);
					var mover = this.showLongName.bind(this);
					var mout = this.showShortName.bind(this);
					var iname = '';
					var section = 'mixed';
					var cap = caption(mergedInst[i].instruments,orch.instruments, this.state.active===i, mover,mout, xpos, ypos+(2*rowHeight/3), 'instrLabel ', i);
					captions.push(cap.obj);
					boxes.push(drawRibbons(mergedInst[i].playing, ypos, rowHeight, (width-40)/orch.measureCount, ' '+cap.cl, mover, mout, i));
				}
				var bars = drawBarLines(orch.measureCount, width, height);
				return <svg width={width} height={height} className="orchestralRibbon">{bars}{boxes}{captions}</svg>;
			}
			return <div>Sad </div>;/*
			//			return <InlineSVG className="score" src={ this.props.score["MEI"][this.props.uri] } />;*/
		}
		return <div>Loading...</div>;
	}
	
  componentDidMount(){
    this.props.fetchRibbonContent(this.props.uri);
  }
}


function mapStateToProps({ score }) {
	return { score };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchRibbonContent }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(OrchestralRibbon);

