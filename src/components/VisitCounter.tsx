import { Eye, TrendingUp, Users } from "lucide-react";
import { useVisitCounter } from "@/hooks/useVisitCounter";
import { Card, CardContent } from "@/components/ui/card";

export function VisitCounter() {
  const { total, today, isConfigured } = useVisitCounter();

  if (!isConfigured) return null;

  return (
    <Card className="overflow-hidden border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-primary/10 border border-primary/5">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                網站訪問
              </h3>
              <p className="text-[11px] text-muted-foreground">累計統計資料</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <TrendingUp className="h-3.5 w-3.5 text-green-500" />
            <span className="text-[11px] font-bold text-green-600 dark:text-green-400">即時</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* 今日訪問 */}
          <div className="relative group p-4 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/10 hover:border-blue-500/20 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <Users className="h-4 w-4 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-black tracking-tight text-blue-600 dark:text-blue-400">
              {today.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1">今日訪問</p>
            <div className="absolute bottom-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Users className="h-12 w-12 text-blue-500" />
            </div>
          </div>

          {/* 累積訪問 */}
          <div className="relative group p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/10 hover:border-purple-500/20 hover:shadow-md hover:shadow-purple-500/5 transition-all duration-300">
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 rounded-lg bg-purple-500/10">
                <Eye className="h-4 w-4 text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-black tracking-tight text-purple-600 dark:text-purple-400 flex items-baseline">
              {total.toLocaleString()}
              <span className="text-lg text-muted-foreground/40 ml-0.5">+</span>
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1">累積訪問次數</p>
            <div className="absolute bottom-3 right-3 opacity-5 group-hover:opacity-10 transition-opacity">
              <Eye className="h-12 w-12 text-purple-500" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
