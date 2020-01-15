import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { bindActionCreators} from 'redux';
import { fetchGraph } from 'meld-clients-core/src/actions/index';

//import InlineSVG from 'svg-inline-react';

class MEITimeline extends Component {
  constructor(props) {
    super(props);
    this.state={
      structures: [['overture', 'Vorspiel', 75, false],
                            ['act', 'One', [['scene', 1, 262],
                                          ['scene', 2, 397],
                                          ['scene', 3, 587]],
                              [['F1', 777], ['F2', 789]]],
                            ['act', 'Two', [['scene', 1, 423],
                                           ['scene', 2, 443],
                                           ['scene', 3, 479],
                                           ['scene', 4, 283],
                                           ['scene', 5, 478]],
                              [['F3', 18], ['F4', 31], ['F5', 288], ['F6', 767], ['F7', 1875], ['F8', 1949], ['F9', 2098]]],
                            ['act', 'Three', [['scene', 1, 174],
                                           ['scene', 2, 553],
                                           ['scene', 3, 845]],
                             [['F10', 494], ['F11', 621], ['F12', 737], ['F13',824], ['F14', 832], ['F15', 836], ['F16',1062]]]],
			bubble: false,
			hover: false,
			actxx: [],
			showLegend: false,
			motifxx: {},
			zoom: false
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
	showLegend(){
		return (
			<svg id="timelineLegend" width="180" height="90">
				<rect className="background" x="0" y="0" height="70" width="170"
							rx="4" ry="4"/>
				<circle className="legend AKeys" cx="20" cy="25" r="5"/>
				<text className="legend AKeys" x="35" y="30">A and A Flat Keys</text>
				<circle className="legend FKeys" cx="20" cy="45" r="5"/>
				<text className="legend FKeys" x="35" y="50">F and F Sharp Keys</text>
				<path className="background" d="M 130,70 L 135,76 L 140,70 z" />
			</svg>
		);
	}
	toggleLegend(){
		this.setState({showLegend: !this.state.showLegend});
	}
  motifChangeClickHandler(event){
    var el = event.target;
//		console.log(el.className);
		var motif = el.className.baseVal.match(/F[0-9]+/)[0];
    //var motif = el.getAttributeNS(null, 'class').match(/F[0-9]+/)[0];
		motif = shortnameToURI(motif);
    this.props.onMotifChange(motif);
  }
	motifHoverOrTouchHandler(event){
		var el = event.target;
		//		var motif = el.getAttributeNS(null, 'class').match(/F[0-9]+/)[0];
//		console.log(el.className);
		var motif = el.className.baseVal.match(/F[0-9]+/)[0];
		motif = shortnameToURI(motif);
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
	expand(){
		this.setState({zoom: true});
	}
	contract(){
		this.setState({zoom: false});
	}
  render(){
    if(this.props.structures || this.state.structures) {
      var structures = this.props.structures || this.state.structures;
      var boxTop = this.props.boxTop || 50;
      var boxHeight= this.props.boxHeight || 20;
      var boxBottom = boxTop+boxHeight;
			var button, width;
			if(this.state.zoom){
				width = 5000;
				button = (<div className="zoomieButton" onClick={this.contract.bind(this)}>Contract</div>);
			}	else {
				width = this.props.width || 1200;
				button = (<div className="zoomieButton" onClick={this.expand.bind(this)}>Expand</div>);
			}
      var height = this.props.height || 120;
      var barCount = this.sumBars(this.state.structures);
			var mainTimelineTop = (height / 2) + 10;
			var mainTimelineHeight=20;
			var progressTimelineTop = mainTimelineTop - 10;
			var progressTimelineHeight = 4;
			var bubbleTop = height - 30;
			var bubbleHeight = 30;
      var scale = width / barCount;
      var curx = 0;
			var actTextVPos = mainTimelineTop - 40;
      var sceneY = mainTimelineTop -20;
      var motifLines = [];
      var divLines = [];
			var actBoxes = [];
			var scenelines = [];
			var currentBox = false;
			var current2Box = false;
			var currentBubble = false;
			var currentBubble2 = false;
			var actLabels = [];
			var sceneLabels = [];
			var key = false;
			var actxx = [];
			var passedCurrent = false;
			var passedCurrent2 = false;
      for(var i=0; i<structures.length; i++){
        var act = structures[i];
        var actString = act[0]+"-"+act[1];
				var actLength = isNaN(act[2]) ? act[2].reduce((tot, scene)=>tot+scene[2], 0) : act[2];
				actxx.push([curx, actLength*scale]);
				var prevx = 0;
        // draw lines for motifs (first because bar numbers are indexed by act, not scene)
        if(act[3] && act[3].length){
          for(var m=0; m<act[3].length; m++){
            var motif = act[3][m];
						var motifUri = shortnameToURI(motif[0]);
						var x = curx+(motif[1]*scale);
            // var current = this.props.motif && this.props.motif==motif[0];
						var current = this.props.motif && (this.props.motif==motifUri
																							 || (Array.isArray(this.props.motif)
																									 && this.props.motif.indexOf(motifUri)>-1
																									 && !passedCurrent)); // Compare view
						var current2 = this.props.motif && Array.isArray(this.props.motif)
								&& this.props.motif.indexOf(motifUri)>-1
								&& passedCurrent;
						if(current) passedCurrent=true;
						if(current2 || (current && !Array.isArray(this.props.motif))) passedCurrent2 = true;
						var hovered = this.state.hover && this.state.hover==motif[0];
            var currentClass = current ? " active" : "";
						if(motif[2]) currentClass += " " +motif[2];
            var fun = this.motifChangeClickHandler.bind(this);
						var funh = this.motifHoverOrTouchHandler.bind(this);
						var funend = this.motifFocusLeavesHandler.bind(this);
						var motifData = this.props.iterations ? this.props.iterations.find(x=>x['@id']==motifUri) : false;
						// if(motifData) {
						// 	console.log(motifData);
						// 	motifData = motifData[0];
						// }
						var key = "unspecifiedKey";
						if(motifData
							 && 'http://purl.org/ontology/mo/key' in motifData){
							key = URIFragment(motifData['http://purl.org/ontology/mo/key']['@id']);
						}
						var extrasx = prevx && x-prevx<32 ? Math.max(prevx+26, x) : x - 13; 
						if(current){
							currentBubble =(
								<g className="motifInfo" key={"cb-"+i+"-"+m}>
									<rect className="motifBubble" x={Array.isArray(this.props.motif) ? Math.max(0, x-150) : Math.max(0, x-80)} y={bubbleTop} width={160} height={bubbleHeight} rx="2" ry="2"/>
									<path d={"M "+x+","+(bubbleTop-8)+" L "+(x-6)+","+bubbleTop+" L "+(x+6)+","+bubbleTop+" z"} className="motifBubble" />
									<text className="motifBubbleText"
												x={Array.isArray(this.props.motif) ? Math.max(50, x-70) : Math.max(50, x)} y={bubbleTop+18}>{(motif[0].substring(0,1)=='F' ? 'Frageverbot ' : motif[0].substring(0, 1))+motif[0].substring(1)}</text>
								</g>);
							;
							currentBox = (
								<rect className="progressToNow" key={"cbx-"+i+"-"+m} x={actxx[actxx.length-1][0]}
											y={progressTimelineTop} rx="2" ry="2"
											width={x-actxx[actxx.length-1][0]} height={progressTimelineHeight}></rect>);
							passedCurrent = x;
						}
						if(current2){
							currentBubble2 =(
								<g className="motifInfo bubble2" key={"cb-"+i+"-"+m}>
									<rect className="motifBubble bubble2" x={x-10} y={bubbleTop} width={160} height={bubbleHeight} rx="2" ry="2"/>
									<path d={"M "+x+","+(bubbleTop-8)+" L "+(x-6)+","+bubbleTop+" L "+(x+6)+","+bubbleTop+" z"} className="motifBubble" />
									<text className="motifBubbleText" x={x+70} y={bubbleTop+18}>{(motif[0].substring(0,1)=='F' ? 'Frageverbot ' : motif[0].substring(0, 1))+motif[0].substring(1)}</text>
								</g>);
							;
							console.log(passedCurrent)
							current2Box = (
								<rect className="compareMiddle progressBox" key={"cbx-"+i+"-"+m}
											x={Math.max(actxx[actxx.length-1][0], passedCurrent)}
											y={progressTimelineTop} rx="2" ry="2"
											width={x-(Math.max(actxx[actxx.length-1][0], passedCurrent))} height={progressTimelineHeight}></rect>);
						}
						prevx = extrasx;
//						this.state.motifxx[motif[0]] = curx+(motif[1]*scale);
            motifLines.push(<line key={"ml-"+i+"-"+m}
																	className={"annotation annotation__AskingForbidden_"+motif[0]+"_1"+currentClass+" "+key}
																	onClick={ fun } onMouseEnter={ funh } onTouchStart={ funh } onMouseLeave={ funend }
																	x1={curx+(motif[1]*scale)} x2={curx+(motif[1]*scale)}
																	y1={mainTimelineTop} y2={mainTimelineTop+mainTimelineHeight} />);
          }
        }
				actBoxes.push(<rect key={"abm-"+i+"-"+m} className="actBox" y={mainTimelineTop} x={curx} rx="6" ry="6"
											width={actLength*scale-2} height={mainTimelineHeight}></rect>);
				actBoxes.push(<rect className={passedCurrent ? (passedCurrent2 ? 'progressBox' : 'progressBox compareMiddle') : 'progressToNow'} y={progressTimelineTop} x={curx}
											rx="2" ry="2" key={"abp-"+i+"-"+m}
											width={actLength*scale-2} height={progressTimelineHeight}></rect>);
				actLabels.push(<text key={"al"+i+"-"+m} className="actName" x={curx} y={actLength < 100 ? actTextVPos-20 : actTextVPos}>{act[0]=='act' ? 'Act '+act[1] : act[1]}</text>);
        if(Array.isArray(act[2])){
          for(var s=0; s<act[2].length; s++){
            var scene = act[2][s];
						if(s){
							divLines.push(<line key={"tl-"+i+"-"+m+"-"+s} className="scene division"
														id={"tl-"+scene[0]+"-"+scene[1]+"-"+actString}
														x1={curx} x2={curx} y1={mainTimelineTop} y2={mainTimelineTop+mainTimelineHeight} />);
						}
            divLines.push(<text key={"tll-"+i+"-"+m+"-"+s} className="scenename" x={curx+2} y={sceneY+2}>{(scene[1]+"").substring(0, 3)}</text>);
            curx += scale*scene[2];
          }
        } else {
          curx += scale * act[2];
        }
      }
			// 					{this.state.showLegend ? this.showLegend() : false}

			return (
				<div>
					<svg width={width} height={height} className="timeline-overview">
						<text y="20" x={width/2} className="title">Lohengrin Timeline</text>
						<g className="legend">
							<circle className="legend AKeys grailRealm" cx={width-300} cy="25" r="5"/>
							<text x={width-280} y="32" className="legend AKeys grailRealm" >Grail Realm</text>
							<circle className="legend FKeys magicRealm" cx={width-150} cy="25" r="5"/>
							<text x={width-130} y="32" className="legend FKeys magicRealm" >Magical Realm</text>
						</g>
					{actBoxes}
          {divLines}
          {motifLines}
						{currentBox}
						{current2Box}
						{currentBubble}
						{currentBubble2}
						{actLabels}
						
        </svg>{button}</div> );
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
	return "https://meld.linkedmusic.org/companion/"+shortname;
}

function URIFragment(URIString){
	var result = /#(.*)$/.exec(URIString);
	if(result && result.length){
		return result[1];
	} else {
		return false;
	}
}
