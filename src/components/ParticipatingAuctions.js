import React, { Component } from "react";

import SaleAuction from "./../../build/contracts/SaleAuction.json";

import getWeb3 from "./../utils/getWeb3";

import moment from "moment";

export default class ParticipatingAuctions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      auctions: [],
      instance: null,
      web3: null
    }

    this.auctionStatus = this.auctionStatus.bind(this);
  }

  async componentDidMount() {
    await this.initWeb3();

    let accounts = await this.state.web3.eth.getAccounts();
    let participatingAuctions = await this.state.instance.participatingIn.call(accounts[0]);

    const auctionInfo = participatingAuctions.map(async id => {
      let auction = await this.state.instance.getAuction.call(id);
      let status = await this.state.instance.getAuctionStatus.call(id);

      return { owner: auction[0], timestamp: auction[1], horse: auction[3], status: status, id: id }
    })

    let res = await Promise.all(auctionInfo);

    await this.setState({ auctions: res });
  }

  async initWeb3() {
    let result = await getWeb3;
    await this.setState({ web3: result.web3 })

    await this.initContracts();
  }

  async initContracts() {
    let contract = require("truffle-contract");
    let SaleAuctionContract = await contract(SaleAuction);

    await SaleAuctionContract.setProvider(this.state.web3.currentProvider);

    let instance = await SaleAuctionContract.deployed();
    await this.setState({ instance: instance })
  }

  auctionStatus(status) {
    return status === true ? "Open" : "Closed"
  }

  async withdraw(auction) {
    let accounts = await this.state.web3.eth.getAccounts();

    await this.state.instance.withdraw(auction, { from: accounts[0], gas: 1000000 })
  }

  canWithdraw(status, id) {
    if (status.toString() === "true") { return (<td></td>) }

    return (<td onClick={this.withdraw.bind(this, id)}><strong>Withdraw</strong></td>)
  }

  // HTML RENDERING FUNCTIONS
  renderUserAuctions() {
    return (
      <div>
        <h2 className="text-center">Here are the auctions where you've participated!</h2>
        <table>
          <thead>
            <tr>
              <td>Owner</td>
              <td>Created at</td>
              <td>Horse</td>
              <td>Status</td>
              <td></td>
            </tr>
          </thead>

          <tbody>
            {
              this.state.auctions.map((auction, index) => {
                return (
                  <tr key={index}>
                    <td>{auction.owner}</td>
                    <td>{moment.unix(auction.timestamp.toNumber()).format("LLL")}</td>
                    <td>{auction.horse.toString()}</td>
                    <td>{this.auctionStatus(auction.status)}</td>

                    {
                      this.canWithdraw(auction.status, auction.id)
                    }
                  </tr>
                )
              })
            }
          </tbody>
        </table>
      </div>
    )
  }

  render() {
    let auctions =
      this.state.auctions.length === 0 ?
        <h3 className="text-center">You're not participating in any Auction, bid on one and it'll appear here</h3> :
        this.renderUserAuctions();

    return (
      <div className="cell">
        {auctions}

        <hr />
      </div>
    )
  }
}