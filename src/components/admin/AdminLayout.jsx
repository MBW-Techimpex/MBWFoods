import React from "react";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";

const AdminLayout = ({ children }) => {
  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 font-sans flex flex-col overflow-hidden">
      <AdminHeader />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar />
        <main className="flex-1 ml-60 mt-16 p-8 overflow-auto no-scrollbar relative dark:text-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;



