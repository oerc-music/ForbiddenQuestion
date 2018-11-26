import React, { Component } from 'react';
import { connect } from 'react-redux' ;
import { bindActionCreators } from 'redux';
import MediaPlayer from '../components/mediaPlayer';
import AudioPlayer from '../components/audioPlayer';

//import Score from 'meld-client/src/containers/score';
import Score from '../containers/score';
import OrchestralRibbon from '../containers/orchestralRibbon';
import TEI from '../containers/tei';
import MyImage from 'meld-clients-core/src/containers/image';
//import MEICarousel from '../containers/carousel';
import MEICarousel from '../containers/new-carousel';
import MEITimeline from '../containers/timeline';
import TwinControls from '../containers/controls';
import SingleControls from '../containers/single-view-controls';
import { fetchGraph } from 'meld-clients-core/src/actions/index';

const MEIManifestation = "meldterm:MEIManifestation";
const TEIManifestation = "meldterm:TEIManifestation";
const IIIFManifestation = "meldterm:IIIFManifestation";
const VideoManifestation = "meldterm:VideoManifestation";
const AudioManifestation = "meldterm:AudioManifestation";
const ImageManifestation = "meldterm:ImageManifestation";
const Carousel= "meldterm:MEICarousel";
const CarouselClassic= "meldterm:MEIClassicCarousel";
const FOR_ORCHESTRA = "http://id.loc.gov/authorities/performanceMediums/2013015516";
const HAS_PIANO = "http://id.loc.gov/authorities/performanceMediums/2013015550";

class App extends Component { 
	constructor(props) {
		super(props);
		this.state = { currentMotif: this.props.motif || false };
	}
 
	componentDidMount() { 
		if(this.props.graphUri) { 
			const graphUri = this.props.graphUri;
			this.props.fetchGraph(graphUri);
			window.addEventListener("resize", this.updateDimensions.bind(this));
		}
	}
	handleMotifChange(motif){
		this.setState({currentMotif: motif});
	}
	
  updateDimensions() {
    this.setState({width: document.documentElement.clientWidth,
									 height: document.documentElement.clientHeight});
  }
  componentWillMount() {
    this.updateDimensions();
  }
  componentWillUnmount() {
    window.removeEventListener("resize", this.updateDimensions);
  }
	
	render() { 
		// Build an array of JSX objects corresponding to the annotation
		// targets in our topLevel
		var textBoxHeight = Math.max(this.state.height/5, 200);
		if(this.props.graph.targetsById) { 
//			console.log("Props: ", this.props);
      const byId = this.props.graph.targetsById;
			return ( 
				<div className="wrapper">
					<link rel="stylesheet" href="../style/style.css"/>
					<link rel="stylesheet" href="../style/CETEIcean.css"/>
					<div className="controls" />
					{ this.props.twins ?
						<TwinControls location={this.props.location} /> :
						( this.props.singlet ?
							<SingleControls location={this.props.location} /> : false )
					}
						{ 
							this.props.motif && <MEITimeline key="UniqueTimeline"
														structures={MEITimeline.defaultStructures}
														motif={this.state.currentMotif}
														onMotifChange={this.handleMotifChange.bind(this)}/>
							}

                {/*		{this.props.graph.annoGraph["@graph"]["ldp:contains"][0]["oa:hasTarget"].map(function (t) { */}
        {Object.keys(byId).map( (id) => {
						switch(byId[id]["type"]) { 
							case CarouselClassic:
								return(<div>
											 <MEICarousel motif={this.state.currentMotif} ref="carousel"
											 onMotifChange={this.handleMotifChange.bind(this)}
											 position={this.props.location.query.position}
											 supplements={this.props.location.query.supplements}
											 layout="classic"/>
											 </div>);
						case Carousel:
							return(<div>
								<MEICarousel layout="prism"/>
										 </div>);
							case MEIManifestation:
								if(this.props.score.scoreMapping[id] && this.props.role!=="carousel"){
									if(FOR_ORCHESTRA in this.props.score.scoreMapping[id]){
										return <OrchestralRibbon key={ id+"ribbon" } uri={ id } width={400} height={this.state.height - textBoxHeight - 50}  />;
									} else if (HAS_PIANO in this.props.score.scoreMapping[id]){							
										return <Score key={ id } uri={ id } annotations={ byId[id]["annotations"] }
										showLibretto={this.props.showLibretto} className={this.props.rightMotif===this.props.graph.targetsById[id].annotations[0]['@id'] ? 'right' : 'left'} />;
									} else {
										return;
//									return <Score key={ id } uri={ id } annotations={ byId[id]["annotations"] } />;
									}
								} else {
//									console.log("ignoring score");
								//console.log("No performance medium at all!", id);
								return;
//								return <Score key={ id } uri={ id } annotations={ byId[id]["annotations"] } />;
							}
							case TEIManifestation:
								if(this.state.currentMotif){
									if(id.substring(id.lastIndexOf("/")+1)==this.state.currentMotif){
										return <TEI key={ id } uri={ id } motif={this.state.currentMotif}
										  height={textBoxHeight}
														onMotifChange={this.handleMotifChange.bind(this)}
							      annotations={ byId[id]["annotations"] } />;
									} else return false;
								} else {
									return <TEI key={ id } uri={ id } annotations={ byId[id]["annotations"] }
									className={this.props.rightMotif===this.props.graph.targetsById[id].annotations[0]['@id'] ? 'right' : 'left'}
									librettoElements={this.props.librettoElements} />;
								}/**/
						case VideoManifestation: 
							return <MediaPlayer key={ id } uri={ id } />;
						case AudioManifestation: 
                return <AudioPlayer key={ id } uri={ id } className={this.props.rightMotif===this.props.graph.targetsById[id].annotations[0]['@id'] ? 'right' : 'left'}/>;
						case ImageManifestation: 
                            return <MyImage key={ id } uri={ id } className={this.props.rightMotif===this.props.graph.targetsById[id].annotations[0]['@id'] ? 'right' : 'left'}/>;
						default: 
							return <div key={ id }>Unhandled target type: { byId[id]["type"] }</div>
						}
					})}
				</div>
			);
		}
		return (<div> Loading...  </div>);
	}
	
};


function mapStateToProps({ graph , score}) {
	return { graph , score }
}

function mapDispatchToProps(dispatch) { 
	return bindActionCreators({ fetchGraph }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(App);

