import React, { Component } from "react";
import moment from "moment";

import getWeb3 from "./../utils/getWeb3";

import SaleAuction from "./../../build/contracts/SaleAuction.json";

export default class AuctionsCreated extends Component {
    constructor(props) {
        super(props);

        this.state = {
            auctions: [],
            instance: null,
        }
    }

    async componentDidMount() {
        let result = await getWeb3;
        this.web3 = await result.web3;

        await this.initContracts();
        await this.getAuctionsCreated();
    }

    async initContracts() {
        let contract = require("truffle-contract");
        let SaleAuctionContract = await contract(SaleAuction);

        await SaleAuctionContract.setProvider(this.web3.currentProvider);

        let instance = await SaleAuctionContract.deployed();

        await this.setState({ instance: instance });
    }

    async getAuctionsCreated() {
        let acc = await this.web3.eth.getAccounts();
        let auctions = await this.state.instance.getAuctionsCreated.call(acc[0]);

        const auctionsObj = auctions.map(async auction => {
            let auctionInfo = await this.state.instance.getAuction.call(auction);
            let status = await this.state.instance.getAuctionStatus.call(auction);
            let timestamp = moment.unix(auctionInfo[1].toNumber()).format("LLL");
            let maxBid = await this.state.instance.getMaxBidder.call(auction);

            return {
                createdAt: timestamp,
                horseId: auctionInfo[3],
                status: status,
                id: auction,
                maxBid: maxBid[1]
            }
        })

        let result = await Promise.all(auctionsObj);

        await this.setState({ auctions: result });
    }

    getStatus(status) {
        if (status === true) { return ("Open") }

        return "Closed"
    }

    canClaim(status, id) {
        if (status === true) {
            return (<td><strong>Auction is still open</strong></td>)
        }

        return (<td onClick={this.claimAuction.bind(this, id)}><strong>Claim Ether</strong></td>)
    }

    formatAmount(amount) {
        let converted = new this.web3.utils.toBN(amount);
        return this.web3.utils.fromWei(converted.toString(), "ether")
    }

    async claimAuction(id) {
        let accounts = await this.web3.eth.getAccounts();
        await this.state.instance.withdraw(id, { from: accounts[0], gas: 1000000 });
    }

    renderCreatedAuctions() {
        return (
            <div>
                <h2 className="text-center">Auctions you've created</h2>

                <table>
                    <thead>
                        <tr>
                            <th>Created at</th>
                            <th>Horse ID</th>
                            <td>Status</td>
                            <td>Amount to claim</td>
                            <td></td>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            this.state.auctions.map((auction, index) => {
                                return (
                                    <tr key={index}>
                                        <td>{auction.createdAt}</td>
                                        <td>{auction.horseId.toString()}</td>
                                        <td>{this.getStatus(auction.status)}</td>
                                        <td>{this.formatAmount(auction.maxBid)} Ether</td>
                                        {this.canClaim(auction.status, auction.id)}
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
        let auctionsCreated =
            this.state.auctions.length === 0 ?
                <h2 className="text-center">You've not created any auctions yet!</h2> :
                this.renderCreatedAuctions();

        return (
            <div className="cell">
                {auctionsCreated}
                <hr />
            </div>
        )
    }
}