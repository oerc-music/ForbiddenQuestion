// import React, { Component }  from 'react';
import React  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
// import { Router, Route, browserHistory } from 'react-router'

import { reducers } from 'meld-clients-core/lib/reducers';
import App from './containers/app';

ReactDOM.render(
  <Provider store={createStore(reducers, applyMiddleware(thunk, ReduxPromise))}>
    <App graphUri="http://localhost:8081/annotations/AskingForbidden.json-ld" />
  </Provider>
  , document.querySelector('.container'));
/*
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
		</Router>
	</Provider>
	, document.querySelector('.container'));
*/
