export interface SchoolRecord {
  _id: number;
  School_Id: string;
  Org_Name: string;
  Telephone: string;
  Fax: string;
  Email: string;
  Contact1_Name: string;
  URL: string;
  Add1_Line1: string;
  Add1_Suburb: string;
  Add1_City: string;
  Add2_Line1: string;
  Add2_Suburb: string;
  Add2_City: string;
  Add2_Postal_Code: string;
  Urban_Rural_Indicator: string;
  Org_Type: string;
  Definition: string;
  Authority: string;
  School_Donations: string;
  CoEd_Status: string;
  KMEPeakBody: string;
  Takiwā: string;
  Territorial_Authority: string;
  Regional_Council: string;
  Local_Office_Name: string;
  Education_Region: string;
  General_Electorate: string;
  Māori_Electorate: string;
  Statistical_Area_2_Code: string;
  Statistical_Area_2_Description: string;
  Ward: string;
  Col_Id: string;
  Col_Name: string;
  Latitude: number;
  Longitude: number;
  Enrolment_Scheme: string;
  EQi_Index: string;
  Roll_Date: string;
  Total: number;
  European: number;
  Māori: number;
  Pacific: number;
  Asian: number;
  MELAA: number;
  Other: number;
  International: number;
  Isolation_Index: string;
  Language_of_Instruction: string;
  BoardingFacilities: string;
  CohortEntry: string;
  Status: string;
  DateSchoolOpened: string;
}

export interface CKANResponse {
  help: string;
  success: boolean;
  result: {
    resource_id: string;
    fields: Array<{
      id: string;
      type: string;
      info?: {
        label: string;
        notes: string;
        type_override: string;
      };
    }>;
    records: SchoolRecord[];
    total: number;
    limit?: number;
    offset?: number;
    _links?: {
      start: string;
      next?: string;
    };
    total_was_estimated: boolean;
  };
}
