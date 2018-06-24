import React, { Component } from "react";

export default class Transfer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      address: "",
      account: "",
      horseID: ""
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    this.props.web3.eth.getAccounts((err, accounts) => {
      this.setState({ account: accounts[0] })
    })
  }

  handleSubmit(event) {
    event.preventDefault()

    this.props.web3.eth.getAccounts((err, accounts) => {
      console.log(accounts)
      this.props.instance.sendHorse(accounts[0], this.state.address, this.state.horseID, {from: accounts[0], gas: 1000000})
      .then(res => { console.log(res) })
      .catch(err => { console.log(err) })
    })
  }

  handleChange(event) {
    this.setState({ [event.target.name]: event.target.value })
  }

  render() {
    return(
      <div className="small-12 cell">
        <form onSubmit={this.handleSubmit}>
          <div className="small-6 cell">
            <label>
              Address to transfer:
              <input
                type="text"
                name="address"
                onChange={this.handleChange}
                value={this.state.address}
                placeholder={this.state.account}
              />
            </label>
          </div>

          <div className="small-6 cell">
            <label>
              Horse ID:
              <input
                type="text"
                name="horseID"
                onChange={this.handleChange}
                value={this.state.horseID}
              />
            </label>
          </div>

          <input type="submit" className="button success expanded" value="Transfer horse" />
        </form>
      </div>
    )
  }
}
