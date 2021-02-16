import { createStore, applyMiddleware, compose} from 'redux';
import thunk from 'redux-thunk'
import posts from './reducers'
import {loadState, saveState} from "../localStorage";

//code to setup redux dev tools
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const persistedState = loadState();

const store = createStore(posts, persistedState, composeEnhancers(
    applyMiddleware(thunk)
));

store.subscribe(() => {
    saveState({
        charts: [],
        posts: store.getState().posts.map(post => { return {id: post.id, symbol: post.symbol, tickers: post.tickers, prepare: true, reload: true}}),
        coins: store.getState().coins,
        currency: store.getState().currency
    });
});

export default store