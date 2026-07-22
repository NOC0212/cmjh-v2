import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { 
    Trash2, 
    RotateCcw, 
    ClipboardCheck, 
    UserCheck, 
    UserX, 
    Clock,
    Users,
    AlertTriangle,
    ArrowRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useBeforeUnload, useNavigate } from "react-router-dom";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AttendanceStatus = "present" | "absent" | "late" | "none";

interface Student {
    id: string;
    name: string;
    status: AttendanceStatus;
}

export default function Attendance() {
    const defaultContent = Array.from({ length: 30 }, (_, i) => (i + 1).toString()).join("\n");
    const [input, setInput] = useState(defaultContent);
    const [students, setStudents] = useState<Student[]>([]);
    const [activeMode, setActiveMode] = useState<AttendanceStatus>("present");
    const [showExitDialog, setShowExitDialog] = useState(false);
    const [showClearDialog, setShowClearDialog] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    useBeforeUnload(
        (e) => {
            if (students.length > 0) {
                e.preventDefault();
                return "您尚未完成點名，確定要離開嗎？";
            }
        }
    );

    const handleBack = () => {
        if (students.length > 0) {
            setShowExitDialog(true);
        } else {
            navigate("/app");
        }
    };

    const confirmExit = () => {
        setShowExitDialog(false);
        navigate("/app");
    };

    const handleSetList = () => {
        const lines = input
            .split("\n")
            .map((line) => line.trim())
            .filter((line) => line.length > 0);

        if (lines.length === 0) {
            toast({
                title: "名單為空",
                description: "請輸入學生名單",
                variant: "destructive",
            });
            return;
        }

        const newStudents: Student[] = lines.map((name, index) => ({
            id: `student-${index}-${Date.now()}`,
            name,
            status: "none",
        }));

        setStudents(newStudents);
        toast({ title: "名單已更新", description: `已匯入 ${newStudents.length} 位學生` });
    };

    const handleStudentClick = (id: string) => {
        setStudents(prev => prev.map(s => s.id === id ? { ...s, status: activeMode } : s));
    };

    const resetAttendance = () => {
        setStudents(prev => prev.map(s => ({ ...s, status: "none" })));
        toast({ title: "點名狀態已重置" });
    };

    const clearAll = () => {
        if (students.length > 0) {
            setShowClearDialog(true);
        } else {
            setStudents([]);
            setInput("");
            toast({ title: "名單已清除" });
        }
    };

    const confirmClear = () => {
        setShowClearDialog(false);
        setStudents([]);
        setInput("");
        toast({ title: "名單已清除" });
    };

    const stats = {
        total: students.length,
        present: students.filter(s => s.status === "present").length,
        absent: students.filter(s => s.status === "absent").length,
        late: students.filter(s => s.status === "late").length,
        pending: students.filter(s => s.status === "none").length,
    };

    const modeConfig = [
        { id: "present" as const, label: "出席", color: "bg-emerald-600", activeColor: "bg-emerald-600 text-white", inactiveColor: "text-emerald-600 border-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950", icon: UserCheck },
        { id: "absent" as const, label: "缺席", color: "bg-red-600", activeColor: "bg-red-600 text-white", inactiveColor: "text-red-600 border-red-300 hover:bg-red-50 dark:hover:bg-red-950", icon: UserX },
        { id: "late" as const, label: "遲到", color: "bg-orange-600", activeColor: "bg-orange-600 text-white", inactiveColor: "text-orange-600 border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950", icon: Clock },
        { id: "none" as const, label: "未點", color: "bg-slate-600", activeColor: "bg-slate-600 text-white", inactiveColor: "text-slate-600 border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950", icon: RotateCcw },
    ] as const;

    const getStatusCardStyle = (status: AttendanceStatus) => {
        switch (status) {
            case "present": return "border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-sm";
            case "absent": return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-bold shadow-sm";
            case "late": return "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400 font-bold shadow-sm";
            default: return "border-border/50 bg-card hover:border-primary/30 text-foreground";
        }
    };

    return (
        <ToolLayout title="課堂點名" onBack={handleBack}>
            <div className="space-y-4 sm:space-y-6">
                {students.length === 0 ? (
                    <Card className="p-4 sm:p-6 max-w-lg mx-auto space-y-4">
                        <div className="text-center mb-2">
                            <ClipboardCheck className="h-10 w-10 text-primary mx-auto mb-2" />
                            <h2 className="text-lg font-bold">建立點名單</h2>
                            <p className="text-xs text-muted-foreground mt-1">每行輸入一個學生姓名</p>
                        </div>
                        <Textarea
                            placeholder="請輸入名單，每行一位…"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[220px] font-mono text-sm leading-relaxed resize-none"
                        />
                        <div className="flex items-center justify-between text-xs text-muted-foreground/70">
                            <span>{input.split("\n").filter(l => l.trim()).length} 位學生</span>
                            <span className="italic">資料不會自動儲存</span>
                        </div>
                        <Button onClick={handleSetList} className="w-full h-11">
                            <ArrowRight className="mr-1.5 h-4 w-4" />
                            開始點名
                        </Button>
                    </Card>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
                        <div className="lg:w-56 shrink-0">
                            <Card className="p-3 sm:p-4 bg-card/50 backdrop-blur-sm border-primary/10 space-y-3 lg:sticky lg:top-4">
                                <div>
                                    <h3 className="font-bold text-xs mb-2 text-muted-foreground/70 uppercase tracking-wider">點名模式</h3>
                                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-1.5">
                                        {modeConfig.map((m) => {
                                            const Icon = m.icon;
                                            const isActive = activeMode === m.id;
                                            return (
                                                <Button
                                                    key={m.id}
                                                    variant={isActive ? "default" : "outline"}
                                                    className={`justify-start h-9 gap-2 text-xs font-semibold transition-all ${isActive ? m.activeColor : m.inactiveColor}`}
                                                    onClick={() => setActiveMode(m.id)}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    {m.label}
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="border-t border-border/40 pt-3">
                                    <h3 className="font-bold text-xs mb-2 text-muted-foreground/70 uppercase tracking-wider">統計</h3>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                                            <div className="text-[10px] opacity-80">出席</div>
                                            <div className="text-lg font-black">{stats.present}</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-red-500/10 text-red-700 dark:text-red-400">
                                            <div className="text-[10px] opacity-80">缺席</div>
                                            <div className="text-lg font-black">{stats.absent}</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-orange-500/10 text-orange-700 dark:text-orange-400">
                                            <div className="text-[10px] opacity-80">遲到</div>
                                            <div className="text-lg font-black">{stats.late}</div>
                                        </div>
                                        <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                                            <div className="text-[10px] opacity-80">未點</div>
                                            <div className="text-lg font-black">{stats.pending}</div>
                                        </div>
                                    </div>
                                    <div className="mt-2 p-2 rounded-lg bg-primary/5 text-primary">
                                        <div className="text-[10px] opacity-80">總人數</div>
                                        <div className="text-lg font-black">{stats.total}</div>
                                    </div>

                                    <div className="flex flex-col gap-1 mt-3 pt-2 border-t border-border/40">
                                        <Button variant="ghost" size="sm" onClick={resetAttendance} className="text-[11px] h-7 justify-start gap-1.5">
                                            <RotateCcw className="h-3 w-3" />
                                            重置狀態
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-[11px] h-7 justify-start gap-1.5 text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-3 w-3" />
                                            更換名單
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    學生名單
                                </h3>
                                <span className="text-xs text-muted-foreground/70">
                                    點擊學生切換狀態
                                </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 sm:gap-2.5">
                                {students.map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => handleStudentClick(student.id)}
                                        className={`p-3 sm:p-3.5 rounded-2xl border-2 text-base sm:text-lg font-semibold transition-all duration-150 active:scale-90 select-none ${getStatusCardStyle(student.status)}`}
                                    >
                                        {student.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                            確定要離開點名工具嗎？
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            如果您現在離開，目前的點名資料將會全部遺失且無法復原。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">返回點名</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmExit}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            確定離開
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-base">
                            <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0" />
                            確定要更換名單嗎？
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm">
                            如果您更換名單，目前的所有點名狀態將會全部清除。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="rounded-xl">取消</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmClear}
                            className="rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            確定更換
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ToolLayout>
    );
}
