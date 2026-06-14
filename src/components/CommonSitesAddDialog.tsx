import { useState } from "react";
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
import { useCommonSites } from "@/hooks/useCommonSites";
import { useToast } from "@/hooks/use-toast";

export function CommonSitesAddDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const { addSite } = useCommonSites();
  const { toast } = useToast();

  const handleSave = () => {
    if (!name.trim() || !url.trim()) {
      toast({
        title: "驗證失敗",
        description: "請填寫名稱和網址",
        variant: "destructive",
      });
      return;
    }

    // 簡單的 URL 驗證
    try {
      new URL(url);
    } catch {
      if (!url.startsWith("/") && !url.startsWith("./")) {
        toast({
          title: "驗證失敗",
          description: "請輸入有效的網址（例如：https://example.com 或 /path/to/file）",
          variant: "destructive",
        });
        return;
      }
    }

    addSite(name.trim(), url.trim());
    toast({ title: "新增成功", description: "網站已新增" });

    setName("");
    setUrl("");
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
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">新增網站連結</DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="add-site-name" className="text-xs font-bold text-muted-foreground ml-1">顯示名稱</Label>
            <Input
              id="add-site-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例如：學校官網"
              className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="add-site-url" className="text-xs font-bold text-muted-foreground ml-1">連結網址</Label>
            <Input
              id="add-site-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://..."
              className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50"
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
          </div>
        </div>

        <DialogFooter className="p-6 pt-2">
          <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20">
            新增網站
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
