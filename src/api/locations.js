import client from "./client";
import { LocationRefSchema, SublocationRefSchema } from "../schemas/common.schema";

export async function getAllCities() {
  const response = await client.get("/cities");
  return response.data;
}

export async function getAllLocations() {
  const response = await client.get("/locations");
  const result = LocationRefSchema.array().safeParse(response.data);
    if (!result.success) {
      console.error("[API] getAllLocations: response shape mismatch", result.error.issues);
      throw new Error("Unexpected response from server. Please contact support.");
    }
  return response.data;
}

export async function getAllSublocations() {
  const response = await client.get("/sublocations");
    const result = SublocationRefSchema.array().safeParse(response.data);
    if (!result.success) {
      console.error("[API] getAllSublocations: response shape mismatch", result.error.issues);
      throw new Error("Unexpected response from server. Please contact support.");
    }
    return result.data;
}
