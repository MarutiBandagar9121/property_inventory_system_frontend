import { z } from "zod";

export const CityRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const LocationRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const SublocationRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});

export const PropertyTypeRefSchema = z.object({
  id: z.number(),
  name: z.string(),
});
