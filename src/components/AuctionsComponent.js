import React, { Component } from "react";
import AuctionCreator from "./AuctionCreator";

export default class AuctionsComponent extends Component {
  constructor(props) {
    super(props);

    this.state = {
      tokens: [],
      horseInAuction: null,
      creatingAuction: false,
    }
  }

  async componentDidMount() {
    let accounts = await this.props.web3.eth.getAccounts();
    let ownedTokens = await this.props.coreInstance.getOwnedTokens.call(accounts[0]);

    for (let i = 0; i < ownedTokens.length; i++) {
      let horseData = await this.props.coreInstance.getHorseData.call(ownedTokens[i]);
      let type = await this.props.web3.utils.hexToUtf8(horseData[8]); // [8] is the Horse Type

      // [0] is the HorseHash
      window.ipfs.catJSON(horseData[0], (err, obj) => {
        // obj.isApproved = result.toString();
        obj.id = ownedTokens[i].toNumber();
        obj.horse_type = type;

        this.setState(prevState => ({ tokens: [...prevState.tokens, obj] }));
      })
    }
  }

  // async isApproved(id) {
  //   return await this.props.coreInstance.isTokenApproved.call(this.state.instance.address, id)
  // }

  async approveToken(id) {
    let accounts = await this.props.web3.eth.getAccounts();
    await this.props.coreInstance.approveAuctions(id, { from: accounts[0] });
  }

  async createAuction(id) {
    this.setState(prevState => ({ creatingAuction: !prevState.creatingAuction, horseInAuction: id }))
  }

  render() {
    return (
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
              <th>Create Auction</th>
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
                    <td onClick={this.createAuction.bind(this, token.id)}> <strong>Create</strong>  </td>
                  </tr>
                )
              })
            }
          </tbody>
        </table>

        {
          this.state.creatingAuction &&
          <AuctionCreator
            web3={this.props.web3}
            coreInstance={this.props.coreInstance}
            horse={this.state.horseInAuction}
          />
        }
      </div>
    )
  }
}