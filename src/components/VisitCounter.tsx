import { Eye, TrendingUp, Users } from "lucide-react";
import { useVisitCounter } from "@/hooks/use-visit-counter";
import { Card, CardContent } from "@/components/ui/card";

export function VisitCounter() {
  const { total, today, isConfigured } = useVisitCounter();

  if (!isConfigured) return null;

  return (
    <Card className="overflow-hidden shadow-sm">
      <CardContent className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="section-icon">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-brand-gradient">網站訪問</h3>
              <p className="text-[11px] text-muted-foreground">累計統計資料</p>
            </div>
          </div>
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/5 border border-primary/10">
            <TrendingUp className="h-3.5 w-3.5 text-success" />
            <span className="text-[11px] font-bold text-success">即時</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10 transition-colors hover:bg-primary/10">
            <div className="p-2 rounded-lg bg-primary/10 inline-flex mb-3">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-black tracking-tight text-primary">{today.toLocaleString()}</p>
            <p className="text-xs font-medium text-muted-foreground mt-1">今日訪問</p>
          </div>

          <div className="p-4 rounded-2xl bg-secondary border border-secondary-foreground/5 transition-colors hover:bg-secondary/70">
            <div className="p-2 rounded-lg bg-primary/10 inline-flex mb-3">
              <Eye className="h-4 w-4 text-primary" />
            </div>
            <p className="text-3xl font-black tracking-tight text-foreground flex items-baseline">
              {total.toLocaleString()}
              <span className="text-lg text-muted-foreground/40 ml-0.5">+</span>
            </p>
            <p className="text-xs font-medium text-muted-foreground mt-1">累積訪問次數</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
