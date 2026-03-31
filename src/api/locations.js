import client from "./client";

export async function getAllCities() {
  const response = await client.get("/cities");
  return response.data;
}

export async function getAllLocations() {
  const response = await client.get("/locations");
  return response.data;
}

export async function getLocationsByCity(cityId) {
  const response = await client.get(`/locations?city_id=${cityId}`);
  return response.data;
}

export async function getSublocations(locationId) {
  const response = await client.get(`/sublocations?location_id=${locationId}`);
  return response.data;
}
