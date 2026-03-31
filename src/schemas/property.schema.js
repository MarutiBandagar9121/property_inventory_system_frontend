import { z } from "zod";
import {
  CityRefSchema,
  LocationRefSchema,
  SublocationRefSchema,
  PropertyTypeRefSchema,
} from "./common.schema";

// ── Mirrors PropertyCreate (what you POST / PUT) ──────────────────────────────
export const PropertyCreateSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  project_grade: z.string().min(1, "Project grade is required"),
  city_id: z.number({ required_error: "Select a city" }),
  location_id: z.number({ required_error: "Select a location" }),
  sublocation_id: z.number({ required_error: "Select a sublocation" }),
  latitude: z
    .number({ invalid_type_error: "Must be a number" })
    .min(-90, "Invalid latitude")
    .max(90, "Invalid latitude"),
  longitude: z
    .number({ invalid_type_error: "Must be a number" })
    .min(-180, "Invalid longitude")
    .max(180, "Invalid longitude"),
  google_map_url: z.string().url("Must be a valid URL"),
  address_line1: z.string().min(1, "Address is required"),
  address_line2: z.string().optional().or(z.literal("")),
  total_property_area: z
    .number({ invalid_type_error: "Must be a number" })
    .positive("Must be greater than 0"),
  total_property_area_unit: z.string().min(1, "Select a unit"),
  property_sanction_type: z.string().min(1, "Select a sanction type"),
  tenant_profile: z.string().optional().or(z.literal("")),
  property_type_id: z.number({ required_error: "Select a property type" }),
});

// ── Mirrors PropertyResponse (what the API returns) ───────────────────────────
export const PropertyResponseSchema = z.object({
  id: z.string().uuid(),
  project_name: z.string(),
  project_grade: z.string(),
  city: CityRefSchema,
  location: LocationRefSchema,
  sublocation: SublocationRefSchema,
  property_type: PropertyTypeRefSchema,
  latitude: z.number(),
  longitude: z.number(),
  google_map_url: z.string(),
  address_line1: z.string(),
  address_line2: z.string().nullable().optional(),
  total_property_area: z.number(),
  total_property_area_unit: z.string(),
  property_sanction_type: z.string(),
  tenant_profile: z.string().nullable().optional(),
});

export const PropertyListResponseSchema = z.object({
  items: z.array(PropertyResponseSchema),
  total: z.number(),
  skip: z.number(),
  limit: z.number(),
});
