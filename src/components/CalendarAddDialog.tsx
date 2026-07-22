import { useState, useEffect, useMemo } from "react";
import { Plus } from "lucide-react";
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
import { useCalendarEvents } from "@/hooks/useCalendarEvents";
import { useToast } from "@/hooks/use-toast";

export function CalendarAddDialog({ availableMonths: initialMonths }: { availableMonths?: string[] }) {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedDay, setSelectedDay] = useState("");
  const [title, setTitle] = useState("");
  const [availableMonths, setAvailableMonths] = useState<string[]>(initialMonths || []);
  const { addEvent } = useCalendarEvents();
  const { toast } = useToast();

  // 若 props 沒給可用月份，獨立 fetch（向後相容）
  useEffect(() => {
    if (initialMonths && initialMonths.length > 0) return;
    fetch("/data/calendar.json")
      .then((res) => res.json())
      .then((data: Record<string, unknown[]>) => {
        const months = Object.keys(data).sort();
        setAvailableMonths(months);
      })
      .catch((error) => {
        console.error("Failed to load calendar months:", error);
      });
  }, [initialMonths]);

  const daysInMonth = useMemo(() => {
    if (!selectedMonth) return [];
    const [year, month] = selectedMonth.split("-").map(Number);
    const lastDay = new Date(year, month, 0).getDate();
    return Array.from({ length: lastDay }, (_, i) => i + 1);
  }, [selectedMonth]);

  const groupedMonths = useMemo(() => {
    const grouped: { [year: string]: string[] } = {};
    availableMonths.forEach((m) => {
      const year = m.split("-")[0];
      if (!grouped[year]) grouped[year] = [];
      grouped[year].push(m);
    });
    return grouped;
  }, [availableMonths]);

  const handleSave = () => {
    if (!selectedMonth || !selectedDay || !title.trim()) {
      toast({
        title: "驗證失敗",
        description: "請選擇日期並填寫名稱",
        variant: "destructive",
      });
      return;
    }

    const date = `${selectedMonth}-${selectedDay.padStart(2, "0")}`;
    addEvent(date, title.trim());
    toast({ title: "新增成功", description: "事件已新增" });

    setTitle("");
    setSelectedMonth("");
    setSelectedDay("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-primary/20 hover:bg-primary/10">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-md rounded-[32px] bg-card border-none shadow-2xl p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">新增自訂事件</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          <div className="space-y-3">
            <Label className="text-xs font-bold text-muted-foreground ml-1">事件日期</Label>
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

          <div className="space-y-1.5">
            <Label htmlFor="add-event-title" className="text-xs font-bold text-muted-foreground ml-1">事件標題</Label>
            <Input
              id="add-event-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：段考、活動名稱"
              className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
            儲存事件
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
