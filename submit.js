require('dotenv').config()
const Web3 = require('web3')
const { numberToHex, toHex, toWei } = require('web3-utils')

const {
  PRIVATE_KEY,
  GAS_PRICE,
  RPC_URL,
  BUMP_NONCE_TO
} = process.env

const web3 = new Web3(RPC_URL, null, { transactionConfirmationBlocks: 1 })
const account = web3.eth.accounts.privateKeyToAccount('0x' + PRIVATE_KEY)
web3.eth.accounts.wallet.add('0x' + PRIVATE_KEY)
web3.eth.defaultAccount = account.address

async function main() {
  let nonce = await web3.eth.getTransactionCount(account.address)
  console.log('nonce', nonce)
  for(let i = nonce; i < BUMP_NONCE_TO; i++) {
    try {
      const tx = {
        from: web3.eth.defaultAccount,
        value: '0x00',
        gas: numberToHex(500000),
        gasPrice: toHex(toWei(GAS_PRICE, 'gwei')),
        to: web3.eth.defaultAccount,
        netId: 1,
        // data,
        nonce
      }
      let signedTx = await web3.eth.accounts.signTransaction(tx, PRIVATE_KEY)
      let result
      if (i % 50 === 0) {
        result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        console.log(`A new successfully sent tx ${result.transactionHash}`)
      } else {
        result = web3.eth.sendSignedTransaction(signedTx.rawTransaction)
        result.once('transactionHash', function(txHash){
          console.log(`A new successfully sent tx ${txHash}`)
        }).on('error', async function(e){
          console.log('error', e.message)
        })
      }
      nonce++
    } catch(e) {
      console.error('skipping tx ', txs[i], e)
      continue
    }
  }
}

main()
