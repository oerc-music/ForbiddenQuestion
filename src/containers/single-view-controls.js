import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';

export default class SingleControls extends Component {
	constructor(props){
		super(props);
	};
	render(){
		if(this.props.location){
			var replaceuri = "TimeMachine";
			console.log(this.props.location.query);
			var adduri = 'TimeMachine?position=right&supplements='+this.props.location.query.motif;
			return (
				<div className="control leftbuttonblock">
					<a className="anchorbutton replace" href={replaceuri}>O</a>
					<a className="anchorbutton add" href={adduri}>+</a>
				</div>
			);
		}
		return <div>Loading...</div>;
	}
}
