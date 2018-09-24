import React, { Component } from "react";
import SaleAuction from "./../../build/contracts/SaleAuction.json";

export default class Ownership extends Component {
  constructor(props) {
    super(props);

    this.state = {
      instance: null,
      newOwner: "",
      currAddr: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  async componentDidMount() {
    let contract = require("truffle-contract");
    let SaleAuctionContract = await contract(SaleAuction);
    let accounts = await this.props.web3.eth.getAccounts();

    await SaleAuctionContract.setProvider(this.props.web3.currentProvider);

    let instance = await SaleAuctionContract.deployed();

    await this.setState({ instance: instance, currAddr: accounts[0] });
  }

  async handleSubmit(e) {
    await e.preventDefault();

    let accounts = await this.props.web3.eth.getAccounts();
    await this.state.instance.giveOwnership(this.state.newOwner, { from: accounts[0] });
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <div className="grid-x grid-margin-x">
            <div className="medium-6 medium-offset-3 cell">
              <label>
                New owner Address:

                <input
                  type="text"
                  onChange={this.handleChange}
                  value={this.state.newOwner}
                  placeholder={this.state.currAddr}
                  name="newOwner"
                />
              </label>
            </div>

            <input type="submit" value="Submit new owner" className="button expanded success" />
          </div>
        </form>
      </div>
    )
  }
}