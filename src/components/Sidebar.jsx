import { useState } from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/dashboard",            label: "Dashboard" },
  { to: "/dashboard/properties", label: "Properties" },
  { to: "/dashboard/employees",  label: "Employees" },
  { to: "/dashboard/leads",      label: "Leads" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <nav
      style={{ width: collapsed ? 60 : 220, transition: "width 0.2s ease" }}
      className="bg-[#1e1e2e] flex flex-col shrink-0 overflow-hidden"
    >
      {/* Logo + toggle button */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
        {!collapsed && (
          <span className="text-white font-bold text-lg">EstateHub</span>
        )}
        {collapsed && (
          <span className="text-white font-bold text-lg mx-auto">E</span>
        )}
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="text-gray-400 hover:text-white ml-auto cursor-pointer bg-transparent border-none text-xl leading-none"
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "→" : "←"}
        </button>
      </div>

      {/* Nav links */}
      <div className="flex flex-col mt-2">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end
            title={collapsed ? link.label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm no-underline border-l-[3px] transition-all
              ${isActive
                ? "text-white bg-[#2e2e4e] border-[#6c63ff]"
                : "text-gray-400 hover:text-white hover:bg-white/5 border-transparent"
              }`
            }
          >
            <span className="shrink-0 text-base">{link.icon}</span>
            {!collapsed && <span>{link.label}</span>}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
