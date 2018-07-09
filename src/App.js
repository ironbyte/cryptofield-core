import React, { Component } from 'react';
import getWeb3 from './utils/getWeb3';
import CryptofieldBase from "./../build/contracts/CryptofieldBase.json";
import Auctions from "./../build/contracts/Auctions.json";
import Transfer from "./components/Transfer";

// Creates a new instance of IPFS.
const IPFS = require("ipfs-mini");
window.ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" })

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      instance: null,
      horsesAvailable: [],
      horsesOwned: [],
      isTransferring: false,
      ipfs: null,
      lastTx: null,
      auctionsInstance: null
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
    let horsesAvailableArray = [];

    this.state.instance.getHorsesAvailable.call()
    .then(res => {
      res.forEach((horse, i) => { horsesAvailableArray[i] = horse.toString() })

      this.setState({ horsesAvailable: horsesAvailableArray })
    })
  }

  instantiateContract() {
    let contract = require('truffle-contract')
    let CryptofieldBaseContract = contract(CryptofieldBase);
    let AuctionsContract = contract(Auctions);

    CryptofieldBaseContract.setProvider(this.web3.currentProvider);
    AuctionsContract.setProvider(this.web3.currentProvider);

    CryptofieldBaseContract.deployed().then(instance => {
      this.setState({ instance: instance });
    })

    AuctionsContract.deployed().then(instance => {
      this.setState({ auctionsInstance: instance })
    })
  }

  buy() {
    let amount = this.web3.toWei(1, "finney");

    this.web3.eth.getAccounts((err, accounts) => {
      this.state.auctionsInstance.start({ from: accounts[0], value: amount })
      .then(res => { console.log(res) })
    })

    /*fetch("http://localhost:4000/generator/generate_horse")
    .then(result => { return result.json() })
    .then(res => {
      window.ipfs.addJSON(res, (err, _hash) => {
        console.log(_hash)

        this.web3.eth.getAccounts((web3Err, accounts) => {
          this.state.instance.buyStallion(accounts[0], _hash, {from: accounts[0], value: amount, gas: 1000000})
          .then(res => { this.setState({ lastTx: res.receipt.transactionHash }) })
          .catch(err => { console.log(err) })
        })
      })
    })
    .catch(err => { console.log("There was an error processing the request", err) })*/
  }

  myHorses() {
    let horsesArr = [];

    this.web3.eth.getAccounts((err, accounts) => {
      this.state.instance.getHorsesOwned.call(accounts[0], {from: accounts[0]})
      .then(res => {
        res.forEach(horseId => { horsesArr.push(horseId) })

        this.setState({ horsesOwned: horsesArr })
      })
      .catch(err => { console.log(err) })
    })
  }

  showHorseInfo(horseId) {
    this.state.instance.getHorse.call(horseId - 1)
    .then(res => {
      window.ipfs.cat(res, (err, horseInfo) => {
        console.log(JSON.parse(horseInfo))
      })
    })
    .catch(err => { console.log(err) })
  }

  transfer() {
    this.setState(prevState => ({ isTransferring: !prevState.isTransferring }))
  }

  render() {
    let link = "https://ropsten.etherscan.io/tx/" + this.state.lastTx

    return (
      <div className="grid-x grid-margin-x">
        <div className="text-center cell">
          <img
            src="/horse.png"
            alt="horse"
          />
          <h2 className="text-center"> {this.state.horsesAvailable[0]} stallions available! </h2>
          <button
            onClick={this.buy}
            className="button expanded success"
          >
            Buy
          </button>

          <button onClick={this.myHorses} className="button expanded success"> Your horses </button>
          <button onClick={this.transfer} className="button expanded success"> Transfer </button>

          <h3 onClick={() => {
            this.state.auctionsInstance.getIds.call()
            .then(res => { console.log(res) })
          }}>
            IDS
          </h3>
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

        {
          this.state.isTransferring &&
          <Transfer
            instance={this.state.instance}
            web3={this.web3}
          />
        }

        {
          this.state.lastTx &&
          <a href={link} target="_blank">Transaction</a>
        }
      </div>
    );
  }
}

export default App
