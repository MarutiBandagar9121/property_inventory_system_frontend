import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";

// ── Nav config ────────────────────────────────────────────────────────────────
// type: "link"     → plain NavLink
// type: "dropdown" → collapsible group with children
const NAV_ITEMS = [
  {
    type: "link",
    to: "/dashboard",
    label: "Dashboard",
  },
  {
    type: "dropdown",
    label: "Properties",
    basePath: "/dashboard/properties",
    children: [
      { to: "/dashboard/properties/new", label: "Add New Property" },
      { to: "/dashboard/properties",     label: "View All Properties" },
    ],
  },
  {
    type: "link",
    to: "/dashboard/employees",
    label: "Employees",
  },
  {
    type: "link",
    to: "/dashboard/leads",
    label: "Leads",
  },
];

// ── Shared active link style ──────────────────────────────────────────────────
const linkClass = (isActive) =>
  `flex items-center gap-3 px-4 py-3 text-sm no-underline border-l-[3px] transition-all
  ${isActive
    ? "text-white bg-[#2e2e4e] border-[#6c63ff]"
    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
  }`;

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <nav
      style={{ width: collapsed ? 60 : 220, transition: "width 0.2s ease" }}
      className="bg-[#1e1e2e] flex flex-col shrink-0 overflow-hidden"
    >
      {/* ── Logo + toggle ── */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {collapsed ? (
          <span className="text-white font-bold text-lg mx-auto">E</span>
        ) : (
          <span className="text-white font-bold text-lg">EstateHub</span>
        )}
        <button
          onClick={() => setCollapsed((prev) => !prev)}
          className="text-gray-400 hover:text-white ml-auto cursor-pointer bg-transparent border-none text-xl leading-none"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* ── Nav links ── */}
      <div className="flex flex-col mt-2">
        {NAV_ITEMS.map((item) =>
          item.type === "link" ? (
            <NavLink
              key={item.to}
              to={item.to}
              end
              title={collapsed ? item.label : undefined}
              className={({ isActive }) => linkClass(isActive)}
            >
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ) : (
            <DropdownItem
              key={item.label}
              item={item}
              collapsed={collapsed}
              currentPath={location.pathname}
            />
          )
        )}
      </div>
    </nav>
  );
}

// ── Dropdown nav item ─────────────────────────────────────────────────────────
function DropdownItem({ item, collapsed, currentPath }) {
  // Auto-expand when any child route is active
  const isAnyChildActive = currentPath.startsWith(item.basePath);
  const [open, setOpen] = useState(isAnyChildActive);

  // When sidebar collapses, close the dropdown
  if (collapsed) {
    return (
      <button
        title={item.label}
        className={linkClass(isAnyChildActive) + " w-full text-left"}
      >
        {/* icon placeholder — space matches other links */}
      </button>
    );
  }

  return (
    <div>
      {/* Parent row — toggles the dropdown */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center justify-between px-4 py-3 text-sm border-l-[3px] transition-all
          ${isAnyChildActive
            ? "text-white bg-[#2e2e4e] border-[#6c63ff]"
            : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
          }`}
      >
        <span>{item.label}</span>
        <span className="text-xs text-gray-500">{open ? "▲" : "▼"}</span>
      </button>

      {/* Children */}
      {open && (
        <div className="flex flex-col">
          {item.children.map((child) => {
            const childActive =
              child.to === "/dashboard/properties"
                ? currentPath === child.to
                : currentPath.startsWith(child.to);
            return (
              <NavLink
                key={child.to}
                to={child.to}
                end
                className={`pl-8 pr-4 py-2.5 text-sm no-underline border-l-[3px] transition-all
                  ${childActive
                    ? "text-white bg-[#252540] border-[#6c63ff]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
                  }`}
              >
                {child.label}
              </NavLink>
            );
          })}
        </div>
      )}
    </div>
  );
}
