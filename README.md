# Cryptofield

## Running
Basically just install packages while running a local blockchain (`ganache-cli` or `testrpc`), you also need `ethereum-bridge` installed.

```sh
yarn
ganache-cli # or testrpc on another window
ethereum-bridge
truffle compile && truffle migrate && yarn start
```

## Running tests
Since we're using oraclize to run external queries, we need to run `ethereum-bridge` to be able to meet some `require`s in the contracts.

```sh
# After installing deps.
ganache-cli # or testrpc on another window
ethereum-bridge
truffle test
```