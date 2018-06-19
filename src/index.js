import React, { Component }  from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import ReduxPromise from 'redux-promise';
import { Router, Route, browserHistory } from 'react-router'

import { reducers } from 'meld-clients-core/src/reducers';
import App from './containers/app';
import ForbiddenQuestion from './containers/musicology/forbiddenQuestion';
import Carousel from './containers/musicology/carousel-app';
import TestDW from './containers/testdw';

const createStoreWithMiddleware = applyMiddleware(thunk, ReduxPromise)(createStore);

ReactDOM.render(
	<Provider store={createStoreWithMiddleware(reducers)}>
		<Router history={browserHistory}> 
			<Route path="/" component={App} />
			<Route path="/TimeMachine" component={Carousel}/>
		  <Route path="/ForbiddenQuestion" component={ForbiddenQuestion}/>
		  <Route path="/testdw" component={TestDW}/>
		</Router>
	</Provider>
	, document.querySelector('.container'));
