import React from "react";
import './Tickers.css';
import TickerDetail from "./TickerDetail";
import {connect, useSelector} from "react-redux";

function Tickers(props) {
    const layout = useSelector((state) => state.layout);

    return (
        <>
            <div className={layout.value}>
                {props.posts.map(function(post) {
                    return <TickerDetail key={post.id} post={post} />
                })}
            </div>
        </>
    )
}

const mapStateToProps = state => {
    return {
        posts: state.posts
    }
};

export default connect(mapStateToProps, null)(Tickers);