import { slide as Menu } from 'react-burger-menu'
import React, { Component } from 'react';

export default class Burger extends Component {
  showSettings (event) {
		console.log("yay");
  }

  render () {
    return (
      <Menu>
        <a id="home" className="menu-item" href="/">Home</a>
				<a id="TM" className="menu-item" onClick={this.props.TM}><div className="icon timemachine"><img src="/style/icons/timemachine.svg"/></div>Time Machine</a>
				<a id="Iteration" className="menu-item" onClick={this.props.iteration}><div className="icon timemachine"><img src="/style/icons/iteration.svg"/></div>Iteration</a>
				<a id="Essay" className="menu-item" onClick={this.props.essay}><div className="icon essay"><img src="/style/icons/essay.svg"/></div>Essay</a>
      </Menu>
    );
  }
}
