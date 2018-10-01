import React, { Component } from "react";

import SaleAuction from "./../../build/contracts/SaleAuction.json";

import moment from "moment";

export default class AuctionCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      saleAuctionsInstance: null,
      duration: 1,
      minimum: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    let contract = require("truffle-contract");
    let SaleAuctionContract = await contract(SaleAuction);

    await SaleAuctionContract.setProvider(this.props.web3.currentProvider);

    let saleAuctionsInstance = await SaleAuctionContract.deployed();

    await this.setState({ saleAuctionsInstance: saleAuctionsInstance });
  }

  async handleSubmit(e) {
    await e.preventDefault();

    // Test values, state should be used when doing this.
    // let duration = moment().add(1, "day").diff(moment(), "seconds") + 1;
    let accounts = await this.props.web3.eth.getAccounts();
    let price = await this.state.saleAuctionsInstance.getQueryPrice.call();

    await this.props.coreInstance.createAuction(
      300,
      this.props.horse,
      this.props.web3.utils.toWei(this.state.minimum, "ether"),
      { from: accounts[0], value: price }
    );
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div>
        <h2 className="text-center cell">Creating Auction for horse number {this.props.horse} </h2>

        <form onSubmit={this.handleSubmit}>
          <div className="grid-x grid-margin-x">
            <div className="medium-6 cell">
              <label>
                Duration:

                <select name="duration" value={this.state.duration} onChange={this.handleChange}>
                  <option value={1}>1 day</option>
                  <option value={2}>2 days</option>
                </select>
              </label>
            </div>

            <div className="medium-6 cell">
              <label>
                Asking price (Ether):

                <input
                  type="number"
                  onChange={this.handleChange}
                  name="minimum"
                  value={this.state.minimum}
                  placeholder="0.05"
                  min={0}
                  step="any" />
              </label>
            </div>
          </div>

          <input type="submit" className="button expanded alert" value="Create" />
        </form>
      </div>
    )
  }
}