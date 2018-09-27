import React, { Component } from "react";
import { Link } from "react-router-dom";

import getWeb3 from "./../../utils/getWeb3";

import GOPCreator from "./../../../build/contracts/GOPCreator.json";

export default class PresaleComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      instance: null,
      batchToOpen: 1,
      batchToClose: 1,
      batchOpenOutput: "",
      batches: {
        open: 0
      },
      horses: {
        available: ""
      }
    }

    this.openBatch = this.openBatch.bind(this);
    this.closeBatch = this.closeBatch.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getOpenBatch = this.getOpenBatch.bind(this);
    this.getAvailableHorses = this.getAvailableHorses.bind(this);
    this.renderGOPAuction = this.renderGOPAuction.bind(this);
    this.createGOPAuction = this.createGOPAuction.bind(this);
  }

  async  componentDidMount() {
    let result = await getWeb3;
    this.web3 = result.web3;

    await this.instantiateContracts();

    await this.getOpenBatch();
    await this.getAvailableHorses();
  }

  async instantiateContracts() {
    let contract = require("truffle-contract");
    let GOPCreatorContract = await contract(GOPCreator);

    await GOPCreatorContract.setProvider(this.web3.currentProvider);

    let instance = await GOPCreatorContract.deployed()

    await this.setState({ instance: instance });
  }

  async openBatch(e) {
    await e.preventDefault();

    let acc = await this.web3.eth.getAccounts();
    await this.state.instance.openBatch(this.state.batchToOpen, { from: acc[0] });
  }

  async closeBatch(e) {
    await e.preventDefault();

    let acc = await this.web3.eth.getAccounts();
    await this.state.instance.closeBatch(this.state.batchToClose, { from: acc[0], gas: 100000 });
  }

  async handleChange(e) {
    await this.setState({ [e.target.name]: e.target.value });
  }

  async getOpenBatch() {
    let state;
    let batchInfo = await this.state.instance.isABatchOpen.call();

    if (batchInfo[0]) {
      state = "Current open batch: " + batchInfo[1].toString();
    } else {
      state = "There are not open batches at the moment!"
    }

    await this.setState(prevState => ({
      batches: { ...prevState.batches, open: batchInfo[1] },
      batchOpenOutput: state
    }))
  }

  async getAvailableHorses() {
    // Get the horses vailable from the current batch
    let horses = await this.state.instance.horsesRemaining.call(this.state.batches.open);

    await this.setState(prevState => ({ horses: { ...prevState.horses, available: horses } }))
  }

  createGOPAuction(e) {
    e.preventDefault();

    fetch("https://cryptofield.app/api/v1/generate_horse")
      .then(res => { return res.json() })
      .then(horseData => {
        let query = this.web3.utils.toWei("1", "ether");

        console.log(horseData)

        // this.state.instance.getQueryPrice.call().then(res => { query = res });

        this.web3.eth.getAccounts((err, accs) => {
          console.log(accs)
          this.state.instance.createGOP(accs[0], "QmXVaGDcwEXpV3CkrQouMkoQBMc5tEUCVHNNWeZqqKeipM", { from: accs[0], value: query });

          // window.ipfs.addJSON(horseData, (err, horseHash) => {
          //   let hash = horseHash
          //   console.log(hash)

          // })
        })
      })
      .catch(err => { console.log("ERROR CREATING HORSE", err) });
  }

  // RENDER FUNCTIONS (OUTPUT HTML)
  renderGOPAuction() {
    return (
      <div className="text-center cell">
        <form onSubmit={this.createGOPAuction}>
          <hr />
          <br />
          <label>
            <h2>Create GOP Auction</h2>
          </label>

          <input type="submit" value="Create GOP Auction" className="button success expanded" />
        </form>
      </div>
    )
  }

  render() {
    return (
      <div className="grid-x grid-margin-x">
        <div className="small-6 cell">
          <form onSubmit={this.openBatch}>
            <label>
              <h2> Open Batch </h2>

              <input
                min={1}
                max={10}
                type="number"
                name="batchToOpen"
                value={this.state.batchToOpen}
                onChange={this.handleChange} />
            </label>

            <input type="submit" value="Open Batch" className="button success expanded" />
          </form>
        </div>

        <div className="small-6 cell">
          <form onSubmit={this.closeBatch}>
            <label>
              <h2>Close Batch</h2>

              <input
                min={1}
                max={10}
                type="number"
                name="batchToClose"
                value={this.state.batchToClose}
                onChange={this.handleChange} />
            </label>

            <input type="submit" value="Close Batch" className="button success expanded" />
          </form>
        </div>

        <div className="small-12 text-center cell">
          <br />
          <h2> {this.state.batchOpenOutput} </h2>
        </div>

        <div className="small-12 text-center cell">
          <br />
          <h2> Horses available in the current batch: {this.state.horses.available.toString()} </h2>
        </div>

        {
          Number(this.state.batches.open) >= 5 && Number(this.state.batches.open) <= 10 &&
          this.renderGOPAuction()
        }

        <Link to="/" className="button expanded success">Home</Link>
      </div>
    )
  }
}