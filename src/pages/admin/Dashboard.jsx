import React, { useState, useEffect } from "react";
import API_BASE from '../../config';
import { 

  IconShoppingBag, 
  IconUsers, 
  IconCar, 
  IconTrendingUp, 
  IconTrendingDown,
  IconArrowRight,
  IconPlus,
  IconDotsVertical,
  IconRefresh,
  IconSection,
  IconPhoto,
  IconCircleCheck,
  IconAlertTriangle

} from "@tabler/icons-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/admin/AdminLayout";
import { cn } from "../../lib/utils";
import { useNotification } from "../../context/NotificationContext";
import { useSettings } from "../../context/SettingsContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('Month');
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllInventory, setShowAllInventory] = useState(false);
  const { showNotification } = useNotification();
  const { settings: siteSettings, formatPrice } = useSettings();

  const fetchStats = async (selectedPeriod = period) => {
    try {
      setRefreshing(true);
      const url = `${API_BASE}/api/stats/dashboard?period=${selectedPeriod.toLowerCase()}`;
      const response = await fetch(url, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return false;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePeriodChange = async (newPeriod) => {
    setPeriod(newPeriod);
    await fetchStats(newPeriod);
  };

  const handleRestock = async () => {
    const success = await fetchStats();
    if (success) {
      showNotification("Inventory records synchronized", "success");
    } else {
      showNotification("Failed to connect to repository", "error");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex-1 flex items-center justify-center min-h-[80vh]">
          <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { 
      label: "TOTAL CUSTOMERS", 
      value: stats?.totalCustomers || "0", 
      icon: IconUsers, 
      trend: stats?.customersGrowth || "+0%", 
      isUp: true, 
      color: "bg-violet-500",
      lightColor: "bg-violet-500/10",
      textColor: "text-violet-600"
    },
    { 
      label: "ACTIVE ORDERS", 
      value: stats?.activeOrders || "0", 
      icon: IconRefresh, 
      trend: stats?.ordersGrowth || "+0%", 
      isUp: true, 
      color: "bg-orange-500",
      lightColor: "bg-orange-500/10",
      textColor: "text-orange-600"
    },
    { 
      label: "DELIVERED ORDERS", 
      value: stats?.deliveredOrders || "0", 
      icon: IconCircleCheck, 
      trend: stats?.deliveredGrowth || "+0%", 
      isUp: true, 
      color: "bg-blue-500",
      lightColor: "bg-blue-500/10",
      textColor: "text-blue-600"
    },
    { 
      label: "LOW STOCK ALERTS", 
      value: stats?.lowStockAlerts || "0", 
      icon: IconAlertTriangle, 
      trend: stats?.lowStockGrowth || "Secure", 
      isUp: !(stats?.lowStockAlerts > 0), 
      color: "bg-rose-500",
      lightColor: "bg-rose-500/10",
      textColor: "text-rose-600"
    },
  ];

  return (
    <AdminLayout>
      <div className="bg-[#fdfcff] dark:bg-slate-950 overflow-y-auto no-scrollbar pb-10">
        {/* Header */}
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-4xl font-serif text-slate-900 dark:text-slate-100 mb-2">Executive <span className="italic text-brand-primary">Overview</span></h1>
            <p className="text-slate-400 dark:text-slate-500 font-medium text-sm">Real-time performance metrics and showroom insights.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => window.location.reload()}
              title="Refresh dashboard"
              className={cn(
                "w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-brand-primary transition-all shadow-sm ring-1 ring-slate-100/50",
                refreshing && "animate-spin text-brand-primary"
              )}
            >
              <IconRefresh size={20} />
            </button>
            
            <Link 
              to="/admin/products"
              className="px-5 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-slate-200 transition-all border border-slate-200/50 shadow-sm"
            >
              Manage Shop
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          
          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-10">
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {statCards.map((stat, idx) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white p-6 rounded-[32px] border border-slate-50 shadow-sm relative overflow-hidden group hover:shadow-xl hover:shadow-slate-100 transition-all duration-500"
                >
                  <div className="relative z-10">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-6 transition-all group-hover:scale-110", stat.lightColor)}>
                      <stat.icon size={24} className={stat.textColor} />
                    </div>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className="text-2xl font-serif text-slate-900">{stat.value}</h3>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-black uppercase tracking-wider",
                        stat.isUp ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                      )}>
                        {stat.isUp ? <IconTrendingUp size={12} /> : <IconTrendingDown size={12} />}
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                  <div className="absolute bottom-[-20%] right-[-10%] w-32 h-32 bg-slate-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
                </motion.div>
              ))}
            </div>

            {/* Evolution Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-serif text-slate-900">Revenue Evolution</h3>
                  <p className="text-xs text-slate-400 font-medium">Monitoring growth trajectories over time</p>
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl">
                  {['Month', 'Quarter', 'Year'].map((p) => (
                    <button 
                      key={p} 
                      onClick={() => handlePeriodChange(p)}
                      className={cn(
                        "px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                        p === period ? "bg-white dark:bg-slate-900 text-brand-primary shadow-sm" : "text-slate-400 hover:text-slate-600 outline-none"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="h-[350px] w-full relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.revenueData}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                      dy={10}
                    />
                    <YAxis 
                      hide 
                    />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                      itemStyle={{fontSize: '12px', fontWeight: '700'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#4f46e5" 
                      strokeWidth={4}
                      fillOpacity={1} 
                      fill="url(#colorRev)" 
                      animationDuration={2000}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Table Area */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Orders Table */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-xl font-serif text-slate-900">Recent Engagement</h3>
                  <Link to="/admin/orders" className="text-brand-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-2">
                    View Full Registry <IconArrowRight size={14} />
                  </Link>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-50 dark:border-slate-800">
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acquisition</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Client</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Value</th>
                        <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {stats?.recentOrders?.map((order) => (
                        <tr key={order.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="py-4 font-bold text-sm text-slate-600 dark:text-slate-400">{order.id}</td>
                          <td className="py-4">
                            <div className="text-sm font-bold text-slate-900">{order.customer}</div>
                            <div className="text-[10px] text-slate-400 font-medium">{order.product}</div>
                          </td>
                          <td className="py-4 text-right">
                            <div className="text-sm font-black text-brand-primary">{formatPrice(order.amount)}</div>
                             <div className="text-[9px] text-slate-400 font-bold uppercase">
                                {order.date && order.date !== 'INVALID DATE' ? order.date : 
                                 (order.created_at || order.createdAt) ? new Date(order.created_at || order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                             </div>
                          </td>
                          <td className="py-4 text-center">
                            <span className={cn(
                              "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest inline-block",
                              order.status === "Delivered" ? "bg-emerald-500/10 text-emerald-600" :
                              order.status === "Pending" ? "bg-amber-500/10 text-amber-600" :
                              "bg-blue-500/10 text-blue-600"
                            )}>
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performance Bar Chart */}
              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col">
                <h3 className="text-xl font-serif text-slate-900 mb-8">Performance Comparison</h3>
                <div className="flex-1 w-full min-h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats?.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis 
                          dataKey="name" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                          dy={10}
                        />
                        <YAxis hide />
                        <Tooltip 
                          cursor={{fill: '#f8fafc'}}
                          contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '12px'}}
                        />
                        <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* Action Sidebar Area */}
          <div className="space-y-8">
            
            {/* Pie Chart Distribution */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-50 dark:border-slate-800 shadow-sm flex flex-col items-center">
              <h3 className="text-xl font-serif text-slate-900 mb-6 self-start w-full text-center">Collection Mix</h3>
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.categoryDistribution}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={8}
                      dataKey="value"
                      animationDuration={1500}
                    >
                      {stats?.categoryDistribution?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-4 px-2">
                {(() => {
                  const total = stats?.categoryDistribution?.reduce((sum, i) => sum + i.value, 0) || 1;
                  return stats?.categoryDistribution
                    ?.map(item => ({ ...item, pct: Math.round((item.value / total) * 100) }))
                    .filter(item => item.pct > 0)
                    .slice(0, showAllCategories ? undefined : 6)
                    .map(item => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                        </div>
                        <span className="text-xs font-black text-slate-900">{item.pct}%</span>
                      </div>
                    ));
                })()}
                
                {stats?.categoryDistribution?.length > 6 && (
                  <button 
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full text-center py-2 text-[10px] font-black uppercase tracking-widest text-brand-primary hover:text-indigo-900 transition-colors border-t border-slate-50 dark:border-slate-800 mt-2"
                  >
                    {showAllCategories ? "Show Less" : "Read More"}
                  </button>
                )}
              </div>
            </div>
            
            
            {/* Image Storage Limit System */}
            <div className="bg-white p-8 rounded-[40px] border border-slate-50 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-2">
                    <IconPhoto size={20} className="text-brand-primary" />
                    <h3 className="text-xl font-serif text-slate-900">Image Storage</h3>
                  </div>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                    stats?.imageStorage?.isFull ? "bg-rose-100 text-rose-600" :
                    stats?.imageStorage?.isNearLimit ? "bg-amber-100 text-amber-600" :
                    "bg-emerald-100 text-emerald-600"
                  )}>
                    {stats?.imageStorage?.isFull ? "Full" : stats?.imageStorage?.isNearLimit ? "Near Limit" : "Optimal"}
                  </span>
                </div>

                <div className="space-y-4 mb-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-2xl font-serif text-slate-900">{stats?.imageStorage?.count || 0}</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Images Stored</p>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Limit: {stats?.imageStorage?.limit || 5000}</p>
                  </div>
                  
                  <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${((stats?.imageStorage?.count || 0) / (stats?.imageStorage?.limit || 5000)) * 100}%` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className={cn(
                        "h-full rounded-full transition-colors duration-500",
                        stats?.imageStorage?.isFull ? "bg-rose-500" :
                        stats?.imageStorage?.isNearLimit ? "bg-amber-500" :
                        "bg-brand-primary"
                      )}
                    />
                  </div>
                  
                  <p className="text-[10px] text-slate-400 font-medium italic">
                    {stats?.imageStorage?.isFull 
                      ? "Limit reached. Delete images to upload more." 
                      : `Remaining: ${(stats?.imageStorage?.limit || 5000) - (stats?.imageStorage?.count || 0)} slots available`}
                  </p>
                </div>
              </div>
              <div className="absolute top-[-20%] right-[-10%] w-32 h-32 bg-slate-50 rounded-full opacity-50" />
            </div>

            {/* Quick Inventory / Alert System */}
            <div className="bg-brand-primary p-8 rounded-[40px] shadow-2xl shadow-violet-100 text-white relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-10">
                  <h3 className="text-xl font-serif">Quick Inventory</h3>
                  <button className="w-10 h-10 bg-white dark:bg-slate-900/10 rounded-xl flex items-center justify-center hover:bg-white dark:bg-slate-900/20 transition-all">
                    <IconDotsVertical size={20} />
                  </button>
                </div>

                <div className="space-y-8 mb-10">
                  {!stats?.lowStockProducts || stats?.lowStockProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center text-white/70">
                      <IconCircleCheck size={36} className="text-white mb-2" />
                      <p className="text-xs font-bold uppercase tracking-wider">Inventory Secure</p>
                      <p className="text-[10px] text-white/50 mt-1">All products are optimally stocked.</p>
                    </div>
                  ) : (
                    stats.lowStockProducts.map(prod => {
                      const lowStockThreshold = parseInt(siteSettings?.low_stock_limit || '10');
                      const percentage = Math.min(100, Math.max(5, (prod.stock / lowStockThreshold) * 100));
                      return (
                        <div key={prod.id} className="space-y-3">
                          <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-white">
                            <span className="truncate max-w-[180px]" title={prod.name}>{prod.name}</span>
                            <span className="text-white/70">Only {prod.stock} Left</span>
                          </div>
                          <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              className="h-full rounded-full bg-white"
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <button 
                  onClick={() => navigate('/admin/inventory?filter=low')}
                  className="w-full py-5 bg-white dark:bg-slate-900 text-brand-primary rounded-2xl font-black text-[10px] tracking-[0.2em] uppercase shadow-lg hover:bg-brand-secondary transition-all flex items-center justify-center gap-3"
                >
                  <IconRefresh size={18} className={refreshing ? "animate-spin" : ""} />
                  Restock Repository
                </button>
              </div>
              {/* Background Ambience */}
              <div className="absolute top-[-10%] right-[-10%] w-32 h-32 bg-white dark:bg-slate-900/5 rounded-full" />
              <div className="absolute bottom-[-20%] left-[-20%] w-48 h-48 bg-white dark:bg-slate-900/5 rounded-full group-hover:scale-110 transition-transform duration-700" />
            </div>

          </div>

        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;



