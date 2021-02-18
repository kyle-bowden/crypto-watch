import React, {useState, useEffect, useRef} from 'react';
import { connect } from "react-redux";
import { fetchLineData } from "../redux/actions";
import './LineChart7Day.css';
import ReactApexChart from 'react-apexcharts';

function LineChart7Day(props) {
    const REFRESH_GRAPH_MINUTES = 10;
    const [timer, setTimer] = useState(60 * REFRESH_GRAPH_MINUTES);

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
        if(props.prepare) {
            // LOAD ONCE
            fetchLineData(false)
        }
    }, [props]);

    useInterval(() => {
        const time = timer - 1;
        if(time === 0) {
            fetchLineData(true);
        } else {
            setTimer(timer - 1);
        }
    }, 1000);

    const fetchLineData = (resetTimer) => {
        props.fetchLineData(props.id, props.finnhub?.symbol).then(() => {
            console.log("ANNOTATIONS UPDATE FOR : " + props.id);
            const patterns = findPatternsById(props.id);

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

                setTimeout(() => {
                    setCandleStick(newAnnotations);
                },5000);
            }

            if(resetTimer) {
                setTimer(60 * REFRESH_GRAPH_MINUTES);
            }
        });
    };

    // const timeString = () => {
    //     const minutes = Math.floor(timer / 60);
    //     const seconds = timer - minutes * 60;
    //     return (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds < 10 ? "0" + seconds : seconds);
    // };

    const findChartById = (id) => {
        if(props.charts.length > 0) {
            const chartById = props.charts.find(chart => chart.id === id);
            return chartById === undefined ? [{data: []}] : chartById.series;
        }
        return [{data: []}];
    };

    const findPatternsById = (id) => {
        if(props.charts.length > 0) {
            const chartById = props.charts.find(chart => chart.id === id);
            return chartById === undefined ? [] : chartById.patterns;
        }
        return [];
    };

    return (
        <>
            {props.prepare === true ? <div className="lds-facebook loading"><div/><div/><div/></div> :
                <div className='chart-wrapper'>
                    <ReactApexChart
                        options={candlestick}
                        series={findChartById(props.id)}
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

const mapStateToProps = state => {
    return {
        charts: state.charts
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchLineData: (id, finnhubSymbol) => dispatch(fetchLineData(id, finnhubSymbol))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LineChart7Day);