import axios from 'axios'

const GET_COIN_LIST = 'https://api.coingecko.com/api/v3/coins/list';
const GET_GRAPH_URL = 'https://api.coingecko.com/api/v3/coins/[ID]/ohlc?vs_currency=usd&days=1';
const GET_POST_URL = 'https://api.coingecko.com/api/v3/coins/[ID]?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false';

const refreshAllPostsSuccess = post => ({
    type: 'REFRESH_ALL_POSTS_SUCCESS',
    payload: { post }
});

export const refreshAllPosts = (posts) => {

    return async dispatch => {
        try {
            posts.map(async post => {
                let updatedPost = await axios.get(GET_POST_URL.replace("[ID]", post.id));
                dispatch(refreshAllPostsSuccess(updatedPost.data));
            });
        } catch(e){
            console.log(e)
        }
    }
};

export const deletePost = (post) => ({
    type: 'DELETE_POST_SUCCESS',
    payload: { post: post }
});

export const clearAllPosts = () => ({
    type: 'CLEAR_ALL_POSTS_SUCCESS',
    payload: { posts: [] }
});

const preparePostSuccess = (id) => ({
   type: 'PREPARE_POST_SUCCESS',
   payload: { post: {id: id, prepare: true} }
});

export const preparePost = (id) => {
    return async dispatch => {
        try {
            dispatch(preparePostSuccess(id));
            dispatch(fetchPost(id));
        } catch(e) {
            console.log(e);
        }
    }
};

const fetchPostSuccess = post => ({
    type: 'FETCH_POST_SUCCESS',
    payload: { post }
});

export const fetchPost = (id) => {

    return async dispatch => {
        try {
            let post = await axios.get(GET_POST_URL.replace("[ID]", id));
            dispatch(fetchPostSuccess(post.data))
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