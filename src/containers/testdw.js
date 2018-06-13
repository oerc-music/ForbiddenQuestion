import React, { Component } from 'react';
import MEICarousel from '../containers/carousel';
import { Media, Player, controls, utils } from 'react-media-player'
const { formatTime } = utils

export default class TestDW extends Component { 
	constructor(props) {
		super(props);
		this.tick = this.tick.bind(this);
		this.state = { lastMediaTick: 0 };
	}

	render() {
		var motif = this.props.location.query.motif || 'F1';
		return (
		  <div> 
		  	<link rel="stylesheet" href="../../style/carousel.css" type="text/css" />
			<MEICarousel />
			<Media>
				<div className="media">
				  <div className="media-player">
					<Player src="http://www.youtube.com/embed/FfBP2UNcMX8" onTimeUpdate={ (t) => {this.tick(t)} } />
				  </div>
				</div>
		    </Media>

      </div>
		);
	}

	tick(t) {
		if(Math.floor(t.currentTime) > this.state.lastMediaTick) { 
			this.setState({ lastMediaTick: Math.floor(t.currentTime) });
			console.log("TICK!! ", utils.formatTime(t.currentTime));
			// dispatch a "TICK" action here, any time-sensitive component
			// subscribes to it, time-anchored annotations triggered as
			// appropriate
		}
	}
}
