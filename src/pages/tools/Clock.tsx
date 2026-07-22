import { useState, useEffect, useCallback, useReducer } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Maximize2, MapPin } from "lucide-react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const TIMEZONES = [
    { id: "Asia/Taipei", label: "台北", utc: "UTC+8" },
    { id: "Asia/Tokyo", label: "東京", utc: "UTC+9" },
    { id: "Asia/Shanghai", label: "上海", utc: "UTC+8" },
    { id: "Asia/Hong_Kong", label: "香港", utc: "UTC+8" },
    { id: "Asia/Singapore", label: "新加坡", utc: "UTC+8" },
    { id: "Asia/Seoul", label: "首爾", utc: "UTC+9" },
    { id: "Asia/Dubai", label: "杜拜", utc: "UTC+4" },
    { id: "Europe/London", label: "倫敦", utc: "UTC+0" },
    { id: "Europe/Paris", label: "巴黎", utc: "UTC+1" },
    { id: "Europe/Berlin", label: "柏林", utc: "UTC+1" },
    { id: "Europe/Moscow", label: "莫斯科", utc: "UTC+3" },
    { id: "America/New_York", label: "紐約", utc: "UTC-5" },
    { id: "America/Chicago", label: "芝加哥", utc: "UTC-6" },
    { id: "America/Denver", label: "丹佛", utc: "UTC-7" },
    { id: "America/Los_Angeles", label: "洛杉磯", utc: "UTC-8" },
    { id: "Pacific/Auckland", label: "奧克蘭", utc: "UTC+12" },
    { id: "Australia/Sydney", label: "雪梨", utc: "UTC+11" },
];

function getTimeParts(timeZone: string) {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat("zh-TW", {
        timeZone,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
    });
    const dateFormatter = new Intl.DateTimeFormat("zh-TW", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        weekday: "short",
    });
    const parts = formatter.formatToParts(now);
    const dateParts = dateFormatter.formatToParts(now);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "00";
    const getDatePart = (type: string) => dateParts.find((p) => p.type === type)?.value ?? "";
    return {
        hours: get("hour"),
        minutes: get("minute"),
        seconds: get("second"),
        year: getDatePart("year"),
        month: getDatePart("month"),
        date: getDatePart("day"),
        weekday: getDatePart("weekday"),
    };
}

export default function Clock() {
    const [, tick] = useReducer((x: number) => x + 1, 0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [selectedZone, setSelectedZone] = useState("Asia/Taipei");

    useEffect(() => {
        const timer = setInterval(() => tick(), 1000);
        return () => clearInterval(timer);
    }, [tick]);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }, []);

    const selected = TIMEZONES.find((tz) => tz.id === selectedZone) ?? TIMEZONES[0];
    const mainTime = getTimeParts(selectedZone);

    if (isFullscreen) {
        return (
            <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background cursor-pointer"
                onClick={toggleFullscreen}
            >
                <div className="font-mono text-center space-y-4">
                    <div className="text-[5rem] sm:text-[8rem] md:text-[12rem] lg:text-[16rem] font-bold leading-none bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
                        {mainTime.hours}:{mainTime.minutes}:{mainTime.seconds}
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl text-muted-foreground/80">
                        {mainTime.year} 年 {mainTime.month} 月 {mainTime.date} 日 {mainTime.weekday}
                    </div>
                    <div className="text-base sm:text-lg text-muted-foreground/50">
                        {selected.label}（{selected.utc}）
                    </div>
                </div>
                <div className="absolute bottom-8 text-muted-foreground/30 text-sm">
                    點擊任意處退出全螢幕
                </div>
            </div>
        );
    }

    return (
        <ToolLayout title="時鐘">
            <div className="space-y-4 sm:space-y-6">
                <Card className="p-6 sm:p-10 text-center bg-gradient-to-br from-primary/[0.03] to-accent/[0.03]">
                    <div className="space-y-6">
                        <div className="font-mono">
                            <div className="text-5xl sm:text-7xl md:text-8xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-wider">
                                {mainTime.hours}:{mainTime.minutes}:{mainTime.seconds}
                            </div>
                            <div className="text-lg sm:text-xl text-muted-foreground mt-3">
                                {mainTime.year} 年 {mainTime.month} 月 {mainTime.date} 日 {mainTime.weekday}
                            </div>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <MapPin className="h-4 w-4 text-primary/60" />
                                <span className="text-sm text-muted-foreground/70">
                                    {selected.label}（{selected.utc}）
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                            <Select value={selectedZone} onValueChange={setSelectedZone}>
                                <SelectTrigger className="w-[180px] sm:w-[200px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIMEZONES.map((tz) => (
                                        <SelectItem key={tz.id} value={tz.id}>
                                            {tz.label}（{tz.utc}）
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={toggleFullscreen} variant="outline" size="lg" className="h-11">
                                <Maximize2 className="mr-2 h-4 w-4" />
                                全螢幕
                            </Button>
                        </div>
                    </div>
                </Card>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                    {TIMEZONES.filter((tz) => tz.id !== selectedZone).map((tz) => {
                        const t = getTimeParts(tz.id);
                        return (
                            <button
                                key={tz.id}
                                onClick={() => setSelectedZone(tz.id)}
                                className="p-3 sm:p-4 rounded-2xl border border-border/50 bg-card/50 hover:bg-card hover:border-primary/30 hover:shadow-md transition-all duration-200 text-center active:scale-95"
                            >
                                <div className="text-xs text-muted-foreground/70 mb-1">{tz.label}</div>
                                <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
                                    {t.hours}:{t.minutes}
                                </div>
                                <div className="text-[10px] text-muted-foreground/50 mt-1">{tz.utc}</div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </ToolLayout>
    );
}
