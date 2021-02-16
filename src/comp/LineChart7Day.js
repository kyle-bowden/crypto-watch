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
            props.fetchLineData(props.id, props.finnhub?.symbol);
        }
    }, [props]);

    useInterval(() => {
        const time = timer - 1;
        if(time === 0) {
            props.fetchLineData(props.id, props.finnhub?.symbol)
                .then(() => setTimer(60 * REFRESH_GRAPH_MINUTES));
        } else {
            setTimer(timer - 1);
        }
    }, 1000);

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
        console.log("NOPE: ");
        return [{data: []}];
    };

    return (
        <>
            {props.prepare === true ? <div className="lds-facebook loading"><div/><div/><div/></div> :
                <ReactApexChart
                    options={candlestick}
                    series={findChartById(props.id)}
                    type="candlestick"
                    width="100%"
                    height="100%"
                />
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