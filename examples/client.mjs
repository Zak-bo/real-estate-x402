import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

const MCP_URL =
  "https://real-estate-x402.zakery585.workers.dev/mcp";

const privateKey = process.env.EVM_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("EVM_PRIVATE_KEY is not set.");
}

if (!privateKey.startsWith("0x")) {
  throw new Error("EVM_PRIVATE_KEY must start with 0x.");
}

const account = privateKeyToAccount(
  privateKey
);

console.log("Customer wallet:", account.address);
console.log("Connecting to:", MCP_URL);

const paymentClient = new x402Client();

registerExactEvmScheme(paymentClient, {
  signer: account,
  networks: ["eip155:84532"],
});

const client = new Client({
  name: "real-estate-api-customer",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL(MCP_URL)
);

const request = {
  name: "analyze_property",
  arguments: {
    address: "3614 Russell Ave N, Minneapolis, MN 55412",
    condition: "average",
    purchase_price: 175000,
  },
};

try {
  await client.connect(transport);

  console.log("MCP connected.");
  console.log("Requesting analysis...");

  const firstResult = await client.callTool(request);

  if (!firstResult.isError) {
    console.log(JSON.stringify(firstResult, null, 2));
    process.exit(0);
  }

  const rawPaymentRequired =
    firstResult._meta?.["x402/error"];

  if (!rawPaymentRequired) {
    throw new Error(
      "API returned an error without an x402 payment requirement."
    );
  }

  console.log("Payment required.");

  const paymentPayload =
    await paymentClient.createPaymentPayload(
      rawPaymentRequired
    );

  const paymentToken = btoa(
    JSON.stringify(paymentPayload)
  );

  console.log("Payment created.");
  console.log("Sending paid request...");

  const paidResult = await client.callTool({
    ...request,
    _meta: {
      "x402/payment": paymentToken,
    },
  });

  console.log(
    JSON.stringify(paidResult, null, 2)
  );
} finally {
  await transport.close();
}
