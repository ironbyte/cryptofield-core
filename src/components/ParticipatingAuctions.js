import React, { Component } from "react";
import Auctions from "./../../build/contracts/Auctions";
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

    console.log(accounts)

    for(let i = 0; i < participatingAuctions.length; i++) {
      let currAuction = participatingAuctions[i];
      let auction = await this.state.instance.getAuction.call(currAuction);
      let status = await this.state.instance.getAuctionStatus.call(currAuction);

      auction = auction.concat(status);

      await this.setState(prevState => ({ auctions: [...prevState.auctions, auction] }));
    }
  }

  async initWeb3() {
    let result = await getWeb3;
    await this.setState({ web3: result.web3 })

    await this.initContracts();
  }

  async initContracts() {
    let contract = require("truffle-contract");
    let AuctionsContract = await contract(Auctions);

    await AuctionsContract.setProvider(this.state.web3.currentProvider);

    let instance = await AuctionsContract.deployed();
    await this.setState({ instance: instance })
  }

  auctionStatus(status) {
    return status === true ? "Open" : "Closed"
  }

  // HTML RENDERING FUNCTIONS
  renderUserAuctions() {
    return(
      <div>
        <h2 className="text-center">Here are the auctons where you're participating!</h2>
        <table>
          <thead>
            <tr>
              <td>Owner</td>
              <td>Created at</td>
              <td>Horse</td>
              <td>Status</td>
            </tr>
          </thead>

          <tbody>
            {
              this.state.auctions.map((auction, index) => {
                return(
                  <tr key={index}>  
                    <td>{auction[0]}</td>
                    <td>{moment.unix(auction[1].toNumber()).format("LLL")}</td>
                    <td>{auction[3].toString()}</td>
                    <td>{this.auctionStatus(auction[4])}</td>
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

    return(
      <div className="cell">
        {auctions}

        <hr />
      </div>
    )
  }
}