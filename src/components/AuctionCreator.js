import React, { Component } from "react";
import moment from "moment";

export default class AuctionCreator extends Component {
  constructor(props) {
    super(props);

    this.state = {
      duration: 1
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDurationChange = this.handleDurationChange.bind(this);
  }

  async handleSubmit(e) {
    await e.preventDefault();

    let duration = moment().add(1, "day").diff(moment(), "seconds") + 1;
    let accounts = await this.props.web3.eth.getAccounts();
    let price = await this.props.instance.getQueryPrice.call();

    console.log(duration);
  
    await this.props.instance.createAuction(duration, this.props.horse, {from: accounts[0], value: price});
  }

  handleDurationChange(e) {
    this.setState({ duration: e.target.value });
  }

  render() {
    return(
      <div>
        <h2 className="text-center cell">Creating Auction for horse number {this.props.horse} </h2>

        <form onSubmit={this.handleSubmit}>
          <label>
            Duration:

            <select value={this.state.duration} onChange={this.handleDurationChange}>
              <option value={1}>1 day</option>
              <option value={2}>2 days</option>
            </select>
          </label>

          <input type="submit" className="button expanded alert" value="Create" />
        </form>
      </div>
    )
  }
}