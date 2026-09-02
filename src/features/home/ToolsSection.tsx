import { Wrench, Target, Users, Shuffle, Clock, Timer, QrCode, Pencil, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tools = [
    {
        id: "wheel",
        icon: Target,
        title: "隨機抽籤",
        subtitle: "轉動輪盤隨機抽選",
        path: "/tools/wheel",
        anim: "animate-stagger-1",
        color: "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20",
    },
    {
        id: "grouping",
        icon: Users,
        title: "分組工具",
        subtitle: "快速隨機分組",
        path: "/tools/grouping",
        anim: "animate-stagger-2",
        color: "bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20",
    },
    {
        id: "order",
        icon: Shuffle,
        title: "順序工具",
        subtitle: "隨機排列順序",
        path: "/tools/order",
        anim: "animate-stagger-3",
        color: "bg-violet-500/10 text-violet-500 group-hover:bg-violet-500/20",
    },
    {
        id: "clock",
        icon: Clock,
        title: "時鐘",
        subtitle: "全球時區實時顯示",
        path: "/tools/clock",
        anim: "animate-stagger-4",
        color: "bg-cyan-500/10 text-cyan-500 group-hover:bg-cyan-500/20",
    },
    {
        id: "timer",
        icon: Timer,
        title: "計時器",
        subtitle: "倒數計時與碼表",
        path: "/tools/timer",
        anim: "animate-stagger-5",
        color: "bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20",
    },
    {
        id: "qrcode",
        icon: QrCode,
        title: "QR Code",
        subtitle: "快速生成 QR Code",
        path: "/tools/qrcode",
        anim: "animate-stagger-6",
        color: "bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20",
    },
    {
        id: "whiteboard",
        icon: Pencil,
        title: "電子白板",
        subtitle: "即時繪圖與標記",
        path: "/tools/whiteboard",
        anim: "animate-stagger-7",
        color: "bg-fuchsia-500/10 text-fuchsia-500 group-hover:bg-fuchsia-500/20",
    },
    {
        id: "attendance",
        icon: ClipboardCheck,
        title: "課堂點名",
        subtitle: "出席狀況管理",
        path: "/tools/attendance",
        anim: "animate-stagger-8",
        color: "bg-amber-500/10 text-amber-500 group-hover:bg-amber-500/20",
    },
];

export function ToolsSection() {
    const navigate = useNavigate();

    return (
        <section id="tools">
            <div className="flex items-center gap-3 mb-5">
                <span className="section-icon">
                    <Wrench className="h-4 w-4" />
                </span>
                <h2 className="text-lg font-bold text-foreground">小工具</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <button
                            key={tool.id}
                            type="button"
                            onClick={() => navigate(tool.path)}
                            className={cn(
                                "group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-2 rounded-2xl",
                                "opacity-0 animate-fade-in",
                                tool.anim
                            )}
                        >
                            <div className={cn(
                                "relative h-full flex flex-col items-center gap-2.5 p-4 sm:p-5 rounded-2xl border border-border bg-card transition-all duration-300",
                                "hover:shadow-md hover:bg-accent/50 hover:border-primary/40",
                                "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                            )}>
                                <div className={cn(
                                    "w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-active:scale-95",
                                    tool.color
                                )}>
                                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
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