import { LayoutDashboard, Users, PieChart, Settings, ShoppingBag, Target, LogOut, ChevronDown, Table as TableIcon } from "lucide-react";

interface SidebarProps {
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
    return (
        <div className="hidden lg:flex w-72 bg-white border-r border-sky-100 flex-col justify-between h-screen fixed left-0 top-0 z-50 shadow-sm">
            <div>
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-sky-200">
                            <Target className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-900 leading-none">Shopper<span className="text-sky-500">DNA</span></h1>
                            <p className="text-xs text-sky-400 font-medium mt-1">Analytics v2.0</p>
                        </div>
                    </div>

                    <div className="relative">
                        <button className="w-full flex items-center justify-between px-4 py-3 bg-sky-50 hover:bg-sky-100 rounded-xl border border-sky-100 transition-colors text-left group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-white text-sky-600 flex items-center justify-center text-xs font-bold shadow-sm">
                                    JD
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">John Doe</p>
                                    <p className="text-xs text-slate-400 group-hover:text-sky-500">Admin Workspace</p>
                                </div>
                            </div>
                            <ChevronDown className="w-4 h-4 text-sky-300 group-hover:text-sky-500 transition-colors" />
                        </button>
                    </div>
                </div>

                <div className="px-6 py-4">
                    <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
                    <nav className="space-y-1">
                        <NavItem icon={<LayoutDashboard />} label="Dashboard" id="dashboard" activeTab={activeTab} onClick={onTabChange} />
                        <NavItem icon={<Users />} label="Audience Segments" id="segments" activeTab={activeTab} onClick={onTabChange} />
                        <NavItem icon={<TableIcon />} label="Data View" id="data" activeTab={activeTab} onClick={onTabChange} />
                    </nav>
                </div>
            </div>

            <div className="p-6 border-t border-sky-50">
                <button className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-500 hover:text-red-500 transition-colors w-full rounded-xl hover:bg-red-50">
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </div>
    );
}

function NavItem({ icon, label, id, activeTab, onClick }: { icon: any, label: string, id: string, activeTab: string, onClick: (t: string) => void }) {
    const active = activeTab === id;
    return (
        <button
            onClick={() => onClick(id)}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-md shadow-sky-200' : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50'}`}
        >
            <span className={`w-5 h-5 ${active ? 'text-white' : 'text-slate-400 group-hover:text-sky-500'}`}>{icon}</span>
            {label}
        </button>
    )
}
