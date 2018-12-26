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

## Initially
* Set Breeding address on Core contract.
* Set GOPCreator address on Core contract.
* Set HorseData address on Core contract.
* Set SaleAuction address on Core contract.

The previous process is done automatically on the migrations, on production perhaps this can be done manually since we have to wait for every transaction to be mined. On development we generate 50 (Last is ID 49) horses locally, also for development purposes.