import React, { Component } from 'react';
import getWeb3 from './utils/getWeb3';
import CryptofieldBase from "./../build/contracts/CryptofieldBase.json";
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
    this.transfer = this.transfer.bind(this);
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
    let CryptofieldBaseContract = contract(CryptofieldBase);
    let CTokenContract = contract(CToken);

    CryptofieldBaseContract.setProvider(this.web3.currentProvider);
    CTokenContract.setProvider(this.web3.currentProvider);

    CryptofieldBaseContract.deployed().then(instance => {
      this.setState({ instance: instance });
    })

    CTokenContract.deployed().then(instance => {
      this.setState({ CToken: instance })
    })
  }

  buy() {
    let amount = this.web3.toWei(1, "finney");
    let bio = "Some biography"
    let byteParams = [
      "Sundance Dancer",
      "Red",
      "Stallion",
      "Fast",
      "Canada",
      "Male",
      "2",
      "pedigree"
    ];

    for(let i = 0; i < byteParams.length; i++) {
      byteParams[i] = this.web3.fromAscii(byteParams[i], 32)
    }

    console.log(byteParams);

    this.web3.eth.getAccounts((err, accounts) => {
      this.state.instance.buyStallion(accounts[0], bio, 12, byteParams, {from: accounts[0], value: amount, gas: 1000000})
      .then(res => { console.log(res) })
      .catch(err => { console.log(err) })
    })
  }

  myHorses() {
    let horsesArr = [];

    this.web3.eth.getAccounts((err, accounts) => {
      this.state.instance.getHorsesOwned.call(accounts[0], {from: accounts[0]})
      .then(res => {
        console.log(accounts)
        res.forEach(horseId => { horsesArr.push(horseId) })

        this.setState({ horsesOwned: horsesArr })
      })
      .catch(err => { console.log(err) })
    })
  }

  showHorseInfo(horseId) {
    let response = [];

    this.state.instance.getHorse.call(horseId)
    .then(res => {
      res.forEach((ele, index) => {
        response[index] = this.web3.toAscii(ele).replace(/\0/g, "")
      })

      console.log(response)
    })
    .catch(err => { console.log(err) })
  }

  transfer() {
    this.web3.eth.getAccounts((err, accounts) => {
      console.log(accounts)
      this.state.instance.sendHorse(
                                      accounts[0],
                                      "0x150bca44f718e4e6df12e28b9ef029dbf4d7ddbf",
                                      2, {from: accounts[0], gas: 1000000}
                                    )
      .then(res => { console.log(res) })
      .catch(err => { console.log(err) })
    })
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
          <button onClick={this.transfer} className="button expanded success"> Transfer </button>
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
