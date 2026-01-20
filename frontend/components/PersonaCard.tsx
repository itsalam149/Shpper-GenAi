import { Sparkles, Users, TrendingUp, ShoppingCart, Star, Zap, User } from "lucide-react";

interface PersonaCardProps {
    clusterId: number;
    stats: any;
    description: string;
    onGenerate: () => void;
    loading: boolean;
}

export function PersonaCard({ clusterId, stats, description, onGenerate, loading }: PersonaCardProps) {
    return (
        <div className="group relative bg-white/80 backdrop-blur-xl border border-sky-100 shadow-xl shadow-sky-100/50 rounded-3xl overflow-hidden hover:scale-[1.02] transition-all duration-300 flex flex-col h-full hover:border-sky-300">

            {/* Decorative gradient blob */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-sky-200 to-cyan-200 rounded-full opacity-30 blur-3xl group-hover:opacity-60 transition-opacity"></div>

            {/* Header */}
            <div className="relative p-6 pb-4 flex items-start justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 shadow-sm flex items-center justify-center text-sky-600 group-hover:bg-sky-500 group-hover:text-white transition-colors">
                        <User className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-bold uppercase tracking-wider border border-sky-100">
                                Segment {clusterId}
                            </span>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight">
                            {description ? description.split('\n')[0].replace('# ', '') : `Cluster #${clusterId}`}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="px-6 py-2 grid grid-cols-2 gap-3 relative z-10">
                <StatPill label="Avg Spend" value={`$${stats.avg_spend?.toFixed(0)}`} icon={<TrendingUp className="w-3 h-3" />} />
                <StatPill label="Avg Age" value={Math.round(stats.avg_age)} icon={<Users className="w-3 h-3" />} />
                <StatPill label="Items" value={Math.round(stats.avg_items)} icon={<ShoppingCart className="w-3 h-3" />} />
                <StatPill label="Rating" value={stats.avg_rating?.toFixed(1)} icon={<Star className="w-3 h-3" />} />
            </div>

            {/* AI Content */}
            <div className="flex-1 p-6 relative z-10 flex flex-col">
                {description ? (
                    <div className="flex-1 bg-sky-50/50 rounded-2xl p-4 border border-sky-100 text-sm text-slate-600 prose prose-sm prose-p:my-1 prose-headings:text-sky-900 prose-strong:text-sky-700 shadow-inner">
                        <div dangerouslySetInnerHTML={{ __html: description.split('\n').slice(1).join('\n').replace(/\n/g, '<br />') }} />
                    </div>
                ) : (
                    <div className="flex-1 border-2 border-dashed border-sky-100 rounded-2xl flex flex-col items-center justify-center p-4 text-center group-hover:border-sky-300 transition-colors bg-white/50">
                        <Sparkles className="w-8 h-8 text-sky-200 mb-2 group-hover:text-sky-400" />
                        <p className="text-xs font-semibold text-sky-300 group-hover:text-sky-500">AI Profile Not Generated</p>
                    </div>
                )}
            </div>

            {/* Footer Button */}
            {!description && (
                <div className="p-6 pt-0 relative z-10">
                    <button
                        onClick={onGenerate}
                        disabled={loading}
                        className="w-full py-3.5 bg-sky-500 text-white rounded-xl font-semibold shadow-lg shadow-sky-200 hover:bg-sky-600 hover:shadow-sky-300 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group/btn"
                    >
                        {loading ? <span className="animate-spin">⌛</span> : <Zap className="w-4 h-4 text-white group-hover/btn:scale-110 transition-transform" />}
                        {loading ? "Analyzing..." : "Generate Insights"}
                    </button>
                </div>
            )}
        </div>
    );
}

function StatPill({ label, value, icon }: { label: string, value: any, icon: any }) {
    return (
        <div className="flex items-center gap-2 bg-white rounded-lg p-2 border border-slate-100 shadow-sm group-hover:border-sky-100 transition-colors">
            <div className="text-sky-400">{icon}</div>
            <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase leading-none mb-0.5">{label}</p>
                <p className="text-sm font-bold text-slate-700 leading-none">{value}</p>
            </div>
        </div>
    )
}
