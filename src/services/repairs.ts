export type PropertyCondition =
  | "poor"
  | "fair"
  | "average"
  | "good"
  | "excellent";

export interface RepairResult {
  condition: PropertyCondition;

  square_feet: number;

  estimated_repairs: number;
  low_estimate: number;
  high_estimate: number;

  cost_per_sqft: number;

  methodology: string;

  source: string;
}

const COST_PER_SQFT: Record<PropertyCondition, number> = {
  poor: 45,
  fair: 30,
  average: 20,
  good: 10,
  excellent: 5,
};

export function estimateRepairs(
  squareFeet: number,
  condition: PropertyCondition,
): RepairResult {
  if (!squareFeet || squareFeet <= 0) {
    throw new Error(
      "Square footage must be greater than zero.",
    );
  }

  const costPerSqft = COST_PER_SQFT[condition];

  const estimatedRepairs = Math.round(
    squareFeet * costPerSqft,
  );

  const lowEstimate = Math.round(
    estimatedRepairs * 0.75,
  );

  const highEstimate = Math.round(
    estimatedRepairs * 1.3,
  );

  return {
    condition,

    square_feet: squareFeet,

    estimated_repairs: estimatedRepairs,

    low_estimate: lowEstimate,

    high_estimate: highEstimate,

    cost_per_sqft: costPerSqft,

    methodology:
      "Repair costs are estimated using a condition-based cost-per-square-foot model. The estimate is intended for preliminary investment analysis and should be replaced or refined with property-specific inspection data.",

    source: "Deterministic repair cost model",
  };
}