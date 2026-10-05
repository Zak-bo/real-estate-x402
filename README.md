# Real Estate Intelligence MCP

Pay-per-call real-estate analysis for AI agents.

Give an agent a property address → receive:
• Property details
• Comparable sales
• Repair estimate
• ARV

💰 $0.08 USDC / analysis
⚡ x402 machine-to-machine payments
🌐 Remote MCP — no API key required
🔗 Base mainnet

## Live MCP

https://real-estate-x402.zakery585.workers.dev/mcp

## Tools

| Tool | Price |
|---|---:|
| property_lookup | $0.01 |
| comps_search | $0.02 |
| arv_estimate | $0.03 |
| repair_estimate | $0.02 |
| analyze_property | $0.08 |

## analyze_property

Input:

{
  "address": "3614 Russell Ave N, Minneapolis, MN 55412",
  "condition": "average",
  "purchase_price": 175000
}

Returns:

Property details
Comparable sales
Repair estimate
ARV

## Payment

Payments are handled automatically using
x402 + USDC on Base.

The calling agent pays per request.
The service receives payment directly
to the configured receiving wallet.

## Connect

Use the remote MCP endpoint:

https://real-estate-x402.zakery585.workers.dev/mcp

## Marketplace

FiatDock:
https://fiatdock.com/service/svc_dbd3bf0a-5a44-435c-b8d6-060e04c3867e

## For Developers

Built for AI agents, MCP clients and
automated real-estate workflows.

No subscription.
No manual checkout.
Pay only when the agent calls the tool.

## Status

🟢 Live
🟢 Base mainnet
🟢 x402 payments
🟢 Remote MCP
