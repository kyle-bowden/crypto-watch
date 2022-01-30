import store from './redux/store'
import { updatePriceData, postConnectedToWebsocket, webSocketConnected } from './redux/actions';

const FINNHUB_WEB_SOCKET_URL = 'wss://ws.finnhub.io?token=c622n1qad3iacs611jv0';

let retryInterval;
let inRetry = false;
let retryCount = 0;
let MAX_RETRIES = 5;
let START_SECONDS = 2500;
let retrySeconds = START_SECONDS;

export let socket;

export const connect = () => {
    socket = new WebSocket(FINNHUB_WEB_SOCKET_URL);

    const retryWebSocketConnection = () => {
        if(retryCount > MAX_RETRIES) {
            console.log("MAX RETRY ATTEMPTS MADE!");
            cancelRetry();
        } else {
            console.log(`RETRYING WEBSOCKET CONNECTION [${retryCount}/${MAX_RETRIES}]`);
            connect();
        }
    };

    const cancelRetry = () => {
        if(retryInterval) {
            clearTimeout(retryInterval);
            retryInterval = null;
        }

        // TODO: need correct mechanism for resetting retry vars
        // retrySeconds = START_SECONDS;
        // retryCount = 0;
        // inRetry = false;
    };

    socket.addEventListener('open', function (event) {
        console.log(`CONNECTED TO ${FINNHUB_WEB_SOCKET_URL}`);

        if(inRetry) {
            console.log(`CONNECT ALL POSTS TO ${FINNHUB_WEB_SOCKET_URL}`);
            store.dispatch(webSocketConnected(true));

            cancelRetry();
        }
    });

    socket.addEventListener('close', (event) => {
        console.log('CONNECTION CLOSED!');
        console.log(event);

        if(retryCount <= MAX_RETRIES) {
            store.dispatch(webSocketConnected(false));

            socket = null;
            if(!retryInterval) {
                retryInterval = setTimeout(() => retryWebSocketConnection(), retrySeconds);
                retrySeconds *= 2;
                retryCount++;
            }
            inRetry = true;
        }
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
            socket.send(JSON.stringify({'type': 'unsubscribe', 'symbol': symbol}));

            store.dispatch(postConnectedToWebsocket(id, false));
        }
    }
};