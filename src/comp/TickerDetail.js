import React, {useEffect, useState} from "react";
import './TickerDetail.css';
import { connect } from "react-redux";
import LineChart7Day from "./LineChart7Day";
import { ColorExtractor } from 'react-color-extractor'
import {useSelector} from "react-redux";
import Trade from '../assets/assessment-24px.svg';
import Web from '../assets/language-24px.svg';
import Remove from '../assets/delete-24px.svg';
import { deletePost, fetchPost } from "../redux/actions";

function TickerDetail(props) {
    const [colors, setColors] = useState({ colors: ['#000000'] });
    const [menu, setMenu] = useState(false);
    const currency = useSelector((state) => state.currency);

    const initColors = (colors) =>  setColors({colors: colors});

    const isLower = (value) => {
        return value < 0;
    };

    const handleColor = (value) => {
        return isLower(value) ? {color: 'red'} : {color: 'green'};
    };

    const hexToRgbA = (hex, alpha) => {
        let c;
        if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
            c= hex.substring(1).split('');
            if(c.length === 3){
                c= [c[0], c[0], c[1], c[1], c[2], c[2]];
            }
            c= '0x'+c.join('');
            return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',' + alpha + ')';
        }
    };

    const findFirstTradeURL = () => {
        const ticker = props.post.tickers.find(ticker => ticker.trade_url !== null);
        return ticker.trade_url;
    };

    useEffect(() => {
        if(props.post.reload === true) {
            props.fetchPost(props.post.id);
        }
    }, []);

    return (
        <>
            {props.post.prepare === true ? <div className="lds-ring loading"><div/><div/><div/><div/></div> :
                <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.2)}} className='ticker-detail'>
                    <div className='image' onMouseLeave={() => setMenu(false)}>
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='title'>
                            <h1 style={{color: hexToRgbA(colors.colors[1], 1)}}>#{props.post.market_data.market_cap_rank} {props.post.name.substr(0, 10).toUpperCase()}</h1>
                        </div>
                        <div style={{alignSelf: 'center'}}>
                            <ColorExtractor src={"https://cors-anywhere.herokuapp.com/" + props.post.image.large}
                                            getColors={initColors}/>
                            {menu ?
                                <div>
                                    <div className='menu menu-offset-top'>
                                        {props.post.tickers.length > 0 ? <img style={{backgroundColor: hexToRgbA(colors.colors[1], 1)}} onClick={() => window.open(findFirstTradeURL())} className='menu-item menu-item-gap' src={Trade} alt='Trade'/>  : <div/>}
                                        <img style={{backgroundColor: 'red'}} onClick={() => props.deletePost(props.post)} className='menu-item' src={Remove} alt='Remove'/>
                                    </div>
                                    <img style={{opacity: 0.2, zIndex: '-99999', position: 'relative'}} onClick={() => window.open(props.post.links.homepage[0])} src={props.post.image.large} alt=""/>
                                    <div className='menu menu-offset-bottom'>
                                        <img style={{backgroundColor: hexToRgbA(colors.colors[1], 1)}} className='menu-item' src={Web} alt='Remove' onClick={() => window.open(props.post.links.homepage[0])}/>
                                    </div>
                                </div>
                                :
                                <img onMouseOver={() => setMenu(true)} src={props.post.image.large} alt=""/>}
                        </div>
                    </div>
                    <div className='crypto'>
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='rank'>
                            <h1 style={{color: hexToRgbA(colors.colors[1], 1)}}>({props.post.symbol.toUpperCase()})</h1>
                            <h3 style={{alignSelf: 'center', textAlign: 'center', color: hexToRgbA(colors.colors[1], 1)}}>LST UPDT {new Date(props.post.last_updated).toISOString().split("T")[1].split(".")[0]}</h3>
                            <h1 className='current-price' style={{
                                color: hexToRgbA(colors.colors[1], 1),
                                textAlign: 'center'
                            }}>${props.post.market_data.current_price[currency]}</h1>
                        </div>
                        <div>
                            <div className='chart-7d'>
                                <LineChart7Day id={props.post.id} tradingURL={findFirstTradeURL()}/>
                            </div>
                            <div className='low-high'>
                                <h1>24H </h1>
                                <h1 className='green'>↑ ${props.post.market_data.high_24h[currency]} </h1>
                                <h1 className='red'>↓ ${props.post.market_data.low_24h[currency]} </h1>
                                <h2>CHG</h2>
                                <h2 style={handleColor(props.post.market_data.price_change_percentage_24h)}>${props.post.market_data.price_change_24h} </h2>
                                <h2 style={handleColor(props.post.market_data.price_change_percentage_24h)}>{props.post.market_data.price_change_percentage_24h}%</h2>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        fetchPost: (id) => dispatch(fetchPost(id)),
        deletePost: (post) => dispatch(deletePost(post))
    }
};

export default connect(null, mapDispatchToProps)(TickerDetail);