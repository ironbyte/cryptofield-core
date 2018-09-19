import React, { Component } from "react";
import getWeb3 from "./../../utils/getWeb3";
import Breeding from "./../../../build/contracts/Breeding.json";

export default class BreedingComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      breedingInstance: null
    }

    this.getHorsesInStud = this.getHorsesInStud.bind(this);
  }

  componentDidMount() {
    getWeb3
      .then(results => {
        this.web3 = results.web3;

        this.instantiateContracts();
      })
      .catch(() => {
        console.log("Error finding web3");
      })
  }

  instantiateContracts() {
    let contract = require("truffle-contract");
    let BreedingContract = contract(Breeding);

    BreedingContract.setProvider(this.web3.currentProvider);

    BreedingContract.deployed().then(instance => {
      this.setState({ breedingInstance: instance });
    })
  }

  async getHorsesInStud() {
    let horses = await this.state.breedingInstance.getHorsesInStud.call();

    return horses;
  }

  render() {
    return (
      <div className="grid-x grid-margin-x">
        <div className="small-6 cell">
          <h2>Number of horses in stud {this.getHorsesInStud.length}</h2>
        </div>

        <div className="small-6 cell">
          <h2>Testing</h2>
        </div>
      </div>
    )
  }
}