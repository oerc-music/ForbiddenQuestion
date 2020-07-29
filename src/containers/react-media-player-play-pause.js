import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withMediaProps } from 'react-media-player'
/*import Transition from 'react-motion-ui-pack'


class ScaleX extends Component {
  render() {
    return (
      <Transition
        component="g"
        enter={{ scaleX: 1 }}
        leave={{ scaleX: 0 }}
      >
        {this.props.children}
      </Transition>
    )
  }
}
*/
class CustomPlayPause extends Component {
  _handlePlayPause = () => {
    this.props.media.playPause()
  }

  render() {
    const { media: { isPlaying }, className } = this.props
    return (
      <svg
        role="button"
        width="36px"
        height="36px"
        viewBox="0 0 36 36"
        className={className}
        onClick={this._handlePlayPause}
      >
      	<circle fill="#FFA500" cx="18" cy="18" r="18"/>
            { isPlaying &&
              <g key="pause" style={{ transformOrigin: '0% 50%' }}>
        	      <rect x="12" y="11" fill="#FFFFFF" width="4" height="14"/>
        	      <rect x="20" y="11" fill="#FFFFFF" width="4" height="14"/>
              </g>
            }
            { !isPlaying &&
              <polygon
                key="play"
                fill="#FFFFFF"
                points="14,11 26,18 14,25"
                style={{ transformOrigin: '100% 50%' }}
              />
            }
      </svg>
    )
  }
}

export default withMediaProps(CustomPlayPause)
