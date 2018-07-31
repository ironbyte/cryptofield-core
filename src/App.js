import React, { Component } from 'react';
import getWeb3 from './utils/getWeb3';
import CToken from "./../build/contracts/CToken.json";
import AuctionsComponent from "./components/AuctionsComponent";

// Creates a new instance of IPFS.
const IPFS = require("ipfs-mini");
window.ipfs = new IPFS({ host: "ipfs.infura.io", port: 5001, protocol: "https" })

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      tokenInstance: null,
      horsesOwned: [],
      isCreatingAuction: false,
      ipfs: null,
      genIPFS: false,
      newHorse: false
    }

    this.buy = this.buy.bind(this);
    this.auctions = this.auctions.bind(this);
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

  instantiateContract() {
    let contract = require('truffle-contract')
    let CTokenContract = contract(CToken);

    CTokenContract.setProvider(this.web3.currentProvider);

    CTokenContract.deployed().then(instance => {
      this.setState({ tokenInstance: instance });
    })
  }

  buy() {
    fetch("http://localhost:4000/api/v1/generate_horse")
    .then(result => { return result.json() })
    .then(res => {
      this.setState({ genIPFS: true })

      window.ipfs.addJSON(res, (err, _hash) => {
        console.log(_hash)

        this.web3.eth.getAccounts((web3Err, accounts) => {
          this.state.tokenInstance.createHorse(accounts[0], _hash, {from: accounts[0]})
          .then(res => { 
            this.setState({ newHorse: true, genIPFS: false }) 
          })
          .catch(err => { console.log(err) })
        })
      })
    })
    .catch(err => { console.log("There was an error processing the request", err) })
  }

  auctions() {
    this.setState(prevState => ({ isCreatingAuction: !prevState.isCreatingAuction }));
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

  render() {
    return(
      <div className="grid-x grid-margin-x">
        <div className="text-center cell">
          <img
            src="/horse.png"
            alt="horse"
          />
          <h2 className="text-center"> Buy a new horse now! </h2>
          <button
            onClick={this.buy}
            className="button expanded success"
          >
            Buy
          </button>

          {
            this.state.genIPFS &&
            <h2> Your horse is being generated, please wait a moment </h2>
          }

          {
            this.state.newHorse &&
            <h2>Your new horse has been created!</h2>
          }

          <button
            onClick={this.auctions}
            className="button expanded success"
          >
            Create Auction
          </button>
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
          this.state.isCreatingAuction &&
          <AuctionsComponent web3={this.web3} tokenInstance={this.state.tokenInstance} />
        }
      </div>
    );
  }
}

export default App
