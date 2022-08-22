// Test example donating and minting globalchange

async function donate(
        secretKey,
        recipient1PublicKey,
        recipient2PublicKey,
        recipient3PublicKey,
        recipient4PublicKey,
        recipient5PublicKey,
        totalAmount,
        cpiValue,
        xlmusdValue
) {

    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();

    // Using the test network
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');
    const account = await server.loadAccount(sourcePublicKey);

    const fee = await server.fetchBaseFee();
    const sendAmount = parseFloat(totalAmount/5).toFixed(6);

    // GlobalChange currency calculation for XLM donated
    const gcAmount = parseFloat(((totalAmount * xlmusdValue) / parseFloat(cpiValue).toFixed(6)) * 300).toFixed(2)

    const transaction = new StellarSdk.TransactionBuilder(
        account,
        {
          fee,
          networkPassphrase: StellarSdk.Networks.TESTNET
        }
    )
    .addOperation(StellarSdk.Operation.payment({
        destination: recipient1PublicKey,
        asset: StellarSdk.Asset.native(),
        amount: sendAmount,
    }))
    .addOperation(StellarSdk.Operation.payment({
        destination: recipient2PublicKey,
        asset: StellarSdk.Asset.native(),
        amount: sendAmount,
    }))
    .addOperation(StellarSdk.Operation.payment({
        destination: recipient3PublicKey,
        asset: StellarSdk.Asset.native(),
        amount: sendAmount,
    }))
    .addOperation(StellarSdk.Operation.payment({
        destination: recipient4PublicKey,
        asset: StellarSdk.Asset.native(),
        amount: sendAmount,
    }))
    .addOperation(StellarSdk.Operation.payment({
        destination: recipient5PublicKey,
        asset: StellarSdk.Asset.native(),
        amount: sendAmount,
    }))
      .setTimeout(30)
      .addMemo(StellarSdk.Memo.text(gcAmount + 'GC'))
      .build();
    transaction.sign(sourceKeypair);

    try {
      const transactionResult = await server.submitTransaction(transaction);
      console.log(JSON.stringify(transactionResult, null, 2));

      return {
        transactionId: transactionResult.id,
        transactionSequence: transactionResult.source_account_sequence,
        transactionLink: transactionResult._links.transaction.href,
        gcAmount: gcAmount
      }

    } catch (e) {
      console.log(e);
    }
}

async function mint(secretKey, transactionSequence, gcAmount, faceValue) {
    const numBills = parseInt(gcAmount / faceValue);

    const sourceKeypair = StellarSdk.Keypair.fromSecret(secretKey);
    const sourcePublicKey = sourceKeypair.publicKey();
    const server = new StellarSdk.Server('https://horizon-testnet.stellar.org');

    // example only, would need to make this more complex to handle varying denominations of bills
    var bills = [];
    for (let i = 0; i < numBills; i++) {

      const account = await server.loadAccount(sourcePublicKey);

      const fee = await server.fetchBaseFee();

      const transaction = new StellarSdk.TransactionBuilder(
          account,
          {
            fee,
            networkPassphrase: StellarSdk.Networks.TESTNET
          }
      )
        // Add a payment operation to the transaction
      .addOperation(StellarSdk.Operation.payment({
          destination: sourcePublicKey,
          asset: StellarSdk.Asset.native(),
          amount: "0.000001",
      }))
        .setTimeout(30)
        .addMemo(
          StellarSdk.Memo.text(transactionSequence + ":" + String(faceValue)),
          StellarSdk.Memo.id(String(gcAmount))
        )
        .build();
      transaction.sign(sourceKeypair);

      try {
        const transactionResult = await server.submitTransaction(transaction);

        bills.push({
          transactionId: transactionResult.id,
          transactionLink: transactionResult._links.transaction.href,
          serialNumber: transactionResult.id,
          faceValue: faceValue
        });

        } catch (e) {
          console.log(e);
        }
    }

    return bills;
}

async function sendToken() {

}

async function validateToken() {

}
