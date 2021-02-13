import React, { useState } from 'react';
import './CoinSelector.css';
import { connect } from "react-redux";
import { useSelector } from "react-redux";
import {fetchPost, preparePost} from "../redux/actions";
import { DropdownList } from 'react-widgets';
import 'react-widgets/dist/css/react-widgets.css';

function CoinSelector(props) {
    const [search, setSearch] = useState("Search for and add crypto...");
    const [searchData, setSearchData] = useState([]);

    const coins = useSelector((state) => state.coins);
    const posts = useSelector((state) => state.posts);

    const addCoin = (c) => {
        if(!posts.find(post => post.id === c.id)) {
            setSearch("");
            setSearchData([]);
            props.preparePost(c.id);
            props.fetchPost(c.id);
        }
    };

    const filterCoins = (v) => {
        if(v.length > 1) {
            const filter = coins.filter(coin => coin.name.toLowerCase().includes(v.toLowerCase()) || coin.symbol.toLowerCase().includes(v.toLowerCase()));
            setSearchData(filter);
        } else if(v.length <= 1) {
            setSearchData([]);
        }
        setSearch(v);
    };

    return (
        <>
            <div className='coin-selector'>
                {coins.length === 0 ?
                    <DropdownList busy value='Loading crypto list...' /> :
                    <DropdownList filter
                                  data={searchData}
                                  value={search}
                                  onChange={value => addCoin(value)}
                                  onSearch={value => filterCoins(value)}
                                  textField="name"
                    />}
            </div>
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        fetchPost: (id) => dispatch(fetchPost(id)),
        preparePost: (id) => dispatch(preparePost(id))
    }
};

export default connect(null, mapDispatchToProps)(CoinSelector);