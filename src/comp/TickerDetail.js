import React, {useEffect, useState, useRef} from "react";
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
import { Slide } from "react-slideshow-image";
import axios from "axios";

function TickerDetail(props) {
    const dataViews = ["Graph", "Stats"];
    const [lastPrice, setLastPrice] = useState(0);
    const [colors, setColors] = useState({ colors: ['#000000'] });
    const [menu, setMenu] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [dataView, setDataView] = useState(0);
    const currency = useSelector((state) => state.currency);

    const initColors = (colors) =>  setColors({colors: colors});

    const isLower = (value) => {
        return value < 0;
    };

    const handleColor = (value) => {
        return isLower(value) ? {color: '#ffdc00'} : {color: '#00ff00'};
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

    const handleDataViewChange = (indx) => {
        setDataView(indx);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        console.log(`${da}-${mo}-${ye}`);
        return `${da}-${mo}-${ye}`;
    };

    const renderDataView = (indx) => {
        switch (indx) {
            case 0: return (
                <div className='chart-7d'>
                    <LineChart7Day post={props.post} tradingURL={findFirstTradeURL()} finnhub={props.post.finnhub} prepare={props.post.prepareGraph}/>
                </div>
            );
            case 1: return (
                <div className='low-high'>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>CAP </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row green'>${props.post.market_data.market_cap[currency]} </span>
                    <div/>

                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>ATH </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row green'>${props.post.market_data.ath[currency]} </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>{formatDate(props.post.market_data.ath_date[currency])} </span>

                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>ATL </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row red'>${props.post.market_data.atl[currency]} </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>{formatDate(props.post.market_data.atl_date[currency])} </span>

                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>24H </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row green'>↑ ${props.post.market_data.high_24h[currency]} </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row red'>↓ ${props.post.market_data.low_24h[currency]} </span>

                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='row'>CHG</span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className={'row ' + (isLower(props.post.market_data.price_change_percentage_24h) ? 'red' : 'green')}>${props.post.market_data.price_change_24h} </span>
                    <span style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className={'row ' + (isLower(props.post.market_data.price_change_percentage_24h) ? 'red' : 'green')}>{props.post.market_data.price_change_percentage_24h}%</span>
                </div>
            );
            default:
                break;
        }
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
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5), borderBottomColor: hexToRgbA(colors.colors[1], 1)}} className='title'>
                            <span className='header-text' style={{color: hexToRgbA(colors.colors[1], 1)}}>#{props.post.market_data.market_cap_rank} {props.post.name.substr(0, 8).toUpperCase()}</span>
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
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5), borderBottomColor: hexToRgbA(colors.colors[1], 1)}} className='rank'>
                            <span className='header-text' style={{color: hexToRgbA(colors.colors[1], 1)}}>({props.post.symbol.toUpperCase()})</span>
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
                        <div style={{background: "linear-gradient(90deg, " + hexToRgbA(colors.colors[0], 0.2) +" 0%, " + hexToRgbA(colors.colors[0], 0.5) + " 1%)"}} className='data'>
                            <div style={{paddingBottom: '0', paddingLeft: '10px'}}>
                                <button onClick={() => handleDataViewChange(0)} className='button-default-mini'><img src={Trade} alt='G'/></button>
                                <button onClick={() => handleDataViewChange(1)} className='button-default-mini'><img src={Web} alt='S'/></button>
                            </div>
                            {renderDataView(dataView)}
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