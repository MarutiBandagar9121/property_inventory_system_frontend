import client from "./client";

// PropertyResponse shape:
// {
//   id: string (UUID)
//   project_name: string
//   project_grade: string
//   city: { id, name }
//   location: { id, name }
//   sublocation: { id, name }
//   property_type: { id, name }
//   latitude: number
//   longitude: number
//   google_map_url: string
//   address_line1: string
//   address_line2: string | null
//   total_property_area: number
//   total_property_area_unit: string
//   property_sanction_type: string
//   tenant_profile: string | null
// }

// PropertyListResponse shape:
// {
//   items: PropertyResponse[]
//   total: int      — total matching records (ignoring pagination)
//   skip: int       — offset used for this page
//   limit: int      — page size used for this page
// }

export async function getAllProperties({
  skip = 0,
  limit = 20,
  city_ids = [],
  location_ids = [],
  property_type_ids = [],
} = {}) {
  // Build params manually so repeated keys serialize as ?city_ids=1&city_ids=2
  // (Axios default would produce ?city_ids[]=1 which FastAPI does not accept)
  const params = new URLSearchParams();
  params.set("skip", skip);
  params.set("limit", limit);
  city_ids.forEach((id) => params.append("city_ids", id));
  location_ids.forEach((id) => params.append("location_ids", id));
  property_type_ids.forEach((id) => params.append("property_type_ids", id));

  const response = await client.get(`/properties?${params.toString()}`);
  return response.data; // PropertyListResponse
}

export async function getAllPropertyTypes() {
  const response = await client.get("/properties/types");
  return response.data;
}
