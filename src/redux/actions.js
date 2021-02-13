import axios from 'axios'

const GET_COIN_LIST = 'https://api.coingecko.com/api/v3/coins/list';
const GET_GRAPH_URL = 'https://api.coingecko.com/api/v3/coins/[ID]/ohlc?vs_currency=usd&days=1';
const GET_POST_URL = 'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=[POST_IDS]&category=coin%2Cdecentralized_finance_defi&order=market_cap_desc&per_page=100&page=1&sparkline=false&price_change_percentage=1h';

const refreshAllPostsSuccess = posts => ({
    type: 'REFRESH_ALL_POSTS_SUCCESS',
    payload: { posts }
});

export const refreshAllPosts = (posts) => {

    return async dispatch => {
        try {
            const postIds = posts.map(post => post.id).join("%2C");
            let updatedPosts = await axios.get(GET_POST_URL.replace("[POST_IDS]", postIds));
            dispatch(refreshAllPostsSuccess(updatedPosts.data));
        } catch(e){
            console.log(e)
        }
    }
};

export const clearAllPosts = () => ({
    type: 'CLEAR_ALL_POSTS_SUCCESS',
    payload: { posts: [] }
});

export const preparePost = (id) => ({
   type: 'PREPARE_POST_SUCCESS',
   payload: { post: {id: id, prepare: true} }
});

const fetchPostSuccess = post => ({
    type: 'FETCH_POST_SUCCESS',
    payload: { post }
});

export const fetchPost = (id) => {

    return async dispatch => {
        try {
            let post = await axios.get(GET_POST_URL.replace("[POST_IDS]", id));
            dispatch(fetchPostSuccess(post.data[0]))
        } catch(e){
            console.log(e)
        }
    }
};

const fetchLineDataSuccess = (chart, id) => ({
    type: 'FETCH_GRAPH_DATA_SUCCESS',
    payload: { chart, id }
});

export const fetchLineData = (id) => {

    return async dispatch => {
        try {
            let lineData = await axios.get(GET_GRAPH_URL.replace("[ID]", id));
            dispatch(fetchLineDataSuccess(lineData.data, id))
        } catch(e){
            console.log(e)
        }
    }
};

const fetchCoinListSuccess = coins => ({
    type: 'FETCH_COIN_LIST_SUCCESS',
    payload: { coins }
});

export const fetchCoinList = () => {

    return async dispatch => {
        try {
            let coins = await axios.get(GET_COIN_LIST);
            dispatch(fetchCoinListSuccess(coins.data))
        } catch(e){
            console.log(e)
        }
    }
};