import store from './redux/store'
import { updatePriceData } from './redux/actions';

export let socket;

export const subscribe = (posts) => {

    if(socket) {
        posts.forEach(post => {
            if(post?.finnhub?.symbol)
                socket.send(JSON.stringify({'type':'unsubscribe','symbol': post.finnhub.symbol}))
        });

        socket = new WebSocket('wss://ws.finnhub.io?token=c0l62g748v6orbr0r0d0');
    } else {
        socket = new WebSocket('wss://ws.finnhub.io?token=c0l62g748v6orbr0r0d0');
    }

    socket.addEventListener('open', function (event) {
        posts.forEach(post => {
            if(post?.finnhub?.symbol) {
                console.log("SUBSCRIBE TO: " + post.finnhub.symbol);
                socket.send(JSON.stringify({'type': 'subscribe', 'symbol': post.finnhub.symbol}));
            }
        });
    });

    socket.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        if(data?.data) store.dispatch(updatePriceData(data.data));
    });
};

export const unsubscribeAll = (posts) => {
    if(socket) {
        posts.forEach(post => {
            if(post?.finnhub?.symbol) {
                socket.send(JSON.stringify({'type': 'unsubscribe', 'symbol': post.finnhub.symbol}))
            }
        });
    }
};

export const unsubscribePost = (post) => {
    if(socket) {
        if(post?.finnhub?.symbol) {
            socket.send(JSON.stringify({'type': 'unsubscribe', 'symbol': post.finnhub.symbol}))
        }
    }
};