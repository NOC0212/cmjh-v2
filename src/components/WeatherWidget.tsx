import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudDrizzle,
  CloudSun, CloudSnow, CloudFog, Droplets, Thermometer,
  Compass, Sunrise, Navigation, ChevronUp, ChevronDown, RefreshCw
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const CWA_API_KEY = import.meta.env.VITE_CWA_API_KEY as string | undefined;

const DISTRICTS = [
  { value: "中西區", label: "中西區" }, { value: "東區", label: "東區" },
  { value: "南區", label: "南區" }, { value: "北區", label: "北區" },
  { value: "安平區", label: "安平區" }, { value: "安南區", label: "安南區" },
  { value: "永康區", label: "永康區" }, { value: "歸仁區", label: "歸仁區" },
  { value: "新化區", label: "新化區" }, { value: "左鎮區", label: "左鎮區" },
  { value: "玉井區", label: "玉井區" }, { value: "楠西區", label: "楠西區" },
  { value: "南化區", label: "南化區" }, { value: "仁德區", label: "仁德區" },
  { value: "關廟區", label: "關廟區" }, { value: "龍崎區", label: "龍崎區" },
  { value: "官田區", label: "官田區" }, { value: "麻豆區", label: "麻豆區" },
  { value: "佳里區", label: "佳里區" }, { value: "西港區", label: "西港區" },
  { value: "七股區", label: "七股區" }, { value: "將軍區", label: "將軍區" },
  { value: "學甲區", label: "學甲區" }, { value: "北門區", label: "北門區" },
  { value: "新營區", label: "新營區" }, { value: "後壁區", label: "後壁區" },
  { value: "白河區", label: "白河區" }, { value: "東山區", label: "東山區" },
  { value: "六甲區", label: "六甲區" }, { value: "下營區", label: "下營區" },
  { value: "柳營區", label: "柳營區" }, { value: "鹽水區", label: "鹽水區" },
  { value: "善化區", label: "善化區" }, { value: "大內區", label: "大內區" },
  { value: "山上區", label: "山上區" }, { value: "新市區", label: "新市區" },
  { value: "安定區", label: "安定區" },
];

interface WeatherElement {
  elementName: string;
  time: Array<{
    startTime: string;
    endTime: string;
    elementValue: Array<{ value: string; measures: string; code?: string }>;
  }>;
}

interface WeatherData {
  locationName: string;
  weatherElement: WeatherElement[];
  weatherCode?: string;
}

interface CwaResponse {
  success: string;
  records?: { locations?: Array<{ location?: RawLocation[] }> };
  Records?: { Locations?: Array<{ Location?: RawLocation[] }> };
}

interface RawWeatherElement {
  time?: RawTimeSlot[]; Time?: RawTimeSlot[];
  elementName?: string; ElementName?: string;
}

interface RawLocation {
  locationName?: string; LocationName?: string;
  weatherElement?: RawWeatherElement[]; WeatherElement?: RawWeatherElement[];
}

interface RawTimeSlot {
  startTime?: string; StartTime?: string;
  endTime?: string; EndTime?: string;
  elementValue?: Array<Record<string, unknown>>;
  ElementValue?: Array<Record<string, unknown>>;
}

interface DailyForecast {
  date: string; dayOfWeek: string; weather: string; weatherCode?: string;
  maxTemp: string; minTemp: string; pop: string; rh: string; ws: string;
  wd: string; feelTemp: string; ci: string; uvi: string;
}

export const WeatherWidget = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("東區");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCwaResponse = useCallback((data: CwaResponse, district: string): boolean => {
    try {
      if (data.success === "true") {
        const records = (data.records || data.Records) as
          { locations?: Array<{ location?: RawLocation[] }>; Locations?: Array<{ Location?: RawLocation[] }> } | undefined;
        const locationsList = records?.locations?.[0]?.location || records?.Locations?.[0]?.Location;
        if (Array.isArray(locationsList)) {
          const rawLoc = locationsList.find((l: RawLocation) => (l.locationName || l.LocationName) === district);
          if (rawLoc) {
            const normalize = (loc: RawLocation): WeatherData => {
              const getSeriesByKey = (valueKey: string) => {
                const elements = loc.weatherElement || loc.WeatherElement || [];
                for (const e of elements) {
                  const times = e.time || e.Time || [];
                  const first = times?.[0];
                  const ev = first?.elementValue?.[0] || first?.ElementValue?.[0];
                  if (ev && valueKey in ev) {
                    return times.map((t: RawTimeSlot) => ({
                      startTime: t.startTime || t.StartTime,
                      endTime: t.endTime || t.EndTime,
                      elementValue: [{
                        value: t.elementValue?.[0]?.[valueKey] ?? t.ElementValue?.[0]?.[valueKey] ?? "N/A",
                        measures: "",
                        code: (t.elementValue?.[0]?.WeatherCode || t.ElementValue?.[0]?.WeatherCode) as string,
                      }],
                    }));
                  }
                }
                return null;
              };
              const buildElement = (name: string, keyCandidates: string[]) => {
                let series = null;
                for (const k of keyCandidates) {
                  series = getSeriesByKey(k);
                  if (series) break;
                }
                return series ? { elementName: name, time: series } : { elementName: name, time: [] };
              };
              return {
                locationName: loc.locationName || loc.LocationName,
                weatherElement: [
                  buildElement("Wx", ["Weather", "WeatherDescription"]),
                  buildElement("T", ["Temperature"]),
                  buildElement("AT", ["ApparentTemperature", "MaxApparentTemperature", "MinApparentTemperature"]),
                  buildElement("PoP12h", ["ProbabilityOfPrecipitation"]),
                  buildElement("RH", ["RelativeHumidity"]),
                  buildElement("WS", ["WindSpeed"]),
                  buildElement("WD", ["WindDirection"]),
                  buildElement("CI", ["MaxComfortIndexDescription", "MinComfortIndexDescription"]),
                  buildElement("UVI", ["UVIndex"]),
                  buildElement("MaxT", ["MaxTemperature"]),
                  buildElement("MinT", ["MinTemperature"]),
                ],
              } as WeatherData;
            };
            setWeatherData(normalize(rawLoc));
            return true;
          }
        }
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const fetchWeather = useCallback(async (district: string) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      if (!CWA_API_KEY) {
        setErrorMsg("VITE_CWA_API_KEY 未設定，無法取得天氣資訊");
        return;
      }
      const cwaUrl = `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-079?Authorization=${encodeURIComponent(CWA_API_KEY)}&locationName=${encodeURIComponent(district)}`;
      const response = await fetch(cwaUrl);
      const data = await response.json();
      if (!handleCwaResponse(data, district)) {
        setErrorMsg("CWA API 回應格式異常");
      }
    } catch {
      setErrorMsg("無法連線至天氣伺服器");
    } finally {
      setLoading(false);
    }
  }, [handleCwaResponse]);

  useEffect(() => {
    fetchWeather(selectedDistrict);
    const interval = setInterval(() => { fetchWeather(selectedDistrict); }, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedDistrict, fetchWeather]);

  const getWeatherIcon = (wx: string, code?: string) => {
    if (code) {
      const c = parseInt(code);
      if (c === 1) return <Sun className="h-8 w-8 text-yellow-500" />;
      if (c >= 2 && c <= 3) return <CloudSun className="h-8 w-8 text-yellow-400" />;
      if (c >= 4 && c <= 7) return <Cloud className="h-8 w-8 text-gray-400" />;
      if (c >= 8 && c <= 14 || c === 30) return <CloudDrizzle className="h-8 w-8 text-blue-300" />;
      if (c >= 15 && c <= 18 || c === 33 || c === 34 || c === 36) return <CloudLightning className="h-8 w-8 text-purple-500" />;
      if (c >= 19 && c <= 22 || c === 29 || c === 31 || c === 32 || c === 35 || c === 38 || c === 39) return <CloudRain className="h-8 w-8 text-blue-500" />;
      if (c === 23) return <CloudSnow className="h-8 w-8 text-blue-100" />;
      if (c >= 24 && c <= 28) return <CloudFog className="h-8 w-8 text-gray-300" />;
    }
    if (wx.includes("雷")) return <CloudLightning className="h-8 w-8 text-purple-500" />;
    if (wx.includes("雨")) return <CloudRain className="h-8 w-8 text-blue-500" />;
    if (wx.includes("雪")) return <CloudSnow className="h-8 w-8 text-blue-100" />;
    if (wx.includes("霧")) return <CloudFog className="h-8 w-8 text-gray-300" />;
    if (wx.includes("陰") || wx.includes("多雲")) return <Cloud className="h-8 w-8 text-gray-400" />;
    if (wx.includes("晴")) return <Sun className="h-8 w-8 text-yellow-500" />;
    return <Sun className="h-8 w-8" />;
  };

  const getElementMetadata = (elementName: string, timeIndex: number = 0) => {
    const element = weatherData?.weatherElement.find(e => e.elementName === elementName);
    const data = element?.time[timeIndex]?.elementValue?.[0];
    return { value: data?.value || "N/A", code: data?.code };
  };

  const getElementValue = (elementName: string, timeIndex: number = 0) => {
    return weatherData?.weatherElement.find(e => e.elementName === elementName)?.time[timeIndex]?.elementValue?.[0]?.value || "N/A";
  };

  const current = !loading && !errorMsg && weatherData ? (() => {
    const wxData = getElementMetadata("Wx");
    return {
      weather: wxData.value, weatherCode: wxData.code,
      temp: getElementValue("T"), feelTemp: getElementValue("AT"),
      pop: getElementValue("PoP12h"), rh: getElementValue("RH"),
      ws: getElementValue("WS"), wd: getElementValue("WD"),
      ci: getElementValue("CI"), uvi: getElementValue("UVI"),
    };
  })() : null;

  const forecast = !loading && weatherData ? (() => {
    const wxElement = weatherData.weatherElement.find(e => e.elementName === "Wx");
    if (!wxElement) return [];
    const dailyData: DailyForecast[] = [];
    const seenDates = new Set<string>();
    wxElement.time.forEach((timeSlot, index) => {
      const date = new Date(timeSlot.startTime);
      const dateKey = date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });
      if (!seenDates.has(dateKey) && dailyData.length < 3) {
        seenDates.add(dateKey);
        const wxData = getElementMetadata("Wx", index);
        dailyData.push({
          date: dateKey, dayOfWeek: date.toLocaleDateString('zh-TW', { weekday: 'short' }),
          weather: wxData.value, weatherCode: wxData.code,
          maxTemp: getElementValue("MaxT", index), minTemp: getElementValue("MinT", index),
          pop: getElementValue("PoP12h", index), rh: getElementValue("RH", index),
          ws: getElementValue("WS", index), wd: getElementValue("WD", index),
          feelTemp: getElementValue("AT", index), ci: getElementValue("CI", index),
          uvi: getElementValue("UVI", index),
        });
      }
    });
    return dailyData;
  })() : [];

  return (
    <section id="weather">
      <div className="flex items-center gap-3 mb-4">
        <div className="section-header-icon">
          <Sun className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-foreground">天氣動態</h2>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">臺南市</span>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardHeader className="pb-0 pt-4 px-4">
          <div className="flex items-center justify-between">
            <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
              <SelectTrigger className="h-9 w-36 bg-muted/30 border-border/50 rounded-xl text-xs">
                <div className="flex items-center gap-1.5">
                  <Navigation className="h-3 w-3 text-primary" />
                  <SelectValue placeholder="選擇行政區" />
                </div>
              </SelectTrigger>
              <SelectContent className="max-h-[300px] rounded-xl border-border/50 shadow-lg">
                {DISTRICTS.map((district) => (
                  <SelectItem key={district.value} value={district.value} className="rounded-lg text-xs">
                    臺南市 {district.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground"
                onClick={() => fetchWeather(selectedDistrict)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-muted-foreground"
                onClick={() => setIsExpanded(!isExpanded)}>
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isExpanded && (
          <CardContent className="p-4">
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-24 w-full rounded-2xl" />
                <div className="grid grid-cols-3 gap-2">
                  {[1,2,3].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
                </div>
              </div>
            ) : current ? (
              <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/10 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold tracking-tight text-foreground">{current.temp}</span>
                        <span className="text-lg text-primary font-semibold">°C</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium border border-primary/10">
                          {current.weather}
                        </span>
                        <span className="text-[11px] text-muted-foreground">體感 {current.feelTemp}°C</span>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-2xl bg-primary/8 border border-primary/10">
                      {getWeatherIcon(current.weather, current.weatherCode)}
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3 mt-4 pt-3 border-t border-border/40">
                    {[
                      { icon: Droplets, label: "降雨", value: `${current.pop}%`, color: "text-blue-500" },
                      { icon: Thermometer, label: "濕度", value: `${current.rh}%`, color: "text-cyan-500" },
                      { icon: Navigation, label: "風速", value: `${current.ws}m/s`, color: "text-indigo-500" },
                      { icon: Sun, label: "紫外線", value: current.uvi, color: "text-amber-500" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div key={item.label} className="text-center">
                          <div className="mx-auto w-7 h-7 flex items-center justify-center rounded-lg bg-muted/50">
                            <Icon className={cn("h-3.5 w-3.5", item.color)} />
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.label}</p>
                          <p className="text-xs font-bold text-foreground">{item.value}</p>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-border/30 text-[11px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Sunrise className="h-3 w-3 text-orange-400" /> {current.ci}</span>
                    <span className="flex items-center gap-1"><Compass className="h-3 w-3 text-primary" /> {current.wd}</span>
                  </div>
                </div>

                {forecast.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground px-1">未來 3 天預報</p>
                    {forecast.map((day, index) => (
                      <Collapsible
                        key={`${day.date}-${day.dayOfWeek}`}
                        open={expandedDay === index}
                        onOpenChange={(open) => setExpandedDay(open ? index : null)}
                      >
                        <div className={cn(
                          "rounded-xl border transition-all duration-200",
                          expandedDay === index
                            ? "border-primary/20 bg-primary/5 shadow-sm"
                            : "border-border/50 bg-muted/20 hover:bg-muted/40"
                        )}>
                          <CollapsibleTrigger className="w-full px-3 py-2.5 flex items-center gap-3">
                            <div className="flex flex-col items-center min-w-[44px]">
                              <p className="text-[10px] font-bold text-primary">{day.dayOfWeek}</p>
                              <p className="text-xs font-semibold text-foreground">{day.date}</p>
                            </div>
                            <div className="shrink-0">
                              {getWeatherIcon(day.weather, day.weatherCode)}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-medium text-foreground truncate">{day.weather}</p>
                              <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                                <span>{day.minTemp}° / {day.maxTemp}°</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-[11px]">
                              <Droplets className="h-3 w-3 text-blue-500" />
                              <span className="font-medium text-blue-500">{day.pop}%</span>
                            </div>
                            {expandedDay === index ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 border-t border-border/30 pt-2.5 mt-0">
                              {[
                                { label: "體感", value: `${day.feelTemp}°C` },
                                { label: "濕度", value: `${day.rh}%` },
                                { label: "風速/向", value: `${day.ws}m/s ${day.wd}` },
                                { label: "紫外線", value: day.uvi },
                              ].map((d) => (
                                <div key={d.label} className="bg-background/50 rounded-lg p-2 border border-border/20">
                                  <p className="text-[10px] text-muted-foreground">{d.label}</p>
                                  <p className="text-xs font-semibold text-foreground">{d.value}</p>
                                </div>
                              ))}
                            </div>
                          </CollapsibleContent>
                        </div>
                      </Collapsible>
                    ))}
                  </div>
                )}
              </div>
            ) : errorMsg ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-4 text-center">
                <p className="text-xs font-medium text-destructive mb-1">天氣資料載入失敗</p>
                <p className="text-[11px] text-muted-foreground">{errorMsg}</p>
                <button
                  onClick={() => fetchWeather(selectedDistrict)}
                  className="mt-2 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20 transition-colors"
                >
                  重新整理
                </button>
              </div>
            ) : (
              <p className="text-center text-xs text-muted-foreground py-4">無法取得天氣資訊</p>
            )}
          </CardContent>
        )}
      </Card>
    </section>
  );
};
