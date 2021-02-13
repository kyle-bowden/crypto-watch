const posts = (state = {posts: [], charts: [], coins: []} , action) => {

    switch(action.type) {
        case 'REFRESH_ALL_POSTS_SUCCESS':
            const updatedPosts = state.posts.map(obj =>  action.payload.posts.find(o => o.id === obj.id) || obj);

            return {
                ...state, posts: updatedPosts
            };
        case 'CLEAR_ALL_POSTS_SUCCESS':
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

            console.log(state.posts);
            const posts = state.posts.map(obj => {
                if(obj.id === action.payload.post.id) return action.payload.post;
                else return obj;
            });
            console.log(posts);

            return {
                ...state, posts: posts
            };
        case 'FETCH_GRAPH_DATA_SUCCESS':
            if(state.posts.length === 0) return {...state};
            //const foundPost = state.posts.find(post => post.id === action.payload.id);

            const lineData = action.payload.chart.map(d => d[4]);

            return {
                ...state, charts: [...state.charts, {
                    id: action.payload.id,
                    chart: {
                        labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
                        datasets:
                            [
                                {
                                    label: '',
                                    fill: false,
                                    lineTension: 0,
                                    borderColor: 'rgba(73,164,0,1)',
                                    borderWidth: 5,
                                    showLines: false,
                                    data: lineData
                                }
                            ]
                    }
                }]
            };
        case 'FETCH_COIN_LIST_SUCCESS':
            return {...state,
                coins: action.payload.coins
            };
        default:
            return state
    }
};

export default posts