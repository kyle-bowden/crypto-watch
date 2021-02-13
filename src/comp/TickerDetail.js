import React, {useState} from "react";
import './TickerDetail.css';
import LineChart7Day from "./LineChart7Day";
import { ColorExtractor } from 'react-color-extractor'

function TickerDetail(props) {
    const [colors, setColors] = useState({ colors: ['#000000'] });

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

    return (
        <>
            {props.post.prepare === true ? <div className="lds-ring loading"><div/><div/><div/><div/></div> :
                <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.2)}} className='ticker-detail'>
                    <div className='image'>
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='title'>
                            <h1 style={{color: hexToRgbA(colors.colors[1], 1)}}>#{props.post.market_cap_rank} {props.post.name.substr(0, 10).toUpperCase()}</h1>
                        </div>
                        <div style={{alignSelf: 'center'}}>
                            <ColorExtractor src={"https://cors-anywhere.herokuapp.com/" + props.post.image}
                                            getColors={initColors}/>
                            <img src={props.post.image} alt=""/>
                        </div>
                    </div>
                    <div className='crypto'>
                        <div style={{backgroundColor: hexToRgbA(colors.colors[0], 0.5)}} className='rank'>
                            <h1 style={{color: hexToRgbA(colors.colors[1], 1)}}>({props.post.symbol.toUpperCase()})</h1>
                            <h1 className='current-price' style={{
                                color: hexToRgbA(colors.colors[1], 1),
                                textAlign: 'center'
                            }}>${props.post.current_price}</h1>
                        </div>
                        <div>
                            <div className='chart-7d'>
                                <LineChart7Day id={props.post.id} symbol={props.post.symbol}/>
                            </div>
                            <div className='low-high'>
                                <h1>24H </h1>
                                <h1 className='green'>↑ ${props.post.high_24h} </h1>
                                <h1 className='red'>↓ ${props.post.low_24h} </h1>
                                <h2>CHG</h2>
                                <h2 style={handleColor(props.post.price_change_percentage_24h)}>${props.post.price_change_24h} </h2>
                                <h2 style={handleColor(props.post.price_change_percentage_24h)}>{props.post.price_change_percentage_24h}%</h2>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    )
}

export default TickerDetail;