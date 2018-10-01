import React, { Component } from "react";
import moment from "moment";

import getWeb3 from "./../../utils/getWeb3";
import GOPCreator from "./../../../build/contracts/GOPCreator.json";

import GOPAuctionBid from "./GOPAuctionBid";

// import Countdown from "react-countdown-moment";

/*
@dev Component to show the open auctions at the moment.
*/
export default class GOPAuctions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      instance: null,
      web3: null,
      auctions: [],
      isBidding: false,
      biddingAuctionId: null,
      askingPrice: null,
    }

    this.calculateTimeLeft = this.calculateTimeLeft.bind(this);
  }

  async componentDidMount() {
    let result = await getWeb3;
    this.web3 = await result.web3;

    window.moment = moment;

    await this.initContract();
    await this.getOpenAuctions();
  }

  async initContract() {
    let contract = require("truffle-contract");
    let GOPContract = await contract(GOPCreator);

    await GOPContract.setProvider(this.web3.currentProvider);

    let gopInstance = await GOPContract.deployed();

    await this.setState({ instance: gopInstance })
  }

  async getOpenAuctions() {
    let auctionsOpen = await this.state.instance.getOpenAuctions.call();

    const auctionInfo = auctionsOpen.map(async auction => {
      let info = await this.state.instance.auctionInformation.call(auction);

      return {
        created: info[0],
        min: info[1],
        gen: info[2],
        amountOfBidders: info[3],
        maxBid: info[4],
        maxBidder: info[5],
        status: info[6],
        id: auction
      }
    })

    let result = await Promise.all(auctionInfo);

    await this.setState({ auctions: result })
  }

  // HTML rendering functions
  calculateTimeLeft(start, duration) {
    return moment.unix(start).add(duration, "seconds").toString()
    // return <Countdown endDate={moment.unix(start).add(duration, "seconds")} />
  }

  bid(id, asking) {
    this.setState(prevState => ({
      isBidding: !prevState.isBidding,
      biddingAuctionId: id.toString(),
      askingPrice: asking
    }))
  }

  displayAmount(amount) {
    let converted = new this.web3.utils.toBN(amount);

    return (<td>{this.web3.utils.fromWei(converted, "ether")}</td>);
  }

  auctionsTable() {
    return (
      <div>
        <h2 className="text-center">Open GOP Auctions!</h2>

        <table>
          <thead>
            <tr>
              <th>Created</th>
              <th>Finishing at</th>
              <th>Horse GEN</th>
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
                    <td>{moment.unix(auction.created.toNumber()).format("LLL")}</td>
                    <td>{this.calculateTimeLeft(auction.created.toNumber(), 604800)}</td>
                    <td>{auction.gen.toString()}</td>
                    <td>{auction.amountOfBidders.toString()}</td>
                    {this.displayAmount(auction.min)}
                    {this.displayAmount(auction.maxBid)}
                    <td onClick={this.bid.bind(this, auction.id, auction.min)}>Click to bid</td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>

        {
          this.state.isBidding &&
          <GOPAuctionBid
            instance={this.state.instance}
            auction={this.state.biddingAuctionId}
            askingPrice={this.state.askingPrice}
            web3={this.web3} />
        }

      </div>
    )
  }

  render() {
    let auctionMessage =
      this.state.auctions.length === 0 ?
        <h2 className="text-center">There are no auctions for GOP open yet.</h2> :
        this.auctionsTable();

    return (
      <div className="cell">
        {auctionMessage}

        <hr />
      </div>
    )
  }
}