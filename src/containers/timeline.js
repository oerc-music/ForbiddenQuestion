import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { fetchGraph } from 'meld-clients-core/src/actions/index';

import InlineSVG from 'svg-inline-react';

class MEITimeline extends Component {
  constructor(props) {
    super(props);
    this.state={
      structures: [['overture', 'Vorspiel', 75, false],
                            ['act', 'I', [['scene', 1, 262],
                                          ['scene', 2, 397],
                                          ['scene', 3, 587]],
                              [['F1', 777], ['F2', 789]]],
                            ['act', 'II', [['scene', 1, 423],
                                           ['scene', 2, 443],
                                           ['scene', 3, 479],
                                           ['scene', 4, 283],
                                           ['scene', 5, 478]],
                              [['F3', 18], ['F4', 31], ['F5', 288], ['F6', 767], ['F7', 1875], ['F8', 1949], ['F9', 2098]]],
                            ['act', 'III', [['scene', 1, 174],
                                           ['scene', 2, 553],
                                           ['scene', 3, 845]],
                             [['F10', 494], ['F11', 621], ['F12', 737], ['F13',824], ['F14', 832], ['F15', 836], ['F16',1062]]]],
			bubble: false,
			hover: false,
			actxx: [],
			motifxx: {}
    };
  }

  sumBars(structures){
    var sum = 0;
    for(var i=0; i<structures.length; i++){
      if(Array.isArray(structures[i][2])){
        sum+=this.sumBars(structures[i][2]);
      } else {
        if(Number.isInteger(structures[i][2])){
          sum += structures[i][2];
        } else {
          console.log("mangled dramatic structure: ", structures[i], Array.isArray(structures[i][2]));
        }
      }
    }
    return sum;
  }
  motifChangeClickHandler(event){
    var el = event.target;
    var motif = el.getAttributeNS(null, 'class').match(/F[0-9]+/);
    this.props.onMotifChange(motif);
  }
	motifHoverOrTouchHandler(event){
		var el = event.target;
		var motif = el.getAttributeNS(null, 'class').match(/F[0-9]+/);
		this.setState({hover:motif});
		/*
		var bub = document.getElementsByClassName('bubble')[0];
		bub.innerHTML = motif;
		bub.style.left = (62+this.state.motifxx[motif])+"px";
		*/
	}
	motifFocusLeavesHandler(event){
		return this.setState({hover:false});
		/*
		var el = event.target;
		var motif = this.props.motif;
		var bub = document.getElementsByClassName('bubble')[0];
		bub.innerHTML = motif;
		bub.style.left = (62+this.state.motifxx[motif])+"px";
		*/
	}
  render(){
    if(this.state.structures) {
      var structures = this.state.structures;
      var boxTop = this.props.boxTop || 50;
      var boxHeight= this.props.boxHeight || 20;
      var boxBottom = boxTop+boxHeight;
      var width = this.props.width || 1200;
      var height = this.props.height || 120;
      var sceneY = boxBottom+((height-boxBottom)/3);
      var barCount = this.sumBars(this.state.structures);
      var scale = width / barCount;
      var curx = 0;
      var motifLines = [];
      var divLines = [];
      for(var i=0; i<structures.length; i++){
        var act = structures[i];
        var actString = act[0]+"-"+act[1];
        // Draw lines for acts
				this.state.actxx.push(curx);
        divLines.push(<line className="act division" id={"tl-"+actString} 
                      x1={curx} x2={curx} y1={i ? boxTop : boxTop+6} y2={height-10} />);
        divLines.push(<text className="actname" x={curx+2} y={height}>{(act[1]+"").substring(0, 3)}</text>);
				var prevx = 0;
        // draw lines for motifs (first because bar numbers are indexed by act, not scene)
        if(act[3] && act[3].length){
          for(var m=0; m<act[3].length; m++){
            var motif = act[3][m];
						var x = curx+(motif[1]*scale);
            var current = this.props.motif && this.props.motif==motif[0];
						var hovered = this.state.hover && this.state.hover==motif[0];
            var currentClass = current ? " active" : "";
            var fun = this.motifChangeClickHandler.bind(this);
						var funh = this.motifHoverOrTouchHandler.bind(this);
						var funend = this.motifFocusLeavesHandler.bind(this);
						var motifUri = 'http://meld.linkedmusic.org/companion/'+motif[0];
						var key = "unspecifiedKey";
						if((motifUri in this.props.graph.info) && ('key' in this.props.graph.info[motifUri])){
							key = URIFragment(this.props.graph.info[motifUri].key);
						}
						var extrasx = prevx && x-prevx<32 ? Math.max(prevx+26, x) : x - 13; 
						if(current){
							var pos = motif[1];
							var scenes = act[2];
							while(pos>scenes[0][2]){
								pos -= scenes[0][2];
								scenes = scenes.slice(1);
							}
							var motifString = motif[0].substring(1);
							this.state.bubble = <div style={{left: (72+-10+curx+motif[1]*scale)+"px", bottom: (15+boxHeight*6)+"px", position: "absolute"}} className="bubble">Frageverbot {motifString} ({act[1]}:{scenes[0][1]})</div>;
							motifLines.push(<path className={"annotation selected "+key+" annotation__AskingForbidden_"+motif[0]+"_1"+currentClass}
															onClick={ fun } onMouseEnter={ funh } onTouchStart={ funh } onMouseLeave={ funend }
															d={"M"+x+" "+(boxTop-2)+" L "+extrasx+" "+(boxTop-12)
																 +" A 12 12 0 1 1 "+(extrasx+6)+" "+(boxTop-12)
																 +" L "+x+" "+(boxTop-2)}
															/>);
							motifLines.push(<text className={"motifName selected"} x={x} y={height}>{"Frageverbot "+motifString}</text>);
						} else if(hovered){
							pos = motif[1];
							scenes = act[2];
							while(pos>scenes[0][2]){
								pos -= scenes[0][2];
								scenes = scenes.slice(1);
							}
							motifString = motif[0].substring(1);
							var hoverbubble = <div style={{left: (72+-10+curx+motif[1]*scale)+"px", bottom: (15+boxHeight*6)+"px", position: "absolute"}} className="hover bubble">Frageverbot {motifString} ({act[1]}:{scenes[0][1]})</div>;
							motifLines.push(<path className={"annotation "+key+" annotation__AskingForbidden_"+motif[0]+"_1"+currentClass}
															onClick={ fun } onMouseEnter={ funh } onTouchStart={ funh } onMouseLeave={ funend }
															d={"M"+x+" "+(boxTop-2)+" L "+extrasx+" "+(boxTop-12)
																 +" A 12 12 0 1 1 "+(extrasx+6)+" "+(boxTop-12)
																 +" L "+x+" "+(boxTop-2)}
														/>);
							motifLines.push(<text className={"motifName hovered"} x={x} y={height}>{"Frageverbot "+motifString}</text>);
						} else {
							motifLines.push(<path className={"annotation "+key+" annotation__AskingForbidden_"+motif[0]+"_1"+currentClass}
															onClick={ fun } onMouseEnter={ funh } onTouchStart={ funh } onMouseLeave={ funend }
															d={"M"+x+" "+(boxTop-2)+" L "+extrasx+" "+(boxTop-12)
																 +" A 10 10 0 1 1 "+(extrasx+6)+" "+(boxTop-12)
																 +" L "+x+" "+(boxTop-2)}
														/>);
						}
						prevx = extrasx;
//						this.state.motifxx[motif[0]] = curx+(motif[1]*scale);
            motifLines.push(<line className={"annotation annotation__AskingForbidden_"+motif[0]+"_1"+currentClass}
                            onClick={ fun } onMouseEnter={ funh } onTouchStart={ funh } onMouseLeave={ funend }
                            x1={curx+(motif[1]*scale)} x2={curx+(motif[1]*scale)}
                            y1={current ? boxTop - 20 : boxTop - 5} y2={boxBottom} />);
          }
        }
        if(Array.isArray(act[2])){
          for(var s=0; s<act[2].length; s++){
            var scene = act[2][s];
            divLines.push(<line className="scene division" id={"tl-"+scene[0]+"-"+scene[1]+"-"+actString}
                          x1={curx} x2={curx} y1={boxTop} y2={sceneY} />);
            divLines.push(<text className="scenename" x={curx+2} y={sceneY+2}>{(scene[1]+"").substring(0, 3)}</text>);
            curx += scale*scene[2];
          }
        } else {
          curx += scale * act[2];
        }
      }
			return (
				<div>{this.state.bubble}{hoverbubble}
        <svg width={width} height={height} className="timeline-overview">
          <rect className={"timeline"} y={boxTop} x="0" rx="6px" ry="6px" width={width} height={boxHeight}></rect>
          {divLines}
          {motifLines}
        </svg></div> );
		}
		return <div>Loading...</div>;
  }

}


function mapStateToProps({ graph, score }) {
	return { graph, score };
}

function mapDispatchToProps(dispatch) {
	return bindActionCreators({ fetchGraph }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(MEITimeline);

function shortnameToURI(shortname){
	return "http://meld.linkedmusic.org/companion/"+shortname;
}

function URIFragment(URIString){
	var result = /#(.*)$/.exec(URIString);
	if(result && result.length){
		return result[1];
	} else {
		return false;
	}
}
