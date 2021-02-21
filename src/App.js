import './App.css';
import React from "react";
import Navbar from './comp/Navbar';
import Tickers from "./comp/Tickers";
import { BrowserRouter as Router, Switch, Route} from "react-router-dom";

function App() {
  return (
    <>
        <Router>
            <div style={{display: 'grid', gridTemplateColumns: '100%'}}>
                <Navbar/>
                <div style={{height: '50px'}}/>
                <Tickers/>
            </div>
            <Switch>
                <Route path="/" exact/>
            </Switch>
        </Router>
    </>
  );
}

export default App;
