import "babel-polyfill";
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'
import BreedingComponent from "./components/mains/BreedingComponent";
import PreSaleComponent from "./components/mains/PreSaleComponent";
import "./css/main.css";
import {
  BrowserRouter as Router,
  Route
} from "react-router-dom";

// Creates a new instance of IPFS.
const IPFS = require("ipfs-mini");
window.ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" });

ReactDOM.render(
  <Router>
    <div>
      <Route exact path="/" component={App} />
      <Route path="/breeding" component={BreedingComponent} />
      <Route path="/system/presale" component={PreSaleComponent} />
    </div>
  </Router>,
  document.getElementById('root')
);
