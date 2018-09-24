import React, { Component } from "react";
import moment from "moment";
import Countdown from "react-countdown-moment";

import getWeb3 from "./../utils/getWeb3";

import SaleAuction from "./../../build/contracts/SaleAuction.json";

import AuctionBid from "./AuctionBid";

/*
@dev Component to show the open auctions at the moment.
*/
export default class OpenAuctions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      auctions: [],
      instance: null,
      web3: null,
      currAddress: null,
      isBidding: false,
      biddingAuctionId: null,
      askingPrice: null,
    }

    this.calculateTimeLeft = this.calculateTimeLeft.bind(this);
  }

  async componentDidMount() {
    await this.initWeb3();

    let auctionsOpen = await this.state.instance.getOpenAuctions.call();
    let accounts = await this.state.web3.eth.getAccounts();

    for (let i = 0; i < auctionsOpen.length; i++) {
      let currAuction = auctionsOpen[i];
      let auction = await this.state.instance.getAuction.call(currAuction);
      let amountOfBidders = await this.state.instance.amountOfBidders.call(currAuction);
      let minimum = await this.state.instance.getMinimumAuctionPrice.call(currAuction);
      let maxBid = await this.state.instance.getMaxBidder.call(currAuction); // Array of two elements.

      auction = auction // 4
        .concat(amountOfBidders) // 5
        .concat(this.state.web3.utils.fromWei(minimum.toString())) // 6
        .concat(this.state.web3.utils.fromWei(maxBid[1].toString())) // 7
        .concat(currAuction); // Auction ID // 8

      await this.setState(prevState => ({
        auctions: [...prevState.auctions, auction],
        currAddress: accounts[0]
      }));
    }
  }

  async initWeb3() {
    let result = await getWeb3;
    await this.setState({ web3: result.web3 });

    await this.initializeContracts();
  }

  async initializeContracts() {
    let contract = require("truffle-contract");
    let SaleAuctionContract = await contract(SaleAuction);

    await SaleAuctionContract.setProvider(this.state.web3.currentProvider);
    let instance = await SaleAuctionContract.deployed();

    await this.setState({ instance: instance });
  }

  // HTML rendering functions
  calculateTimeLeft(start, duration) {
    return <Countdown endDate={moment.unix(start).add(duration, "seconds")} />
  }

  bid(id, asking) {
    this.setState(prevState => ({
      isBidding: !prevState.isBidding,
      biddingAuctionId: id.toString(),
      askingPrice: asking
    }))
  }

  auctionsTable() {
    return (
      <div>
        <h2 className="text-center">Open Auctions!</h2>

        <table>
          <thead>
            <tr>
              <th>Auctioner</th>
              <th>Created</th>
              <th>Time left</th>
              <th>Horse ID</th>
              <th>Amount of Bidders</th>
              <th>Reserve Price (Ether)</th>
              <th>Highest Bid</th>
              <th>Bid!</th>
            </tr>
          </thead>

          <tbody>
            {
              this.state.auctions.map((auction, index) => {
                return (
                  <tr key={index}>
                    <td>{auction[0]}</td>
                    <td>{moment.unix(auction[1].toNumber()).format("LLL")}</td>
                    <td>{this.calculateTimeLeft(auction[1].toNumber(), auction[2].toNumber())}</td>
                    <td>{auction[3].toString()}</td>
                    <td>{auction[4].toString()}</td>
                    <td>{auction[5]}</td>
                    <td>{auction[6]}</td>

                    {
                      auction[0] !== this.state.currAddress &&
                      <td onClick={this.bid.bind(this, auction[7], auction[5])}>Click to bid</td>
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>

        {
          this.state.isBidding &&
          <AuctionBid
            instance={this.state.instance}
            auction={this.state.biddingAuctionId}
            askingPrice={this.state.askingPrice}
            web3={this.state.web3} />
        }
      </div>
    )
  }

  render() {
    let auctionMessage =
      this.state.auctions.length === 0 ?
        <h2 className="text-center">There are no auctions open yet.</h2> :
        this.auctionsTable();

    return (
      <div className="cell">
        {auctionMessage}

        <hr />
      </div>
    )
  }
}