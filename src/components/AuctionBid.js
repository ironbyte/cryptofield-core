import React, { Component } from "react";

export default class AuctionBid extends Component {
  constructor(props) {
    super(props);

    this.state = {
      bidAmount: "",
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    await this.setState({ bidAmount: this.props.askingPrice })
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
        <h2 className="text-center">Creating auction for auction nº {this.props.auction}</h2>

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
                  min={this.props.askingPrice}
                  step="any" />
              </label>
            </div>

            <input type="submit" value="Submit bid" className="button expanded success" />
          </div>
        </form>
      </div>
    )
  }
}