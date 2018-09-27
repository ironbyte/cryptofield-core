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
    await this.getOpenAuctions();
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

  async getOpenAuctions() {
    let auctionsOpen = await this.state.instance.getOpenAuctions.call();
    let accounts = await this.state.web3.eth.getAccounts();

    const auctionInfo = auctionsOpen.map(async auction => {
      let info = await this.state.instance.getAuction.call(auction);
      let amountOfBidders = await this.state.instance.amountOfBidders.call(auction);
      let min = await this.state.instance.getMinimumAuctionPrice.call(auction);
      let maxBid = await this.state.instance.getMaxBidder.call(auction);

      return {
        owner: info[0],
        created: info[1],
        duration: info[2],
        horseId: info[3],
        amountOfBidders: amountOfBidders,
        min: min,
        maxBid: maxBid,
        id: auction
      }
    })

    let result = await Promise.all(auctionInfo);

    await this.setState({ auctions: result, currAddress: accounts[0] })
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

  displayAmount(amount) {
    let converted = new this.state.web3.utils.toBN(amount);

    return (<td>{this.state.web3.utils.fromWei(converted, "ether")}</td>);
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
                    <td>{auction.owner}</td>
                    <td>{moment.unix(auction.created.toNumber()).format("LLL")}</td>
                    <td>{this.calculateTimeLeft(auction.created.toNumber(), auction.duration.toNumber())}</td>
                    <td>{auction.horseId.toString()}</td>
                    <td>{auction.amountOfBidders.toString()}</td>
                    {this.displayAmount(auction.min)}
                    {this.displayAmount(auction.maxBid[1])}

                    {
                      auction.owner !== this.state.currAddress &&
                      <td onClick={this.bid.bind(this, auction.id, auction.min)}>Click to bid</td>
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