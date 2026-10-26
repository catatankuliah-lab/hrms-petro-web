// src/components/layout/sidebar/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import SidebarContent from "./Sidebaritems";
import { Icon } from "@iconify/react";

const SidebarLayout = ({ onClose }) => {
  const location = useLocation();
  const pathname = location.pathname;
  const { user } = useContext(AuthContext);

  // Hanya simpan role yang aktif: Super Admin dan MGR_PROJECT (Manager)
  const basePath =
    { "Super Admin": "/super-admin", "Project Manager": "/manager", "A Project Manager": "/manager", "HR": "/hr", "Finance": "/finance", "Employee" : "/employee"  }[user?.role] || "";
  // Filter menu berdasarkan role
  const filteredSidebarContent = SidebarContent.filter((section) =>
    section.roles?.includes(user?.role)
  )
    .map((section) => ({
      ...section,
      children: section.children?.filter((item) =>
        item.roles ? item.roles.includes(user?.role) : true
      ),
    }))
    .filter((section) => section.children?.length > 0);

  return (
    <div className="fixed left-0 top-0 h-screen w-[270px] bg-white dark:bg-card shadow-md z-[100] flex flex-col">
      {/* Logo */}
      <div className="px-4 h-[90px] flex justify-center items-center shrink-0">
        <img src="/images/logos/logopetropacific.png" alt="Logo" className="h-12" />
      </div>

      {/* Menu Container */}
      <div className="flex-1 overflow-y-auto custom-scroll w-full">
        <div className="px-4 pb-10 space-y-2">
          {filteredSidebarContent.map((section, idx) => (
            <div key={idx} className="mt-4">
              {section.heading && (
                <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">
                  {section.heading}
                </p>
              )}
              {section.children.map((item) => (
                <Link
                  key={item.id}
                  to={`${basePath}${item.url}`}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
                    pathname.startsWith(`${basePath}${item.url}`)
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-slate-600 dark:text-slate-400 hover:bg-primary/5 hover:text-primary"
                  }`}
                >
                  <Icon
                    icon={item.icon || "ri:checkbox-blank-circle-line"}
                    width="20"
                    height="20"
                  />
                  {item.name}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
export default SidebarLayout;
