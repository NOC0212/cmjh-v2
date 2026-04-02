import { useState, useEffect, useMemo } from "react";
import { Settings, Trash2, RotateCcw, Edit } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarEvents, type CalendarEvent } from "@/hooks/useCalendarEvents";
import { useToast } from "@/hooks/use-toast";
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

export function CalendarDialog() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [formData, setFormData] = useState({ date: "", title: "" });
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const { customEvents, addEvent, updateEvent, deleteEvent, resetToDefault } = useCalendarEvents();
  const { toast } = useToast();

  // 載入可用月份
  useEffect(() => {
    fetch("/data/calendar.json")
      .then((res) => res.json())
      .then((data: Record<string, unknown[]>) => {
        const months = Object.keys(data).sort();
        setAvailableMonths(months);
      })
      .catch((error) => {
        console.error("Failed to load calendar months:", error);
      });
  }, []);

  // 計算選中月份的天數
  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }, [selectedMonth]);

  // 當月份或日期變更時，更新 formData.date
  useEffect(() => {
    if (selectedMonth && selectedDay) {
      const day = selectedDay.padStart(2, "0");
      setFormData((prev) => ({ ...prev, date: `${selectedMonth}-${day}` }));
    } else {
      setFormData((prev) => ({ ...prev, date: "" }));
    }
  }, [selectedMonth, selectedDay]);

  const handleEdit = (event: CalendarEvent) => {
    setEditingId(event.id);
    // 解析日期
    const [yearMonth, day] = [event.date.substring(0, 7), event.date.substring(8)];
    setSelectedMonth(yearMonth);
    setSelectedDay(day);
    setFormData({ date: event.date, title: event.title });
  };

  const handleSave = () => {
    if (!formData.date.trim() || !formData.title.trim()) {
      toast({
        title: "驗證失敗",
        description: "請選擇日期並填寫名稱",
        variant: "destructive",
      });
      return;
    }

    // 驗證日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(formData.date)) {
      toast({
        title: "驗證失敗",
        description: "日期格式不正確",
        variant: "destructive",
      });
      return;
    }

    // 驗證日期是否有效
    const date = new Date(formData.date);
    if (isNaN(date.getTime())) {
      toast({
        title: "驗證失敗",
        description: "日期無效",
        variant: "destructive",
      });
      return;
    }

    if (editingId) {
      updateEvent(editingId, formData.date.trim(), formData.title.trim());
      toast({
        title: "更新成功",
        description: "事件已更新",
      });
    } else {
      addEvent(formData.date.trim(), formData.title.trim());
      toast({
        title: "新增成功",
        description: "事件已新增",
      });
    }

    setFormData({ date: "", title: "" });
    setSelectedMonth("");
    setSelectedDay("");
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteEvent(deleteId);
      toast({
        title: "刪除成功",
        description: "事件已刪除",
      });
      setDeleteId(null);
    }
  };

  const handleReset = () => {
    resetToDefault();
    toast({
      title: "重置成功",
      description: "已清除所有自訂事件",
    });
  };

  // 按日期排序
  const sortedEvents = [...customEvents].sort((a, b) => a.date.localeCompare(b.date));

  // 按年份分組月份
  const groupedMonths = useMemo(() => {
    const grouped: { [year: string]: string[] } = {};
    availableMonths.forEach((m) => {
      const year = m.split("-")[0];
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(m);
    });
    return grouped;
  }, [availableMonths]);

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">管理</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md h-[85vh] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden rounded-[32px] bg-card border-none shadow-2xl p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">管理自訂事件</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
            {/* 新增/編輯表單 */}
            <div className="space-y-4 p-5 bg-primary/5 rounded-[24px] border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:rotate-12 text-primary">
                <Settings className="h-12 w-12" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-sm font-black text-primary">
                  {editingId ? "編輯事件內容" : "新增自訂事件"}
                </h3>
                {editingId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setEditingId(null);
                      setSelectedMonth("");
                      setSelectedDay("");
                      setFormData({ date: "", title: "" });
                    }}
                  >
                    取消編輯
                  </Button>
                )}
              </div>

              {/* 日期選擇 */}
              <div className="space-y-3 relative z-10">
                <Label className="text-xs font-bold text-muted-foreground ml-1 text-foreground">事件日期</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Select
                    value={selectedMonth}
                    onValueChange={(value) => {
                      setSelectedMonth(value);
                      setSelectedDay("");
                    }}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/40">
                      <SelectValue placeholder="月份" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40">
                      {Object.keys(groupedMonths).sort().map((year) => (
                        <div key={year}>
                          <div className="px-2 py-1.5 text-[10px] font-black uppercase text-muted-foreground/60 bg-muted/30">
                            {year}年
                          </div>
                          {groupedMonths[year].map((m) => {
                            const month = parseInt(m.split("-")[1]);
                            return (
                              <SelectItem key={m} value={m} className="text-sm rounded-lg">
                                {month}月
                              </SelectItem>
                            );
                          })}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={selectedDay}
                    onValueChange={setSelectedDay}
                    disabled={!selectedMonth}
                  >
                    <SelectTrigger className="h-10 rounded-xl bg-background/50 border-border/40">
                      <SelectValue placeholder={selectedMonth ? "日期" : "先選月"} />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-border/40">
                      {daysInMonth.map((day) => (
                        <SelectItem key={day} value={String(day)} className="text-sm rounded-lg">
                          {day}日
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5 relative z-10">
                <Label htmlFor="event-title" className="text-xs font-bold text-muted-foreground ml-1 text-foreground">事件標題</Label>
                <Input
                  id="event-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：段考、活動名稱"
                  className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50"
                />
              </div>
              <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 relative z-10">
                {editingId ? "更新變更" : "儲存事件"}
              </Button>
            </div>

            {/* 事件列表 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground">已安排的事件</h3>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-[10px] font-bold text-muted-foreground hover:text-destructive gap-1">
                  <RotateCcw className="h-3.3 w-3" />
                  全部清除
                </Button>
              </div>
              <div className="flex flex-col gap-2.5">
                {sortedEvents.length > 0 ? (
                  sortedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 bg-background rounded-2xl p-4 border border-border/50 shadow-sm hover:shadow-md transition-all group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-foreground break-words">{event.title}</div>
                        <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{event.date}</div>
                      </div>
                      <div className="flex gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleEdit(event)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-destructive/70 hover:text-destructive"
                          onClick={() => handleDelete(event.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                    <p className="text-xs font-bold text-muted-foreground">尚未新增任何自訂事件</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/5 border-t border-border/10 shrink-0">
            <Button onClick={() => setOpen(false)} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">完成管理</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除這個事件嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


