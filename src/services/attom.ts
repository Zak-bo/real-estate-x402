export interface AttomPropertyResult {
  address: string;
  attom_id: string | null;

  property_type: string | null;
  property_use: string | null;

  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  year_built: number | null;
  units: number | null;

  lot_size_acres: number | null;
  lot_size_sqft: number | null;

  garage_spaces: number | null;
  garage_type: string | null;

  latitude: number | null;
  longitude: number | null;

  owner_occupied: boolean;
  occupancy_status: string | null;

  construction_condition: string | null;
  construction_type: string | null;
  roof_type: string | null;
  wall_type: string | null;

  basement_square_feet: number | null;

  heating: string | null;
  cooling: string | null;

  estimated_value: number | null;

  last_sale_price: number | null;
  last_sale_date: string | null;
  last_sale_type: string | null;
  sale_document_number: string | null;

  assessed_value: number | null;
  assessed_land_value: number | null;
  market_assessed_value: number | null;
  market_land_value: number | null;
  market_improvement_value: number | null;

  tax_amount: number | null;
  tax_year: number | null;
  tax_per_sqft: number | null;

  source: string;
}

export async function getPropertyFromAttom(
  address: string,
  apiKey: string,
): Promise<AttomPropertyResult> {
  const parts = address.split(",");

  const address1 = parts[0]?.trim() ?? address;
  const address2 = parts.slice(1).join(",").trim();

  const propertyUrl =
    `https://api.gateway.attomdata.com/propertyapi/v1.0.0/property/detail` +
    `?address1=${encodeURIComponent(address1)}` +
    `&address2=${encodeURIComponent(address2)}`;

  const propertyResponse = await fetch(propertyUrl, {
    method: "GET",
    headers: {
      apikey: apiKey,
      Accept: "application/json",
    },
  });

  const propertyData: any = await propertyResponse.json();

  if (!propertyResponse.ok) {
    throw new Error(
      `ATTOM property lookup failed: ${propertyResponse.status}`,
    );
  }

  const property = propertyData?.property?.[0];

  if (!property) {
    throw new Error(`Property not found: ${address}`);
  }

  const attomId = property?.identifier?.attomId ?? null;

  let sale: any = null;
  let assessment: any = null;

  if (attomId) {
    const saleUrl =
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/saleshistory/detail` +
      `?attomId=${encodeURIComponent(attomId)}`;

    const assessmentUrl =
      `https://api.gateway.attomdata.com/propertyapi/v1.0.0/assessment/detail` +
      `?attomId=${encodeURIComponent(attomId)}`;

    const [saleResponse, assessmentResponse] = await Promise.all([
      fetch(saleUrl, {
        headers: {
          apikey: apiKey,
          Accept: "application/json",
        },
      }),
      fetch(assessmentUrl, {
        headers: {
          apikey: apiKey,
          Accept: "application/json",
        },
      }),
    ]);

    const saleData: any = await saleResponse.json();
    const assessmentData: any = await assessmentResponse.json();

    sale = saleData?.property?.[0] ?? null;
    assessment = assessmentData?.property?.[0] ?? null;
  }

  const saleHistory = sale?.salehistory?.[0];

  return {
    address,

    attom_id: attomId,

    property_type: property?.summary?.propclass ?? null,
    property_use: property?.summary?.proptype ?? null,

    bedrooms: property?.building?.rooms?.beds ?? null,
    bathrooms: property?.building?.rooms?.bathstotal ?? null,

    square_feet:
      property?.building?.size?.universalsize ??
      property?.building?.size?.livingsize ??
      null,

    year_built: property?.summary?.yearbuilt ?? null,

    units: property?.building?.summary?.unitsCount ?? null,

    lot_size_acres: property?.lot?.lotsize1 ?? null,
    lot_size_sqft: property?.lot?.lotsize2 ?? null,

    garage_spaces: property?.building?.parking?.prkgSpaces ?? null,
    garage_type: property?.building?.parking?.garagetype ?? null,

    latitude: property?.location?.latitude ?? null,
    longitude: property?.location?.longitude ?? null,

    owner_occupied:
      property?.summary?.absenteeInd === "OWNER OCCUPIED",

    occupancy_status: property?.summary?.absenteeInd ?? null,

    construction_condition:
      property?.building?.construction?.condition ?? null,

    construction_type:
      property?.building?.construction?.constructiontype ?? null,

    roof_type:
      property?.building?.construction?.roofcover ?? null,

    wall_type:
      property?.building?.construction?.wallType ?? null,

    basement_square_feet:
      property?.building?.interior?.bsmtsize ?? null,

    heating: property?.utilities?.heatingtype ?? null,
    cooling: property?.utilities?.coolingtype ?? null,

    estimated_value: null,

    last_sale_price:
      saleHistory?.amount?.saleAmt ??
      saleHistory?.amount?.saleamt ??
      null,

    last_sale_date: saleHistory?.saleTransDate ?? null,

    last_sale_type:
      saleHistory?.amount?.saletranstype ??
      null,

    sale_document_number:
      saleHistory?.amount?.saledocnum ??
      null,

    assessed_value:
      assessment?.assessment?.assessed?.assdttlvalue ??
      null,

    assessed_land_value:
      assessment?.assessment?.assessed?.assdlandvalue ??
      null,

    market_assessed_value:
      assessment?.assessment?.market?.mktttlvalue ??
      null,

    market_land_value:
      assessment?.assessment?.market?.mktlandvalue ??
      null,

    market_improvement_value:
      assessment?.assessment?.market?.mktimprvalue ??
      null,

    tax_amount:
      assessment?.assessment?.tax?.taxamt ??
      null,

    tax_year:
      assessment?.assessment?.tax?.taxyear ??
      null,

    tax_per_sqft:
      assessment?.assessment?.tax?.taxpersizeunit ??
      null,

    source: "ATTOM Data",
  };
}