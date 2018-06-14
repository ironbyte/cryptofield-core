import React, { Component } from 'react';
import getWeb3 from './utils/getWeb3';
import Horse from "./../build/contracts/Horse.json";
import CToken from "./../build/contracts/CToken.json";

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      instance: null,
      stallionsAvailable: null,
      horsesOwned: [],
      CToken: null
    }

    this.myHorses = this.myHorses.bind(this);
    this.buy = this.buy.bind(this);
    this.getData = this.getData.bind(this);
  }

  componentWillMount() {
    getWeb3
    .then(results => {
      this.web3 = results.web3;

      // Instantiate contract once web3 provided.
      this.instantiateContract()
    })
    .catch(() => {
      console.log('Error finding web3.')
    })
  }

  componentDidUpdate() {
    this.state.instance.getStallionsAvailable.call()
    .then(res => { this.setState({ stallionsAvailable: res.toString() }) })
  }

  instantiateContract() {
    let contract = require('truffle-contract')
    let HorseContract = contract(Horse);
    let CTokenContract = contract(CToken);

    HorseContract.setProvider(this.web3.currentProvider);
    CTokenContract.setProvider(this.web3.currentProvider);

    HorseContract.deployed().then(instance => {
      this.setState({ instance: instance });
    })

    CTokenContract.deployed().then(instance => {
      this.setState({ CToken: instance })
    })
  }

  buy() {
    let amount = this.web3.toWei(1, "finney");
    let byteParams = [
      "Sundance Dancer",
      "Brown",
      "Stallion",
      "Some breed",
      "Some running style",
      "Some origin",
      "Sire",
      "Some rank",
      "Some pedigree",
      "Some parents",
      "Some grandparents",
      "some phenotypes",
      "Some genotypes",
      "None"
    ];

    for(let i = 0; i < byteParams.length; i++) {
      byteParams[i] = this.web3.fromAscii(byteParams[i], 32)
    }

    console.log(byteParams);

    let bio = "Some biography"

    this.web3.eth.getAccounts((err, accounts) => {
      this.state.instance.buyStallion(accounts[0], bio, byteParams, {from: accounts[0], value: amount, gas: 1000000})
      .then(res => { console.log(res) })
      .catch(err => { console.log(err) })
    })
  }

  myHorses() {
    let horsesArr = [];

    this.web3.eth.getAccounts((err, accounts) => {
      this.state.instance.getStallions.call(accounts[0], {from: accounts[0]})
      .then(res => {
        res.forEach(horseId => { horsesArr.push(horseId) })

        this.setState({ horsesOwned: horsesArr })
      })
      .catch(err => { console.log(err) })
    })
  }

  getData() {
    //console.log(this.web3.toAscii("0x536f6d652072756e6e696e67207374796c65").replace(/\u0000g/, ""))
    this.state.CToken._getHorse.call(0)
    .then(res => {
      console.log(res);
    })
    .catch(err => { console.log(err) })
  }

  showHorseInfo(horseId) {
    this.state.CToken._getHorse.call(horseId.toString())
    .then(res => {
      console.log(res);
    })
    .catch(err => { console.log(err) })
  }

  render() {
    return (
      <div className="grid-x grid-margin-x">
        <div className="text-center cell">
          <img
            src="/horse.png"
            alt="horse"
          />
          <h2 className="text-center"> {this.state.stallionsAvailable} stallions available! </h2>
          <button
            onClick={this.buy}
            className="button expanded success"
          >
            Buy
          </button>

          <button onClick={this.myHorses} className="button expanded success"> Your horses </button>
          <button onClick={this.getData} className="button expanded success"> Data </button>
        </div>

        {
          this.state.horsesOwned &&
          this.state.horsesOwned.map(horseId => {
            return(
              <div key={horseId}>
                Horses Owned:
                <h1
                  onClick={this.showHorseInfo.bind(this, horseId)}
                >
                  {horseId.toString()}
                </h1>
              </div>
            )
          })
        }
      </div>
    );
  }
}

export default App
