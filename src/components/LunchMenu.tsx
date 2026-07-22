import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Calendar, ImageOff, Utensils, ChefHat } from "lucide-react";
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
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="group rounded-xl border border-border/60 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm hover:-translate-y-0.5"
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
          <span className={cn("mb-1 inline-block rounded-md border px-1.5 py-0.5 text-[10px] font-semibold leading-none", colorClass)}>
            {dish.category || "餐點"}
          </span>
          <p className="truncate text-sm font-medium text-foreground mt-0.5">{dish.name}</p>
        </div>
      </div>
    </motion.div>
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
        if (!res.ok) throw new Error("Failed to fetch lunch data");
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
      <section id="lunch">
        <div className="mb-6 h-8 w-48 rounded-lg bg-muted animate-pulse" />
        <div className="rounded-xl border border-border/60 bg-card p-4 space-y-3">
          {Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="h-16 animate-pulse rounded-lg bg-muted/70" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section id="lunch">
      <div className="flex items-center gap-3 mb-5">
        <div className="section-header-icon">
          <Utensils className="h-4 w-4" />
        </div>
        <h2 className="text-xl font-bold text-foreground">營養午餐</h2>
      </div>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/8 px-3 py-1.5">
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
        <DialogContent className="max-w-lg border-border/60 bg-background p-3 rounded-xl">
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
};
