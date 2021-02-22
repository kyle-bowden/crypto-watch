import React, {useState, useEffect, useRef} from 'react';
import {connect} from "react-redux";
import { fetchLineData } from "../redux/actions";
import './LineChart7Day.css';
import ReactApexChart from 'react-apexcharts';
import axios from "axios";

function LineChart7Day(props) {
    const REFRESH_GRAPH_MINUTES = 5; //10
    const [timer, setTimer] = useState(60 * REFRESH_GRAPH_MINUTES);

    const [fetch, setFetch] = useState(false);
    const [source, setSource] = useState(null);

    const [candlestick, setCandleStick] = useState({
        chart: {
            type: 'candlestick',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            redrawOnParentResize: true
        },
        grid: {
            show: true,
            borderColor: '#8f8f8b',
            row: {
                colors: '#555434',
                opacity: 0.5
            }
        },
        annotations: {
            position: 'front',
            xaxis: []
        },
        xaxis: {
            type: 'datetime',
            tooltip: {
                enabled: false
            },
            labels: {
                show: true,
                style: {
                    colors: 'white',
                    cssClass: 'apexcharts-label'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: true
            }
        },
        yaxis: {
            tooltip: {
                enabled: false
            },
            labels: {
                show: true,
                style: {
                    colors: 'white',
                    cssClass: 'apexcharts-label'
                }
            },
            axisBorder: {
                show: false
            },
            axisTicks: {
                show: false
            },
            decimalsInFloat: 2,
            forceNiceScale: true
        },
        tooltip: {
            enabled: false
        }
    });

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        setSource(source);

        if(fetch) {
            console.log("REFRESH LINE DATA: " + props.post.id);

            if(fetch) {
                setTimer(60 * REFRESH_GRAPH_MINUTES);
                setFetch(false);
            }

            props.fetchLineData(props.post.id, props.finnhub?.symbol, source.token);
        }

        const patterns = props.post?.graph?.patterns;
        if(patterns) {
            const completeColor = '#00E396';
            const incompleteColor = '#E34342';
            const annotations = patterns.map(a => {
                return {
                    x: Math.floor(a.atime*1000),
                    borderColor: (a.status === 'complete') ? completeColor : incompleteColor,
                    label: {
                        borderColor: (a.status === 'complete') ? completeColor : incompleteColor,
                        style: {
                            fontSize: '12px',
                            color: '#000000',
                            background: (a.status === 'complete') ? completeColor : incompleteColor
                        },
                        orientation: 'horizontal',
                        offsetY: 7,
                        text: a.patternname + (a.patterntype === "bullish" ? " ↑" : " ↓")
                    }
                }
            });

            const newAnnotations = {...candlestick};
            newAnnotations.annotations = { ...newAnnotations.annotations, xaxis: annotations };

            // TODO: slows down rendering of graph
            setCandleStick(newAnnotations);
        }
    }, [fetch, props.post?.graph?.patterns]);

    useEffect(() => {
        const CancelToken = axios.CancelToken;
        const source = CancelToken.source();
        setSource(source);

        console.log("FETCH LINE DATA: " + props.post.id);
        props.fetchLineData(props.post.id, props.finnhub?.symbol, source.token);

        return () => {
            console.log(`CLEANUP LineChart7Day: ${props.post.id}`);
            if(source) source.cancel();
        }
    }, []);

    useInterval(() => {
        const time = timer - 1;
        if(time === 0) {
            setFetch(true);
        } else {
            setTimer(timer - 1);
        }
    }, 1000);

    return (
        <>
            {props.prepare === true ? <div className="lds-facebook loading"><div/><div/><div/></div> :
                <div className='chart-wrapper'>
                    <ReactApexChart
                        options={candlestick}
                        series={props.post?.graph?.series}
                        type="candlestick"
                        width="100%"
                        height="100%"
                    />
                </div>

            }
        </>
    );
}

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

const mapDispatchToProps = dispatch => {
    return {
        fetchLineData: (id, finnhubSymbol, token) => dispatch(fetchLineData(id, finnhubSymbol, token))
    }
};

export default connect(null, mapDispatchToProps)(LineChart7Day);