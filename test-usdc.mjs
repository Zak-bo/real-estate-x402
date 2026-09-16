import { privateKeyToAccount } from "viem/accounts";
import {
  createWalletClient,
  createPublicClient,
  http,
  parseUnits,
} from "viem";
import { baseSepolia } from "viem/chains";

const pk = process.env.EVM_PRIVATE_KEY;

if (!pk) {
  throw new Error("EVM_PRIVATE_KEY missing");
}

const account = privateKeyToAccount(pk);

console.log("Wallet:", account.address);

const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const walletClient = createWalletClient({
  account,
  chain: baseSepolia,
  transport: http("https://sepolia.base.org"),
});

const usdc = "0x036CbD53842c5426634e7929541eC2318f3dCF7e";

const recipient =
  "0x6bF83015d625c56fFA99f4174fe76390154820E2";

const abi = [
  {
    name: "transfer",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      {
        name: "to",
        type: "address",
      },
      {
        name: "value",
        type: "uint256",
      },
    ],
    outputs: [
      {
        type: "bool",
      },
    ],
  },
];

console.log("Sending 0.01 USDC...");
console.log("Recipient:", recipient);

const hash = await walletClient.writeContract({
  address: usdc,
  abi,
  functionName: "transfer",
  args: [
    recipient,
    parseUnits("0.01", 6),
  ],
});

console.log("TX:", hash);

console.log("Waiting for confirmation...");

const receipt =
  await publicClient.waitForTransactionReceipt({
    hash,
  });

console.log("STATUS:", receipt.status);
console.log("BLOCK:", receipt.blockNumber.toString());