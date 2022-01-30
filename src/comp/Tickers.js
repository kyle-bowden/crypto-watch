import React, {useEffect, useState} from "react";
import './Tickers.css';
import TickerDetail from "./TickerDetail";
import {useSelector} from "react-redux";
import useInterval from "../useInterval";

function Tickers() {
    const SWITCH_VIEW_SECONDS = 5;

    const [timer, setTimer] = useState(SWITCH_VIEW_SECONDS);
    const [showChange, setShowChange] = useState(false);
    const [endIndex, setEndIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(0);
    const [awaitLayoutUpdate, setAwaitLayoutUpdate] = useState(true);

    const layout = useSelector((state) => state.layout);
    const page = useSelector((state) => state.page);
    const posts = useSelector((state) => state.posts);

    useEffect(() => {
        const endIndex = parseInt(layout.maxPostsPerPage) * parseInt(page.currentPageNumber);
        const startIndex = parseInt(endIndex) - parseInt(layout.maxPostsPerPage);

        console.log(`SLICE POSTS, START: ${startIndex}, END: ${endIndex-1}`);
        setEndIndex(endIndex);
        setStartIndex(startIndex);

        setAwaitLayoutUpdate(false);
    }, [page.currentPageNumber, layout.maxPostsPerPage]);

    useInterval(() => {
        const time = timer - 1;
        if(time === 0) {
            setShowChange(!showChange);
            setTimer(SWITCH_VIEW_SECONDS);
        } else {
            setTimer(timer - 1);
        }
    }, 1000);

    return (
        <>
            {awaitLayoutUpdate ? <div style={{height: '100vh', left: '50%', top: '40%'}} className="lds-grid"><div/><div/><div/><div/><div/><div/><div/><div/><div/></div> :
                <div className={layout.value}>
                    {posts.slice(startIndex, endIndex).map(function (post) {
                        return <TickerDetail key={post.id} post={post} autoViewChange={showChange}/>
                    })}
                </div>
            }
        </>
    )
}

export default Tickers;