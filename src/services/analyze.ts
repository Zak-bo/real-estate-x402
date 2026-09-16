
import { getPropertyFromAttom } from "./attom";
import { getCompsFromAttom } from "./comps";
import { calculateArv } from "./arv";
import { estimateRepairs, type PropertyCondition } from "./repairs";
import { analyzeDeal } from "./deal";

export async function analyzeProperty(
  address: string,
  condition: PropertyCondition,
  attomApiKey: string,
  purchasePrice?: number,
) 
{
  // ============================================================
  // 1. PROPERTY LOOKUP
  // ============================================================

  const property = await getPropertyFromAttom(
    address,
    attomApiKey,
  );

  // ============================================================
  // 2. COMPARABLE SALES
  // ============================================================

  const compsResult = await getCompsFromAttom(
    address,
    attomApiKey,
  );

  // ============================================================
  // 3. EXTRACT SQUARE FOOTAGE
  // ============================================================

  const squareFeet = property.square_feet;

  if (!squareFeet || squareFeet <= 0) {
    throw new Error(
      "Property square footage was not available from ATTOM.",
    );
  }

  // ============================================================
  // 4. REPAIR ESTIMATE
  // ============================================================

  const repairs = estimateRepairs(
    squareFeet,
    condition,
  );

  // ============================================================
  // 5. ARV
  // ============================================================

  const arv = calculateArv(
    address,
    squareFeet,
    compsResult.comps,
  );
  const deal = analyzeDeal({
    arv: arv.arv,
    estimated_repairs: repairs.estimated_repairs,
    purchase_price: purchasePrice ?? null,
  });

  // ============================================================
  // 6. RETURN COMPLETE ANALYSIS
  // ============================================================

  return {
  subject_property: property,
  comparable_sales: compsResult,
  repair_estimate: repairs,
  arv_estimate: arv,
  deal_analysis: deal,

  analysis: {
    address,
    square_feet: squareFeet,
    condition,
  },

  source: "ATTOM Data + deterministic calculations",
};
}
