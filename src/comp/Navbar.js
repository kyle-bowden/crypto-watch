import React, {useEffect, useRef, useState} from 'react';
import './Navbar.css';
import {connect, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import CoinSelector from "./CoinSelector";
import { clearAllPosts, refreshAllPosts } from "../redux/actions";

function Navbar(props) {
    const REFRESH_MINUTES = 5;
    const [timer, setTimer] = useState(60 * REFRESH_MINUTES);
    const [disableRefresh, setDisableRefresh] = useState(false);

    const posts = useSelector((state) => state.posts);

    const clearPosts = () => {
        props.clearAllPosts();
    };

    const refreshPosts = () => {
        if(posts.length > 0) {
            setDisableRefresh(true);
            props.refreshAllPosts(posts).then(() => {
                setTimer(60 * REFRESH_MINUTES);
                setDisableRefresh(false);
            });
        }
    };

    const time = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer - minutes * 60;
        return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    useInterval(() => {
        const time = timer - 1;
        if(time === 0) {
            refreshPosts();
        } else {
            if(!disableRefresh) setTimer(timer - 1);
        }
    }, 1000);

    return(
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link to="/" className="navbar-logo">
                        {/*<img src={Icon} alt='CryptoWatch'/>*/}
                    </Link>
                    <button disabled={disableRefresh} className='button-reset' onClick={() => refreshPosts()}>Refresh All ({time()})</button>
                    <button className='button-default' onClick={() => clearPosts()}>Clear All</button>
                    <CoinSelector/>
                </div>
            </nav>
        </>
    )
}

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const mapDispatchToProps = dispatch => {
    return {
        clearAllPosts: (id) => dispatch(clearAllPosts(id)),
        refreshAllPosts: (posts) => dispatch(refreshAllPosts(posts))
    }
};

export default connect(null, mapDispatchToProps)(Navbar);