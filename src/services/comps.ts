export interface PropertyComp {
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;

  sale_price: number | null;
  sale_date: string | null;

  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  year_built: number | null;

  property_type: string | null;
  distance: number | null;

  price_per_sqft: number | null;
}

export interface CompsResult {
  subject_address: string;
  comps: PropertyComp[];
  source: string;
}

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

export async function getCompsFromAttom(
  address: string,
  apiKey: string,
): Promise<CompsResult> {
  const parts = address.split(",").map((part) => part.trim());

  const street = parts[0] ?? "";
  const city = parts[1] ?? "";
  const stateZip = parts[2] ?? "";

  const stateZipParts = stateZip.split(/\s+/);

  const state = stateZipParts[0] ?? "";
  const zip = stateZipParts[1] ?? "";

  const url =
    `https://api.gateway.attomdata.com/property/v2/SalesComparables/Address/` +
    `${encodeURIComponent(street)}/` +
    `${encodeURIComponent(city)}/-/` +
    `${encodeURIComponent(state)}/` +
    `${encodeURIComponent(zip)}` +
    `?searchType=Radius` +
    `&minComps=1` +
    `&maxComps=10` +
    `&miles=5` +
    `&bedroomsRange=2` +
    `&bathroomRange=2` +
    `&sqFeetRange=600` +
    `&lotSizeRange=2000` +
    `&saleDateRange=6` +
    `&yearBuiltRange=10` +
    `&ownerOccupied=Both` +
    `&distressed=IncludeDistressed`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      apikey: apiKey,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    throw new Error(
      `ATTOM comps request failed: ${response.status} ${errorText}`,
    );
  }

  const data = (await response.json()) as any;

  const properties =
    data?.RESPONSE_GROUP?.RESPONSE?.RESPONSE_DATA
      ?.PROPERTY_INFORMATION_RESPONSE_ext
      ?.SUBJECT_PROPERTY_ext?.PROPERTY ?? [];

  const comps: PropertyComp[] = properties
    .filter(
      (property: any) =>
        property?.COMPARABLE_PROPERTY_ext !== undefined,
    )
    .map((property: any) => {
      const comp = property.COMPARABLE_PROPERTY_ext;

      const salePrice = toNumber(
        comp?.SALES_HISTORY?.["@PropertySalesAmount"],
      );

      const squareFeet = toNumber(
        comp?.STRUCTURE?.["@GrossLivingAreaSquareFeetCount"],
      );

      const pricePerSqft =
        toNumber(
          comp?.SALES_HISTORY?.["@PricePerSquareFootAmount"],
        ) ??
        (salePrice !== null &&
        squareFeet !== null &&
        squareFeet > 0
          ? salePrice / squareFeet
          : null);

      return {
        address: comp?.["@_StreetAddress"] ?? null,

        city: comp?.["@_City"] ?? null,

        state: comp?.["@_State"] ?? null,

        zip: comp?.["@_PostalCode"] ?? null,

        sale_price: salePrice,

        sale_date:
          comp?.SALES_HISTORY?.["@TransferDate_ext"] ?? null,

        bedrooms: toNumber(
          comp?.STRUCTURE?.["@TotalBedroomCount"],
        ),

        bathrooms: toNumber(
          comp?.STRUCTURE?.["@TotalBathroomCount"],
        ),

        square_feet: squareFeet,

        year_built: toNumber(
          comp?.STRUCTURE?.STRUCTURE_ANALYSIS?.[
            "@PropertyStructureBuiltYear"
          ],
        ),

        property_type:
          comp?.["@StandardUseDescription_ext"] ??
          comp?.["@StandardUseCode_ext"] ??
          null,

        distance: toNumber(
          comp?.["@_DistanceFromSubjectPropertyMilesCount"],
        ),

        price_per_sqft: pricePerSqft,
      };
    });

  return {
    subject_address: address,
    comps,
    source: "ATTOM Data",
  };
}