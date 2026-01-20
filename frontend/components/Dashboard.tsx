"use client";

import { useState, useMemo } from "react";
import {
    ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend, ReferenceArea, PieChart, Pie
} from "recharts";
import { BarChart, Bar } from "recharts";
import { Upload, FileText, Loader2, TrendingUp, Users, DollarSign, Activity, ChevronRight, Zap, ZoomIn, Filter, ChevronDown, Cloud, Table as TableIcon, ChevronLeft, ChevronRight as ChevronRightIcon } from "lucide-react";
import { PersonaCard } from "./PersonaCard";
import { Sidebar } from "./Sidebar";

// Sky Blue & Corporate Palette
const COLORS = ['#0ea5e9', '#3b82f6', '#6366f1', '#06b6d4', '#14b8a6', '#8b5cf6'];

export default function Dashboard() {
    const [file, setFile] = useState<File | null>(null);
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [personas, setPersonas] = useState<Record<number, string>>({});
    const [personaLoading, setPersonaLoading] = useState<Record<number, boolean>>({});

    // Navigation State
    const [activeTab, setActiveTab] = useState('dashboard');

    // Filters & Pagination
    const [selectedCluster, setSelectedCluster] = useState<number | 'all'>('all');
    const [rowsPerPage, setRowsPerPage] = useState<number | 'all'>(50);
    const [currentPage, setCurrentPage] = useState(1);

    // Range Filters (Manual "Zooming")
    const [ageRange, setAgeRange] = useState<[number, number]>([0, 100]);
    const [spendRange, setSpendRange] = useState<[number, number]>([0, 10000]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("http://localhost:8000/analyze/upload", {
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            setData(result.data);

            // Auto-set ranges based on data
            const maxAge = Math.max(...result.data.map((d: any) => d.Age));
            const maxSpend = Math.max(...result.data.map((d: any) => d['Total Spend']));
            setAgeRange([0, maxAge + 10]);
            setSpendRange([0, maxSpend + 100]);

        } catch (error) {
            console.error("Upload failed", error);
            alert("Analysis failed. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const generatePersona = async (clusterId: number, clusterData: any[]) => {
        setPersonaLoading(prev => ({ ...prev, [clusterId]: true }));

        const stats = {
            avg_age: clusterData.reduce((acc, curr) => acc + curr.Age, 0) / clusterData.length,
            avg_spend: clusterData.reduce((acc, curr) => acc + curr['Total Spend'], 0) / clusterData.length,
            avg_items: clusterData.reduce((acc, curr) => acc + curr['Items Purchased'], 0) / clusterData.length,
            avg_rating: clusterData.reduce((acc, curr) => acc + curr['Average Rating'], 0) / clusterData.length,
            // New Stats for Deep Analysis
            avg_days_since: clusterData.reduce((acc, curr) => acc + curr['Days Since Last Purchase'], 0) / clusterData.length,
            discount_usage: (clusterData.filter(d => d['Discount Applied'] === true || d['Discount Applied'] === 'TRUE' || d['Discount Applied'] === 1).length / clusterData.length) * 100,
            // Calculate Top Category
            top_category: Object.entries(clusterData.reduce((acc: any, curr: any) => {
                const cat = curr['Category'] || 'Unknown';
                acc[cat] = (acc[cat] || 0) + 1;
                return acc;
            }, {})).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'Mixed',
            // Simple sentiment proxy from rating
            sentiment_vibe: (clusterData.reduce((acc, curr) => acc + curr['Average Rating'], 0) / clusterData.length) > 3.5 ? 'Positive' : 'Needs Improvement'
        };

        try {
            const response = await fetch(`http://localhost:8000/analyze/persona?cluster_id=${clusterId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(stats)
            });
            const result = await response.json();
            setPersonas(prev => ({ ...prev, [clusterId]: result.description }));
        } catch (error) {
            console.error("Persona generation failed", error);
        } finally {
            setPersonaLoading(prev => ({ ...prev, [clusterId]: false }));
        }
    };

    const clusters = [...new Set(data.map(d => d.Cluster))].sort();

    // Filter Logic
    const filteredData = useMemo(() => {
        return data.filter(d => {
            const matchCluster = selectedCluster === 'all' || d.Cluster === selectedCluster;
            const matchAge = d.Age >= ageRange[0] && d.Age <= ageRange[1];
            const matchSpend = d['Total Spend'] >= spendRange[0] && d['Total Spend'] <= spendRange[1];
            return matchCluster && matchAge && matchSpend;
        });
    }, [data, selectedCluster, ageRange, spendRange]);

    const displayedClusters = selectedCluster === 'all'
        ? clusters
        : [selectedCluster];

    // Pagination Logic
    const totalPages = rowsPerPage === 'all' ? 1 : Math.ceil(filteredData.length / rowsPerPage);
    const paginatedData = rowsPerPage === 'all'
        ? filteredData
        : filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

    const totalCustomers = data.length;
    const avgSpend = data.length ? data.reduce((acc, curr) => acc + curr['Total Spend'], 0) / data.length : 0;

    return (
        <div className="min-h-screen bg-sky-50/50 font-sans text-slate-600 flex">
            <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

            <div className="flex-1 lg:ml-72 relative z-0">
                <header className="px-10 py-6 flex items-center justify-between sticky top-0 z-40 bg-sky-50/80 backdrop-blur-md">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 capitalize">{activeTab.replace('-', ' ')}</h2>
                        <p className="text-sm text-slate-400 font-medium">Analytics & Data Intelligence</p>
                    </div>

                    <div className="flex items-center gap-4">
                        {data.length > 0 && activeTab !== 'data' && (
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                    <Filter className="w-4 h-4 text-sky-400" />
                                </div>
                                <select
                                    value={selectedCluster}
                                    onChange={(e) => setSelectedCluster(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                    className="appearance-none pl-10 pr-10 py-2.5 bg-white border border-sky-100 rounded-xl text-sm font-semibold text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer hover:border-sky-300 transition-colors"
                                >
                                    <option value="all">All Segments</option>
                                    {clusters.map(c => (
                                        <option key={c} value={c}>Cluster {c}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                    <ChevronDown className="w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                        )}

                        <div className="h-10 w-10 bg-white rounded-full border border-sky-100 flex items-center justify-center shadow-sm">
                            <Users className="w-5 h-5 text-sky-400" />
                        </div>
                    </div>
                </header>

                <main className="px-10 pb-10 space-y-8 max-w-[1600px] mx-auto">

                    {!data.length && (
                        <div className="min-h-[70vh] flex flex-col items-center justify-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="bg-white p-12 rounded-[40px] shadow-2xl shadow-sky-200/40 border border-white text-center max-w-xl w-full">
                                <div className="w-20 h-20 bg-sky-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                                    <Cloud className="w-10 h-10 text-sky-500" />
                                </div>
                                <h1 className="text-3xl font-bold text-slate-800 mb-3">Upload Data</h1>
                                <p className="text-slate-500 mb-8">Drag and drop your consumer dataset CSV to unlock powerful AI-driven insights.</p>
                                <label className="block w-full cursor-pointer group">
                                    <input type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                                    <div className="w-full py-4 border-2 border-dashed border-sky-100 rounded-2xl flex items-center justify-center gap-2 group-hover:border-sky-500 group-hover:bg-sky-50 transition-all">
                                        <Upload className="w-5 h-5 text-sky-300 group-hover:text-sky-600" />
                                        <span className="text-sm font-semibold text-sky-400 group-hover:text-sky-700">{file ? file.name : "Choose CSV File"}</span>
                                    </div>
                                </label>
                                <button onClick={handleUpload} disabled={!file || loading} className="w-full mt-4 py-4 bg-sky-500 text-white rounded-2xl font-bold text-lg hover:bg-sky-600 transition-all shadow-xl shadow-sky-400/30 disabled:opacity-50 flex items-center justify-center gap-2">
                                    {loading ? <Loader2 className="animate-spin" /> : "Start Analysis"}
                                    {!loading && <ChevronRight className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    )}

                    {data.length > 0 && (
                        <div className="space-y-8 animate-in fade-in transform duration-700">

                            {activeTab === 'dashboard' && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <KPICard title="Total Analyzed" value={filteredData.length.toLocaleString()} icon={<Users />} sub="Displayed Customers" />
                                        <KPICard title="Avg Spend" value={`$${avgSpend.toFixed(0)}`} icon={<DollarSign />} sub="Per Customer" />
                                        <KPICard title="Segments" value={displayedClusters.length.toString()} icon={<Activity />} sub="Identified Groups" />
                                    </div>

                                    {/* Range Filters for Graph Control */}
                                    <div className="bg-white p-6 rounded-3xl border border-sky-100 shadow-sm flex flex-col md:flex-row gap-8">
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Filter by Age: {ageRange[0]} - {ageRange[1]}</label>
                                            <input type="range" min="0" max="100" value={ageRange[1]} onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])} className="w-full accent-sky-500" />
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Filter by Spend: ${spendRange[0]} - ${spendRange[1]}</label>
                                            <input type="range" min="0" max="10000" step="100" value={spendRange[1]} onChange={(e) => setSpendRange([spendRange[0], parseInt(e.target.value)])} className="w-full accent-sky-500" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                        <ChartCard title="Wealth Distribution">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#cbd5e1" />
                                                    <XAxis type="number" dataKey="Age" name="Age" unit=" yrs" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} domain={[ageRange[0], ageRange[1]]} tickLine={false} axisLine={false} />
                                                    <YAxis type="number" dataKey="Total Spend" name="Spend" unit="$" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} domain={[spendRange[0], spendRange[1]]} tickLine={false} axisLine={false} />
                                                    <Tooltip cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }} contentStyle={{ backgroundColor: '#fff', borderColor: '#e0f2fe', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
                                                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                                                    {displayedClusters.map((clusterId, index) => (
                                                        <Scatter key={clusterId} name={`Segment ${clusterId}`} data={filteredData.filter(d => d.Cluster === clusterId)} fill={COLORS[clusterId % COLORS.length]} />
                                                    ))}
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </ChartCard>

                                        <ChartCard title="Engagement Matrix">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#cbd5e1" />
                                                    <XAxis type="number" dataKey="Items Purchased" name="Items" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} domain={['auto', 'auto']} tickLine={false} axisLine={false} />
                                                    <YAxis type="number" dataKey="Average Rating" name="Rating" domain={[0, 5]} stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 12 }} tickLine={false} axisLine={false} />
                                                    <Tooltip cursor={{ stroke: '#0ea5e9', strokeWidth: 1 }} contentStyle={{ backgroundColor: '#fff', borderColor: '#e0f2fe', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', color: '#0f172a' }} />
                                                    {displayedClusters.map((clusterId, index) => (
                                                        <Scatter key={clusterId} name={`Segment ${clusterId}`} data={filteredData.filter(d => d.Cluster === clusterId)} fill={COLORS[clusterId % COLORS.length]} />
                                                    ))}
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </ChartCard>
                                    </div>

                                    {/* ROW 2: Deep Dive Analytics (Membership & Recency) */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <ChartCard title="Membership Breakdown">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={Object.entries(filteredData.reduce((acc: any, curr: any) => {
                                                    acc[curr['Membership Type']] = (acc[curr['Membership Type']] || 0) + 1;
                                                    return acc;
                                                }, {})).map(([name, value]) => ({ name, value }))}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#cbd5e1" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px' }} cursor={{ fill: '#f0f9ff' }} />
                                                    <Bar dataKey="value" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>



                                        <ChartCard title="Satisfaction Levels">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={Object.entries(filteredData.reduce((acc: any, curr: any) => {
                                                    const key = curr['Satisfaction Level'] || 'Unknown';
                                                    acc[key] = (acc[key] || 0) + 1;
                                                    return acc;
                                                }, {})).map(([name, value]) => ({ name, value }))}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#cbd5e1" />
                                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                                    <Tooltip contentStyle={{ borderRadius: '12px' }} cursor={{ fill: '#f0f9ff' }} />
                                                    <Bar dataKey="value" fill="#14b8a6" radius={[6, 6, 0, 0]} barSize={40} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartCard>

                                        <ChartCard title="Category Affinity">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={Object.entries(filteredData.reduce((acc: any, curr: any) => {
                                                            const cat = curr['Category'] || 'Other';
                                                            acc[cat] = (acc[cat] || 0) + 1;
                                                            return acc;
                                                        }, {})).map(([name, value]) => ({ name, value }))}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={80}
                                                        paddingAngle={5}
                                                        dataKey="value"
                                                    >
                                                        {COLORS.map((color, index) => (
                                                            <Cell key={`cell-${index}`} fill={color} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip contentStyle={{ borderRadius: '12px' }} />
                                                    <Legend verticalAlign="bottom" height={36} iconType="circle" />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </ChartCard>

                                        <ChartCard title="Churn Risk (Recency)">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} stroke="#cbd5e1" />
                                                    <XAxis type="number" dataKey="Days Since Last Purchase" name="Days Ago" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                                                    <YAxis type="number" dataKey="Total Spend" name="Spend" stroke="#94a3b8" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} axisLine={false} />
                                                    <Tooltip cursor={{ stroke: '#f43f5e', strokeWidth: 1 }} contentStyle={{ borderRadius: '12px' }} />
                                                    {displayedClusters.map((clusterId, index) => (
                                                        <Scatter key={clusterId} name={`Segment ${clusterId}`} data={filteredData.filter(d => d.Cluster === clusterId)} fill={COLORS[clusterId % COLORS.length]} />
                                                    ))}
                                                </ScatterChart>
                                            </ResponsiveContainer>
                                        </ChartCard>
                                    </div>
                                </>
                            )}

                            {(activeTab === 'dashboard' || activeTab === 'segments') && (
                                <div>
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-slate-800">AI Persona Profiles</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                                        {displayedClusters.map((clusterId) => {
                                            const clusterRows = data.filter(d => d.Cluster === clusterId);
                                            const stats = {
                                                avg_age: clusterRows.reduce((acc, curr) => acc + curr.Age, 0) / clusterRows.length,
                                                avg_spend: clusterRows.reduce((acc, curr) => acc + curr['Total Spend'], 0) / clusterRows.length,
                                                avg_items: clusterRows.reduce((acc, curr) => acc + curr['Items Purchased'], 0) / clusterRows.length,
                                                avg_rating: clusterRows.reduce((acc, curr) => acc + curr['Average Rating'], 0) / clusterRows.length,
                                            };
                                            return (
                                                <PersonaCard key={clusterId} clusterId={clusterId as number} stats={stats} description={personas[clusterId as number]} loading={personaLoading[clusterId as number]} onGenerate={() => generatePersona(clusterId as number, clusterRows)} />
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'data' && (
                                <div className="bg-white rounded-3xl border border-sky-100 shadow-sm overflow-hidden flex flex-col">
                                    <div className="p-6 border-b border-slate-100 flex flex-wrap gap-4 justify-between items-center bg-sky-50/30">
                                        <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                            <TableIcon className="w-5 h-5 text-sky-500" />
                                            Raw Dataset
                                        </h3>

                                        {/* Rows Per Page Selector */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-slate-400 uppercase">Rows:</span>
                                            <div className="flex bg-white rounded-lg border border-sky-100 p-1">
                                                {[10, 50, 100, 'all'].map((opt) => (
                                                    <button
                                                        key={opt}
                                                        onClick={() => { setRowsPerPage(opt as any); setCurrentPage(1); }}
                                                        className={`px-3 py-1 rounded-md text-xs font-bold transition-colors ${rowsPerPage === opt ? 'bg-sky-500 text-white' : 'text-slate-500 hover:bg-sky-50'}`}
                                                    >
                                                        {opt === 'all' ? 'All' : opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="overflow-x-auto flex-1">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100 sticky top-0">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold">ID</th>
                                                    <th className="px-6 py-4 font-bold">Age</th>
                                                    <th className="px-6 py-4 font-bold">Gender</th>
                                                    <th className="px-6 py-4 font-bold">Spend</th>
                                                    <th className="px-6 py-4 font-bold">Items</th>
                                                    <th className="px-6 py-4 font-bold">Cluster</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-50">
                                                {paginatedData.map((row, i) => (
                                                    <tr key={i} className="hover:bg-sky-50/50 transition-colors">
                                                        <td className="px-6 py-4 font-medium text-slate-900">{row['Customer ID'] || i}</td>
                                                        <td className="px-6 py-4 text-slate-600">{row.Age}</td>
                                                        <td className="px-6 py-4 text-slate-600">{row.Gender}</td>
                                                        <td className="px-6 py-4 text-slate-600 font-medium text-emerald-600">${row['Total Spend']}</td>
                                                        <td className="px-6 py-4 text-slate-600">{row['Items Purchased']}</td>
                                                        <td className="px-6 py-4">
                                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-800">
                                                                Cluster {row.Cluster}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination Controls */}
                                    {rowsPerPage !== 'all' && (
                                        <div className="p-4 border-t border-slate-100 flex justify-between items-center bg-slate-50/50">
                                            <p className="text-xs text-slate-400 font-medium">Page {currentPage} of {totalPages}</p>
                                            <div className="flex gap-2">
                                                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                                                </button>
                                                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors">
                                                    <ChevronRightIcon className="w-4 h-4 text-slate-600" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div >
        </div >
    );
}

function KPICard({ title, value, icon, sub }: { title: string, value: string, icon: any, sub: string }) {
    return (
        <div className="bg-white border border-sky-100 p-6 rounded-3xl relative overflow-hidden group hover:shadow-xl hover:shadow-sky-100/50 hover:border-sky-300 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-wider mb-1">{title}</p>
                    <p className="text-sky-300 text-[10px] font-medium">{sub}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-sky-50 flex items-center justify-center text-sky-400 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                    {icon}
                </div>
            </div>
            <h3 className="text-3xl font-extrabold text-slate-800 tracking-tight">{value}</h3>
        </div>
    )
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="bg-white border border-sky-100 p-8 rounded-3xl shadow-sm hover:shadow-xl hover:shadow-sky-100/50 transition-all duration-500">
            <div className="flex justify-between items-center mb-8">
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <div className="h-[350px] w-full">
                {children}
            </div>
        </div>
    )
}
