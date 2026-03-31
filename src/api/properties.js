import client from "./client";
import {
  PropertyListResponseSchema,
  PropertyResponseSchema,
} from "../schemas/property.schema";

export async function getAllProperties({
  skip = 0,
  limit = 20,
  city_ids = [],
  location_ids = [],
  property_type_ids = [],
} = {}) {
  const params = new URLSearchParams();
  params.set("skip", skip);
  params.set("limit", limit);
  city_ids.forEach((id) => params.append("city_ids", id));
  location_ids.forEach((id) => params.append("location_ids", id));
  property_type_ids.forEach((id) => params.append("property_type_ids", id));

  const response = await client.get(`/properties?${params.toString()}`);

  const result = PropertyListResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error("[API] getAllProperties: response shape mismatch", result.error.issues);
    throw new Error("Unexpected response from server. Please contact support.");
  }
  return result.data;
}

export async function getPropertyById(id) {
  const response = await client.get(`/properties/${id}`);

  const result = PropertyResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error("[API] getPropertyById: response shape mismatch", result.error.issues);
    throw new Error("Unexpected response from server. Please contact support.");
  }
  return result.data;
}

export async function createProperty(data) {
  const response = await client.post("/properties", data);

  const result = PropertyResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error("[API] createProperty: response shape mismatch", result.error.issues);
    throw new Error("Unexpected response from server. Please contact support.");
  }
  return result.data;
}

export async function updateProperty(id, data) {
  const response = await client.put(`/properties/${id}`, data);

  const result = PropertyResponseSchema.safeParse(response.data);
  if (!result.success) {
    console.error("[API] updateProperty: response shape mismatch", result.error.issues);
    throw new Error("Unexpected response from server. Please contact support.");
  }
  return result.data;
}

export async function deleteProperty(id) {
  await client.delete(`/properties/${id}`);
}

export async function getAllPropertyTypes() {
  const response = await client.get("/properties/types");
  return response.data;
}
