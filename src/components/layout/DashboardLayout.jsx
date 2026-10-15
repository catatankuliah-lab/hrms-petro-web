import Header from "./header/Header";
import Sidebar from "./sidebar/Sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex w-full min-h-screen">
      <div className="page-wrapper flex w-full">
        {/* Sidebar */}
        <div className="xl:block hidden">
          <Sidebar />
        </div>
        <div className="body-wrapper flex flex-col flex-1 w-full xl:ml-[270px] min-h-screen transition-all duration-300">
          {/* Top Header  */}
          <Header />
          {/* Body Content */}
          <div className="flex-1 bg-gray-50 dark:bg-background">
            <div className="app-content container mx-auto px-6 py-30">
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
