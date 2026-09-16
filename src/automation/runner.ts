import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { privateKeyToAccount } from "viem/accounts";
import { x402Client } from "@x402/core/client";
import { registerExactEvmScheme } from "@x402/evm/exact/client";
import type { PaymentRequired } from "@x402/core/types";

import { PROPERTY_QUEUE, type PropertyQueueItem } from "./queue";

const MCP_URL = "https://real-estate-x402.zakery585.workers.dev/mcp";

export async function analyzeQueuedProperty(
  property: PropertyQueueItem,
) {
  const privateKey = process.env.EVM_PRIVATE_KEY;

  if (!privateKey) {
    throw new Error("EVM_PRIVATE_KEY is not set.");
  }

  if (!privateKey.startsWith("0x")) {
    throw new Error("EVM_PRIVATE_KEY must start with 0x.");
  }

  const account = privateKeyToAccount(
    privateKey as `0x${string}`,
  );

  console.log("");
  console.log("========================================");
  console.log("ANALYZING PROPERTY");
  console.log("========================================");
  console.log("Address:", property.address);
  console.log(
    "Purchase price:",
    property.purchase_price ?? "Not provided",
  );
  console.log("Condition:", property.condition);
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
    new URL(MCP_URL),
  );

  try {
    await client.connect(transport);

    console.log("MCP connected.");

    const firstResult = await client.callTool({
      name: "analyze_property",
      arguments: {
        address: property.address,
        condition: property.condition,
        purchase_price: property.purchase_price,
      },
    });

    if (!firstResult.isError) {
      return {
        success: true,
        property,
        result: firstResult,
        payment_required: false,
      };
    }

    const rawPaymentRequired =
      firstResult._meta?.["x402/error"];

    if (!rawPaymentRequired) {
      throw new Error(
        "MCP returned an error without an x402 payment requirement.",
      );
    }

    const paymentRequired =
      rawPaymentRequired as unknown as PaymentRequired;

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

    const paymentPayload =
      await paymentClient.createPaymentPayload(
        paymentRequired,
      );

    const paymentToken =
      btoa(JSON.stringify(paymentPayload));

    console.log("Payment payload created.");

    const paidResult = await client.callTool({
      name: "analyze_property",
      arguments: {
        address: property.address,
        condition: property.condition,
        purchase_price: property.purchase_price,
      },
      _meta: {
        "x402/payment": paymentToken,
      },
    });

    return {
      success: !paidResult.isError,
      property,
      result: paidResult,
      payment_required: true,
      payment_amount:
        paymentPayload.accepted?.amount ??
        paymentRequired.accepts[0].amount,
    };
  } finally {
    await transport.close();
  }
}

export async function processQueue() {
  const results = [];

  for (const property of PROPERTY_QUEUE) {
    console.log("");
    console.log("Processing next property...");

    const result = await analyzeQueuedProperty(property);

    results.push(result);

    console.log("");
    console.log("Property complete:", property.address);
  }

  return results;
}
