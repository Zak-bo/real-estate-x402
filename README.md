# Real Estate Intelligence API

### Machine-to-machine real-estate intelligence for AI agents using MCP + x402

An MCP server that allows AI agents and software to purchase real-estate intelligence programmatically using **x402 micropayments and USDC**.

Instead of requiring a traditional API subscription, an agent can request a tool, receive a payment requirement, automatically pay for the request, and receive the data.

---

## How It Works

```text
AI Agent
   │
   │ MCP tool request
   ▼
Real Estate Intelligence API
   │
   │ 402 Payment Required
   ▼
AI Agent creates USDC payment
   │
   │ x402 payment
   ▼
Payment verification
   │
   ▼
Real Estate Analysis
   │
   ▼
AI Agent receives result
```

The goal is to make specialized real-estate data available as a **machine-to-machine paid service**.

---

# Quick Start

## 1. Clone the repository

```bash
git clone https://github.com/Zak-bo/real-estate-x402.git
cd real-estate-x402
```

## 2. Install dependencies

```bash
npm install
```

## 3. Configure your wallet

Create a `.env` file:

```env
EVM_PRIVATE_KEY=your_test_wallet_private_key
```

**Never commit your private key to GitHub.**

The wallet is used by the client as the **customer/payer**.

The API itself does not require your private key.

---

# Try the API

The easiest way to test the system is with the included customer example.

```bash
node --env-file=.env --import tsx examples/client.mjs
```

The client will:

1. Connect to the MCP server
2. Request `analyze_property`
3. Receive an x402 payment requirement
4. Create a USDC payment
5. Send the paid request
6. Receive the real-estate analysis

A successful request looks approximately like:

```text
Customer wallet: 0x...

Connecting to:
https://real-estate-x402.zakery585.workers.dev/mcp

MCP connected.

Requesting analysis...

Payment required.

Payment created.

Sending paid request...

Analysis returned.
```

---

# Test Network

The current public deployment uses:

**Network:** Base Sepolia
**Currency:** USDC
**Environment:** Testnet

This means test requests do **not** use real money.

You will need a Base Sepolia wallet containing testnet USDC to make a paid request.

---

# MCP Endpoint

```text
https://real-estate-x402.zakery585.workers.dev/mcp
```

The server exposes paid MCP tools that can be called by compatible MCP clients and AI agents.

---

# Available Tools

| Tool               | Price | Description                   |
| ------------------ | ----: | ----------------------------- |
| `property_lookup`  | $0.01 | Retrieve property information |
| `comps_search`     | $0.02 | Find comparable sales         |
| `arv_estimate`     | $0.03 | Estimate after-repair value   |
| `repair_estimate`  | $0.02 | Estimate renovation costs     |
| `analyze_property` | $0.08 | Complete property analysis    |

Prices are currently denominated in USDC on Base Sepolia for testing.

---

# `analyze_property`

The main tool combines multiple pieces of real-estate intelligence into one request.

### Inputs

```json
{
  "address": "3614 Russell Ave N, Minneapolis, MN 55412",
  "condition": "average",
  "purchase_price": 175000
}
```

### Parameters

| Parameter        | Required | Description                                       |
| ---------------- | -------- | ------------------------------------------------- |
| `address`        | Yes      | Full property address                             |
| `condition`      | Yes      | `poor`, `fair`, `average`, `good`, or `excellent` |
| `purchase_price` | No       | Asking price or proposed purchase price           |

### Example

```javascript
const request = {
  name: "analyze_property",
  arguments: {
    address: "3614 Russell Ave N, Minneapolis, MN 55412",
    condition: "average",
    purchase_price: 175000
  }
};
```

---

# What the Analysis Can Return

A complete analysis can include:

* Property information
* Comparable sales
* Repair estimate
* ARV
* Maximum allowable offer
* Assignment spread
* Deal analysis

The purpose is to give an AI agent enough information to evaluate a potential real-estate deal programmatically.

---

# Why x402?

Traditional APIs usually require:

```text
API key
+
Subscription
+
Account
+
Billing system
```

This project experiments with a different model:

```text
Agent
   ↓
Request data
   ↓
402 payment requirement
   ↓
USDC payment
   ↓
Data returned
```

This makes the API suitable for **machine-to-machine payments** where an AI agent can pay for individual requests.

---

# Example Agent Workflow

An autonomous real-estate agent could eventually operate like this:

```text
Find property
      ↓
Determine whether analysis is needed
      ↓
Call analyze_property
      ↓
Pay $0.08 USDC
      ↓
Receive analysis
      ↓
Evaluate deal
      ↓
Analyze another property
```

The agent only pays when it actually needs the service.

---

# Repository Structure

```text
real-estate-x402/
│
├── src/
│   ├── worker.ts
│   │
│   ├── services/
│   │   ├── attom.ts
│   │   ├── comps.ts
│   │   ├── arv.ts
│   │   ├── repairs.ts
│   │   └── analyze.ts
│   │
│   └── automation/
│       ├── queue.ts
│       └── runner.ts
│
├── examples/
│   └── client.mjs
│
├── run-automation.mjs
├── wrangler.jsonc
├── package.json
└── README.md
```

---

# Running Locally

Start the Cloudflare Worker locally:

```bash
npm run dev
```

The local MCP endpoint will be available through Wrangler.

For type checking:

```bash
npx tsc --noEmit
```

---

# Customer Integration

Developers can use the included client example as a starting point for their own AI agent or application.

The basic flow is:

```javascript
const firstResult = await client.callTool(request);

if (firstResult.isError) {
  // Receive x402 payment requirement

  const paymentPayload =
    await paymentClient.createPaymentPayload(
      firstResult._meta["x402/error"]
    );

  const paymentToken =
    btoa(JSON.stringify(paymentPayload));

  // Retry with payment

  const paidResult = await client.callTool({
    ...request,
    _meta: {
      "x402/payment": paymentToken
    }
  });
}
```

See:

```text
examples/client.mjs
```

for the complete working example.

---

# Security

Never commit private keys or API credentials.

The customer example expects:

```env
EVM_PRIVATE_KEY=...
```

Make sure `.env` is included in `.gitignore`.

The private key belongs to the **customer wallet** making the payment.

The API's payment recipient is configured separately on the server.

---

# Project Status

Current status:

* MCP server deployed
* x402 payments working
* Base Sepolia support
* USDC test payments working
* Customer client example included
* Real-estate analysis tools available
* End-to-end paid request successfully tested

The project is currently focused on testing **machine-to-machine paid APIs for AI agents**.

---

# Roadmap

Possible future development:

* More real-estate data sources
* Additional paid intelligence tools
* Production Base mainnet deployment
* Agent discovery
* Usage analytics
* Additional MCP integrations
* Automated agent workflows

---

# Contributing

If you're building AI agents, MCP integrations, autonomous workflows, or x402 applications, feedback and experiments are welcome.

Ideas, bug reports, integrations, and alternative agent workflows are especially useful.

---

# Links

**GitHub**

https://github.com/Zak-bo/real-estate-x402

**MCP Endpoint**

https://real-estate-x402.zakery585.workers.dev/mcp

**Network**

Base Sepolia

**Payment Protocol**

x402

**Protocol Currency**

USDC
