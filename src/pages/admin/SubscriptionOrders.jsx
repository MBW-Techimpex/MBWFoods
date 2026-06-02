import React, { useState, useEffect } from "react";
import API_BASE from "../../config";
import { useNotification } from "../../context/NotificationContext";
import AdminLayout from "../../components/admin/AdminLayout";
import { getImageUrl } from "../../utils/imageHelper";
import {
  IconCalendar,
  IconClock,
  IconUser,
  IconMapPin,
  IconPhone,
  IconTruck,
  IconPrinter,
  IconCoffee,
  IconIdBadge,
  IconCheckbox,
  IconCircleCheck,
  IconCircleDot,
  IconRefresh,
  IconCircleX,
} from "@tabler/icons-react";

// ─── Helper: local YYYY-MM-DD string (no UTC shift) ───────────────────────────
function localDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ─── Helper: nice label from YYYY-MM-DD ───────────────────────────────────────
function formatDate(str) {
  if (!str) return "—";
  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export default function SubscriptionOrders() {
  const { showNotification } = useNotification();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("MORNING PREP LIST");

  // Default to today's date (local, not UTC)
  const [prepDate, setPrepDate] = useState(() => {
    const today = new Date();
    if (today.getFullYear() < 2026) return "2026-05-31";
    return localDateStr(today);
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/orders/admin/all`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setOrders(data || []);
      } else {
        showNotification("Failed to fetch orders", "error");
      }
    } catch (err) {
      console.error("Error loading orders:", err);
      showNotification("Failed to load subscription orders", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // ── MORNING PREP LIST filter ───────────────────────────────────────────────
  const prepListItems = [];
  orders.forEach((order) => {
    if (order.status?.toLowerCase() === "cancelled") return;
    (order.items || []).forEach((item) => {
      if (item.options?.isSubscription) {
        let activeDelivery = null;

        if (Array.isArray(item.options.deliveries)) {
          activeDelivery = item.options.deliveries.find((d) => d.date === prepDate);
        } else {
          const startStr = order.delivery_date || null;
          if (startStr) {
            const [sy, sm, sd] = startStr.split("-").map(Number);
            const startDate = new Date(sy, sm - 1, sd);
            const endDate = new Date(sy, sm - 1, sd + 6);
            const [py, pm, pd] = prepDate.split("-").map(Number);
            const checkDate = new Date(py, pm - 1, pd);
            if (checkDate >= startDate && checkDate <= endDate) {
              const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
              const dayName = days[checkDate.getDay()];
              const dish = item.options.menu?.[dayName];
              if (dish) {
                const statuses = item.options.deliveryStatuses || {};
                activeDelivery = { date: prepDate, dayName, dish, status: statuses[dayName] || "Pending" };
              }
            }
          }
        }

        if (activeDelivery) {
          const subCat = (item.options.plan || item.name || "").toLowerCase();
          let defaultTime = "08:30 AM", label = "BREAKFAST";
          if (subCat.includes("lunch")) { defaultTime = "12:30 PM"; label = "LUNCH"; }
          else if (subCat.includes("dinner")) { defaultTime = "07:30 PM"; label = "DINNER"; }

          prepListItems.push({
            orderId: order.id,
            orderItemId: item.id,
            customerName: order.customer_name || "Guest User",
            customerPhone: order.customer_phone || "N/A",
            customerEmail: order.customer_email || "N/A",
            city: order.shipping_city || "Chennai",
            address: order.shipping_address || "N/A",
            planName: item.options.plan || item.name,
            dish: activeDelivery.dish,
            status: activeDelivery.status,
            dayName: activeDelivery.dayName,
            timeSlot: order.time_slot || defaultTime,
            deliveryLabel: label,
            image: item.image || "/uploads/subscription_banner.png",
          });
        }
      }
    });
  });

  // ── ACTIVE MEMBERSHIPS list ────────────────────────────────────────────────
  const today = localDateStr(new Date());
  const activeMembers = [];
  orders.forEach((order) => {
    if (order.status?.toLowerCase() === "cancelled") return;
    (order.items || []).forEach((item) => {
      if (!item.options?.isSubscription) return;

      const deliveries = Array.isArray(item.options.deliveries) ? item.options.deliveries : [];
      if (deliveries.length === 0) return;

      const startDate = deliveries[0].date;
      const endDate = deliveries[deliveries.length - 1].date;

      // Only show if today is within or before the subscription window
      if (today > endDate) return;

      const delivered = deliveries.filter((d) =>
        ["delivered", "dispatched"].includes(d.status?.toLowerCase())
      ).length;
      const total = deliveries.length;
      const remaining = total - delivered;

      const subCat = (item.options.plan || item.name || "").toLowerCase();
      let mealLabel = "Breakfast";
      let mealColor = "orange";
      if (subCat.includes("lunch")) { mealLabel = "Lunch"; mealColor = "teal"; }
      else if (subCat.includes("dinner")) { mealLabel = "Dinner"; mealColor = "violet"; }

      activeMembers.push({
        orderId: order.id,
        orderItemId: item.id,
        customerName: order.customer_name || "Guest User",
        customerPhone: order.customer_phone || "N/A",
        customerEmail: order.customer_email || "N/A",
        city: order.shipping_city || "Chennai",
        address: order.shipping_address || "N/A",
        planName: item.options.plan || item.name,
        mealLabel,
        mealColor,
        startDate,
        endDate,
        deliveries,
        delivered,
        remaining,
        total,
        image: item.image || "/uploads/subscription_banner.png",
      });
    });
  });

  // ── Status update handler ──────────────────────────────────────────────────
  const handleUpdateStatus = async (orderItemId, newStatus, dayName) => {
    try {
      const res = await fetch(`${API_BASE}/api/orders/item/${orderItemId}/subscription-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day: dayName, date: prepDate, status: newStatus }),
        credentials: "include",
      });
      if (res.ok) {
        showNotification(`Kitchen status updated to ${newStatus}`, "success");
        fetchOrders();
      } else {
        const data = await res.json();
        showNotification(data.message || "Failed to update kitchen status", "error");
      }
    } catch (err) {
      console.error("Status update error:", err);
      showNotification("Network error updating status", "error");
    }
  };

  const handlePrint = () => window.print();

  // ── Colour palettes for meal type ─────────────────────────────────────────
  const mealPalette = {
    orange: {
      badge: "bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/30",
      bar: "bg-orange-500",
      ring: "ring-orange-200 dark:ring-orange-900/40",
      avatar: "bg-orange-100 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400",
    },
    teal: {
      badge: "bg-teal-50 text-teal-600 border-teal-200 dark:bg-teal-950/30 dark:text-teal-400 dark:border-teal-900/30",
      bar: "bg-teal-500",
      ring: "ring-teal-200 dark:ring-teal-900/40",
      avatar: "bg-teal-100 text-teal-600 dark:bg-teal-950/30 dark:text-teal-400",
    },
    violet: {
      badge: "bg-violet-50 text-violet-600 border-violet-200 dark:bg-violet-950/30 dark:text-violet-400 dark:border-violet-900/30",
      bar: "bg-violet-500",
      ring: "ring-violet-200 dark:ring-violet-900/40",
      avatar: "bg-violet-100 text-violet-600 dark:bg-violet-950/30 dark:text-violet-400",
    },
  };

  const statusColor = (s) => {
    const st = (s || "Pending").toLowerCase();
    if (st === "delivered") return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (st === "dispatched") return "text-blue-600 bg-blue-50 border-blue-200";
    if (st === "skipped") return "text-slate-500 bg-slate-100 border-slate-200";
    if (st === "cancelled") return "text-rose-600 bg-rose-50 border-rose-200";
    return "text-amber-600 bg-amber-50 border-amber-200";
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-8 max-w-7xl mx-auto font-sans">

        {/* Tabs — only 2 tabs now */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 pb-px">
          {[
            { id: "MORNING PREP LIST", icon: IconCoffee, label: "MORNING PREP LIST" },
            { id: "ACTIVE MEMBERSHIPS", icon: IconIdBadge, label: "ACTIVE MEMBERSHIPS" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-xs font-black tracking-widest uppercase border-b-2 transition-all ${
                activeTab === tab.id
                  ? "border-orange-500 text-orange-600 dark:text-orange-400"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              <tab.icon size={16} className={activeTab === tab.id ? "text-orange-500" : "text-slate-300"} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══════════════════════ MORNING PREP LIST ══════════════════════ */}
        {activeTab === "MORNING PREP LIST" && (
          <div className="space-y-6">
            {/* Date & Actions bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/20 flex items-center justify-center text-orange-500 shrink-0 border border-orange-100/30">
                  <IconCalendar size={22} />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest block mb-1">Select Prep Date</span>
                  <input
                    type="date"
                    value={prepDate}
                    onChange={(e) => setPrepDate(e.target.value)}
                    className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 font-bold text-slate-700 dark:text-slate-300 text-sm outline-none cursor-pointer focus:border-orange-500"
                  />
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                {/* Actions removed */}
              </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] shadow-sm overflow-hidden p-6">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Compiling Prep Sheet...</p>
                </div>
              ) : prepListItems.length === 0 ? (
                <div className="py-20 text-center">
                  <IconCoffee className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
                  <h3 className="text-lg font-serif text-slate-900 dark:text-slate-100">No preps scheduled</h3>
                  <p className="text-sm text-slate-400 font-light mt-1">
                    There are no subscription preps scheduled for {prepDate.split("-").reverse().join("/")}.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[1000px]">
                    <thead>
                      <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 border-b border-slate-50 dark:border-slate-800 bg-slate-50/20 dark:bg-slate-950/20">
                        <th className="px-6 py-5">Delivery Details</th>
                        <th className="px-6 py-5">Food Item</th>
                        <th className="px-6 py-5">Subscriber</th>
                        <th className="px-6 py-5">Address</th>
                        <th className="px-6 py-5 text-right pr-12">Kitchen Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                      {prepListItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition-colors">
                          <td className="px-6 py-6">
                            <div className="space-y-1.5">
                              <span className="px-3 py-1 bg-sky-50 dark:bg-sky-950/30 text-sky-500 border border-sky-100/30 rounded-lg text-[9px] font-black uppercase tracking-widest inline-block">
                                {item.deliveryLabel}
                              </span>
                              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                                <IconClock size={13} className="text-slate-300" /> {item.timeSlot}
                              </p>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 bg-slate-50">
                                <img src={getImageUrl(item.image)} alt="" className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h5 className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-snug">{item.dish}</h5>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-bold">Ref Order #{item.orderId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{item.customerName}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <IconPhone size={12} className="text-slate-300" /> {item.customerPhone}
                            </p>
                          </td>
                          <td className="px-6 py-6">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1">
                              <IconMapPin size={13} className="text-slate-300 shrink-0" /> {item.city}
                            </p>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed mt-0.5">{item.address}</p>
                          </td>
                          <td className="px-6 py-6 text-right pr-12">
                            <select
                              value={item.status || "Pending"}
                              onChange={(e) => handleUpdateStatus(item.orderItemId, e.target.value, item.dayName)}
                              className={`px-4 py-2 border rounded-xl font-black text-xs outline-none cursor-pointer text-center transition-all ${statusColor(item.status)}`}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Dispatched">Dispatched</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                              <option value="Skipped">Skipped</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════ ACTIVE MEMBERSHIPS ══════════════════════ */}
        {activeTab === "ACTIVE MEMBERSHIPS" && (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Subscriptions</p>
                <p className="text-3xl font-serif font-black text-slate-900 dark:text-slate-100">
                  {loading ? "—" : activeMembers.length}
                  <span className="text-sm font-bold text-slate-400 ml-2">subscribers</span>
                </p>
              </div>
              <button
                onClick={fetchOrders}
                className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-2xl transition-all text-xs font-black uppercase tracking-wider w-fit"
              >
                <IconRefresh size={15} /> Refresh
              </button>
            </div>

            {/* Cards grid */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <div className="w-12 h-12 border-4 border-slate-100 border-t-orange-500 rounded-full animate-spin" />
                <p className="text-xs font-black uppercase text-slate-400 tracking-widest">Loading memberships...</p>
              </div>
            ) : activeMembers.length === 0 ? (
              <div className="py-20 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem]">
                <IconIdBadge className="mx-auto text-slate-200 dark:text-slate-800 mb-4" size={48} />
                <h3 className="text-lg font-serif text-slate-900 dark:text-slate-100">No active memberships</h3>
                <p className="text-sm text-slate-400 font-light mt-1">No customers have an active subscription today.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {activeMembers.map((m, idx) => {
                  const pal = mealPalette[m.mealColor];
                  const pct = Math.round((m.delivered / m.total) * 100);
                  return (
                    <div
                      key={idx}
                      className={`bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm ring-1 ${pal.ring} hover:shadow-md transition-all`}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4 mb-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg font-black shrink-0 ${pal.avatar}`}>
                            {m.customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-tight">{m.customerName}</p>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <IconPhone size={11} /> {m.customerPhone}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${pal.badge}`}>
                          {m.mealLabel} Plan
                        </span>
                      </div>

                      {/* Timeline */}
                      <div className="flex items-center gap-3 mb-4 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        <IconCalendar size={13} className="text-slate-300 shrink-0" />
                        <span>{formatDate(m.startDate)}</span>
                        <span className="text-slate-300">→</span>
                        <span>{formatDate(m.endDate)}</span>
                        <span className={`ml-auto px-2.5 py-1 rounded-lg border text-[9px] font-black uppercase ${
                          m.remaining === 0
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-sky-50 text-sky-600 border-sky-100"
                        }`}>
                          {m.remaining === 0 ? "Completed" : `${m.remaining} left`}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="mb-4">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                          <span>{m.delivered} delivered</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${pal.bar}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {/* Daily delivery dots */}
                      <div className="flex gap-2 flex-wrap">
                        {m.deliveries.map((d, di) => {
                          const st = (d.status || "Pending").toLowerCase();
                          return (
                            <div key={di} className="flex flex-col items-center gap-1" title={`${d.date} – ${d.dish} (${d.status})`}>
                              <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center ${
                                st === "delivered"
                                  ? "bg-emerald-100 border-emerald-400 text-emerald-600"
                                  : st === "dispatched"
                                    ? "bg-blue-100 border-blue-400 text-blue-600"
                                    : st === "skipped"
                                      ? "bg-slate-100 border-slate-300 text-slate-400"
                                      : st === "cancelled"
                                        ? "bg-rose-100 border-rose-300 text-rose-500"
                                        : "bg-amber-50 border-amber-200 text-amber-400"
                              }`}>
                                {st === "delivered" ? <IconCircleCheck size={14} /> :
                                 st === "dispatched" ? <IconTruck size={12} /> :
                                 st === "skipped" ? <IconCircleX size={13} /> :
                                 st === "cancelled" ? <IconCircleX size={13} /> :
                                 <IconCircleDot size={13} />}
                              </div>
                              <span className="text-[8px] text-slate-400 font-bold leading-none">{d.dayName?.slice(0,3)}</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-[10px] text-slate-400 flex items-center gap-1">
                          <IconMapPin size={11} /> {m.city} · Order #{m.orderId}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{m.address}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
