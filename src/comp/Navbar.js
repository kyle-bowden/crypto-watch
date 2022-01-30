import React, {useEffect, useState} from 'react';
import './Navbar.css';
import {connect, useSelector} from "react-redux";
import {Link} from "react-router-dom";
import { DropdownList  } from 'react-widgets';
import CoinSelector from "./CoinSelector";
import { clearAllPosts, changeGridLayout, goNext, sort, saveAutoPlay } from "../redux/actions";
import useInterval from "../useInterval";

function Navbar(props) {
    const autoPlayRef = React.createRef();

    const AUTO_PLAY_MINUTES = 60 * 15;
    const [timer, setTimer] = useState(AUTO_PLAY_MINUTES);

    const [gridLayouts, setGridLayouts] = useState([
        {display: '1 X 1', value: 'grid-view-1x1', maxPostsPerPage: 1},
        {display: '2 X 2', value: 'grid-view-2x2', maxPostsPerPage: 4},
        {display: '2 X 3', value: 'grid-view-2x3', maxPostsPerPage: 6},
        {display: '3 X 3', value: 'grid-view-3x3', maxPostsPerPage: 9}]);

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

    const timeString = () => {
        const minutes = Math.floor(timer / 60);
        const seconds = timer - minutes * 60;
        return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    };

    const onAutoPlayChange = (event) => {
        const isChecked = event.target.checked;
        props.saveAutoPlay(isChecked);

        setTimer(AUTO_PLAY_MINUTES);
    };

    useEffect(() => {
        autoPlayRef.current.checked = page.autoPlay;
    }, []);

    useInterval(() => {
        if(page.autoPlay) {
            const time = timer - 1;
            if(time === 0) {
                nextPage(true);
                setTimer(AUTO_PLAY_MINUTES);
            } else {
                setTimer(timer - 1);
            }
        }
    }, 1000);

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
                    <label className='checkbox-default'>
                        <input onChange={event => onAutoPlayChange(event)} style={{marginRight: '10px', width: '20px', height: '20px'}} type="checkbox" ref={autoPlayRef} name="name" defaultValue={false}/>
                        Auto Page ( {timeString()} )
                    </label>
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
        saveAutoPlay: (isChecked) => dispatch(saveAutoPlay(isChecked)),
        clearAllPosts: (id) => dispatch(clearAllPosts(id)),
        setGridLayout: (layout) => dispatch(changeGridLayout(layout))
    }
};

export default connect(null, mapDispatchToProps)(Navbar);