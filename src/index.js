import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import { Router, Route, browserHistory } from 'react-router'

import { reducers } from 'meld-clients-core/src/reducers';
import App from './containers/app';
//import ForbiddenQuestion from './containers/musicology/forbiddenQuestion';

//const createStoreWithMiddleware = applyMiddleware(thunk, ReduxPromise)(createStore);

//	<Provider store={createStoreWithMiddleware(lohengrinReducers)}>

ReactDOM.render(
		<Provider store={createStore(reducers, applyMiddleware(thunk, ReduxPromise))}>
		<Router history={browserHistory}> 
			<Route path="/" component={App}
							 graphUri="http://localhost:8081/annotations/AskingForbidden.json-ld"
//	graphUri="http://meld.linkedmusic.org/companion/Frageverbot.nq"
//					 graphUri="https://meld.linkedmusic.org/annotations/AskingForbidden.json-ld"
					 // graphUriList={
					 // 	 ["https://meld.linkedmusic.org/annotations/Frageverbot1.json-ld", "https://meld.linkedmusic.org/companion/F1.nq",
					 // 		"https://meld.linkedmusic.org/annotations/Frageverbot2.json-ld", "https://meld.linkedmusic.org/companion/F2.nq",
					 // 		"http://meld.linkedmusic.org/annotations/Frageverbot3.json-ld", "https://meld.linkedmusic.org/companion/F3.nq",
					 // 		"http://meld.linkedmusic.org/annotations/Frageverbot4.json-ld", "https://meld.linkedmusic.org/companion/F4.nq",
					 // 		"http://meld.linkedmusic.org/annotations/Frageverbot5.json-ld", "https://meld.linkedmusic.org/companion/F5.nq",
					 // 		"http://meld.linkedmusic.org/annotations/Frageverbot6.json-ld", "https://meld.linkedmusic.org/companion/F6.nq",
							
					 // ]}
					 />
		  <Route path="/TimeMachine" component={App} mode="TimeMachine" 
						 graphUri="http://localhost:8080/annotations/AskingForbidden.json-ld"/>
		</Router>
	</Provider>
	, document.querySelector('.container'));
