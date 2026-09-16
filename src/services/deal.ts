export interface DealAnalysisInput {
  arv: number | null;
  estimated_repairs: number;
  purchase_price?: number | null;

  // Maximum percentage of ARV allocated to purchase price
  // after accounting for repairs.
  mao_percentage?: number;

  // Optional assignment/wholesale fee target.
  assignment_fee?: number;
}

export interface DealAnalysisResult {
  arv: number | null;
  estimated_repairs: number;

  mao_percentage: number | null;
  mao: number | null;

  purchase_price: number | null;
  estimated_assignment_fee: number | null;

  investor_margin: number | null;
  equity_after_repairs: number | null;

  deal_grade: "A" | "B" | "C" | "D" | "NO_DEAL";

  decision:
    | "STRONG_DEAL"
    | "PURSUE"
    | "REVIEW"
    | "PASS"
    | "INSUFFICIENT_DATA";

  methodology: string;
  source: string;
}

export function analyzeDeal(
  input: DealAnalysisInput,
): DealAnalysisResult {
  const {
    arv,
    estimated_repairs,
    purchase_price = null,
    mao_percentage = 0.70,
    assignment_fee = null,
  } = input;

  if (arv === null || arv <= 0) {
    return {
      arv: null,
      estimated_repairs,
      mao_percentage: null,
      mao: null,
      purchase_price,
      estimated_assignment_fee: null,
      investor_margin: null,
      equity_after_repairs: null,
      deal_grade: "NO_DEAL",
      decision: "INSUFFICIENT_DATA",
      methodology:
        "Deal analysis could not be calculated because ARV was unavailable.",
      source: "Deterministic deal analysis model",
    };
  }

  if (estimated_repairs < 0) {
    throw new Error(
      "Estimated repairs cannot be negative.",
    );
  }

  if (
    mao_percentage <= 0 ||
    mao_percentage > 1
  ) {
    throw new Error(
      "MAO percentage must be greater than 0 and no greater than 1.",
    );
  }

  const mao = Math.round(
    arv * mao_percentage - estimated_repairs,
  );

  const equityAfterRepairs = Math.round(
    arv - estimated_repairs,
  );

  let estimatedAssignmentFee: number | null = null;

  if (
    purchase_price !== null &&
    purchase_price >= 0
  ) {
    estimatedAssignmentFee =
      Math.round(
        mao - purchase_price,
      );
  }

  let investorMargin: number | null = null;

  if (
    purchase_price !== null &&
    purchase_price >= 0
  ) {
    investorMargin = Math.round(
      arv -
        purchase_price -
        estimated_repairs,
    );
  }

  let dealGrade: DealAnalysisResult["deal_grade"] =
    "NO_DEAL";

  let decision: DealAnalysisResult["decision"] =
    "INSUFFICIENT_DATA";

  if (
    purchase_price !== null &&
    purchase_price >= 0
  ) {
    const margin =
      investorMargin ?? 0;

    const marginPercentage =
      arv > 0
        ? margin / arv
        : 0;

    if (marginPercentage >= 0.30) {
      dealGrade = "A";
      decision = "STRONG_DEAL";
    } else if (marginPercentage >= 0.20) {
      dealGrade = "B";
      decision = "PURSUE";
    } else if (marginPercentage >= 0.10) {
      dealGrade = "C";
      decision = "REVIEW";
    } else if (marginPercentage > 0) {
      dealGrade = "D";
      decision = "PASS";
    } else {
      dealGrade = "NO_DEAL";
      decision = "PASS";
    }
  }

  return {
    arv,

    estimated_repairs,

    mao_percentage,

    mao,

    purchase_price,

    estimated_assignment_fee: estimatedAssignmentFee,

    investor_margin: investorMargin,

    equity_after_repairs: equityAfterRepairs,

    deal_grade: dealGrade,

    decision,

    methodology:
      "MAO is calculated as ARV multiplied by the configured MAO percentage minus estimated repairs. When a purchase price is supplied, investor margin and estimated assignment spread are calculated.",

    source:
      "Deterministic deal analysis model",
  };
}
