import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { PropertyCreateSchema } from "../../schemas/property.schema";
import { createProperty, getAllPropertyTypes } from "../../api/properties";
import { getAllCities, getAllLocations, getAllSublocations } from "../../api/locations";
import { PROJECT_GRADES } from "../../const/project.const";

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

// ── Main Component ────────────────────────────────────────────────────────────
export default function AddPropertyForm() {
  const navigate = useNavigate();

  // ── Dropdown data ───────────────────────────────────────────────────────────
  const allLocationsRef = useRef([]);
  const allSublocationsRef = useRef([]);

  const [cities, setCities] = useState([]);
  const [locations, setLocations] = useState([]);
  const [sublocations, setSublocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [loadingDropdowns, setLoadingDropdowns] = useState(true);
  const [submitError, setSubmitError] = useState(null);

  // ── RHF setup ───────────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(PropertyCreateSchema),
    defaultValues: {
      property_name: "",
      property_grade: "",
      city_id: undefined,
      location_id: undefined,
      sublocation_id: undefined,
      property_type_id: undefined,
      latitude: undefined,
      longitude: undefined,
      google_map_url: "",
      address_line1: "",
      address_line2: "",
      postal_code: "",
      total_property_area: undefined,
      tenant_profile: "",
    },
  });

  const watchedCityId = watch("city_id");
  const watchedLocationId = watch("location_id");

  // ── Fetch static dropdown data once ────────────────────────────────────────
  useEffect(() => {
    Promise.all([getAllCities(), getAllLocations(), getAllSublocations(), getAllPropertyTypes()])
      .then(([citiesData, locationsData, sublocationsData, typesData]) => {
        setCities(citiesData);
        allLocationsRef.current = locationsData;
        allSublocationsRef.current = sublocationsData;
        setPropertyTypes(typesData);
      })
      .catch((err) => setSubmitError(err.message))
      .finally(() => setLoadingDropdowns(false));
  }, []);

  // ── When city changes: filter locations, reset downstream ──────────────────
  useEffect(() => {
    if (!watchedCityId) {
      setLocations([]);
      setSublocations([]);
      return;
    }
    setLocations(allLocationsRef.current.filter((l) => l.city_id === watchedCityId));
    setValue("location_id", undefined);
    setValue("sublocation_id", undefined);
    setSublocations([]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedCityId]);

  // ── When location changes: filter sublocations ────────────────────────────
  useEffect(() => {
    if (!watchedLocationId) {
      setSublocations([]);
      return;
    }
    setSublocations(allSublocationsRef.current.filter((s) => s.location_id === watchedLocationId));
    setValue("sublocation_id", undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedLocationId]);

  // ── Submit ──────────────────────────────────────────────────────────────────
  async function onSubmit(data) {
    setSubmitError(null);
    const payload = {
      ...data,
      address_line2: data.address_line2 || null,
      postal_code: data.postal_code || null,
      tenant_profile: data.tenant_profile || null,
    };
    try {
      await createProperty(payload);
      navigate("/dashboard/properties");
    } catch (err) {
      setSubmitError(err.message);
    }
  }

  if (loadingDropdowns) {
    return <p className="text-gray-500">Loading...</p>;
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Property</h1>
          <p className="text-sm text-gray-500 mt-1">Fill in the basic details to register a new property.</p>
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
          <h2 className="text-base font-semibold text-gray-800 border-b pb-2">Basic Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Property Name" error={errors.property_name?.message} required>
              <input
                {...register("property_name")}
                placeholder="e.g. Sunrise Residency"
                className={inputClass}
              />
            </Field>

            <Field label="Property Grade" error={errors.property_grade?.message} required>
              <select {...register("property_grade")} className={inputClass}>
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

            <Field label="Tenant Profile" error={errors.tenant_profile?.message}>
              <input
                {...register("tenant_profile")}
                placeholder="e.g. Corporate, Retail, Mixed"
                className={inputClass}
              />
            </Field>
          </div>
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

          <div className="grid grid-cols-2 gap-4">
            <Field label="Address Line 2" error={errors.address_line2?.message}>
              <input
                {...register("address_line2")}
                placeholder="Apartment, suite, floor (optional)"
                className={inputClass}
              />
            </Field>

            <Field label="Postal Code" error={errors.postal_code?.message}>
              <input
                {...register("postal_code")}
                placeholder="e.g. 400050"
                className={inputClass}
              />
            </Field>
          </div>

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
            <Field label="Total Area (sq ft)" error={errors.total_property_area?.message} required>
              <input
                {...register("total_property_area", { valueAsNumber: true })}
                type="number"
                step="any"
                placeholder="e.g. 5000"
                className={inputClass}
              />
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
            {isSubmitting ? "Creating..." : "Create Property"}
          </button>
        </div>

      </form>
    </div>
  );
}
