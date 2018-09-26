import React, { Component } from "react";

import getWeb3 from "./../utils/getWeb3";

import SaleAuction from "./../../build/contracts/SaleAuction.json";

export default class AuctionsCreated extends Component {
  constructor(props) {
    super(props);

    this.state = {
      auctions: [],
      instance: null,
    }
  }

  async componentDidMount() {
    let result = await getWeb3;
    this.web3 = await result.web3;

    await this.initContracts();
  }

  async initContracts() {
    let contract = require("truffle-contract");
    let SaleAuctionContract = await contract(SaleAuction);

    await SaleAuctionContract.setProvider(this.web3.currentProvider);

    let instance = await SaleAuctionContract.deployed();

    await this.setState({ instance: instance });
  }

  renderCreatedAuctions() {
    return (
      <div>
        <h2 className="text-center">Auctions you've created</h2>

        <table>
          <thead>
            <tr>
              <th>Created at</th>
              <th>Horse ID</th>
              <td>Status</td>
              <td>Claim</td>
            </tr>
          </thead>

          <tbody>
            {
              this.state.auctions.map((auction, index) => {
                return (
                  <tr key={index}>
                    <td>{auction.createdAt}</td>
                    <td>{auction.horseId}</td>
                    <td>{auction.status}</td>
                    <td>CLAIM</td>
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
    let auctionsCreated =
      this.state.auctions.length === 0 ?
        <h2 className="text-center">You've not created any auctions yet!</h2> :
        this.renderCreatedAuctions();

    return (
      <div className="cell">
        {auctionsCreated}
        <hr />
      </div>
    )
  }
}