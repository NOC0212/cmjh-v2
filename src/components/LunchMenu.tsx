import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ImageOff, Sparkles, Utensils } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface DishItem {
  category: string;
  name: string;
  image: string;
}

interface LunchDataNew {
  last_updated?: string;
  items?: DishItem[];
}

interface LunchDataOld {
  last_updated?: string;
  week_data?: Record<string, DishItem[] | string>;
}

const categoryColors: Record<string, string> = {
  主食: "bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30",
  主菜: "bg-rose-500/15 text-rose-700 dark:text-rose-300 border-rose-500/30",
  副菜: "bg-orange-500/15 text-orange-700 dark:text-orange-300 border-orange-500/30",
  蔬菜: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  湯品: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
  其他: "bg-violet-500/15 text-violet-700 dark:text-violet-300 border-violet-500/30",
};

const defaultCategoryColor = "bg-muted/50 text-muted-foreground border-border";

function normalizeDishes(raw: LunchDataNew | LunchDataOld): DishItem[] {
  // 使用 'in' 操作符來檢查屬性是否存在，從而進行類型縮小 (Type Narrowing)
  if ("items" in raw && Array.isArray(raw.items) && raw.items.length > 0) {
    return raw.items.filter((item: DishItem) => item?.name);
  }

  if ("week_data" in raw && raw.week_data) {
    const today = format(new Date(), "yyyy-MM-dd");
    const todayData = raw.week_data[today];
    
    if (Array.isArray(todayData) && todayData.length > 0) {
      return todayData as DishItem[];
    }

    const firstValid = Object.values(raw.week_data).find(
      (value) => Array.isArray(value) && value.length > 0
    );
    
    return Array.isArray(firstValid) ? (firstValid as DishItem[]) : [];
  }

  return [];
}

function DishCard({ dish, index }: { dish: DishItem; index: number }) {
  const [imgError, setImgError] = useState(false);
  const colorClass = categoryColors[dish.category] ?? defaultCategoryColor;

  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-2xl border border-border/70 bg-card/80 p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
    >
      <div className="flex items-center gap-3">
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-muted">
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
              <ImageOff className="h-5 w-5 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <span className={cn("mb-1 inline-block rounded-md border px-2 py-0.5 text-[11px] font-semibold", colorClass)}>
            {dish.category || "餐點"}
          </span>
          <p className="truncate text-sm font-medium text-foreground">{dish.name}</p>
        </div>
      </div>
    </motion.article>
  );
}

export const LunchMenu: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState("");
  const [dishes, setDishes] = useState<DishItem[]>([]);
  const [previewDish, setPreviewDish] = useState<DishItem | null>(null);

  useEffect(() => {
    const fetchLunch = async () => {
      try {
        const res = await fetch("/data/lunch.json");
        const data: LunchDataNew | LunchDataOld = await res.json();
        setLastUpdated(data.last_updated ?? "");
        setDishes(normalizeDishes(data));
      } catch (error) {
        console.error("Failed to fetch lunch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLunch();
  }, []);

  const sectionTitle = useMemo(
    () => (dishes.length > 0 ? `今日供應 ${dishes.length} 道餐點` : "今日尚無餐點資料"),
    [dishes.length]
  );

  if (loading) {
    return (
      <section id="lunch" className="mb-12 scroll-mt-20">
        <div className="mb-6 h-10 w-56 animate-pulse rounded-lg bg-primary/20" />
        <Card className="overflow-hidden border-primary/20">
          <CardContent className="space-y-3 p-4">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="h-20 animate-pulse rounded-xl bg-muted/70" />
            ))}
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <section id="lunch" className="mb-12 scroll-mt-20">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="flex items-center gap-3 bg-gradient-to-r from-primary to-accent bg-clip-text text-3xl font-bold text-transparent">
          <Utensils className="h-8 w-8 text-primary" />
          營養午餐
        </h2>
        {lastUpdated && (
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            更新時間：{lastUpdated}
          </div>
        )}
      </div>

      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 shadow-lg">
        <CardContent className="p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            {sectionTitle}
          </div>

          {dishes.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 py-10 text-center text-sm text-muted-foreground">
              目前沒有可顯示的午餐內容
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!previewDish} onOpenChange={(open) => !open && setPreviewDish(null)}>
        <DialogContent className="max-w-2xl border-border/60 bg-background/95 p-3 sm:p-4">
          <DialogTitle className="sr-only">{previewDish?.name || "餐點圖片"}</DialogTitle>
          {previewDish?.image && (
            <div className="overflow-hidden rounded-xl border border-border/70 bg-muted">
              <img
                src={previewDish.image}
                alt={previewDish.name}
                className="max-h-[70vh] w-full object-contain"
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
};
