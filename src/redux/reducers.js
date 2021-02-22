const posts = (state = {posts: [], charts: [], coins: [], currency: 'usd', layout: {display: '2 X 3', value: 'grid-view-2x3', maxPostsPerPage: 6}, page: { currentPageNumber: 1, totalPages: 1 }} , action) => {

    const updateNumberOfPages = (posts, maxPostsPerPage) => {
        const pages = Math.floor((posts.length + maxPostsPerPage - 1) / maxPostsPerPage);
        return pages === 0 ? 1 : pages;
    };

    switch(action.type) {
        case 'SORT_POSTS': {
            function highestRank( a, b ) {
                if ( a.market_cap_rank < b.market_cap_rank ){
                    return -1;
                }
                if ( a.market_cap_rank > b.market_cap_rank ){
                    return 1;
                }
                return 0;
            }

            state.posts = state.posts.sort(highestRank);

            return {
                ...state, page: { ...state.page, currentPageNumber: 1 }
            }
        }
        case 'CHANGE_GRID_LAYOUT_SUCCESS': {
            const maxPostsPerPage = action.payload.layout.maxPostsPerPage;

            const totalPages = updateNumberOfPages(state.posts, maxPostsPerPage);
            console.log("PAGES: " + totalPages);

            return {
                ...state, layout: action.payload.layout, page: { currentPageNumber: 1, totalPages: totalPages }
            }
        }
        case 'GO_NEXT_PAGE': {
            let nextPageNumber = state.page.currentPageNumber;

            if(action.payload.isNext) {
                nextPageNumber += 1;
            } else {
                nextPageNumber -= 1;
            }
            console.log(`NEXT PAGE ${nextPageNumber}`);

            return {
                ...state, page: { ...state.page, currentPageNumber: nextPageNumber }
            }
        }
        // TODO: not good
        case 'WEB_SOCKET_IS_CONNECTED_SUCCESS': {
            const posts = state.posts.map(post => {
                return {...post, finnhub: {...post.finnhub, connected: action.payload.isConnected}};
            });

            return {
                ...state, posts: posts
            }
        }
        case 'POST_CONNECTED_TO_WEB_SOCKET_SUCCESS': {
            const posts = state.posts.map(post => {
                if (post.id === action.payload.id) return {...post, finnhub: {...post.finnhub, connected: action.payload.isConnected}};
                else return post;
            });

            return {
                ...state, posts: posts
            }
        }
        case 'UPDATE_PRICE_DATA_SUCCESS': {
            const posts = state.posts.map(post => {
                const specimen = action.payload.data[0];
                if (post?.finnhub?.symbol === specimen.s) {
                    return {...post, finnhub: {...post.finnhub, price: specimen.p.toFixed(2)}};
                } else return post;
            });

            return {
                ...state, posts: posts
            };
        }
        case 'DELETE_POST_SUCCESS': {
            const posts = state.posts.filter(post => post.id !== action.payload.post.id);

            let page;
            const totalPages = updateNumberOfPages(posts, state.layout.maxPostsPerPage);
            if(state.page.currentPageNumber > totalPages) {
                page = {currentPageNumber: totalPages, totalPages: totalPages};
            } else {
                page = {...state.page, totalPages: totalPages};
            }

            console.log("PAGES: " + totalPages);

            return {
                ...state, posts: posts, page: page
            };
        }
        case 'CLEAR_ALL_POSTS_SUCCESS': {
            return {
                ...state, posts: [], page: { currentPageNumber: 1, totalPages: 1 }
            };
        }
        case 'PREPARE_POST_SUCCESS': {
            const posts = [...state.posts, {...action.payload.post},];

            let page;
            const totalPages = updateNumberOfPages(posts, state.layout.maxPostsPerPage);
            if(totalPages > state.page.currentPageNumber) {
                page = { currentPageNumber: totalPages, totalPages: totalPages };
            } else {
                page =  { ...state.page, totalPages: totalPages };
            }

            return {
                ...state, posts: posts, page: page, prepareGraph: true
            };
        }
        case 'FETCH_POST_SUCCESS':
            const posts = state.posts.map((obj) => {
                if(obj.id === action.payload.post.id) {
                    let post;
                    if(action.payload.exchange) {
                        post = {
                            ...action.payload.post,
                            finnhub: {
                                connected: obj?.finnhub?.connected,
                                symbol: action.payload?.exchange?.symbol,
                                name: action.payload?.exchange?.description
                            },
                            prepareGraph: true
                        };
                    } else {
                        post = {
                            ...action.payload.post,
                            prepareGraph: true
                        };
                    }
                    return post;
                } else return obj;
            });

            const totalPages = updateNumberOfPages(posts, state.layout.maxPostsPerPage);

            return {
                ...state, posts: posts, page: { ...state.page, totalPages: totalPages }
            };
        case 'FETCH_GRAPH_DATA_SUCCESS': {
            // make prepare false so graph does show loading again once initialised
            const posts = state.posts.map(obj => {
                if (obj.id === action.payload.id) return {...obj, graph: { series: action.payload.chart, patterns: action.payload.patterns }, prepareGraph: false};
                else return obj;
            });

            return {
                ...state, posts: posts
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