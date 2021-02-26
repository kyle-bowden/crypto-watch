import React, { useState, useEffect } from 'react';
import {connect} from "react-redux";
import { fetchLineData } from "../redux/actions";
import './LineChart7Day.css';
import ReactApexChart from 'react-apexcharts';
import useInterval from "../useInterval";
import axios from "axios";

function LineChart7Day(props) {
    const REFRESH_GRAPH_MINUTES = 5; //10
    const [timer, setTimer] = useState(60 * REFRESH_GRAPH_MINUTES);

    const [fetch, setFetch] = useState(false);
    const [source, setSource] = useState(null);

    const [graphRenderComplete, setGraphRenderComplete] = useState(false);
    const [renderPatternTimeout, setRenderPatternTimeout] = useState(-1);

    const [candlestick, setCandleStick] = useState({
        chart: {
            type: 'candlestick',
            toolbar: {
                show: false
            },
            zoom: {
                enabled: false
            },
            redrawOnParentResize: true,
            events: {
                mounted: (chartContext, config) =>  {
                    setRenderPatternTimeout(setTimeout(() =>  {
                        setGraphRenderComplete(true);
                    }, 5000));
                }
            }
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

        updatePatternAnnotations(graphRenderComplete, props.post?.graph?.patterns);

        return () => {
            if(renderPatternTimeout !== -1) clearTimeout(renderPatternTimeout);
        }
    }, [fetch, props.post?.graph?.patterns, graphRenderComplete]);

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

    const updatePatternAnnotations = (doRender, patterns) => {
        if(doRender && patterns) {
            const completeColor = '#00E396';
            const incompleteColor = '#E34342';
            const annotations = patterns.map(a => {
                const annotation =  {
                    x: Math.floor(a.atime*1000),
                    borderColor: (a.status === 'complete') ? completeColor : incompleteColor,
                    fillColor: 'rgba(255,231,236,0.2)',
                    label: {
                        borderColor: (a.status === 'complete') ? completeColor : incompleteColor,
                        style: {
                            fontSize: '10px',
                            color: '#000000',
                            background: (a.status === 'complete') ? completeColor : incompleteColor
                        },
                        orientation: 'vertical',
                        offsetY: 0,
                        text: a.patternname + (a.patterntype === "bullish" ? " →" : " ←")
                    }
                };

                if(a.btime !== undefined) annotation.x2 = Math.floor(a.btime*1000);

                return annotation;
            });

            const newAnnotations = {...candlestick};
            newAnnotations.annotations = { ...newAnnotations.annotations, xaxis: annotations };

            // TODO: slows down rendering of graph
            setCandleStick(newAnnotations);

            setGraphRenderComplete(false);
        }
    };

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

const mapDispatchToProps = dispatch => {
    return {
        fetchLineData: (id, finnhubSymbol, token) => dispatch(fetchLineData(id, finnhubSymbol, token))
    }
};

export default connect(null, mapDispatchToProps)(LineChart7Day);