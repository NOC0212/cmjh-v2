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
    MousePointer2,
    AlertTriangle
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
    const { toast } = useToast();
    const navigate = useNavigate();

    // 瀏覽器層級拦截 (重新整理/關閉分頁) - 這裡只能用瀏覽器原生的
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
            navigate("/");
        }
    };

    const confirmExit = () => {
        setShowExitDialog(false);
        navigate("/");
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
        if (students.length > 0 && !window.confirm("確定要清除所有點名名單嗎？")) return;
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
        { id: "present", label: "出席", color: "bg-green-600", icon: UserCheck, hover: "hover:bg-green-600/10 hover:border-green-600" },
        { id: "absent", label: "缺席", color: "bg-red-600", icon: UserX, hover: "hover:bg-red-600/10 hover:border-red-600" },
        { id: "late", label: "遲到", color: "bg-orange-600", icon: Clock, hover: "hover:bg-orange-600/10 hover:border-orange-600" },
        { id: "none", label: "重置", color: "bg-slate-600", icon: RotateCcw, hover: "hover:bg-slate-600/10 hover:border-slate-600" },
    ] as const;

    const getStatusCardStyle = (status: AttendanceStatus) => {
        switch (status) {
            case "present": return "border-green-500 bg-green-500/10 text-green-700 dark:text-green-400 font-black scale-[1.02] shadow-md z-10";
            case "absent": return "border-red-500 bg-red-500/10 text-red-700 dark:text-red-400 font-black scale-[1.02] shadow-md z-10";
            case "late": return "border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400 font-black scale-[1.02] shadow-md z-10";
            default: return "border-muted/50 bg-card hover:border-primary/50 text-muted-foreground";
        }
    };

    return (
        <ToolLayout title="課堂點名" onBack={handleBack}>
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                        <ClipboardCheck className="h-8 w-8 text-primary" />
                        課堂點名
                    </h2>
                    <p className="text-muted-foreground text-sm italic">資料不會自動儲存，離開頁面後將會重置</p>
                </div>

                {students.length === 0 ? (
                    <Card className="p-8 max-w-2xl mx-auto space-y-4">
                        <Textarea
                            placeholder="請輸入名單，每行一位..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="min-h-[300px] font-mono leading-relaxed"
                        />
                        <Button onClick={handleSetList} className="w-full h-12 text-lg font-bold">建立點名單</Button>
                    </Card>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="lg:w-64 shrink-0 space-y-4">
                            <Card className="p-4 bg-card/50 backdrop-blur-sm border-primary/20 sticky top-4">
                                <h3 className="font-bold mb-4 flex items-center gap-2 text-sm border-b pb-2">
                                    <MousePointer2 className="h-4 w-4" /> 點名模式
                                </h3>
                                <div className="flex flex-col gap-2">
                                    {modeConfig.map((m) => (
                                        <Button
                                            key={m.id}
                                            variant={activeMode === m.id ? "default" : "outline"}
                                            className={`justify-start h-12 gap-3 font-bold transition-all ${activeMode === m.id ? m.color : m.hover}`}
                                            onClick={() => setActiveMode(m.id)}
                                        >
                                            <m.icon className="h-5 w-5" />
                                            {m.label}模式
                                        </Button>
                                    ))}
                                </div>

                                <div className="mt-8 space-y-4">
                                    <h3 className="font-bold text-sm border-b pb-2">今日統計</h3>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="p-2 bg-green-500/10 rounded-lg text-green-700 dark:text-green-400">
                                            <p>出席</p>
                                            <p className="text-lg font-black">{stats.present}</p>
                                        </div>
                                        <div className="p-2 bg-red-500/10 rounded-lg text-red-700 dark:text-red-400">
                                            <p>缺席</p>
                                            <p className="text-lg font-black">{stats.absent}</p>
                                        </div>
                                        <div className="p-2 bg-orange-500/10 rounded-lg text-orange-700 dark:text-orange-400">
                                            <p>遲到</p>
                                            <p className="text-lg font-black">{stats.late}</p>
                                        </div>
                                        <div className="p-2 bg-secondary rounded-lg">
                                            <p>未點</p>
                                            <p className="text-lg font-black">{stats.pending}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 flex flex-col gap-1.5">
                                        <Button variant="ghost" size="sm" onClick={resetAttendance} className="text-[10px] h-8 gap-2">
                                            <RotateCcw className="h-3 w-3" /> 重置全部狀態
                                        </Button>
                                        <Button variant="ghost" size="sm" onClick={clearAll} className="text-[10px] h-8 gap-2 text-destructive hover:bg-destructive/10">
                                            <Trash2 className="h-3 w-3" /> 更換名單
                                        </Button>
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="flex-1">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                                {students.map((student) => (
                                    <button
                                        key={student.id}
                                        onClick={() => handleStudentClick(student.id)}
                                        className={`p-4 rounded-2xl border-2 font-bold text-lg transition-all active:scale-90 select-none ${getStatusCardStyle(student.status)}`}
                                    >
                                        {student.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 自定義離開確認對話框 */}
            <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                            確定要離開點名工具嗎？
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            如果您現在離開，目前的點名資料將會全部遺失且無法復原。
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>返回點名</AlertDialogCancel>
                        <AlertDialogAction 
                            onClick={confirmExit}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            確定離開
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </ToolLayout>
    );
}
