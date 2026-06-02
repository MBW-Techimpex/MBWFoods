
import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import AdminLayout from "../../components/admin/AdminLayout";
import { IconSearch, IconFilter, IconUsers, IconDownload, IconChevronLeft, IconChevronRight, IconMail, IconPhone, IconCalendar, IconUserCircle } from "@tabler/icons-react";
import { useNotification } from "../../context/NotificationContext";

const CustomerManagement = () => {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");
    const { showNotification } = useNotification();
    const [hasSearched, setHasSearched] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            let url = `${API_BASE}/api/customers`;
            const params = new URLSearchParams();
            if (dateFrom) params.append('dateFrom', dateFrom);
            if (dateTo) params.append('dateTo', dateTo);
            
            if (params.toString()) {
                url += `?${params.toString()}`;
            }

            const res = await fetch(url);
            const data = await res.json();
            setCustomers(data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching customers:", err);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, []);

    const handleSearchClick = () => {
        fetchCustomers();
        setCurrentPage(1);
        if (dateFrom || dateTo) {
            setHasSearched(true);
        }
    };

    useEffect(() => {
        setHasSearched(false);
    }, [dateFrom, dateTo]);

    const filteredCustomers = customers.filter(c =>
        (c.first_name + " " + c.last_name).toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
    const currentItems = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const downloadCustomersExcel = () => {
        if (!customers || customers.length === 0) {
            showNotification("No customers found for the selected dates. Please search first.", "warning");
            return;
        }

        const headers = ["ID", "First Name", "Last Name", "Email", "Phone", "Joined Date"];
        const data = customers.map(c => [
            c.id,
            c.first_name,
            c.last_name,
            c.email,
            c.phone || "N/A",
            new Date(c.createdAt).toLocaleDateString()
        ]);

        const csvContent = [headers, ...data].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `Customers_Export_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <AdminLayout>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 font-serif flex items-center gap-3">
                        <IconUsers size={32} className="text-brand-primary" />
                        Customer Registry
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium text-sm">Manage your community and member base.</p>
                </div>
            </div>

            {/* Single-Line Filter Bar */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Date Inputs */}
                    <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 shadow-sm">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-2">Joined Dates</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="bg-transparent text-xs font-bold focus:outline-none w-[120px]"
                            />
                        </div>
                        <div className="text-slate-300 font-bold">/</div>
                        <div className="relative">
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="bg-transparent text-xs font-bold focus:outline-none w-[120px]"
                            />
                        </div>
                    </div>

                    {/* Search Button */}
                    <button
                        onClick={handleSearchClick}
                        className="px-8 py-3.5 bg-amber-400 hover:bg-amber-500 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-amber-400/20 active:scale-[0.98] whitespace-nowrap"
                    >
                        Search Range
                    </button>

                    {/* Excel Button */}
                    {hasSearched && (dateFrom || dateTo) && (
                        <button
                            onClick={downloadCustomersExcel}
                            className="px-8 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-xs transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-[0.98] whitespace-nowrap animate-in fade-in slide-in-from-left-2"
                        >
                            <IconDownload size={16} />
                            Excel Export
                        </button>
                    )}

                    <div className="flex-1" />

                    <div className="relative w-full md:w-[300px]">
                        <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                            <IconSearch size={18} />
                        </div>
                        <input
                            type="text"
                            placeholder="Quick search by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/10 focus:bg-white focus:border-brand-primary/30 transition-all text-xs font-bold"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Table Toolbar */}
                <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-4">
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Registry Records
                    </p>
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-slate-500">
                            Total Base: <span className="text-slate-900">{filteredCustomers.length}</span> Members
                        </p>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Customer Info</th>
                                <th className="px-6 py-4">Contact Details</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 text-right">Joined Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary mx-auto"></div>
                                    </td>
                                </tr>
                            ) : currentItems.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="py-20 text-center text-slate-400 font-medium">
                                        No customers found matching your criteria.
                                    </td>
                                </tr>
                            ) : currentItems.map((customer) => (
                                <tr key={customer.id} className="group hover:bg-brand-secondary/30 transition-colors cursor-default">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-brand-primary/10 flex items-center justify-center text-brand-primary shadow-sm ring-4 ring-white group-hover:scale-110 transition-transform">
                                                <IconUserCircle size={22} />
                                            </div>
                                            <div>
                                                <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{customer.first_name} {customer.last_name}</p>
                                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ID: {customer.id}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-slate-600 text-sm font-medium">
                                            <IconMail size={16} className="text-slate-400" />
                                            {customer.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-600">
                                            Active Member
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 text-slate-400 text-[11px] font-bold">
                                            <IconCalendar size={14} />
                                            {new Date(customer.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between mt-auto">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 border border-transparent hover:border-slate-200"
                        >
                            <IconChevronLeft size={18} />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${currentPage === i + 1
                                        ? "bg-brand-primary text-white shadow-lg shadow-violet-200"
                                        : "text-slate-500 hover:bg-white border border-transparent hover:border-slate-200"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                        </div>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-white rounded-xl transition-all disabled:opacity-40 border border-transparent hover:border-slate-200"
                        >
                            Next
                            <IconChevronRight size={18} />
                        </button>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default CustomerManagement;
