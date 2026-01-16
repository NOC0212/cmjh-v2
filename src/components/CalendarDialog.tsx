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
        <DialogContent className="w-[95vw] max-w-md max-h-[85vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-foreground">管理自訂事件</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 新增/編輯表單 */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-xl border border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {editingId ? "編輯事件" : "新增事件"}
                </h3>
                {editingId && (
                  <Button
                    variant="ghost"
                    size="sm"
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

              {/* 日期選擇：先選月份，再選日期 */}
              <div className="space-y-3">
                <Label className="text-foreground">日期</Label>
                <div className="grid grid-cols-2 gap-3">
                  {/* 月份選擇 */}
                  <Select
                    value={selectedMonth}
                    onValueChange={(value) => {
                      setSelectedMonth(value);
                      setSelectedDay(""); // 重置日期
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="選擇月份" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(groupedMonths).sort().map((year) => (
                        <div key={year}>
                          <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground bg-muted/50">
                            {year}年
                          </div>
                          {groupedMonths[year].map((m) => {
                            const month = parseInt(m.split("-")[1]);
                            return (
                              <SelectItem key={m} value={m}>
                                {month}月
                              </SelectItem>
                            );
                          })}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* 日期選擇 */}
                  <Select
                    value={selectedDay}
                    onValueChange={setSelectedDay}
                    disabled={!selectedMonth}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={selectedMonth ? "選擇日期" : "請先選月份"} />
                    </SelectTrigger>
                    <SelectContent>
                      {daysInMonth.map((day) => (
                        <SelectItem key={day} value={String(day)}>
                          {day}日
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {formData.date && (
                  <p className="text-xs text-muted-foreground">
                    已選擇：{formData.date}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="event-title" className="text-foreground">名稱</Label>
                <Input
                  id="event-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="例如：考試、活動"
                />
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingId ? "更新" : "新增"}
              </Button>
            </div>

            {/* 事件列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-semibold text-foreground">自訂事件列表</h3>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">清除所有</span>
                  <span className="sm:hidden">清除</span>
                </Button>
              </div>
              <div className="space-y-2">
                {sortedEvents.length > 0 ? (
                  sortedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-2 bg-background rounded-lg p-3 border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm break-words text-foreground">{event.title}</div>
                        <div className="text-xs text-muted-foreground break-all">{event.date}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(event)}
                          title="編輯"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(event.id)}
                          title="刪除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    沒有自訂事件，請新增
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>完成</Button>
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


