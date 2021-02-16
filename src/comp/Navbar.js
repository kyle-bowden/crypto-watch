import React, {useEffect, useRef, useState} from 'react';
import './Navbar.css';
import {connect, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import CoinSelector from "./CoinSelector";
import { clearAllPosts, refreshAllPosts } from "../redux/actions";

function Navbar(props) {
    const [disableRefresh, setDisableRefresh] = useState(false);

    const posts = useSelector((state) => state.posts);

    const clearPosts = () => {
        props.clearAllPosts();
    };

    const refreshPosts = () => {
        if(posts.length > 0) {
            setDisableRefresh(true);
            props.refreshAllPosts(posts).then(() => {
                // setTimer(60 * REFRESH_MINUTES);
                setDisableRefresh(false);
            });
        }
    };

    return(
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        {/*<img src={Icon} alt='CryptoWatch'/>*/}
                    </Link>
                    {/*<button disabled={disableRefresh} className='button-reset' onClick={() => refreshPosts()}>Refresh All</button>*/}
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
        refreshAllPosts: (posts) => dispatch(refreshAllPosts(posts))
    }
};

export default connect(null, mapDispatchToProps)(Navbar);