import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchOrchestration } from '../actions/index';
/*import {
	MARKUP_EMPHASIS,
	handleEmphasis,
	MARKUP_HIGHLIGHT,
	handleHighlight,
	MARKUP_HIGHLIGHT2,
	handleHighlight2,
	CUE_IMAGE,
	handleCueImage
} from '../actions/meldActions';*/
import InlineSVG from 'svg-inline-react';

class MEIOrchestralView extends Component {
	constructor(props) {
		super(props);
		this.state = {
			MEIRibbon: {},
      annotations:{},
    };
	}
	render() {
		console.log("3");
		console.log("MEIO", this.props);
		if(Object.keys(this.props.MEIRibbon).length) {
			return (
				<div id={this.props.uri + "-ribbon"} className="ribbonpane">
{//					<InlineSVG className="ribbon"
//										 src={ this.props.MEIRibbon["MEIRibbon"][this.props.uri]} />-->
}				</div>
			);
		}
		return <div> Loading MEI... </div>;
	}

	componentDidMount() {
		this.props.fetchOrchestration(this.props.uri);
	}

	componentDidUpdate() {
		// for now, don't care;
	}

	handleMELDActions(annotation, fragments) {
		// for now, don't care
	}
}

function mapStateToProps({ graph }) {
	console.log("1");
	return { graph };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchOrchestration }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MEIOrchestralView);
