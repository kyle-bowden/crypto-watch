import React from "react";
import './Tickers.css';
import TickerDetail from "./TickerDetail";
import { connect } from "react-redux";

function Tickers(props) {

    return (
        <>
            <div className='grid-view-2x5'>
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