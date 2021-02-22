import React, { useState } from 'react';
import './CoinSelector.css';
import { connect } from "react-redux";
import { useSelector } from "react-redux";
import { DropdownList } from 'react-widgets';
import { preparePost } from "../redux/actions";

function CoinSelector(props) {
    const [search, setSearch] = useState("Type to search...");
    const [searchData, setSearchData] = useState([]);

    const coins = useSelector((state) => state.coins);
    const posts = useSelector((state) => state.posts);
    const currency = useSelector((state) => state.currency);

    const addCoin = (c) => {
        if(!posts.find(post => post.id === c.id)) {
            setSearch("Type to search...");
            setSearchData([]);
            props.preparePost(c.id, currency);
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
                                  messages={{emptyList: "Press enter to add crypto.", filterPlaceholder: "Type to search..."}}
                    />}
            </div>
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        preparePost: (id, currency) => dispatch(preparePost(id, currency))
    }
};

export default connect(null, mapDispatchToProps)(CoinSelector);