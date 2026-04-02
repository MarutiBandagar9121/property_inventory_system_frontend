import { useEffect, useState, useMemo, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { getAllProperties, getAllPropertyTypes } from "../../api/properties";
import { getAllCities, getAllLocations, getAllSublocations } from "../../api/locations";

// Change this one number whenever you want a different page size
const PAGE_SIZE = 20;

export default function Properties() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [cities, setCities] = useState([]);
  const [allLocations, setAllLocations] = useState([]);
  const [allSublocations, setAllSublocations] = useState([]);
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [properties, setProperties] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ─── Filter state — derived from URL search params ────────────────────────
  // Filters live in the URL so they are bookmarkable and shareable.
  // e.g. /properties?city_ids=1&city_ids=2&location_ids=5&page=3
  const selectedCityIds = new Set(searchParams.getAll("city_ids").map(Number));
  const selectedLocationIds = new Set(searchParams.getAll("location_ids").map(Number));
  const selectedTypeIds = new Set(searchParams.getAll("property_type_ids").map(Number));
  // ?page is 1-based in the URL; internally we use 0-based pageIndex
  const pageIndex = searchParams.get("page")
    ? parseInt(searchParams.get("page"), 10) - 1
    : 0;

  // ─── Dropdown open/close (UI-only, stays out of URL) ─────────────────────
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const cityDropdownRef = useRef(null);

  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const locationDropdownRef = useRef(null);
  
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef(null);

  function closeAllDropdowns() {
    setCityDropdownOpen(false);
    setLocationDropdownOpen(false);
    setTypeDropdownOpen(false);
  }

  function toggleCity(id) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      const next = new Set(selectedCityIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Drop location selections that no longer belong to the new city set
      const validLocIds = new Set(
        allLocations
          .filter((loc) => next.size === 0 || next.has(loc.city_id))
          .map((loc) => loc.id)
      );
      const keptLocs = [...selectedLocationIds].filter((lid) => validLocIds.has(lid));
      p.delete("city_ids");
      [...next].forEach((cid) => p.append("city_ids", cid));
      p.delete("location_ids");
      keptLocs.forEach((lid) => p.append("location_ids", lid));
      p.delete("page");
      return p;
    });
  }

  function clearCityFilter() {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("city_ids");
      p.delete("page");
      return p;
    });
  }

  function toggleLocation(id) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      const next = new Set(selectedLocationIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      p.delete("location_ids");
      [...next].forEach((lid) => p.append("location_ids", lid));
      p.delete("page");
      return p;
    });
  }

  function clearLocationFilter() {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("location_ids");
      p.delete("page");
      return p;
    });
  }

  function toggleType(id) {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      const next = new Set(selectedTypeIds);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      p.delete("property_type_ids");
      [...next].forEach((tid) => p.append("property_type_ids", tid));
      p.delete("page");
      return p;
    });
  }

  function clearTypeFilter() {
    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      p.delete("property_type_ids");
      p.delete("page");
      return p;
    });
  }

  // Fetch all reference data once on mount
  useEffect(() => {
    Promise.all([
      getAllCities(),
      getAllLocations(),
      getAllSublocations(),
      getAllPropertyTypes(),
    ])
      .then(([citiesData, locationsData, sublocationsData, typesData]) => {
        setCities(citiesData);
        setAllLocations(locationsData);
        setAllSublocations(sublocationsData);
        setPropertyTypes(typesData);
      })
      .catch((err) => setError(err.message));
  }, []);

  // Arrays of IDs read from repeated URL params — passed directly to the API
  const cityIdsParam = searchParams.getAll("city_ids").map(Number);
  const locationIdsParam = searchParams.getAll("location_ids").map(Number);
  const typeIdsParam = searchParams.getAll("property_type_ids").map(Number);

  // Derived: which locations to show in the location dropdown.
  // If no city is selected (All) → show all 133 locations.
  // If cities are selected → show only locations belonging to those cities.
  // This is pure client-side filtering — no extra API call needed.
  const visibleLocations =
    selectedCityIds.size === 0
      ? allLocations
      : allLocations.filter((loc) => selectedCityIds.has(loc.city_id));

  useEffect(() => {
    setLoading(true);
    getAllProperties({
      skip: pageIndex * PAGE_SIZE,
      limit: PAGE_SIZE,
      city_ids: cityIdsParam,
      location_ids: locationIdsParam,
      property_type_ids: typeIdsParam,
    })
      .then((data) => {
        setProperties(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ─── Lookup maps (id → name) built from reference data ──────────────────
  const cityMap = useMemo(
    () => Object.fromEntries(cities.map((c) => [c.id, c.name])),
    [cities]
  );
  const locationMap = useMemo(
    () => Object.fromEntries(allLocations.map((l) => [l.id, l.name])),
    [allLocations]
  );
  const sublocationMap = useMemo(
    () => Object.fromEntries(allSublocations.map((s) => [s.id, s.name])),
    [allSublocations]
  );
  const typeMap = useMemo(
    () => Object.fromEntries(propertyTypes.map((t) => [t.id, t.name])),
    [propertyTypes]
  );

  // ─── Column Definitions ───────────────────────────────────────────────────
  const columns = useMemo(
    () => [
      {
        header: "#",
        cell: (info) => info.row.index + 1,
      },
      {
        accessorKey: "property_name",
        header: "Property Name",
      },
      {
        header: "City / Location / Sublocation",
        accessorFn: (row) =>
          [
            cityMap[row.city_id] ?? "—",
            locationMap[row.location_id] ?? "—",
            sublocationMap[row.sublocation_id] ?? "—",
          ].join(" / "),
      },
      {
        header: "Property Type",
        accessorFn: (row) => typeMap[row.property_type_id] ?? "—",
      },
      {
        header: "Grade",
        accessorKey: "property_grade",
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button
            onClick={() => handleManage(row.original)}
            className="text-xs px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
          >
            Manage
          </button>
        ),
      },
    ],
    [cityMap, locationMap, sublocationMap, typeMap]
  );

  // ─── Table Instance ───────────────────────────────────────────────────────
  // `useReactTable` is the core hook. You pass in your data + columns + "row models".
  // Row models are plugins that transform your data:
  //   getCoreRowModel()       → always required, the base model
  //   getPaginationRowModel() → slices data into pages
  const table = useReactTable({
    data: properties,
    columns,
    pageCount: Math.ceil(total / PAGE_SIZE),
    state: {
      pagination: { pageIndex, pageSize: PAGE_SIZE },
    },
    onPaginationChange: (updater) => {
      const next =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize: PAGE_SIZE })
          : updater;
      setSearchParams((prev) => {
        const p = new URLSearchParams(prev);
        if (next.pageIndex === 0) p.delete("page");
        else p.set("page", next.pageIndex + 1); // 1-based in URL
        return p;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
  });

  function handleManage(property) {
    navigate(`/dashboard/properties/${property.id}`);
  }

  if (loading) return <p className="text-gray-500">Loading properties...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  // ─── Pagination helpers (from the table instance) ─────────────────────────
  // table.getState().pagination  → { pageIndex: 0, pageSize: 10 }
  // table.getPageCount()         → total number of pages
  // table.getCanPreviousPage()   → boolean
  // table.getCanNextPage()       → boolean
  // table.previousPage()         → go back one page
  // table.nextPage()             → go forward one page
  // table.setPageSize(n)         → change how many rows per page
  const firstRow = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const lastRow = Math.min((pageIndex + 1) * PAGE_SIZE, total);

  return (
    <div>
      {/* ── Header row: title + filters ── */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Properties</h1>

        {/* Filter bar — add more filter dropdowns here later */}
        <div className="flex items-center gap-3 relative z-50">

          {/* City multi-select dropdown */}
          <div className="relative" ref={cityDropdownRef}>

            {/* Trigger button */}
            <button
              onClick={() => setCityDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50 transition shadow-sm"
            >
              <span className="text-gray-500">City:</span>
              <span className="font-medium text-gray-800">
                {selectedCityIds.size === 0
                  ? "All"
                  : `${selectedCityIds.size} selected`}
              </span>
              {/* Show X to clear only when something is selected */}
              {selectedCityIds.size > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); clearCityFilter(); }}
                  className="ml-1 text-gray-400 hover:text-red-500 font-bold leading-none"
                >
                  ×
                </span>
              )}
              <span className="text-gray-400 text-xs">{cityDropdownOpen ? "▲" : "▼"}</span>
            </button>

            {/* Dropdown panel */}
            {cityDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border z-50 py-1 max-h-64 overflow-y-auto">

                {/* "All Cities" row — clears selection */}
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-indigo-600">
                  <input
                    type="checkbox"
                    checked={selectedCityIds.size === 0}
                    onChange={clearCityFilter}
                    className="accent-indigo-600"
                  />
                  All Cities
                </label>

                <div className="border-t my-1" />

                {/* Individual city rows */}
                {cities.map((city) => (
                  <label
                    key={city.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedCityIds.has(city.id)}
                      onChange={() => toggleCity(city.id)}
                      className="accent-indigo-600"
                    />
                    {city.name}
                  </label>
                ))}

              </div>
            )}
          </div>
          {/* Location multi-select dropdown */}
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setLocationDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50 transition shadow-sm"
            >
              <span className="text-gray-500">Location:</span>
              <span className="font-medium text-gray-800">
                {selectedLocationIds.size === 0
                  ? "All"
                  : `${selectedLocationIds.size} selected`}
              </span>
              {selectedLocationIds.size > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); clearLocationFilter(); }}
                  className="ml-1 text-gray-400 hover:text-red-500 font-bold leading-none"
                >
                  ×
                </span>
              )}
              <span className="text-gray-400 text-xs">{locationDropdownOpen ? "▲" : "▼"}</span>
            </button>

            {locationDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border z-50 py-1 max-h-64 overflow-y-auto">
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-indigo-600">
                  <input
                    type="checkbox"
                    checked={selectedLocationIds.size === 0}
                    onChange={clearLocationFilter}
                    className="accent-indigo-600"
                  />
                  All Locations
                </label>
                <div className="border-t my-1" />
                {visibleLocations.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-gray-400">No locations available</p>
                ) : (
                  visibleLocations.map((loc) => (
                    <label
                      key={loc.id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocationIds.has(loc.id)}
                        onChange={() => toggleLocation(loc.id)}
                        className="accent-indigo-600"
                      />
                      {loc.name}
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Property Type multi-select dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              onClick={() => setTypeDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border bg-white text-sm hover:bg-gray-50 transition shadow-sm"
            >
              <span className="text-gray-500">Type:</span>
              <span className="font-medium text-gray-800">
                {selectedTypeIds.size === 0 ? "All" : `${selectedTypeIds.size} selected`}
              </span>
              {selectedTypeIds.size > 0 && (
                <span
                  onClick={(e) => { e.stopPropagation(); clearTypeFilter(); }}
                  className="ml-1 text-gray-400 hover:text-red-500 font-bold leading-none"
                >
                  ×
                </span>
              )}
              <span className="text-gray-400 text-xs">{typeDropdownOpen ? "▲" : "▼"}</span>
            </button>

            {typeDropdownOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white rounded-lg shadow-lg border z-50 py-1 max-h-64 overflow-y-auto">
                <label className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm font-medium text-indigo-600">
                  <input
                    type="checkbox"
                    checked={selectedTypeIds.size === 0}
                    onChange={clearTypeFilter}
                    className="accent-indigo-600"
                  />
                  All Types
                </label>
                <div className="border-t my-1" />
                {propertyTypes.map((type) => (
                  <label
                    key={type.id}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700"
                  >
                    <input
                      type="checkbox"
                      checked={selectedTypeIds.has(type.id)}
                      onChange={() => toggleType(type.id)}
                      className="accent-indigo-600"
                    />
                    {type.name}
                  </label>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Backdrop: closes all dropdowns when clicking anywhere outside the filter bar */}
      {(cityDropdownOpen || locationDropdownOpen || typeDropdownOpen) && (
        <div className="fixed inset-0 z-40" onClick={closeAllDropdowns} />
      )}

      {/* ── Active filter chips ── */}
      {(selectedCityIds.size > 0 || selectedLocationIds.size > 0 || selectedTypeIds.size > 0) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {[...selectedCityIds].map((id) => {
            const city = cities.find((c) => c.id === id);
            return (
              <span key={id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-medium">
                {city?.name}
                <button onClick={() => toggleCity(id)} className="hover:text-red-500 font-bold leading-none">×</button>
              </span>
            );
          })}
          {[...selectedLocationIds].map((id) => {
            const loc = allLocations.find((l) => l.id === id);
            return (
              <span key={id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-medium">
                {loc?.name}
                <button onClick={() => toggleLocation(id)} className="hover:text-red-500 font-bold leading-none">×</button>
              </span>
            );
          })}
          {[...selectedTypeIds].map((id) => {
            const type = propertyTypes.find((t) => t.id === id);
            return (
              <span key={id} className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
                {type?.name}
                <button onClick={() => toggleType(id)} className="hover:text-red-500 font-bold leading-none">×</button>
              </span>
            );
          })}
          <button
            onClick={() => { clearCityFilter(); clearLocationFilter(); clearTypeFilter(); }}
            className="text-xs text-gray-400 hover:text-red-500 underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* ── Results Overview ── */}
      <div className="flex items-center gap-6 mb-4 px-4 py-3 bg-white rounded-xl shadow-sm border text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Cities</span>
          <span className="font-semibold text-gray-800">
            {selectedCityIds.size === 0 ? cities.length : selectedCityIds.size}
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Locations</span>
          <span className="font-semibold text-gray-800">{visibleLocations.length}</span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <div className="flex items-center gap-2">
          <span className="text-gray-400">Properties</span>
          <span className="font-semibold text-indigo-600">{total}</span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl shadow">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold tracking-wide"
                  >
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody className="divide-y divide-gray-100">
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="text-center py-8 text-gray-400"
                >
                  No properties found.
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 transition">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-gray-700">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination Controls ── */}
      <div className="flex items-center justify-between mt-4 text-sm text-gray-600">

        {/* Left: showing X–Y of Z */}
        <span>
          Showing <strong>{firstRow}–{lastRow}</strong> of <strong>{total}</strong> properties
        </span>

        {/* Center: page navigation */}
        <div className="flex items-center gap-1">
          {/* Go to first page */}
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100 transition"
          >
            «
          </button>

          {/* Go to previous page */}
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100 transition"
          >
            ‹
          </button>

          {/* Current page indicator */}
          <span className="px-3 py-1 rounded border bg-indigo-50 text-indigo-700 font-medium">
            {pageIndex + 1} / {table.getPageCount()}
          </span>

          {/* Go to next page */}
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100 transition"
          >
            ›
          </button>

          {/* Go to last page */}
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-2 py-1 rounded border disabled:opacity-40 hover:bg-gray-100 transition"
          >
            »
          </button>
        </div>

      </div>
    </div>
  );
}
