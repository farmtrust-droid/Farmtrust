import { Client, PrivateKey, AccountId, TransferTransaction } from '@hashgraph/sdk';

export const transferHBAR = async (fromAccountId, toAccountId, amount) => {
  const client = Client.forTestnet();
  client.setOperator(AccountId.fromString(process.env.HEDERA_OPERATOR_ID), PrivateKey.fromStringECDSA(process.env.HEDERA_OPERATOR_KEY));

  const transaction = new TransferTransaction()
    .addHbarTransfer(AccountId.fromString(fromAccountId), -amount)
    .addHbarTransfer(AccountId.fromString(toAccountId), amount);

  const txResponse = await transaction.execute(client);
  const receipt = await txResponse.getReceipt(client);
  return receipt.transactionId.toString();
};