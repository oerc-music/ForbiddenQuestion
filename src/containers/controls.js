import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';

export default class TwinControls extends Component {
	constructor(props){
		super(props);
	}
	render(){
		if(this.props.location){
			var closelefturi = '/ForbiddenQuestion?motif='+this.props.location.query.motif[1];
			var closerighturi = '/ForbiddenQuestion?motif='+this.props.location.query.motif[0];
			var replacelefturi = '/TimeMachine?position=left&supplements='+this.props.location.query.motif[1];
			var replacerighturi = '/TimeMachine?position=right&supplements='+this.props.location.query.motif[0];
			return (
					<div className="motifcontrols">
					<div className="leftbuttonblock">
			    <a className="anchorbutton close" href={closelefturi}>-</a>
			    <a className="anchorbutton replace" href={replacelefturi}>O</a>
					</div>
					<div className="rightbuttonblock">
			    <a className="anchorbutton close" href={closerighturi}>-</a>
			    <a className="anchorbutton replace" href={replacerighturi}>O</a>
					</div>
					</div>
			);
		}
		return <div>Loading...</div>;
	}
}
