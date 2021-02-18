import React, {useEffect, useState} from 'react';
import './Navbar.css';
import {connect, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import { DropdownList  } from 'react-widgets';
import CoinSelector from "./CoinSelector";
import { clearAllPosts, changeGridLayout } from "../redux/actions";

function Navbar(props) {
    const [gridLayouts, setGridLayouts] = useState([{display: '1 X 1', value: 'grid-view-1x1'}, {display: '2 X 2', value: 'grid-view-2x2'}, {display: '2 X 3', value: 'grid-view-2x3'}]);
    const layout = useSelector((state) => state.layout);

    const clearPosts = () => {
        props.clearAllPosts();
    };

    const onGridLayoutChange = (value) => {
        props.setGridLayout(value);
    };

    return(
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        {/*<img src={Icon} alt='CryptoWatch'/>*/}
                    </Link>
                    <div className='grid-selector'>
                        <DropdownList
                            data={gridLayouts}
                            value={layout}
                            textField='display'
                            defaultValue={gridLayouts[2]}
                            onChange={value => onGridLayoutChange(value)}
                        />
                    </div>
                    <button className='button-default' onClick={() => clearPosts()}>Clear All</button>
                    <CoinSelector/>
                </div>
            </nav>
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        clearAllPosts: (id) => dispatch(clearAllPosts(id)),
        setGridLayout: (layout) => dispatch(changeGridLayout(layout))
    }
};

export default connect(null, mapDispatchToProps)(Navbar);