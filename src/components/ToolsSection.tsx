import { Wrench, Target, Users, Shuffle, Clock as ClockIcon, Timer as TimerIcon, QrCode, Pencil, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";

const tools = [
    {
        id: "wheel",
        icon: Target,
        title: "隨機抽籤輪盤",
        description: "轉動輪盤抽選",
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        path: "/tools/wheel",
    },
    {
        id: "grouping",
        icon: Users,
        title: "分組工具",
        description: "快速分組名單",
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        path: "/tools/grouping",
    },
    {
        id: "order",
        icon: Shuffle,
        title: "順序工具",
        description: "隨機排列順序",
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
        path: "/tools/order",
    },
    {
        id: "clock",
        icon: ClockIcon,
        title: "時鐘",
        description: "實時時鐘顯示",
        color: "text-orange-500",
        bgColor: "bg-orange-500/10",
        path: "/tools/clock",
    },
    {
        id: "timer",
        icon: TimerIcon,
        title: "計時器",
        description: "倒數計時器",
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        path: "/tools/timer",
    },
    {
        id: "qrcode",
        icon: QrCode,
        title: "QR Code 產生器",
        description: "快速生成 QR Code",
        color: "text-slate-600 dark:text-slate-300",
        bgColor: "bg-slate-500/10",
        path: "/tools/qrcode",
    },
    {
        id: "whiteboard",
        icon: Pencil,
        title: "電子白板",
        description: "即時繪圖與標記",
        color: "text-sky-500",
        bgColor: "bg-sky-500/10",
        path: "/tools/whiteboard",
    },
    {
        id: "attendance",
        icon: ClipboardCheck,
        title: "課堂點名",
        description: "出席狀況管理",
        color: "text-indigo-500",
        bgColor: "bg-indigo-500/10",
        path: "/tools/attendance",
    },
];

export function ToolsSection() {
    const navigate = useNavigate();

    return (
        <section id="tools" className="scroll-mt-20">
            <div className="flex items-center gap-3 mb-6">
                <Wrench className="h-8 w-8 text-primary" />
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">小工具</h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {tools.map((tool) => {
                    const Icon = tool.icon;
                    return (
                        <Card
                            key={tool.id}
                            className="group cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105 hover:border-primary/50 overflow-hidden rounded-2xl"
                            onClick={() => navigate(tool.path)}
                        >
                            <div className="p-6 text-center">
                                <div className={`w-16 h-16 mx-auto mb-4 rounded-full ${tool.bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <Icon className={`h-8 w-8 ${tool.color}`} />
                                </div>
                                <h3 className="font-semibold text-sm mb-1">{tool.title}</h3>
                                <p className="text-xs text-muted-foreground">{tool.description}</p>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
