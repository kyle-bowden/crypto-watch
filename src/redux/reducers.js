import { subscribe, unsubscribePost, unsubscribeAll } from '../webSocket';

const posts = (state = {posts: [], charts: [], coins: [], currency: 'usd'} , action) => {

    switch(action.type) {
        case 'UPDATE_PRICE_DATA_SUCCESS': {
            const posts = state.posts.map(post => {
                const specimen = action.payload.data[0];
                if (post?.finnhub?.symbol === specimen.s) {
                    // console.log("UPDATED PRICE FOR " + post.name + " - " + specimen.p.toFixed(2));
                    return {...post, finnhub: {...post.finnhub, price: specimen.p.toFixed(2)}};
                } else return post;
            });

            return {
                ...state, posts: posts
            };
        }
        case 'REFRESH_ALL_POSTS_SUCCESS': {
            const posts = state.posts.map(obj => {
                if (obj.id === action.payload.post.id) return action.payload.post;
                else return obj;
            });

            return {
                ...state, posts: posts
            };
        }
        case 'DELETE_POST_SUCCESS': {
            unsubscribePost(action.payload.post);

            const posts = state.posts.filter(post => post.id !== action.payload.post.id);

            return {
                ...state, posts: posts
            };
        }
        case 'CLEAR_ALL_POSTS_SUCCESS':
            unsubscribeAll(state.posts);

            return {
                ...state, posts: action.payload.posts
            };
        case 'PREPARE_POST_SUCCESS':
            return {
                ...state, posts: [...state.posts, { ...action.payload.post } ]
            };
        case 'FETCH_POST_SUCCESS':
            // function highestRank( a, b ) {
            //     if ( a.market_cap_rank < b.market_cap_rank ){
            //         return -1;
            //     }
            //     if ( a.market_cap_rank > b.market_cap_rank ){
            //         return 1;
            //     }
            //     return 0;
            // }

            // let rankedPosts = posts.data.sort(highestRank).splice(0, 50);

            const posts = state.posts.map(obj => {
                if(obj.id === action.payload.post.id) return {...action.payload.post,
                    finnhub: {
                        symbol: action.payload?.exchange?.symbol,
                        name: action.payload?.exchange?.description
                    },
                    prepareGraph: true};
                else return obj;
            });

            // resubscribe to websocket for updated price
            const waitingPageLoad = posts.filter(post => post.prepare === true);
            console.log("WAIT FOR ALL PAGE POSTS TO LOAD: " + waitingPageLoad.length);
            if(waitingPageLoad.length === 0) {
                subscribe(posts);
            }

            return {
                ...state, posts: posts
            };
        case 'FETCH_GRAPH_DATA_SUCCESS': {
            if (state.posts.length === 0) return {...state};

            let charts = state.charts;
            if (!charts.find(chart => chart.id === action.payload.id)) {
                charts.push({id: action.payload.id, series: action.payload.chart});
            } else {
                charts = charts.map(obj => {
                    if (obj.id === action.payload.id) return {id: action.payload.id, series: action.payload.chart};
                    else return obj;
                });
            }

            // make prepare false so graph does show loading again once initialised
            const posts = state.posts.map(obj => {
                if (obj.id === action.payload.id) return {...obj, prepareGraph: false};
                else return obj;
            });

            return {
                ...state, charts: charts, posts: posts
            };
        }
        case 'FETCH_COIN_LIST_SUCCESS':
            return {...state,
                coins: action.payload.coins
            };
        default:
            return state
    }
};

export default posts