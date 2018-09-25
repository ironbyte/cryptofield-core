import React, { Component } from "react";
import getWeb3 from "./../../utils/getWeb3";

import Core from "./../../../build/contracts/Core.json";
import Breeding from "./../../../build/contracts/Breeding.json";

export default class BreedingComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      breedingInstance: null,
      coreInstance: null,
      horsesInStud: [],
      horsesForBreeding: [],
      selectedFemaleHorse: null,
    }
  }

  async componentDidMount() {
    let result = await getWeb3;
    this.web3 = await result.web3;
    await this.instantiateContracts();
    await this.getHorsesInStud();
    await this.getHorsesForBreeding();
  }

  async instantiateContracts() {
    let contract = require("truffle-contract");
    let CoreContract = await contract(Core);
    let BreedingContract = await contract(Breeding);

    await CoreContract.setProvider(this.web3.currentProvider);
    await BreedingContract.setProvider(this.web3.currentProvider);

    let coreInstance = await CoreContract.deployed();
    let breedingInstance = await BreedingContract.deployed();

    await this.setState({ coreInstance: coreInstance, breedingInstance: breedingInstance });
  }

  async getHorsesInStud() {
    // Get available horses and also get information from them.
    let horses = await this.state.coreInstance.getHorsesInStud.call();

    const horsesInStud = horses.map(async (token, index) => {
      let horseData = await this.state.coreInstance.getHorseData.call(token);
      let studPrice = await this.state.coreInstance.matingPrice.call(token)
      studPrice = await this.web3.utils.fromWei(studPrice.toString(), "ether");

      return { name: horseData[4], bloodline: horseData[7], id: token, breedPrice: studPrice };
    })

    let finalRes = await Promise.all(horsesInStud);

    await this.setState({ horsesInStud: finalRes });
  }

  async getHorsesForBreeding() {
    let acc = await this.web3.eth.getAccounts();
    let ownedHorses = await this.state.coreInstance.getOwnedTokens.call(acc[0]);

    const horses = ownedHorses.map(async (token, index) => {
      let horseData = await this.state.coreInstance.getHorseData.call(token);

      return await { name: horseData[4], bloodline: horseData[7], id: token, gender: horseData[1] };
    })

    let result = await Promise.all(horses);
    let filtered = result.filter(obj => { return this.web3.utils.hexToUtf8(obj.gender) !== "M" });

    await this.setState({ horsesForBreeding: filtered })
  }

  breedWith(id) {
    if (this.state.selectedFemaleHorse === null) {
      alert("Please select a female horse to breed");

      return;
    }

    fetch("https://cryptofield.app/api/v1/generate_horse")
      .then(result => { return result.json() })
      .then(res => {
        window.ipfs.addJSON(res, (err, hash) => {
          console.log(hash, "IPFS HORSE HASH");

          this.web3.eth.getAccounts((web3Err, acc) => {
            this.state.coreInstance.matingPrice.call(id).then(price => {
              this.state.breedingInstance.mix(id, this.state.selectedFemaleHorse, hash, { from: acc[0], value: price })
            })
          })
        })
      })
      .catch(err => { console.log("There was an error processing the request", err) })
  }

  selectForBreeding(id) {
    this.setState({ selectedFemaleHorse: id.toString() })
  }

  displaySelectedHorse() {
    if (this.state.selectedFemaleHorse === null) {
      return (<div><h2>There are no selected horses</h2></div>)
    } else {
      return (<div><h2>Horse nº {this.state.selectedFemaleHorse} selected</h2></div>)
    }
  }

  render() {
    return (
      <div className="grid-x grid-margin-x">
        <div className="small-6 cell">
          <h2>Number of horses in stud {this.state.horsesInStud.length}</h2>

          <hr />
          <br />

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Bloodline</th>
                <th>ID</th>
                <th>Breed Price</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {
                this.state.horsesInStud.map((token, index) => {
                  return (
                    <tr key={index}>
                      <td>{token.name}</td>
                      <td>{this.web3.utils.hexToUtf8(token.bloodline)}</td>
                      <td>{token.id.toString()}</td>
                      <td>{token.breedPrice} ether</td>
                      <td onClick={this.breedWith.bind(this, token.id)}><strong>Breed!</strong></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        <div className="small-6 cell">
          <h2>Your horses for breeding!</h2>

          <hr />
          <br />

          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Bloodline</th>
                <th>ID</th>
                <th></th>
              </tr>
            </thead>

            <tbody>
              {
                this.state.horsesForBreeding.map((token, index) => {
                  return (
                    <tr key={index}>
                      <td>{token.name}</td>
                      <td>{this.web3.utils.hexToUtf8(token.bloodline)}</td>
                      <td>{token.id.toString()}</td>
                      <td onClick={this.selectForBreeding.bind(this, token.id)}><strong>Select</strong></td>
                    </tr>
                  )
                })
              }
            </tbody>
          </table>
        </div>

        <div className="text-center cell">
          {this.displaySelectedHorse()}
        </div>
      </div>
    )
  }
}