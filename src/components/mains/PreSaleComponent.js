import React, { Component } from "react";
import getWeb3 from "./../../utils/getWeb3";
import GOPCreator from "./../../../build/contracts/GOPCreator.json";

export default class PresaleComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      instance: null,
    }

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount() {
    getWeb3
      .then(result => {
        this.web3 = result.web3;

        this.instantiateContracts();
      })
      .catch(() => {
        console.log("Error finding web3 in presale component");
      })
  }

  instantiateContracts() {
    let contract = require("truffle-contract");
    let GOPCreatorContract = contract(GOPCreator);

    GOPCreatorContract.setProvider(this.web3.currentProvider);

    GOPCreatorContract.deployed().then(instance => {
      this.setState({ instance: instance });
    })
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  render() {
    return (
      <div className="grid-x grid-margin-x">
        <div className="small-6 cell">
          <form onSubmit={this.handleSubmit}>
            <label>
              Open Batch
                <input type="numeric" />
            </label>
          </form>
        </div>
      </div>
    )
  }
}