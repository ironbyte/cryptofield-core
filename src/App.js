import React, { Component } from 'react';
import getWeb3 from './utils/getWeb3';

import Core from "./../build/contracts/Core.json";
import GOPCreator from "./../build/contracts/GOPCreator.json";

import AuctionsComponent from "./components/AuctionsComponent";
import OpenAuctions from "./components/OpenAuctions";
import AuctionClosing from "./components/AuctionClosing";
import ParticipatingAuctions from "./components/ParticipatingAuctions";
import Ownership from "./components/Ownership";

import { Link } from "react-router-dom";

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      coreInstance: null,
      gopInstance: null,
      horsesOwned: [],
      isCreatingAuction: false,
      isClosingAuction: false,
      isTransfering: false,
      ipfs: null,
      genIPFS: false,
      newHorse: false
    }

    this.buy = this.buy.bind(this);
    this.auctions = this.auctions.bind(this);
    this.closeAuction = this.closeAuction.bind(this);
    this.transferOwnership = this.transferOwnership.bind(this);
  }

  componentDidMount() {
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
    let GOPCreatorContract = contract(GOPCreator);
    let CoreContract = contract(Core);

    GOPCreatorContract.setProvider(this.web3.currentProvider);
    CoreContract.setProvider(this.web3.currentProvider);

    CoreContract.deployed().then(instance => {
      this.setState({ coreInstance: instance });
    })

    GOPCreatorContract.deployed().then(i => {
      this.setState({ gopInstance: i });
    })
  }

  buy() {
    fetch("https://cryptofield.app/api/v1/generate_horse")
      .then(result => { return result.json() })
      .then(res => {
        this.setState({ genIPFS: true })

        window.ipfs.addJSON(res, (err, hash) => {
          let price = this.web3.utils.toWei("1", "ether");

          console.log(hash, "IPFS HORSE HASH");

          this.web3.eth.getAccounts((web3Err, accounts) => {
            this.state.gopInstance.createGOP(accounts[0], hash, { from: accounts[0], value: price })
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

  closeAuction() {
    this.setState(prevState => ({ isClosingAuction: !prevState.isClosingAuction }));
  }

  transferOwnership() {
    this.setState(prevState => ({ isTransfering: !prevState.isTransfering }));
  }

  render() {
    return (
      <div className="grid-x grid-margin-x">
        <OpenAuctions />

        <ParticipatingAuctions />

        <div className="text-center cell">
          <img
            src="/horse.svg"
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
            return (
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
          <AuctionsComponent
            web3={this.web3}
            coreInstance={this.state.coreInstance}
          />
        }

        <div className="medium-12 cell">
          <button
            onClick={this.closeAuction}
            className="button expanded alert"
          >
            Close Auction
          </button>
          {
            this.state.isClosingAuction &&
            <AuctionClosing
              web3={this.web3}
            />
          }
        </div>

        <div className="medium-12 cell">
          <button
            onClick={this.transferOwnership}
            className="button expanded alert"
          >
            Transfer Ownership
          </button>
          {
            this.state.isTransfering &&
            <Ownership web3={this.web3} coreInstance={this.state.coreInstance} />
          }

          <Link to="/breeding" className="button expanded success">Breeding</Link>
        </div>
      </div>
    );
  }
}

export default App
