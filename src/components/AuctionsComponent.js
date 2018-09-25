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
      let horseGender = await this.props.web3.utils.hexToUtf8(horseData[1]);

      // [0] is the HorseHash
      window.ipfs.catJSON(horseData[0], (err, obj) => {
        obj.id = ownedTokens[i].toNumber();
        obj.horse_type = type;
        obj.gender = horseGender;
        obj.name = horseData[4];

        this.setState(prevState => ({ tokens: [...prevState.tokens, obj] }));
      })
    }
  }

  async createAuction(id) {
    await this.setState(prevState => ({ creatingAuction: !prevState.creatingAuction, horseInAuction: id }))
  }

  evaluateHorseType(type, id) {
    if (id === 0) {
      return (<td>Genesis Horse</td>)
    } else if (type === "F") {
      return (<td>Not male</td>)
    } else {
      return (<td onClick={this.putInStud.bind(this, id)}><strong>Put in stud!</strong></td>)
    }
  }

  async putInStud(id) {
    let acc = await this.props.web3.eth.getAccounts();
    let query = await this.props.coreInstance.getQueryPrice.call();
    let amount = await this.props.web3.utils.toWei("0.14", "ether");
    let duration = 259200

    await this.props.coreInstance.putInStud(id, amount, duration, { from: acc[0], value: query });
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
              <th></th>
              <th>Availability</th>
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
                    <td onClick={this.createAuction.bind(this, token.id)}><strong>Create Auction</strong></td>
                    {this.evaluateHorseType(token.gender, token.id)}
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