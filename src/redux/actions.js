import axios from 'axios'

const FINNHUB_API_ENABLED = false;
const FINNHUB_TOKEN = "c622n1qad3iacs611jv0";

// FINNHUB https://finnhub.io
const GET_FINNHUB_EXCHANGE_URL = 'https://finnhub.io/api/v1/crypto/symbol?exchange=[EXCHANGE]&token=' + FINNHUB_TOKEN;
const GET_FINNHUB_PATTERN_RECOGNITION_URL = 'https://finnhub.io/api/v1/scan/pattern?symbol=[SYMBOL]&resolution=[RESOLUTION]&token=' + FINNHUB_TOKEN;
const GET_FINNHUB_GRAPH_URL = 'https://finnhub.io/api/v1/crypto/candle?symbol=[SYMBOL]&resolution=[RESOLUTION]&from=[TIME_START]&to=[TIME_END]&token=' + FINNHUB_TOKEN;

// COINGECKO https://api.coingecko.com
const GET_COIN_LIST = 'https://api.coingecko.com/api/v3/coins/list';
const GET_GRAPH_URL = 'https://api.coingecko.com/api/v3/coins/[ID]/ohlc?vs_currency=usd&days=1';
const GET_POST_URL = 'https://api.coingecko.com/api/v3/coins/[ID]?localization=false&tickers=true&market_data=true&community_data=false&developer_data=false&sparkline=false';

export const sort = () => ({
    type : 'SORT_POSTS'
});

export const saveAutoPlay = (isChecked) => ({
    type: 'SAVE_AUTO_PLAY',
    payload: { isChecked }
});

export const goNext = (isNext) => ({
    type : 'GO_NEXT_PAGE',
    payload: { isNext }
});

export const webSocketConnected = (isConnected) => ({
    type : 'WEB_SOCKET_IS_CONNECTED_SUCCESS',
    payload: { isConnected }
});

export const postConnectedToWebsocket = (id, isConnected) => ({
    type : 'POST_CONNECTED_TO_WEB_SOCKET_SUCCESS',
    payload: { id, isConnected }
});

export const changeGridLayout = (layout) => ({
    type: 'CHANGE_GRID_LAYOUT_SUCCESS',
    payload: { layout }
});

export const updatePriceData = (data) => ({
    type: 'UPDATE_PRICE_DATA_SUCCESS',
    payload: { data }
});

export const deletePost = (post) => ({
    type: 'DELETE_POST_SUCCESS',
    payload: { post: post }
});

export const clearAllPosts = () => ({
    type: 'CLEAR_ALL_POSTS_SUCCESS'
});

const preparePostSuccess = (id) => ({
   type: 'PREPARE_POST_SUCCESS',
   payload: { post: {id: id, prepare: true} }
});

export const preparePost = (id, currency) => {
    return async dispatch => {
        try {
            dispatch(preparePostSuccess(id));
        } catch(e) {
            console.log(e);
        }
    }
};

const fetchPostSuccess = (post, exchange) => ({
    type: 'FETCH_POST_SUCCESS',
    payload: { post, exchange }
});

export const fetchPost = (id, currency, token) => {

    const findTradeExchange = (post) => {
        // TODO: finnhub supported exchanges this can be fetched from https://finnhub.io/api/v1/crypto/exchange?token=c0l62g748v6orbr0r0d0
        const supportedExchanges = [
            "KRAKEN",
            "HITBTC",
            "COINBASE",
            "GEMINI",
            "POLONIEX",
            "Binance",
            "ZB",
            "BITTREX",
            "KUCOIN",
            "OKEX",
            "BITFINEX",
            "HUOBI"
        ];

        const ticker = post.tickers.find(ticker => supportedExchanges.includes(ticker.market.identifier.toUpperCase()));
        return ticker !== undefined ? ticker.market.identifier : null;
    };

    return async dispatch => {
        try {
            // FETCH CRYPTO INFO FROM COIN GECKO
            let post = await axios.get(GET_POST_URL.replace("[ID]", id), { cancelToken: token });

            // FETCH EXCHANGE/TRADE DATA FROM FINNHUB
            const exchangeGecko = findTradeExchange(post.data);
            if(exchangeGecko) {
                let exchanges = await axios.get(GET_FINNHUB_EXCHANGE_URL.replace("[EXCHANGE]", exchangeGecko), { cancelToken: token });
                const exchangeFinnhub = exchanges.data.find(exchange => {
                    const s = (post.data.symbol.toUpperCase() + "/" + currency.toUpperCase());
                    return exchange.displaySymbol.includes(s);
                });

                dispatch(fetchPostSuccess(post.data, exchangeFinnhub));
            } else {
                dispatch(fetchPostSuccess(post.data));
            }
        } catch(e){
            if (axios.isCancel(e)) {
                console.log(`CANCELLED fetchPost: ${id}`);
            } else {
                throw e;
            }
        }
    }
};

const fetchLineDataSuccess = (chart, patterns, id) => ({
    type: 'FETCH_GRAPH_DATA_SUCCESS',
    payload: { chart, patterns, id }
});

export const fetchLineData = (id, finnhubSymbol, token) => {

    return async dispatch => {
        try {
            let lineData = [];
            let patterns = [];

            // TODO: commented out because FINHUB api is now a payed for service
            if(FINNHUB_API_ENABLED && finnhubSymbol) {
                const timeScaleHours = 8;  // TODO: make configurable
                const resolution = 5; // TODO: make configurable [1, 5, 15, 30, 60, D, W, M]

                const timeSliceEnd = new Date();
                const timeSliceStart = new Date(timeSliceEnd.getTime());
                timeSliceStart.setHours(timeSliceEnd.getHours() - timeScaleHours);

                const patternData = await axios.get(GET_FINNHUB_PATTERN_RECOGNITION_URL
                    .replace("[SYMBOL]", finnhubSymbol)
                    .replace("[RESOLUTION]", resolution), { cancelToken: token });

                if(patternData) {
                    patterns = patternData.data.points;
                }

                lineData = await axios.get(GET_FINNHUB_GRAPH_URL.replace("[SYMBOL]", finnhubSymbol)
                    .replace("[RESOLUTION]", resolution)
                    .replace("[TIME_START]", Math.round(timeSliceStart.valueOf()/1000))
                    .replace("[TIME_END]",  Math.round(timeSliceEnd.valueOf()/1000)), { cancelToken: token });

                if(lineData) {
                    // [Timestamp, O, H, L, C]
                    const data = [];
                    const length = lineData.data?.t === undefined ? 0 : lineData.data?.t?.length;
                    for(let i = 0; i < length; i++) {
                        let series = [Math.floor(lineData.data.t[i] * 1000), lineData.data.o[i], lineData.data.h[i], lineData.data.l[i], lineData.data.c[i]];
                        data.push(series);
                    }

                    if(data.length > 0)
                        lineData = [{ data: data }];
                    else
                        lineData = [ { data: [] }];
                }
            } else {
                lineData = await axios.get(GET_GRAPH_URL.replace("[ID]", id), { cancelToken: token });
                if(lineData)
                    lineData = [{ data: lineData.data }];
                else
                    lineData = [ { data: [] }];
            }

            dispatch(fetchLineDataSuccess(lineData, patterns, id))
        } catch(e) {
            if (axios.isCancel(e)) {
                console.log(`CANCELLED fetchLineData: ${id}`);
            } else {
                throw e;
            }
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