import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Sun, Cloud, CloudRain, CloudLightning, CloudDrizzle,
  CloudSun, CloudSnow, CloudFog, Droplets, Thermometer,
  Compass, Sunrise, Navigation, ChevronUp, ChevronDown
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// 從環境變數讀取 API 金鑰，如果沒有設置則使用預設值（僅用於開發）
const API_KEY = import.meta.env.VITE_CWA_API_KEY || "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";

const DISTRICTS = [
  { value: "中西區", label: "中西區" },
  { value: "東區", label: "東區" },
  { value: "南區", label: "南區" },
  { value: "北區", label: "北區" },
  { value: "安平區", label: "安平區" },
  { value: "安南區", label: "安南區" },
  { value: "永康區", label: "永康區" },
  { value: "歸仁區", label: "歸仁區" },
  { value: "新化區", label: "新化區" },
  { value: "左鎮區", label: "左鎮區" },
  { value: "玉井區", label: "玉井區" },
  { value: "楠西區", label: "楠西區" },
  { value: "南化區", label: "南化區" },
  { value: "仁德區", label: "仁德區" },
  { value: "關廟區", label: "關廟區" },
  { value: "龍崎區", label: "龍崎區" },
  { value: "官田區", label: "官田區" },
  { value: "麻豆區", label: "麻豆區" },
  { value: "佳里區", label: "佳里區" },
  { value: "西港區", label: "西港區" },
  { value: "七股區", label: "七股區" },
  { value: "將軍區", label: "將軍區" },
  { value: "學甲區", label: "學甲區" },
  { value: "北門區", label: "北門區" },
  { value: "新營區", label: "新營區" },
  { value: "後壁區", label: "後壁區" },
  { value: "白河區", label: "白河區" },
  { value: "東山區", label: "東山區" },
  { value: "六甲區", label: "六甲區" },
  { value: "下營區", label: "下營區" },
  { value: "柳營區", label: "柳營區" },
  { value: "鹽水區", label: "鹽水區" },
  { value: "善化區", label: "善化區" },
  { value: "大內區", label: "大內區" },
  { value: "山上區", label: "山上區" },
  { value: "新市區", label: "新市區" },
  { value: "安定區", label: "安定區" },
];

interface WeatherElement {
  elementName: string;
  time: Array<{
    startTime: string;
    endTime: string;
    elementValue: Array<{
      value: string;
      measures: string;
      code?: string;
    }>;
  }>;
}

interface WeatherData {
  locationName: string;
  weatherElement: WeatherElement[];
}

// 未標準化的 API 回應類型
interface RawWeatherElement {
  time?: RawTimeSlot[];
  Time?: RawTimeSlot[];
  elementName?: string;
  ElementName?: string;
}

interface RawLocation {
  locationName?: string;
  LocationName?: string;
  weatherElement?: RawWeatherElement[];
  WeatherElement?: RawWeatherElement[];
}

interface RawTimeSlot {
  startTime?: string;
  StartTime?: string;
  endTime?: string;
  EndTime?: string;
  elementValue?: Array<Record<string, unknown>>;
  ElementValue?: Array<Record<string, unknown>>;
}

interface DailyForecast {
  date: string;
  dayOfWeek: string;
  weather: string;
  maxTemp: string;
  minTemp: string;
  pop: string;
  rh: string;
  ws: string;
  wd: string;
  feelTemp: string;
  ci: string;
  uvi: string;
}

export const WeatherWidget = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("東區");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const fetchWeather = useCallback(async (district: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://opendata.cwa.gov.tw/api/v1/rest/datastore/F-D0047-079?Authorization=${API_KEY}&locationName=${encodeURIComponent(district)}`
      );
      const data = await response.json();

      if (data.success === "true") {
        const records = data.records || data.Records;
        const locationsList =
          records?.locations?.[0]?.location ||
          records?.Locations?.[0]?.Location;

        if (Array.isArray(locationsList)) {
          const rawLoc = locationsList.find(
            (l: RawLocation) => (l.locationName || l.LocationName) === district
          );

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
                      elementValue: [
                        {
                          value:
                            t.elementValue?.[0]?.[valueKey] ??
                            t.ElementValue?.[0]?.[valueKey] ??
                            "N/A",
                          measures: "",
                          code: (t.elementValue?.[0]?.WeatherCode || t.ElementValue?.[0]?.WeatherCode) as string,
                        },
                      ],
                    }));
                  }
                }
                return null;
              };

              const buildElement = (name: string, keyCandidates: string[]) => {
                let series: ReturnType<typeof getSeriesByKey> = null;
                for (const k of keyCandidates) {
                  series = getSeriesByKey(k);
                  if (series) break;
                }
                return series
                  ? { elementName: name, time: series }
                  : { elementName: name, time: [] };
              };

              const elems = [
                buildElement("Wx", ["Weather", "WeatherDescription"]),
                buildElement("T", ["Temperature"]),
                buildElement("AT", [
                  "ApparentTemperature",
                  "MaxApparentTemperature",
                  "MinApparentTemperature",
                ]),
                buildElement("PoP12h", ["ProbabilityOfPrecipitation"]),
                buildElement("RH", ["RelativeHumidity"]),
                buildElement("WS", ["WindSpeed"]),
                buildElement("WD", ["WindDirection"]),
                buildElement("CI", [
                  "MaxComfortIndexDescription",
                  "MinComfortIndexDescription",
                ]),
                buildElement("UVI", ["UVIndex"]),
                buildElement("MaxT", ["MaxTemperature"]),
                buildElement("MinT", ["MinTemperature"]),
              ];

              return {
                locationName: loc.locationName || loc.LocationName,
                weatherElement: elems,
              } as WeatherData;
            };

            setWeatherData(normalize(rawLoc));
          } else {
            console.error("District not found in response");
          }
        } else {
          console.error("Invalid API response structure");
        }
      } else {
        console.error("API success flag is false");
      }
    } catch (error) {
      console.error("Failed to fetch weather:", error);
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchWeather(selectedDistrict);

    // 每30分鐘更新一次
    const interval = setInterval(() => {
      fetchWeather(selectedDistrict);
    }, 30 * 60 * 1000); // 30分鐘 = 30 * 60 * 1000 毫秒

    return () => clearInterval(interval);
  }, [selectedDistrict, fetchWeather]);

  const getWeatherIcon = (wx: string, code?: string) => {
    // 優先使用代碼判斷
    if (code) {
      const c = parseInt(code);
      if (c === 1) return <Sun className="h-8 w-8 text-yellow-500" />; // 晴
      if (c >= 2 && c <= 3) return <CloudSun className="h-8 w-8 text-yellow-400" />; // 晴時多雲
      if (c >= 4 && c <= 7) return <Cloud className="h-8 w-8 text-gray-400" />; // 多雲/陰
      if (c >= 8 && c <= 14 || c === 30) return <CloudDrizzle className="h-8 w-8 text-blue-300" />; // 短暫雨
      if (c >= 15 && c <= 18 || c === 33 || c === 34 || c === 36) return <CloudLightning className="h-8 w-8 text-purple-500" />; // 雷雨
      if (c >= 19 && c <= 22 || c === 29 || c === 31 || c === 32 || c === 35 || c === 38 || c === 39) return <CloudRain className="h-8 w-8 text-blue-500" />; // 雨
      if (c === 23) return <CloudSnow className="h-8 w-8 text-blue-100" />; // 雪
      if (c >= 24 && c <= 28) return <CloudFog className="h-8 w-8 text-gray-300" />; // 霧
    }

    // 備援方案：關鍵字判斷
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
    const element = weatherData?.weatherElement.find(e => e.elementName === elementName);
    return element?.time[timeIndex]?.elementValue?.[0]?.value || "N/A";
  };

  const getCurrentWeather = () => {
    if (!weatherData) return null;

    const wxData = getElementMetadata("Wx");
    return {
      weather: wxData.value,
      weatherCode: wxData.code,
      temp: getElementValue("T"),
      feelTemp: getElementValue("AT"),
      pop: getElementValue("PoP12h"),
      rh: getElementValue("RH"),
      ws: getElementValue("WS"),
      wd: getElementValue("WD"),
      ci: getElementValue("CI"),
      uvi: getElementValue("UVI"),
    };
  };

  const getDailyForecast = () => {
    if (!weatherData) return [];

    const wxElement = weatherData.weatherElement.find(e => e.elementName === "Wx");
    if (!wxElement) return [];

    // 每天取早上6點的資料作為代表
    const dailyData: DailyForecast[] = [];
    const seenDates = new Set<string>();

    wxElement.time.forEach((timeSlot, index) => {
      const date = new Date(timeSlot.startTime);
      const dateKey = date.toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' });

      if (!seenDates.has(dateKey) && dailyData.length < 3) {
        seenDates.add(dateKey);
        const wxData = getElementMetadata("Wx", index);
        dailyData.push({
          date: dateKey,
          dayOfWeek: date.toLocaleDateString('zh-TW', { weekday: 'short' }),
          weather: wxData.value,
          weatherCode: wxData.code,
          maxTemp: getElementValue("MaxT", index),
          minTemp: getElementValue("MinT", index),
          pop: getElementValue("PoP12h", index),
          rh: getElementValue("RH", index),
          ws: getElementValue("WS", index),
          wd: getElementValue("WD", index),
          feelTemp: getElementValue("AT", index),
          ci: getElementValue("CI", index),
          uvi: getElementValue("UVI", index),
        } as DailyForecast);
      }
    });

    return dailyData;
  };

  const current = getCurrentWeather();
  const forecast = getDailyForecast();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 hover:shadow-lg transition-all duration-300 rounded-2xl">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
            天氣動態
          </CardTitle>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            台南市即時天氣
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
            onClick={() => fetchWeather(selectedDistrict)}
          >
            <Navigation className="h-4 w-4 text-primary" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-primary/10 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </div>

        <div className="mt-4">
          <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
            <SelectTrigger className="w-full h-10 bg-muted/30 border-primary/10 focus:ring-primary/20 transition-all rounded-xl">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-md bg-primary/10">
                  <Navigation className="h-3 w-3 text-primary" />
                </div>
                <SelectValue placeholder="選擇行政區" />
              </div>
            </SelectTrigger>
            <SelectContent className="max-h-[300px] rounded-xl border-primary/10 shadow-xl">
              {DISTRICTS.map((district) => (
                <SelectItem key={district.value} value={district.value} className="rounded-lg">
                  臺南市 {district.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-24 w-full" />
              <div className="grid grid-cols-3 gap-2">
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
                <Skeleton className="h-20" />
              </div>
            </div>
          ) : current ? (
            <>
              {/* 當前天氣 */}
              <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 transition-all duration-500 hover:shadow-inner">
                <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  {getWeatherIcon(current.weather, (current as any).weatherCode)}
                </div>

                <div className="flex items-center justify-between mb-6 relative z-10">
                  <div className="space-y-1">
                    <p className="text-5xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text">
                      {current.temp}<span className="text-3xl text-primary">°C</span>
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground font-medium">
                      <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs border border-primary/10">
                        {current.weather}
                      </span>
                      <span className="text-xs">體感 {current.feelTemp}°C</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center p-3 rounded-2xl bg-primary/10 border border-primary/10 backdrop-blur-sm shadow-sm scale-110">
                    {getWeatherIcon(current.weather, (current as any).weatherCode)}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 relative z-10">
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-blue-500/10 text-blue-500">
                      <Droplets className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">降雨</p>
                    <p className="text-sm font-bold">{current.pop}%</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-cyan-500/10 text-cyan-500">
                      <Thermometer className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">濕度</p>
                    <p className="text-sm font-bold">{current.rh}%</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-indigo-500/10 text-indigo-500">
                      <Navigation className="h-4 w-4 rotate-[var(--wind-dir,0deg)] transition-transform" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">風速</p>
                    <p className="text-sm font-bold">{current.ws}m/s</p>
                  </div>
                  <div className="text-center space-y-1">
                    <div className="mx-auto w-8 h-8 flex items-center justify-center rounded-full bg-yellow-500/10 text-yellow-500">
                      <Sun className="h-4 w-4" />
                    </div>
                    <p className="text-[10px] text-muted-foreground font-medium">紫線</p>
                    <p className="text-sm font-bold">{current.uvi}</p>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-primary/10 flex justify-between items-center text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Sunrise className="h-3 w-3 text-orange-400" />
                    <span>舒適度: {current.ci}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Compass className="h-3 w-3 text-primary" />
                    <span>風向: {current.wd}</span>
                  </div>
                </div>
              </div>

              {/* 未來3天預報 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-muted-foreground px-1 border-l-2 border-primary ml-1">週預報概覽</h3>
                  <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">點擊查看詳情</span>
                </div>
                <div className="grid grid-cols-1 gap-2.5">
                  {forecast.map((day, index) => (
                    <Collapsible
                      key={index}
                      open={expandedDay === index}
                      onOpenChange={(open) => setExpandedDay(open ? index : null)}
                      className="group"
                    >
                      <div className={`p-4 rounded-2xl transition-all duration-300 border ${expandedDay === index
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 shadow-md translate-x-1'
                        : 'bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/20'
                        }`}>
                        <CollapsibleTrigger className="w-full cursor-pointer focus:outline-none">
                          <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center min-w-[60px] py-1 bg-background/50 rounded-xl border border-border/20">
                              <p className="text-[10px] font-bold text-primary uppercase">{day.dayOfWeek}</p>
                              <p className="text-sm font-black">{day.date}</p>
                            </div>

                            <div className="flex-shrink-0 p-2 rounded-full bg-primary/5 group-hover:scale-110 transition-transform duration-300">
                              {getWeatherIcon(day.weather, (day as any).weatherCode)}
                            </div>

                            <div className="flex-1 text-left overflow-hidden">
                              <p className="text-sm font-bold truncate">{day.weather}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  <ChevronDown className="h-3 w-3 text-blue-500" /> {day.minTemp}°
                                </span>
                                <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                                  <ChevronUp className="h-3 w-3 text-red-500" /> {day.maxTemp}°
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1 px-2 border-l border-border/30">
                              <div className="flex items-center gap-1 text-[10px] font-bold text-blue-500">
                                <Droplets className="h-3 w-3" />
                                {day.pop}%
                              </div>
                              {expandedDay === index ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                            </div>
                          </div>
                        </CollapsibleTrigger>

                        <CollapsibleContent>
                          <div className="mt-4 pt-4 border-t border-primary/10 grid grid-cols-2 sm:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="bg-background/40 p-2 rounded-xl border border-border/10">
                              <p className="text-[10px] text-muted-foreground mb-0.5">體感溫度</p>
                              <p className="text-xs font-bold">{day.feelTemp}°C</p>
                            </div>
                            <div className="bg-background/40 p-2 rounded-xl border border-border/10">
                              <p className="text-[10px] text-muted-foreground mb-0.5">相對濕度</p>
                              <p className="text-xs font-bold">{day.rh}%</p>
                            </div>
                            <div className="bg-background/40 p-2 rounded-xl border border-border/10">
                              <p className="text-[10px] text-muted-foreground mb-0.5">風速/向</p>
                              <p className="text-xs font-bold">{day.ws}m/s {day.wd}</p>
                            </div>
                            <div className="bg-background/40 p-2 rounded-xl border border-border/10">
                              <p className="text-[10px] text-muted-foreground mb-0.5">紫外指數</p>
                              <p className="text-xs font-bold text-orange-500">{day.uvi}</p>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">無法取得天氣資訊</p>
          )}
        </CardContent>
      )}
    </Card>
  );
};
