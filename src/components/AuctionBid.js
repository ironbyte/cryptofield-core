import React, { Component } from "react";
import "web3";

export default class AuctionBid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bidAmount: "",
      currBid: null
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    let accounts = await this.props.web3.eth.getAccounts();
    let bid = await this.props.instance.bidOfBidder.call(accounts[0], this.props.auction)

    await this.setState({ 
      bidAmount: this.props.askingPrice,
      currBid: this.props.web3.utils.fromWei(bid.toString())
     })
  }

  async handleSubmit(e) {
    await e.preventDefault();

    let accounts = await this.props.web3.eth.getAccounts();
    let bid = this.props.web3.utils.toWei(this.state.bidAmount, "ether");
    await this.props.instance.bid(this.props.auction, {from: accounts[0], value: bid});
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return(
      <div>
        <h2 className="text-center">Creating bid for auction nº {this.props.auction}</h2>

        <form onSubmit={this.handleSubmit}>
          <div className="grid-x grid-margin-x">
            <div className="medium-6 medium-offset-3 cell">
              <label>
                Amount:

                <input 
                  onChange={this.handleChange}
                  type="number" 
                  value={this.state.bidAmount} 
                  name="bidAmount" 
                  placeholder="Bid is in ether"
                  step="any" />
              </label>
            </div>
            
            <div className="text-center cell">
              <h2>Your current bid is: {this.state.currBid}</h2>
              
              {
                this.state.bidAmount !== "" &&
                <h3>
                  If you bid {this.state.bidAmount} then your total bid would be {+this.state.currBid + +this.state.bidAmount}
                </h3>
              }
            </div>

            <input type="submit" value="Submit bid" className="button expanded success" />
          </div>
        </form>

      </div>
    )
  }
}