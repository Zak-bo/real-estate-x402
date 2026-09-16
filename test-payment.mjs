import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";

const privateKey = process.env.EVM_PRIVATE_KEY;

if (!privateKey) {
  throw new Error("EVM_PRIVATE_KEY is not set.");
}

const account = privateKeyToAccount(privateKey);

console.log("Payer wallet:", account.address);

const paymentClient = new x402Client();

registerExactEvmScheme(paymentClient, {
  signer: account,
  networks: ["eip155:84532"],
});

const client = new Client({
  name: "real-estate-agent",
  version: "1.0.0",
});

const transport = new StreamableHTTPClientTransport(
  new URL("http://localhost:8787/mcp"),
);

await client.connect(transport);

console.log("MCP connected.");

const tools = await client.listTools();

console.log(
  "Available tools:",
  tools.tools.map((tool) => tool.name),
);

// ------------------------------------------------------------
// ARV TEST INPUT
// ------------------------------------------------------------

const arvArguments = {
  address: "3614 Russell Ave N, Minneapolis, MN 55412",

  square_feet: 1566,

  comps: [
    {
      address: "3431 PENN AVE N",
      sale_price: 289000,
      square_feet: 1514,
      price_per_sqft: 190.88507265522,
    },
    {
      address: "2924 EMERSON AVE N",
      sale_price: 180000,
      square_feet: 1840,
      price_per_sqft: 97.82608695652,
    },
    {
      address: "2507 LOGAN AVE N",
      sale_price: 240000,
      square_feet: 2028,
      price_per_sqft: 118.34319526627,
    },
    {
      address: "1414 LOGAN AVE N",
      sale_price: 275000,
      square_feet: 1800,
      price_per_sqft: 152.77777777778,
    },
    {
      address: "2531 CALIFORNIA ST NE",
      sale_price: 384000,
      square_feet: 1600,
      price_per_sqft: 240,
    },
    {
      address: "712 6TH ST NE",
      sale_price: 377000,
      square_feet: 1978,
      price_per_sqft: 190.59656218402,
    },
    {
      address: "1331 MADISON ST NE",
      sale_price: 250000,
      square_feet: 1739,
      price_per_sqft: 143.76078205865,
    },
    {
      address: "2926 POLK ST NE",
      sale_price: 395000,
      square_feet: 1714,
      price_per_sqft: 230.45507584597,
    },
    {
      address: "2537 PILLSBURY AVE S",
      sale_price: 444988,
      square_feet: 1810,
      price_per_sqft: 245.84972375691,
    },
  ],
};

// ------------------------------------------------------------
// FIRST CALL — SHOULD RETURN PAYMENT REQUIRED
// ------------------------------------------------------------

const firstResult = await client.callTool({
  name: "analyze_property",
  arguments: {
    address: "3614 Russell Ave N, Minneapolis, MN 55412",
    condition: "average",
    purchase_price: 175000,
  },
});

if (!firstResult.isError) {
  console.log(
    "Unexpectedly received a result without payment:",
  );

  console.log(
    JSON.stringify(firstResult, null, 2),
  );

  await transport.close();
  process.exit(0);
}

const paymentRequired =
  firstResult._meta?.["x402/error"];

if (!paymentRequired) {
  console.error(
    "No x402 payment requirement was returned.",
  );

  console.error(
    JSON.stringify(firstResult, null, 2),
  );

  await transport.close();
  process.exit(1);
}

console.log("Payment required:");

console.log(
  "Amount:",
  paymentRequired.accepts[0].amount,
);

console.log(
  "Network:",
  paymentRequired.accepts[0].network,
);

console.log(
  "Recipient:",
  paymentRequired.accepts[0].payTo,
);

// ------------------------------------------------------------
// CREATE PAYMENT
// ------------------------------------------------------------

const paymentPayload =
  await paymentClient.createPaymentPayload(
    paymentRequired,
  );

const paymentToken =
  btoa(JSON.stringify(paymentPayload));

console.log("Payment payload created.");

console.log(
  "Payment amount:",
  paymentPayload.accepted?.amount ??
    paymentRequired.accepts[0].amount,
);

// ------------------------------------------------------------
// SECOND CALL — PAID ARV REQUEST
// ------------------------------------------------------------

const paidResult = await client.callTool({
  name: "analyze_property",

  arguments: {
    address: "3614 Russell Ave N, Minneapolis, MN 55412",
    condition: "average",
    purchase_price: 175000,
  },

  _meta: {
    "x402/payment": paymentToken,
  },
});


console.log("");
console.log("========================================");
console.log("FINAL PROPERTY ANALYSIS");
console.log("========================================");

console.log(
  JSON.stringify(paidResult, null, 2),
);

await transport.close();