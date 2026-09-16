export interface ArvComp {
  address: string | null;
  sale_price: number | null;
  square_feet: number | null;
  price_per_sqft: number | null;
}

export interface ArvResult {
  subject_address: string;
  arv: number | null;

  comp_count: number;

  average_price_per_sqft: number | null;
  median_price_per_sqft: number | null;

  selected_comps: ArvComp[];

  methodology: string;

  source: string;
}

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);

  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

export function calculateArv(
  subjectAddress: string,
  subjectSquareFeet: number | null,
  comps: ArvComp[],
): ArvResult {
  if (!subjectSquareFeet || subjectSquareFeet <= 0) {
    return {
      subject_address: subjectAddress,
      arv: null,
      comp_count: 0,
      average_price_per_sqft: null,
      median_price_per_sqft: null,
      selected_comps: [],
      methodology:
        "ARV could not be calculated because the subject property square footage was unavailable.",
      source: "ATTOM Data + deterministic calculation",
    };
  }

  const validComps = comps.filter(
    (comp) =>
      comp.square_feet !== null &&
      comp.square_feet > 0 &&
      comp.price_per_sqft !== null &&
      comp.price_per_sqft > 0,
  );

  if (validComps.length === 0) {
    return {
      subject_address: subjectAddress,
      arv: null,
      comp_count: 0,
      average_price_per_sqft: null,
      median_price_per_sqft: null,
      selected_comps: [],
      methodology:
        "ARV could not be calculated because no comparable properties contained usable price-per-square-foot data.",
      source: "ATTOM Data + deterministic calculation",
    };
  }

  const pricePerSqftValues = validComps.map(
    (comp) => comp.price_per_sqft as number,
  );

  const averagePricePerSqft =
    pricePerSqftValues.reduce((sum, value) => sum + value, 0) /
    pricePerSqftValues.length;

  const medianPricePerSqft = median(pricePerSqftValues);

  const arv =
    medianPricePerSqft !== null
      ? Math.round(subjectSquareFeet * medianPricePerSqft)
      : null;

  return {
    subject_address: subjectAddress,

    arv,

    comp_count: validComps.length,

    average_price_per_sqft: Number(
      averagePricePerSqft.toFixed(2),
    ),

    median_price_per_sqft:
      medianPricePerSqft !== null
        ? Number(medianPricePerSqft.toFixed(2))
        : null,

    selected_comps: validComps,

    methodology:
      "ARV is estimated by multiplying the subject property's square footage by the median sale price per square foot of the available comparable properties.",

    source: "ATTOM Data + deterministic calculation",
  };
}