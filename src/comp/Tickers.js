import React, {useEffect, useState} from "react";
import './Tickers.css';
import TickerDetail from "./TickerDetail";
import {useSelector} from "react-redux";

function Tickers() {
    const [endIndex, setEndIndex] = useState(0);
    const [startIndex, setStartIndex] = useState(0);

    const [awaitLayoutUpdate, setAwaitLayoutUpdate] = useState(false);

    const layout = useSelector((state) => state.layout);
    const page = useSelector((state) => state.page);
    const posts = useSelector((state) => state.posts);

    useEffect(() => {
        const endIndex = parseInt(layout.maxPostsPerPage) * parseInt(page.currentPageNumber);
        const startIndex = parseInt(endIndex) - parseInt(layout.maxPostsPerPage);

        setAwaitLayoutUpdate(true);

        console.log(`SLICE POSTS, START: ${startIndex}, END: ${endIndex-1}`);
        setEndIndex(endIndex);
        setStartIndex(startIndex);

        setAwaitLayoutUpdate(false);
    }, [page.currentPageNumber, layout]);

    return (
        <>
            {awaitLayoutUpdate ? <div style={{height: '100vh', left: '50%', top: '40%'}} className="lds-grid"><div/><div/><div/><div/><div/><div/><div/><div/><div/></div> :
                <div className={layout.value}>
                    {posts.slice(startIndex, endIndex).map(function (post) {
                        return <TickerDetail key={post.id} post={post}/>
                    })}
                </div>
            }
        </>
    )
}

export default Tickers;