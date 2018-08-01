import React, { Component } from "react";
import Countdown from "react-countdown-moment";
import Auctions from "./../../build/contracts/Auctions.json";
import getWeb3 from "./../utils/getWeb3";
import moment from "moment";

/*
@dev Component to show the open auctions at the moment.
*/

export default class OpenAuctions extends Component {
  constructor(props) {
    super(props);

    this.state = {
      auctions: [],
      instance: null,
      web3: null
    }

    this.calculateTimeLeft = this.calculateTimeLeft.bind(this);
  }

  async componentDidMount() {
    await this.initWeb3();

    let auctionsOpen = await this.state.instance.getOpenAuctions.call();
    
    for(let i = 0; i < auctionsOpen.length; i++) {
      let currAuction = auctionsOpen[i];
      let auction = await this.state.instance.getAuction.call(currAuction);
      let amountOfBidders = await this.state.instance.amountOfBidders.call(currAuction);

      auction = auction.concat(amountOfBidders);

      await this.setState(prevState => ({ auctions: [...prevState.auctions, auction] })); 
    }
  }

  async initWeb3() {
    let result  = await getWeb3;
    await this.setState({ web3: result.web3 });

    await this.initializeContracts();
  }

  async initializeContracts() {
    let contract = require("truffle-contract");
    let AuctionsContract = await contract(Auctions);
    
    await AuctionsContract.setProvider(this.state.web3.currentProvider);
    let instance = await AuctionsContract.deployed();

    await this.setState({ instance: instance });
  }

  // HTML rendering functions
  calculateTimeLeft(start, duration) {
    return  <Countdown endDate={moment.unix(start).add(duration, "seconds")} />
  }

  auctionsTable() {
    return(
      <div>
        <h2>Open Auctions!</h2>

        <table>
          <thead>
            <tr>
              <th>Auctioner</th>
              <th>Created</th>
              <th>Time left</th>
              <th>Horse ID</th>
              <th>Amount of Bidders</th>
            </tr>
          </thead>

          <tbody>
            {
              this.state.auctions.map((auction, index) => {
                return(
                  <tr key={index}>
                    <td>{auction[0].toString()}</td>
                    <td>{moment.unix(auction[1].toNumber()).format("LLL")}</td>
                    <td>{this.calculateTimeLeft(auction[1].toNumber(), auction[2].toNumber())}</td>
                    <td>{auction[3].toString()}</td>
                    <td>{auction[4].toString()}</td>
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
    let auctionMessage = 
      this.state.auctions.length === 0 ? 
      <h2>There are no auctions open yet.</h2> : 
      this.auctionsTable();

    return(
      <div className="cell">
        {auctionMessage}
        <hr />
      </div>
    )
  }
}