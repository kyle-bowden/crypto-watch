import React, {useEffect, useState } from "react";
import './TickerDetail.css';
import { connect } from "react-redux";
import LineChart7Day from "./LineChart7Day";
import { ColorExtractor } from 'react-color-extractor'
import { useSelector } from "react-redux";
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
    const dataViews = ["Graph", "Stats"];
    const [dataViewIndex, setDataViewIndex] = useState(0);
    const [lastPrice, setLastPrice] = useState(0);
    const [colors, setColors] = useState({ colors: ['#000000'] });
    const [menu, setMenu] = useState(false);
    const [fetching, setFetching] = useState(true);
    const currency = useSelector((state) => state.currency);

    const initColors = (colors) =>  setColors({colors: colors});

    const isLower = (value) => {
        return value < 0;
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
        return ticker?.trade_url;
    };

    const handleDataViewChange = (indx) => {
        setDataViewIndex(indx);
    };

    const formatDate = (date) => {
        const d = new Date(date);
        const ye = new Intl.DateTimeFormat('en', { year: 'numeric' }).format(d);
        const mo = new Intl.DateTimeFormat('en', { month: 'short' }).format(d);
        const da = new Intl.DateTimeFormat('en', { day: '2-digit' }).format(d);
        return `${da}-${mo}-${ye}`;
    };

    const renderDataView = () => {
        switch (dataViews[dataViewIndex]) {
            case 'Graph': return (
                <div className='chart-7d'>
                    <LineChart7Day post={props.post} tradingURL={findFirstTradeURL()} finnhub={props.post.finnhub} prepare={props.post.prepareGraph}/>
                </div>
            );
            case 'Stats': return (
                <div className='low-high'>
                    <span className='row row-detail'>CAP </span>
                    <span className='row row-detail green'>${props.post.market_data.market_cap[currency]} </span>
                    <div/>

                    <span className='row row-detail'>ATH </span>
                    <span className='row row-detail green'>${props.post.market_data.ath[currency]} </span>
                    <span className='row row-detail'>{formatDate(props.post.market_data.ath_date[currency])} </span>

                    <span className='row row-detail'>ATL </span>
                    <span className='row row-detail red'>${props.post.market_data.atl[currency]} </span>
                    <span className='row row-detail'>{formatDate(props.post.market_data.atl_date[currency])} </span>

                    <span className='row row-detail'>24H </span>
                    <span className='row row-detail green'>↑ ${props.post.market_data.high_24h[currency]} </span>
                    <span className='row row-detail red'>↓ ${props.post.market_data.low_24h[currency]} </span>

                    <span className='row row-detail'>CHG</span>
                    <span className={'row row-detail ' + (isLower(props.post.market_data.price_change_percentage_24h) ? 'red' : 'green')}>${props.post.market_data.price_change_24h} </span>
                    <span className={'row row-detail ' + (isLower(props.post.market_data.price_change_percentage_24h) ? 'red' : 'green')}>{props.post.market_data.price_change_percentage_24h}%</span>
                </div>
            );
            default:
                break;
        }
    };

    const renderPriceChange = () => {
        if(!props.autoViewChange) {
            return (
                <CountUp style={{color: 'white', textAlign: 'center'}}
                         className="row row-right current-price fade-in"
                         start={lastPrice}
                         end={props.post?.finnhub?.price === undefined ? parseFloat(lastPrice) : parseFloat(props.post?.finnhub?.price)}
                         duration={2.75}
                         useEasing={true}
                         useGrouping={true}
                         separator=" "
                         decimals={2}
                         decimal=","
                         prefix='$ '
                />
            );
        } else {
            const isLow = isLower(props.post.market_data.price_change_percentage_24h);
            return (
                <span className={'row row-right header-text fade-in ' + (isLow ? 'red' : 'green')} style={{textAlign: 'center'}}>$ {props.post.market_data.price_change_24h.toFixed(3)}</span>
            );
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
                            <span className='header-text' style={{color: hexToRgbA(colors.colors[1], 1)}}>{props.post.name.substr(0, 8).toUpperCase()}</span>
                        </div>
                        <div style={{alignSelf: 'center'}}>
                            <ColorExtractor src={props.post.image.large} getColors={initColors}/>
                            {/*<ColorExtractor src={props.post.image.large.replace("https://assets.coingecko.com", "https://localhost:3000")} getColors={initColors}/>*/}
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
                            <span className='header-text' style={{color: hexToRgbA(colors.colors[1], 1)}}>#{props.post.market_data.market_cap_rank} ({props.post.symbol.toUpperCase()})</span>
                            {renderPriceChange()}
                            <div className='exchange'>
                                {props.post.finnhub?.connected ?
                                    <span className='row row-left'><Connected data-tip={'Connected to [ ' + props.post?.finnhub?.name + ' ] exchange'} className='exchange-connected' fill='white'/></span> :
                                    <span className='row row-left'><Disconnected data-tip="Exchange could not be found or connected to." className='exchange-disconnected' fill='#556672'/></span>}
                                <ReactTooltip className='tooltip' place="bottom" type="light" effect="solid"/>
                            </div>
                        </div>
                        <div style={{background: "linear-gradient(90deg, " + hexToRgbA(colors.colors[0], 0.2) +" 0%, " + hexToRgbA(colors.colors[0], 0.5) + " 1%)"}} className='data'>
                            <div style={{paddingBottom: '0', paddingLeft: '10px'}}>
                                <button onClick={() => handleDataViewChange(0)} className='button-default-mini'><img src={Trade} alt='G'/></button>
                                <button onClick={() => handleDataViewChange(1)} className='button-default-mini'><img src={Web} alt='S'/></button>
                            </div>
                            {renderDataView()}
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

const mapDispatchToProps = dispatch => {
    return {
        deletePost: (post) => dispatch(deletePost(post)),
        fetchPost: (id, currency, token) => dispatch(fetchPost(id, currency, token))
    }
};

export default connect(null, mapDispatchToProps)(TickerDetail);