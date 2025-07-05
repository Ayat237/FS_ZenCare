import React from "react";
import { NavLink } from "react-router-dom";
import { BarChart3, Users, UserCheck, Settings, Home } from "lucide-react";
import { cn } from "@/utils/helpers";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Pending Doctors", href: "/doctors/pending", icon: UserCheck },
  { name: "All Doctors", href: "/doctors", icon: Users },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Settings", href: "/settings", icon: Settings },
];

const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-600 border-r-2 border-primary-500"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )
              }
            >
              <Icon className="mr-3 h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
