import React, { Component } from "react";
import Auctions from "./../../build/contracts/Auctions.json";
import CryptofieldBase from "./../../build/contracts/CryptofieldBase.json";

export default class AuctionsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      instance: null,
      baseInstance: null,
      tokens: []
    }

    this.setAuctions = this.setAuctions.bind(this);
  }

  setAuctions() {
    this.props.web3.eth.getAccounts((err, accounts) => {
      this.props.tokenInstance.setAuctions(this.state.instance.address, {from: accounts[0]});
    })
  }

  componentWillMount() {
    // Initiate contract
    let contract = require("truffle-contract");
    let AuctionsContract = contract(Auctions);
    let CryptofieldBaseContract = contract(CryptofieldBase);

    AuctionsContract.setProvider(this.props.web3.currentProvider);
    CryptofieldBaseContract.setProvider(this.props.web3.currentProvider);

    AuctionsContract.deployed().then(i => this.setState({ instance: i }))
    CryptofieldBaseContract.deployed().then(i => this.setState({ baseInstance: i }))
  }

  async componentDidMount() {
    let accounts = await this.props.web3.eth.getAccounts(); 
    let ownedTokens = await this.props.tokenInstance.getOwnedTokens.call(accounts[0]);
    
    for(let i = 0; i < ownedTokens.length; i++) {
      let hash = await this.state.baseInstance.getHorse.call(ownedTokens[i]);
      let result = await this.isApproved(ownedTokens[i]);

      window.ipfs.catJSON(hash, (err, obj) => {
        obj.isApproved = result.toString();
        obj.id = ownedTokens[i].toNumber();

        this.setState({ tokens: [...this.state.tokens, obj] });
      })
    }
  }

  async isApproved(id) {
    return await this.props.tokenInstance.isTokenApproved.call(this.state.instance.address, id)
  }

  async approveToken(id) {
    let accounts = await this.props.web3.eth.getAccounts();
    await this.props.tokenInstance.approveAuctions(id, {from: accounts[0]});
  }

  render() {
    return(
      <div className="cell">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Characteristic</th>
              <th>Color</th>
              <th>Gender</th>
              <th>Height</th>
              <th>Type</th>
              <th>Origin</th>
              <th>Pedigree</th>
              <th>Running style</th>
              <th>Approved?</th>
            </tr>
          </thead>

          <tbody>
            {
              this.state.tokens.map((token, index) => {
                return (
                  <tr key={index}>
                    <td>{token.name}</td>
                    <td>{token.characteristic}</td>
                    <td>{token.color}</td>
                    <td>{token.gender}</td>
                    <td>{token.height}</td>
                    <td>{token.horse_type}</td>
                    <td>{token.origin}</td>
                    <td>{token.pedigree}</td>
                    <td>{token.running_style}</td>

                    <td 
                      onClick={this.approveToken.bind(this, token.id)}
                      style={{color: "blue", fontWeight: "bold"}}
                    >
                      {token.isApproved}
                    </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>

        <button className="button expanded warning" onClick={this.setAuctions}>Setup Auctions Address</button>
      </div>
    )
  }
}