import './App.css';
import React from "react";
import Navbar from './comp/Navbar';
import { BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Tickers from "./comp/Tickers";

function App() {
  return (
    <>
        <Router>
            <div style={{display: 'grid', gridTemplateColumns: '100%'}}>
                <Navbar/>
                <Tickers />
            </div>
            <Switch>
                <Route path="/" exact/>
            </Switch>
        </Router>
    </>
  );
}

export default App;
