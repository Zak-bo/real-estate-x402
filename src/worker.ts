import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { McpAgent } from "agents/mcp";
import { withX402, type X402Config } from "agents/x402";
import { z } from "zod";

import { getPropertyFromAttom } from "./services/attom";
import { getCompsFromAttom } from "./services/comps";
import { calculateArv } from "./services/arv";
import { estimateRepairs, type PropertyCondition } from "./services/repairs";
import { analyzeProperty } from "./services/analyze";

const X402_CONFIG: X402Config = {
  network: "base-sepolia",
  recipient: "0x6bF83015d625c56fFA99f4174fe76390154820E2",
  facilitator: {
    url: "https://x402.org/facilitator",
  },
};

export class RealEstateMCP extends McpAgent<Env> {
  server = withX402(
    new McpServer({
      name: "Real Estate Intelligence",
      version: "1.0.0",
    }),
    X402_CONFIG,
  );

  async init() {
    // ============================================================
    // PROPERTY LOOKUP
    // ============================================================

    this.server.paidTool(
      "property_lookup",
      "Look up detailed property information for a real estate address.",
      0.01,
      {
        address: z.string().describe("Full property address"),
      },
      {
        readOnlyHint: true,
        idempotentHint: true,
      },
      async ({ address }) => {
        try {
          const result = await getPropertyFromAttom(
            address,
            this.env.ATTOM_API_KEY,
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Property lookup failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : String(error),
                }),
              },
            ],
          };
        }
      },
    );

    // ============================================================
    // COMPARABLE SALES
    // ============================================================

    this.server.paidTool(
      "comps_search",
      "Find comparable recently sold properties near a subject property.",
      0.02,
      {
        address: z.string().describe("Full property address"),
      },
      {
        readOnlyHint: true,
        idempotentHint: true,
      },
      async ({ address }) => {
        try {
          const result = await getCompsFromAttom(
            address,
            this.env.ATTOM_API_KEY,
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Comparable search failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : String(error),
                }),
              },
            ],
          };
        }
      },
    );

    // ============================================================
    // ARV ESTIMATE
    // ============================================================

    this.server.paidTool(
      "arv_estimate",
      "Estimate the after-repair value of a property using comparable sales.",
      0.03,
      {
        address: z
          .string()
          .describe("Full subject property address"),

        square_feet: z
          .number()
          .positive()
          .describe("Subject property's square footage"),

        comps: z
          .array(
            z.object({
              address: z.string().nullable(),

              sale_price: z
                .number()
                .nullable(),

              square_feet: z
                .number()
                .nullable(),

              price_per_sqft: z
                .number()
                .nullable(),
            }),
          )
          .describe("Comparable property sales"),
      },
      {
        readOnlyHint: true,
        idempotentHint: true,
      },
      async ({ address, square_feet, comps }) => {
        try {
          const result = calculateArv(
            address,
            square_feet,
            comps,
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "ARV estimation failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : String(error),
                }),
              },
            ],
          };
        }
      },
    );

    // ============================================================
    // REPAIR ESTIMATE
    // ============================================================

    this.server.paidTool(
      "repair_estimate",
      "Estimate renovation and repair costs based on property condition and square footage.",
      0.02,
      {
        square_feet: z
          .number()
          .positive()
          .describe("Property square footage"),

        condition: z
          .enum([
            "poor",
            "fair",
            "average",
            "good",
            "excellent",
          ])
          .describe("Overall condition of the property"),
      },
      {
        readOnlyHint: true,
        idempotentHint: true,
      },
      async ({ square_feet, condition }) => {
        try {
          const result = estimateRepairs(
            square_feet,
            condition as PropertyCondition,
          );

          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Repair estimation failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : String(error),
                }),
              },
            ],
          };
        }
      },
    );


    // ============================================================
    // COMPLETE PROPERTY ANALYSIS
    // ============================================================

    this.server.paidTool(
      "analyze_property",
      "Run a complete real estate analysis including property details, comparable sales, repair estimate, and ARV.",
      0.08,
      {
        address: z.string().describe("Full property address"),

        condition: z
          .enum([
            "poor",
            "fair",
            "average",
            "good",
            "excellent",
          ])
          .describe("Overall property condition"),

          purchase_price: z
  .number()
  .positive()
  .optional()
  .describe(
    "Current asking price or proposed purchase price, if known",
  ),
      },
      {
        readOnlyHint: true,
        idempotentHint: true,
      },
async ({ address, condition, purchase_price }) => {
  try {
    const result = await analyzeProperty(
      address,
      condition as PropertyCondition,
      this.env.ATTOM_API_KEY,
      purchase_price,
    );
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(result, null, 2),
              },
            ],
          };
        } catch (error) {
          return {
            isError: true,
            content: [
              {
                type: "text",
                text: JSON.stringify({
                  error: "Complete property analysis failed",
                  message:
                    error instanceof Error
                      ? error.message
                      : String(error),
                }),
              },
            ],
          };
        }
      },
    );
  }
}

const mcpHandler = RealEstateMCP.serve("/mcp");

export default {
  ...mcpHandler,

  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext,
  ) {
    console.log("========================================");
    console.log("REAL ESTATE AUTOMATION TICK");
    console.log("Scheduled at:", new Date().toISOString());
    console.log("========================================");
  },
};
