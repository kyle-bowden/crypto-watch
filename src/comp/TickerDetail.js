import React, {useEffect, useState} from "react";
import './TickerDetail.css';
import { connect } from "react-redux";
import LineChart7Day from "./LineChart7Day";
import { ColorExtractor } from 'react-color-extractor'
import {useSelector} from "react-redux";
import Trade from '../assets/assessment-24px.svg';
import Web from '../assets/language-24px.svg';
import Remove from '../assets/delete-24px.svg';
import {ReactComponent as Connected} from '../assets/link_on-24px.svg';
import {ReactComponent as Disconnected} from '../assets/link_off-24px.svg';
import ReactTooltip from 'react-tooltip';
import CountUp from "react-countup";
import { subscribe, unsubscribe } from '../webSocket';
import { deletePost, fetchPost } from "../redux/actions";
import axios from "axios";

function TickerDetail(props) {
    const [lastPrice, setLastPrice] = useState(0);
    const [colors, setColors] = useState({ colors: ['#000000'] });
    const [menu, setMenu] = useState(false);
    const [fetching, setFetching] = useState(true);
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
        if(props.post.market_data)
            setLastPrice(props.post.market_data.current_price[currency]);
    },  [props.post?.market_data]);

    useEffect(() => {
        ReactTooltip.rebuild();

        if(props.post?.finnhub?.symbol !== undefined) subscribe(props.post.id, props.post?.finnhub?.symbol);

        return () => {
            if(props.post?.finnhub?.symbol !== undefined) unsubscribe(props.post.id, props.post?.finnhub?.symbol);
        }
    }, [props.post?.finnhub?.symbol]);

    useEffect(() => {
        if(props.post?.finnhub?.symbol !== undefined &&
            props.post?.finnhub?.reconnect !== undefined && props.post?.finnhub?.reconnect)
                subscribe(props.post.id, props.post?.finnhub?.symbol);
    }, [props.post?.finnhub?.reconnect]);

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();

        console.log(`FETCH POST: ${props.post.id}`);
        props.fetchPost(props.post.id, currency, source.token).then(() => {
            setFetching(false);
        });

        return () => {
            console.log(`CLEANUP CANCEL: ${props.post.id}`);
            source.cancel();
        }
    }, []);

    return (
        <>
            {fetching === true ? <div className="lds-ring loading"><div/><div/><div/><div/></div> :
                <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.2)}} className='ticker-detail fade-in'>
                    <div className='image' onMouseLeave={() => setMenu(false)}>
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='title'>
                            <h1 style={{color: hexToRgbA(colors.colors[1], 1)}}>#{props.post.market_data.market_cap_rank} {props.post.name.substr(0, 10).toUpperCase()}</h1>
                        </div>
                        <div style={{alignSelf: 'center'}}>
                            <ColorExtractor src={"https://cors-anywhere.herokuapp.com/" + props.post.image.large} getColors={initColors}/>
                            {menu ?
                                <div>
                                    <div className='menu menu-offset-top fade-in'>
                                        {props.post.tickers.length > 0 ? <img style={{backgroundColor: hexToRgbA(colors.colors[1], 1)}} onClick={() => window.open(findFirstTradeURL())} className='menu-item menu-item-gap' src={Trade} alt='Trade'/>  : <div/>}
                                        <img style={{backgroundColor: 'red'}} onClick={() => props.deletePost(props.post)} className='menu-item' src={Remove} alt='Remove'/>
                                    </div>
                                    <img className='fade-out-slight' style={{opacity: 0.2, zIndex: '-99999', position: 'relative'}} onClick={() => window.open(props.post.links.homepage[0])} src={props.post.image.large} alt=""/>
                                    <div className='menu menu-offset-bottom fade-in'>
                                        <img style={{backgroundColor: hexToRgbA(colors.colors[1], 1)}} className='menu-item' src={Web} alt='Web' onClick={() => window.open(props.post.links.homepage[0])}/>
                                    </div>
                                </div>
                                :
                                <img onMouseOver={() => setMenu(true)} src={props.post.image.large} alt=""/>}
                        </div>
                    </div>
                    <div className='crypto'>
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='rank'>
                            <h1 style={{color: hexToRgbA(colors.colors[1], 1)}}>({props.post.symbol.toUpperCase()})</h1>
                            <CountUp style={{color: hexToRgbA(colors.colors[1], 1), textAlign: 'center'}}
                                className="current-price"
                                start={lastPrice}
                                end={props.post?.finnhub?.price === undefined ? parseFloat(lastPrice) : parseFloat(props.post?.finnhub?.price)}
                                duration={2.75}
                                useEasing={true}
                                useGrouping={true}
                                separator=" "
                                decimals={2}
                                decimal=","
                                prefix='$'
                            />
                            <div className='exchange'>
                                {props.post.finnhub?.connected ?
                                    <Connected data-tip={'Connected to [ ' + props.post?.finnhub?.name + ' ] exchange'} className='exchange-connected' fill={hexToRgbA(colors.colors[1], 1)}/> :
                                    <Disconnected data-tip="Exchange could not be found or connected to." className='exchange-disconnected' fill={hexToRgbA(colors.colors[1], 1)}/>}
                                <ReactTooltip className='tooltip' place="bottom" type="light" effect="solid"/>
                            </div>
                        </div>
                        <div className='data'>
                            <div className='chart-7d'>
                                <LineChart7Day post={props.post} tradingURL={findFirstTradeURL()} finnhub={props.post.finnhub} prepare={props.post.prepareGraph}/>
                            </div>
                            <div className='low-high'>
                                <h2>24H </h2>
                                <h2 className='green'>↑ ${props.post.market_data.high_24h[currency]} </h2>
                                <h2 className='red'>↓ ${props.post.market_data.low_24h[currency]} </h2>
                                <h3>CHG</h3>
                                <h3 style={handleColor(props.post.market_data.price_change_percentage_24h)}>${props.post.market_data.price_change_24h} </h3>
                                <h3 style={handleColor(props.post.market_data.price_change_percentage_24h)}>{props.post.market_data.price_change_percentage_24h}%</h3>
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
        fetchPost: (id, currency, token) => dispatch(fetchPost(id, currency, token)),
        deletePost: (post) => dispatch(deletePost(post))
    }
};

export default connect(null, mapDispatchToProps)(TickerDetail);