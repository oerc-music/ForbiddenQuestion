import React, { Component } from 'react';

export default class AudioPlayer extends Component { 
    constructor(props) { 
      super(props);
    }

    render() { 
        return (
            <audio controls data-uri={this.props.uri} className={this.props.className ? this.props.className : "unstyled"}>
              <source src={this.props.uri} type="audio/mp3" />
            </audio>
        )
    }
}
