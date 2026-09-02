import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, ChefHat, ImageOff, Utensils } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useLunch } from "@/hooks/use-static-data";
import type { LunchData, LunchItem } from "@/lib/data";
import { cn, getTodayStr } from "@/lib/utils";

/** 舊版 lunch.json 格式（讀取相容） */
interface LegacyLunchData {
  last_updated?: string;
  week_data?: Record<string, LunchItem[] | string>;
}

/** 分類標籤（品牌色柔和底） */
const categoryStyles: Record<string, string> = {
  主食: "border-warning/30 bg-warning/10 text-warning",
  主菜: "border-destructive/30 bg-destructive/10 text-destructive",
  副菜: "border-primary/20 bg-primary/10 text-primary",
  蔬菜: "border-success/30 bg-success/10 text-success",
  湯品: "border-primary/20 bg-primary/10 text-primary",
};

const defaultCategoryStyle = "border-border bg-muted/50 text-muted-foreground";

function normalizeDishes(raw: LunchData | LegacyLunchData): LunchItem[] {
  if ("items" in raw && Array.isArray(raw.items) && raw.items.length > 0) {
    return raw.items.filter((item) => item?.name);
  }
  // 舊版 week_data 格式相容：優先今日，其次第一組有效資料
  if ("week_data" in raw && raw.week_data) {
    const today = getTodayStr();
    const todayData = raw.week_data[today];
    if (Array.isArray(todayData) && todayData.length > 0) {
      return todayData;
    }
    const firstValid = Object.values(raw.week_data).find(
      (value) => Array.isArray(value) && value.length > 0,
    );
    return Array.isArray(firstValid) ? firstValid : [];
  }
  return [];
}

function DishCard({ dish, index }: { dish: LunchItem; index: number }) {
  const [imgError, setImgError] = useState(false);
  const colorClass = categoryStyles[dish.category] ?? defaultCategoryStyle;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-xl border border-border/60 bg-card p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-sm"
    >
      <div className="flex items-center gap-3">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
          {!imgError && dish.image ? (
            <img
              src={dish.image}
              alt={dish.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageOff className="h-4 w-4 text-muted-foreground/50" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <span
            className={cn(
              "mb-1 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none",
              colorClass,
            )}
          >
            {dish.category || "餐點"}
          </span>
          <p className="mt-0.5 truncate text-sm font-medium text-foreground">{dish.name}</p>
        </div>
      </div>
    </motion.div>
  );
}

/** 首頁區塊：營養午餐 */
export function LunchMenu() {
  const [previewDish, setPreviewDish] = useState<LunchItem | null>(null);

  // 使用 useLunch（@/hooks/use-static-data）統一管理午餐資料
  const { data: lunchData, isLoading: loading } = useLunch();

  const lastUpdated = lunchData?.last_updated ?? "";
  const dishes = useMemo(() => (lunchData ? normalizeDishes(lunchData) : []), [lunchData]);

  const sectionTitle = useMemo(
    () => (dishes.length > 0 ? `今日供應 ${dishes.length} 道餐點` : "今日尚無餐點資料"),
    [dishes.length],
  );

  if (loading) {
    return (
      <section id="lunch" aria-label="營養午餐" aria-busy="true">
        <div className="mb-5 flex items-center gap-3">
          <span className="section-icon" aria-hidden="true">
            <Utensils className="h-4 w-4" />
          </span>
          <h2 className="sr-only">營養午餐</h2>
          <div className="h-7 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="space-y-3 rounded-xl border border-border/60 bg-card p-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="lunch">
      {/* 區塊標題（統一模式） */}
      <div className="mb-5 flex items-center gap-3">
        <span className="section-icon">
          <Utensils className="h-4 w-4" />
        </span>
        <h2 className="text-lg font-bold text-foreground">營養午餐</h2>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5">
              <ChefHat className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">{sectionTitle}</span>
            </div>
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Calendar className="h-3 w-3" />
                {lastUpdated}
              </div>
            )}
          </div>

          {dishes.length > 0 ? (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {dishes.map((dish, index) => (
                <button
                  key={`${dish.name}-${index}`}
                  type="button"
                  className="text-left"
                  onClick={() => dish.image && setPreviewDish(dish)}
                >
                  <DishCard dish={dish} index={index} />
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 py-10 text-center text-sm text-muted-foreground">
              目前沒有可顯示的午餐內容
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewDish} onOpenChange={(open) => !open && setPreviewDish(null)}>
        <DialogContent className="max-w-lg rounded-xl border-border/60 bg-background p-3">
          <DialogTitle className="sr-only">{previewDish?.name || "餐點圖片"}</DialogTitle>
          {previewDish?.image && (
            <div className="overflow-hidden rounded-lg border border-border/60 bg-muted">
              <img
                src={previewDish.image}
                alt={previewDish.name}
                className="max-h-[60vh] w-full object-contain"
              />
            </div>
          )}
          {previewDish && (
            <div className="px-1 pb-1 pt-2">
              <p className="text-sm font-semibold text-foreground">{previewDish.name}</p>
              <p className="text-xs text-muted-foreground">{previewDish.category}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
