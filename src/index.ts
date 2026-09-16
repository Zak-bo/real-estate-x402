import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

const server = new McpServer({
  name: "Real Estate Intelligence",
  version: "1.0.0",
});

server.tool(
  "property_lookup",
  "Look up basic information about a real estate property.",
  {
    address: z.string().describe("Full property address"),
  },
  async ({ address }) => {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            address,
            property_type: "Single Family",
            bedrooms: 3,
            bathrooms: 2,
            square_feet: 1450,
            year_built: 1955,
            estimated_value: 185000,
            source: "Demo property database",
          }),
        },
      ],
    };
  }
);

export default server;