import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import store from './redux/store';
import {fetchCoinList} from './redux/actions';
import 'react-widgets/dist/css/react-widgets.css';

//Dispatch the fetchPosts() before our root component renders
store.dispatch(fetchCoinList());

ReactDOM.render(
    <Provider store={ store }>
        <App />
    </Provider>, document.getElementById('root')
);