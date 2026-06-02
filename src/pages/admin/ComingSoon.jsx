import React from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { IconClock } from "@tabler/icons-react";

const AdminComingSoon = ({ title }) => {
  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6">
        <div className="w-24 h-24 bg-brand-secondary rounded-full flex items-center justify-center text-brand-primary animate-pulse">
            <IconClock size={48} />
        </div>
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 font-serif mb-2">{title}</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            We are currently crafting a premium experience for this section. Please check back later for full functionality.
          </p>
        </div>
        <button className="px-8 py-3 bg-brand-primary text-white rounded-2xl font-bold hover:bg-violet-800 transition-all shadow-lg shadow-violet-200 transform active:scale-95">
          Go Back to Dashboard
        </button>
      </div>
    </AdminLayout>
  );
};

export default AdminComingSoon;



