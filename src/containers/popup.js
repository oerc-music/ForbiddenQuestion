import React, { Component } from 'react';
import TEI from 'meld-clients-core/src/containers/tei';

export default class Popup extends Component {
	constructor(props) { 
		super(props);
	}

  render () {
		var TEIBlocks = this.props.uris.map(uri=><TEI key={ uri } uri={ uri } />);
		console.log('yay');
    return (
			<div className="background">
				<div className="popup">
					{TEIBlocks}
				</div>
			</div>
    );
  }
}
