import React, {useState, useEffect} from 'react';
import { Line } from 'react-chartjs-2';
import { connect } from "react-redux";
import { fetchLineData } from "../redux/actions";
import './LineChart7Day.css';

function LineChart7Day(props) {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            console.log(props);
            props.fetchLineData(props.id).then(setLoading(false));
        }, 500);
    }, []);

    const findChartById = (id) => {
        if(props.charts.length > 0) {
            const chartById = props.charts.find(chart => chart.id === id);
            return chartById === undefined ? {} : chartById.chart;
        }
        return {};
    };

    return (
        <>
            {loading === true ? <div className="lds-facebook loading"><div/><div/><div/></div> :
                <Line onElementsClick={() => window.open("https://uk.tradingview.com/symbols/" + props.symbol.toUpperCase() + "USD")} data={findChartById(props.id)}
                      options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          title: {
                              display: false
                          },
                          legend: {
                              display: false
                          },
                          elements: {
                              point: {
                                  radius: 0,
                                  hitRadius: 0,
                                  hoverRadius: 0
                              }
                          },
                          scales: {
                              xAxes: [{
                                  gridLines: {
                                      display: false
                                  }
                              }],
                              yAxes: [{
                                  gridLines: {
                                      display: false
                                  },
                                  ticks: {
                                      display: false
                                  }
                              }]
                          }
                      }}
                />
            }
        </>
    );
}

const mapStateToProps = state => {
    return {
        charts: state.charts
    }
};

const mapDispatchToProps = dispatch => {
    return {
        fetchLineData: (id) => dispatch(fetchLineData(id))
    }
};

export default connect(mapStateToProps, mapDispatchToProps)(LineChart7Day);