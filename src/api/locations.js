import client from "./client";

export async function getAllCities() {
  const response = await client.get("/cities");
  return response.data;
}

export async function getAllLocations() {
  const response = await client.get("/locations");
  return response.data;
}