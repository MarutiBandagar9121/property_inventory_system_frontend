import { z } from "zod";

export const CityRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const LocationRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  city_id: z.number(),
  location_type_business: z.string(),
  city_division_name: z.string(),
});

export const SublocationRefSchema = z.object({
  id: z.number(),
  name: z.string(),
  location_id: z.number(),
});

export const PropertyTypeRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});
