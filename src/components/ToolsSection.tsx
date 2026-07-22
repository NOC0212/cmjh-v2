import { Wrench, Target, Users, Shuffle, Clock, Timer, QrCode, Pencil, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tools = [
    {
        id: "wheel",
        icon: Target,
        title: "隨機抽籤",
        subtitle: "轉動輪盤隨機抽選",
        gradient: "from-blue-500/20 to-blue-600/10",
        border: "border-blue-500/30",
        iconBg: "bg-blue-500/10",
        iconColor: "text-blue-500 dark:text-blue-400",
        path: "/tools/wheel",
        span: "col-span-1",
    },
    {
        id: "grouping",
        icon: Users,
        title: "分組工具",
        subtitle: "快速隨機分組",
        gradient: "from-emerald-500/20 to-emerald-600/10",
        border: "border-emerald-500/30",
        iconBg: "bg-emerald-500/10",
        iconColor: "text-emerald-500 dark:text-emerald-400",
        path: "/tools/grouping",
        span: "col-span-1",
    },
    {
        id: "order",
        icon: Shuffle,
        title: "順序工具",
        subtitle: "隨機排列順序",
        gradient: "from-violet-500/20 to-violet-600/10",
        border: "border-violet-500/30",
        iconBg: "bg-violet-500/10",
        iconColor: "text-violet-500 dark:text-violet-400",
        path: "/tools/order",
        span: "col-span-1",
    },
    {
        id: "clock",
        icon: Clock,
        title: "時鐘",
        subtitle: "全球時區實時顯示",
        gradient: "from-amber-500/20 to-amber-600/10",
        border: "border-amber-500/30",
        iconBg: "bg-amber-500/10",
        iconColor: "text-amber-500 dark:text-amber-400",
        path: "/tools/clock",
        span: "col-span-1",
    },
    {
        id: "timer",
        icon: Timer,
        title: "計時器",
        subtitle: "倒數計時與碼表",
        gradient: "from-rose-500/20 to-rose-600/10",
        border: "border-rose-500/30",
        iconBg: "bg-rose-500/10",
        iconColor: "text-rose-500 dark:text-rose-400",
        path: "/tools/timer",
        span: "col-span-1",
    },
    {
        id: "qrcode",
        icon: QrCode,
        title: "QR Code",
        subtitle: "快速生成 QR Code",
        gradient: "from-slate-500/20 to-slate-600/10",
        border: "border-slate-500/30",
        iconBg: "bg-slate-500/10",
        iconColor: "text-slate-500 dark:text-slate-400",
        path: "/tools/qrcode",
        span: "col-span-1",
    },
    {
        id: "whiteboard",
        icon: Pencil,
        title: "電子白板",
        subtitle: "即時繪圖與標記",
        gradient: "from-sky-500/20 to-sky-600/10",
        border: "border-sky-500/30",
        iconBg: "bg-sky-500/10",
        iconColor: "text-sky-500 dark:text-sky-400",
        path: "/tools/whiteboard",
        span: "col-span-2 sm:col-span-1",
    },
    {
        id: "attendance",
        icon: ClipboardCheck,
        title: "課堂點名",
        subtitle: "出席狀況管理",
        gradient: "from-indigo-500/20 to-indigo-600/10",
        border: "border-indigo-500/30",
        iconBg: "bg-indigo-500/10",
        iconColor: "text-indigo-500 dark:text-indigo-400",
        path: "/tools/attendance",
        span: "col-span-2 sm:col-span-1",
    },
];

export function ToolsSection() {
    const navigate = useNavigate();

    return (
        <section id="tools">
            <div className="flex items-center gap-3 mb-5">
                <div className="section-header-icon">
                    <Wrench className="h-4 w-4" />
                </div>
                <h2 className="text-xl font-bold text-foreground">小工具</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            type="button"
                            onClick={() => navigate(tool.path)}
                            className="group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-2xl"
                        >
                            <div className={cn(
                                "relative h-full flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border bg-gradient-to-br transition-all duration-300",
                                tool.gradient,
                                tool.border,
                                "hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
                                "bg-card/40 hover:bg-card/80"
                            )}>
                                <div className={cn(
                                    "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                                    tool.iconBg,
                                    "group-hover:scale-110 group-hover:shadow-lg group-active:scale-95"
                                )}>
                                    <Icon className={cn("h-6 w-6 sm:h-7 sm:w-7", tool.iconColor)} />
                                </div>
                                <div className="text-center">
                                    <p className="text-xs sm:text-sm font-bold text-foreground leading-tight">{tool.title}</p>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground/60 mt-0.5 leading-tight hidden sm:block">{tool.subtitle}</p>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </section>
    );
}
