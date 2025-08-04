export interface PropertyDetails {
  "OH Time"?: string;
  Address: string;
  "Sale Type": string;
  Seen?: boolean;
  Keen?: boolean;
  "Property Type"?: string;
  "RE Estimate"?: number;
  "Homes Estimate"?: number;
  CV?: number;
  Bedrooms?: number;
  Toilets?: number;
  Garages?: number;
  "Auction Date"?: string;
  "floor-area"?: number;
  "Land Size"?: number;
  "Property Built"?: string;
  "Listing Link": string;
}

export interface RealEstateApiResponse {
  data: {
    attributes: {
      "full-address": string;
      "estimated-value": {
        "value-mid": number;
      };
      "council-information": {
        "capital-value": number;
      };
      bedrooms: number;
      bathrooms: number;
      garages: number;
      "floor-area": number;
      address: {
        "full-address": string;
      };
    };
  };
}

export interface HomesApiResponse {
  property_id: string;
}

export interface HomesDetailsResponse {
  property: {
    legal_description: string
    land_area: number
    estimated_value: number
    decade_built: string
  }
}