import React, { useState } from 'react';
import './Navbar.css';
import {connect, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import { DropdownList  } from 'react-widgets';
import CoinSelector from "./CoinSelector";
import { clearAllPosts, changeGridLayout, goNext, sort } from "../redux/actions";

function Navbar(props) {
    const [gridLayouts, setGridLayouts] = useState([
        {display: '1 X 1', value: 'grid-view-1x1', maxPostsPerPage: 1},
        {display: '2 X 2', value: 'grid-view-2x2', maxPostsPerPage: 4},
        {display: '2 X 3', value: 'grid-view-2x3', maxPostsPerPage: 6}]);

    const layout = useSelector((state) => state.layout);
    const page = useSelector((state) => state.page);

    const clearPosts = () => {
        props.clearAllPosts();
    };

    const onGridLayoutChange = (value) => {
        props.setGridLayout(value);
    };

    const nextPage = (isNext) => {
        props.goNext(isNext);
    };

    const sortPosts = () => {
        props.sort();
    };

    return(
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <CoinSelector/>
                    <button className='button-default' onClick={() => sortPosts()}>Sort</button>
                    <button className='button-default' onClick={() => clearPosts()}>Clear</button>
                    <div className='grid-selector'>
                        <DropdownList
                            data={gridLayouts}
                            value={layout}
                            textField='display'
                            defaultValue={gridLayouts[2]}
                            onChange={value => onGridLayoutChange(value)}
                        />
                    </div>
                    <button disabled={page.currentPageNumber === 1} className='button-default' onClick={() => nextPage(false)}>Prev</button>
                    <button disabled={page.currentPageNumber === page.totalPages} className='button-default' onClick={() => nextPage(true)}>Next</button>
                    <Link to="/" className="navbar-logo">
                        {/*<img src={Icon} alt='CryptoWatch'/>*/}
                    </Link>
                </div>
            </nav>
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        sort: () => dispatch(sort()),
        goNext: (isNext) => dispatch(goNext(isNext)),
        clearAllPosts: (id) => dispatch(clearAllPosts(id)),
        setGridLayout: (layout) => dispatch(changeGridLayout(layout))
    }
};

export default connect(null, mapDispatchToProps)(Navbar);