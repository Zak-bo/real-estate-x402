# Real Estate Intelligence API

Machine-to-machine real estate intelligence delivered through MCP and x402 micropayments.

## Endpoint

https://real-estate-x402.zakery585.workers.dev/mcp

## Network

Base Sepolia

## Payment

USDC via x402.

The API returns an x402 payment requirement when a paid tool is called without payment.

## Tools

| Tool | Price |
|---|---:|
| `property_lookup` | $0.01 |
| `comps_search` | $0.02 |
| `repair_estimate` | $0.02 |
| `arv_estimate` | $0.03 |
| `analyze_property` | $0.08 |

## analyze_property

The flagship analysis endpoint combines property data, comparable sales, repair estimates, ARV, and deal calculations into one response.

### Inputs

- `address` — Full property address
- `condition` — `poor`, `fair`, `average`, `good`, or `excellent`
- `purchase_price` — Optional asking/proposed purchase price

### Output

The response can include:

- Property characteristics
- Property type and occupancy
- Comparable sales
- Sale prices and price per square foot
- Repair estimate
- ARV estimate
- MAO
- Estimated assignment spread
- Investor margin
- Deal analysis

## Example request

An MCP client calls:

```json
{
  "name": "analyze_property",
  "arguments": {
    "address": "3614 Russell Ave N, Minneapolis, MN 55412",
    "condition": "average",
    "purchase_price": 175000
  }

