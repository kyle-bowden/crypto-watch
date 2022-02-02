import store from './redux/store'
import { updatePriceData, postConnectedToWebsocket, webSocketConnected } from './redux/actions';

const WEB_SOCKET_HOST = window.location.origin.replace(/^http/, 'ws');

let inRetry = false;
let retrySeconds = 15000;

export let socket;

export const connect = () => {
    socket = new WebSocket(WEB_SOCKET_HOST);

    const retryConnection = () => {
        inRetry = true;
        setTimeout(() => connect(), retrySeconds);
    };

    const cancelRetry = () => {
        if(inRetry) {
            console.log(`CONNECT ALL POSTS TO ${WEB_SOCKET_HOST}`);
            store.dispatch(webSocketConnected(true));
            inRetry = false;
        }
    };

    socket.addEventListener('open', function (event) {
        console.log(`CONNECTED TO ${WEB_SOCKET_HOST}`);
        cancelRetry();
    });

    socket.addEventListener('close', (event) => {
        console.log('CONNECTION CLOSED!');
        console.log(event);

        store.dispatch(webSocketConnected(false));
        retryConnection();
    });

    socket.addEventListener('error', function (event) {
        console.log('WebSocket error: ', event);
    });

    socket.addEventListener('message', function (event) {
        const data = JSON.parse(event.data);
        if(data?.data) store.dispatch(updatePriceData(data.data));
    });
};

export const subscribe = (id, symbol) => {
    if(socket && socket.readyState === WebSocket.OPEN) {
        if(symbol) {
            console.log(`SUBSCRIBE TO: ${id}`);
            socket.send(JSON.stringify({'type': 'subscribe', 'symbol': symbol}));

            store.dispatch(postConnectedToWebsocket(id, true));
        }
    }
};

export const unsubscribe = (id, symbol) => {
    if(socket && socket.readyState === WebSocket.OPEN) {
        if(symbol) {
            console.log(`UNSUBSCRIBE: ${id}`);
            // TODO: because the websocket is served via the express server we cant unsubscribe in case there are multiple clients using that tracker
            //socket.send(JSON.stringify({'type': 'unsubscribe', 'symbol': symbol}));

            store.dispatch(postConnectedToWebsocket(id, false));
        }
    }
};