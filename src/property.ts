import { Hono } from "hono";
import type { Bindings } from "./bindings";
import {
  PropertyDetails,
  RealEstateApiResponse,
  HomesApiResponse,
  HomesDetailsResponse,
} from "./types/property";
import { canaanLogger } from "./log";

const properties = new Hono<{ Bindings: Bindings }>();

// Extract property ID from HTML
function extractPropertyId(html: string): string | null {
  const propertyIdMatch = html.match(/property-short-id["\s>]+([^"<\s]+)/);
  return propertyIdMatch ? propertyIdMatch[1] : null;
}

// Extract sale type and auction date from HTML
function extractSaleInfo(html: string): {
  saleType: string;
  auctionDate?: string;
} {
  const priceDisplayIndex = html.indexOf("price-display");
  if (priceDisplayIndex === -1) {
    return { saleType: "Unknown" };
  }

  const saleTypeRaw = html.substring(
    priceDisplayIndex + 18,
    priceDisplayIndex + 29
  );

  if (saleTypeRaw.includes("$")) {
    const price = saleTypeRaw.replace(/[^0-9]/g, "");
    return { saleType: price };
  } else if (saleTypeRaw.includes("Auction")) {
    const auctionIndex = html.indexOf("auction-date");
    let auctionDate: string | undefined;

    if (auctionIndex !== -1) {
      auctionDate = html.substring(auctionIndex + 17, auctionIndex + 33).trim();
    }

    return { saleType: "Auction", auctionDate };
  } else if (saleTypeRaw.includes("Negotia")) {
    return { saleType: "Negotiation" };
  } else {
    return { saleType: saleTypeRaw.trim() };
  }
}

async function fetchPropertyData(
  listingNumber: number
): Promise<PropertyDetails> {
  const listingUrl = `https://www.realestate.co.nz/${listingNumber}`;

  const htmlResponse = await fetch(listingUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    },
  });

  if (!htmlResponse.ok) {
    throw new Error(`Failed to fetch listing page: ${htmlResponse.status}`);
  }

  const html = await htmlResponse.text();

  const propertyId = extractPropertyId(html);
  if (!propertyId) {
    throw new Error("Could not extract property ID from listing page");
  }

  const { saleType, auctionDate } = extractSaleInfo(html);

  const apiResponse = await fetch(
    `https://platform.realestate.co.nz/search/v1/properties/${propertyId}`
  );
  if (!apiResponse.ok) {
    throw new Error(`Failed to fetch property data: ${apiResponse.status}`);
  }

  const apiData: RealEstateApiResponse = await apiResponse.json();
  const attributes = apiData.data.attributes;

  let homesData: HomesDetailsResponse["property"] | null = null;

  try {
    const homesUrl = `https://gateway.homes.co.nz/property/resolve?address=${encodeURIComponent(
      attributes.address["full-address"]
    )}`;
    const homesResponse = await fetch(homesUrl);

    if (homesResponse.ok) {
      const homesResolve: HomesApiResponse = await homesResponse.json();

      if (homesResolve.property_id) {
        const homesDetailsResponse = await fetch(
          `https://api-gateway.homes.co.nz/details?property_id=${homesResolve.property_id}`
        );

        if (homesDetailsResponse.ok) {
          const homesDetails: HomesDetailsResponse =
            await homesDetailsResponse.json();
          homesData = homesDetails.property;
        }
      }
    }
  } catch (error) {
    canaanLogger(`Could not fetch Homes.co.nz data:`, { error });
  }

  const estimatedValue =
    attributes["estimated-value"]?.["value-mid"] ?? homesData?.estimated_value;
  if (!estimatedValue) {
    throw new Error("Could not determine property value for loan calculation");
  }

  let propertyType: string | undefined;
  if (homesData?.legal_description) {
    const legalDesc = homesData.legal_description.toLowerCase();
    if (legalDesc.includes("flat") ?? legalDesc.includes("unit")) {
      propertyType = "CrossLease/Unit";
    } else {
      propertyType = "Freehold";
    }
  }

  // Build result
  const result: PropertyDetails = {
    Address: attributes["full-address"],
    "Sale Type": saleType,
    "RE Estimate": attributes["estimated-value"]?.["value-mid"],
    "Homes Estimate": homesData?.estimated_value,
    "Property Type": propertyType,
    CV: attributes["council-information"]?.["capital-value"],
    Bedrooms: attributes.bedrooms,
    Toilets: attributes.bathrooms,
    Garages: attributes.garages,
    "Auction Date": auctionDate,
    "floor-area": attributes["floor-area"],
    "Land Size": homesData?.land_area,
    "Property Built": homesData?.decade_built,
    "Listing Link": listingUrl,
  };

  return result;
}

// Routes matching your existing natto pattern
properties.get("/", (c) => {
  return c.json({
    success: true,
    message: "Property data API",
    description:
      "Fetch property information from Realestate.co.nz and Homes.co.nz with mortgage calculations",
    endpoints: {
      "GET /properties": "This endpoint information",
      "GET /properties/:listingNumber": "Get property data by listing number ",
    },
    examples: {
      "GET /propert/12345678": "Get property 12345678 with default parameters",
    },
  });
});

// GET endpoint for quick property lookup
properties.get("/:listingNumber", async (c) => {
  try {
    const listingNumber = parseInt(c.req.param("listingNumber"));

    if (isNaN(listingNumber) || listingNumber <= 0) {
      return c.json(
        {
          success: false,
          error: "Invalid listing number",
          message: "Listing number must be a positive integer",
        },
        400
      );
    }

    const propertyData = await fetchPropertyData(listingNumber);

    return c.json({
      success: true,
      data: propertyData,
      parameters: {
        listingNumber,
      },
      meta: {
        fetchedAt: new Date().toISOString(),
        source: "realestate.co.nz + homes.co.nz",
      },
    });
  } catch (error) {
    canaanLogger("Error fetching property data:", { error });
    return c.json(
      {
        success: false,
        error: "Failed to fetch property data",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      500
    );
  }
});

export { properties };
