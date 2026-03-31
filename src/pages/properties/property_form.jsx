import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { PropertyCreateSchema } from "../../schemas/property.schema";
import {
  createProperty,
  updateProperty,
  getPropertyById,
  getAllPropertyTypes,
} from "../../api/properties";
import { getAllCities, getLocationsByCity, getSublocations } from "../../api/locations";

// ── Reusable field wrapper ────────────────────────────────────────────────────
function Field({ label, error, required, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400";

const PROJECT_GRADES = ["A+", "A", "B+", "B", "C"];
const AREA_UNITS = ["sq ft", "sq m", "acres", "hectares", "yards"];
const SANCTION_TYPES = ["Residential", "Commercial", "Mixed Use", "Industrial", "Agricultural"];

// ── Main Component ────────────────────────────────────────────────────────────
export default function PropertyForm() {
  const { id } = useParams(); // present on /properties/:id/edit
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  // ── Dropdown data ───────────────────────────────────────────────────────────
  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sublocations, setSublocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [loadingProperty, setLoadingProperty] = useState(isEdit);
  const [submitError, setSubmitError] = useState(null);

  // ── RHF setup ───────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(PropertyCreateSchema),
    defaultValues: {
      project_name: "",
      project_grade: "",
      city_id: undefined,
      location_id: undefined,
      sublocation_id: undefined,
      latitude: undefined,
      longitude: undefined,
      google_map_url: "",
      address_line1: "",
      address_line2: "",
      total_property_area: undefined,
      total_property_area_unit: "",
      property_sanction_type: "",
      tenant_profile: "",
      property_type_id: undefined,
    },
  });

  const watchedCityId = watch("city_id");
  const watchedLocationId = watch("location_id");

  // ── Fetch static dropdown data once ────────────────────────────────────────
  useEffect(() => {
    Promise.all([getAllCities(), getAllPropertyTypes()])
      .then(([citiesData, typesData]) => {
        setCities(citiesData);
        setPropertyTypes(typesData);
      })
      .finally(() => setLoadingDropdowns(false));
  }, []);

  // ── In edit mode: load the property and pre-fill the form ──────────────────
  useEffect(() => {
    if (!isEdit) return;
    getPropertyById(id)
      .then((property) => {
        // Map the nested response objects back to their IDs for the form
        reset({
          project_name: property.project_name,
          project_grade: property.project_grade,
          city_id: property.city.id,
          location_id: property.location.id,
          sublocation_id: property.sublocation.id,
          latitude: property.latitude,
          longitude: property.longitude,
          google_map_url: property.google_map_url,
          address_line1: property.address_line1,
          address_line2: property.address_line2 ?? "",
          total_property_area: property.total_property_area,
          total_property_area_unit: property.total_property_area_unit,
          property_sanction_type: property.property_sanction_type,
          tenant_profile: property.tenant_profile ?? "",
          property_type_id: property.property_type.id,
        });
      })
      .catch((err) => setSubmitError(err.message))
      .finally(() => setLoadingProperty(false));
  }, [id, isEdit, reset]);

  // ── When city changes: fetch filtered locations, reset downstream ──────────
  useEffect(() => {
    if (!watchedCityId) {
      setLocations([]);
      setSublocations([]);
      return;
    }
    getLocationsByCity(watchedCityId).then((data) => {
      setLocations(data);
      // Only reset in add mode; in edit mode the initial reset already set these
      if (!isEdit || loadingProperty) return;
      setValue("location_id", undefined);
      setValue("sublocation_id", undefined);
      setSublocations([]);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCityId]);

  // ── When location changes: fetch sublocations, reset sublocation ───────────
  useEffect(() => {
    if (!watchedLocationId) {
      setSublocations([]);
      return;
    }
    getSublocations(watchedLocationId).then((data) => {
      setSublocations(data);
      if (!isEdit || loadingProperty) return;
      setValue("sublocation_id", undefined);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedLocationId]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function onSubmit(data) {
    setSubmitError(null);
    // Convert optional empty strings to null before sending
    const payload = {
      ...data,
      address_line2: data.address_line2 || null,
      tenant_profile: data.tenant_profile || null,
    };
    try {
      if (isEdit) {
        await updateProperty(id, payload);
      } else {
        await createProperty(payload);
      }
      navigate("/dashboard/properties");
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  if (loadingDropdowns || loadingProperty) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Property" : "Add Property"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit
              ? "Update the property details below."
              : "Fill in the details to add a new property."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate("/dashboard/properties")}
          className="text-sm text-gray-500 hover:text-gray-800 transition"
        >
          ← Back to Properties
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

        {/* ── Section: Basic Info ── */}
        <section className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Project Name" error={errors.project_name?.message} required>
              <input
                {...register("project_name")}
                placeholder="e.g. Sunrise Residency"
                className={inputClass}
              />
            </Field>

            <Field label="Project Grade" error={errors.project_grade?.message} required>
              <select {...register("project_grade")} className={inputClass}>
                <option value="">Select grade</option>
                {PROJECT_GRADES.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Type" error={errors.property_type_id?.message} required>
              <select
                {...register("property_type_id", { valueAsNumber: true })}
                className={inputClass}
              >
                <option value="">Select type</option>
                {propertyTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Sanction Type" error={errors.property_sanction_type?.message} required>
              <select {...register("property_sanction_type")} className={inputClass}>
                <option value="">Select sanction type</option>
                {SANCTION_TYPES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tenant Profile" error={errors.tenant_profile?.message}>
            <input
              {...register("tenant_profile")}
              placeholder="e.g. Corporate, Retail, Mixed"
              className={inputClass}
            />
          </Field>
        </section>

        {/* ── Section: Location ── */}
        <section className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Location</h2>

          <div className="grid grid-cols-3 gap-4">
            <Field label="City" error={errors.city_id?.message} required>
              <select
                {...register("city_id", { valueAsNumber: true })}
                className={inputClass}
              >
                <option value="">Select city</option>
                {cities.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Location" error={errors.location_id?.message} required>
              <select
                {...register("location_id", { valueAsNumber: true })}
                disabled={locations.length === 0}
                className={inputClass}
              >
                <option value="">Select location</option>
                {locations.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </Field>

            <Field label="Sublocation" error={errors.sublocation_id?.message} required>
              <select
                {...register("sublocation_id", { valueAsNumber: true })}
                disabled={sublocations.length === 0}
                className={inputClass}
              >
                <option value="">Select sublocation</option>
                {sublocations.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Address Line 1" error={errors.address_line1?.message} required>
            <input
              {...register("address_line1")}
              placeholder="Street address"
              className={inputClass}
            />
          </Field>

          <Field label="Address Line 2" error={errors.address_line2?.message}>
            <input
              {...register("address_line2")}
              placeholder="Apartment, suite, floor (optional)"
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Latitude" error={errors.latitude?.message} required>
              <input
                {...register("latitude", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="e.g. 19.0760"
                className={inputClass}
              />
            </Field>

            <Field label="Longitude" error={errors.longitude?.message} required>
              <input
                {...register("longitude", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="e.g. 72.8777"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Google Maps URL" error={errors.google_map_url?.message} required>
            <input
              {...register("google_map_url")}
              type="url"
              placeholder="https://maps.google.com/..."
              className={inputClass}
            />
          </Field>
        </section>

        {/* ── Section: Area ── */}
        <section className="bg-white rounded-xl shadow-sm border p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Property Area</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Total Area" error={errors.total_property_area?.message} required>
              <input
                {...register("total_property_area", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="e.g. 5000"
                className={inputClass}
              />
            </Field>

            <Field label="Unit" error={errors.total_property_area_unit?.message} required>
              <select {...register("total_property_area_unit")} className={inputClass}>
                <option value="">Select unit</option>
                {AREA_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </Field>
          </div>
        </section>

        {/* ── Submit area ── */}
        {submitError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3">
            {submitError}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pb-8">
          <button
            type="button"
            onClick={() => navigate("/dashboard/properties")}
            className="px-5 py-2 rounded-lg border text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {isSubmitting
              ? isEdit ? "Saving..." : "Creating..."
              : isEdit ? "Save Changes" : "Create Property"}
          </button>
        </div>

      </form>
    </div>
  );
}
