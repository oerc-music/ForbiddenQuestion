import React, { Component } from 'react';

class AudioWithState extends Component {
	constructor(props) {
		super(props);
		this.state = {
			duration: null,
			pos: null
		};
  };
	
	handlePlay() {
		this.audio.play();
	}
	
	handleStop() {
		this.audio.currentTime = 0;
		this.slider.value = 0;
		this.audio.pause(); 
	}

	componentDidMount() {
		this.currentTimeInterval = null;
		
		// Get duration of the song and set it as max slider value
		this.audio.onloadedmetadata = function() {
			this.setState({duration: this.audio.duration,
										 pos: 0});
		}.bind(this);
		
		// Sync slider position with song current time
		this.audio.onplay = () => {
			this.currentTimeInterval = setInterval( () => {
				this.props.modifyCurrentPlaybackTime(this.audio.currentTime);
				this.setState({pos: this.audio.currentTime
											}, 200);
			});
		};
		
		this.audio.onpause = () => {
			clearInterval(this.currentTimeInterval);
		};
		
		// Seek functionality
		this.slider.onchange = (e) => {
			clearInterval(this.currentTimeInterval);
			this.audio.currentTime = e.target.value;
			this.props.modifyCurrentPlaybackTime(e.target.value);
		};
	}

	render() {
		const src = this.props.uri;
		
		return <div>
			<audio ref={(audio) => { this.audio = audio }} src={src} />
			
			<input type="button" value="Play"
				onClick={ this.handlePlay.bind(this) } />
			
			<input type="button"
					value="Stop"
					onClick={ this.handleStop.bind(this) } />
			
			<p><input ref={(slider) => { this.slider = slider }}
					type="range"
					name="points"
					min="0" max={this.state.duration} /> </p>
		</div>
	}
}
