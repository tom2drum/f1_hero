/* eslint-disable no-underscore-dangle */
import { applyMiddleware, compose, combineReducers, createStore } from 'redux';
import reduxThunk from 'redux-thunk';
import dataReducer from './data/reducer';

const appReducer = combineReducers({
	data: dataReducer
});

const composeEnhancers =
	typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		: compose;

const enhancer = composeEnhancers(applyMiddleware(reduxThunk));

const store = createStore(appReducer, enhancer);

export default store;
