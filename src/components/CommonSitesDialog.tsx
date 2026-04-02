import { useState } from "react";
import { Settings, Trash2, RotateCcw, Edit, GripVertical } from "lucide-react";
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
import { useCommonSites, type CommonSite } from "@/hooks/useCommonSites";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Reorder, useDragControls } from "framer-motion";

export function CommonSitesDialog() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "" });
  const { sites, addSite, updateSite, deleteSite, resetToDefault, setSites } =
    useCommonSites();
  const { toast } = useToast();

  const handleEdit = (site: CommonSite) => {
    setEditingId(site.id);
    setFormData({ name: site.name, url: site.url });
  };

  const handleSave = () => {
    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: "驗證失敗",
        description: "請填寫名稱和網址",
        variant: "destructive",
      });
      return;
    }

    // 簡單的 URL 驗證
    try {
      new URL(formData.url);
    } catch {
      // 如果不是完整 URL，檢查是否為相對路徑
      if (!formData.url.startsWith("/") && !formData.url.startsWith("./")) {
        toast({
          title: "驗證失敗",
          description: "請輸入有效的網址（例如：https://example.com 或 /path/to/file）",
          variant: "destructive",
        });
        return;
      }
    }

    if (editingId) {
      updateSite(editingId, formData.name.trim(), formData.url.trim());
      toast({
        title: "更新成功",
        description: "網站已更新",
      });
    } else {
      addSite(formData.name.trim(), formData.url.trim());
      toast({
        title: "新增成功",
        description: "網站已新增",
      });
    }

    setFormData({ name: "", url: "" });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteSite(deleteId);
      toast({
        title: "刪除成功",
        description: "網站已刪除",
      });
      setDeleteId(null);
    }
  };

  const handleReset = () => {
    resetToDefault();
    toast({
      title: "重置成功",
      description: "已重置為預設網站",
    });
  };

  const handleReorder = (newSites: CommonSite[]) => {
    // 更新每個項目的 order
    const orderedSites = newSites.map((site, index) => ({
      ...site,
      order: index
    }));
    setSites(orderedSites);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">管理</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[95vw] max-w-md h-[85vh] md:h-auto md:max-h-[85vh] flex flex-col overflow-hidden rounded-[32px] bg-card border-none shadow-2xl p-0">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <DialogTitle className="text-xl font-bold tracking-tight text-foreground">管理常用網站</DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 custom-scrollbar">
            {/* 新增/編輯表單 */}
            <div className="space-y-4 p-5 bg-primary/5 rounded-[24px] border border-primary/10 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transition-transform group-hover:rotate-12 text-primary">
                <Settings className="h-12 w-12" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <h3 className="text-sm font-black text-primary">
                  {editingId ? "編輯項目內容" : "新增網站連結"}
                </h3>
                {editingId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] uppercase font-bold text-muted-foreground hover:text-destructive"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: "", url: "" });
                    }}
                  >
                    取消編輯
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4 relative z-10">
                <div className="space-y-1.5">
                  <Label htmlFor="site-name" className="text-xs font-bold text-muted-foreground ml-1">顯示名稱</Label>
                  <Input
                    id="site-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：學校官網"
                    className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="site-url" className="text-xs font-bold text-muted-foreground ml-1">連結網址</Label>
                  <Input
                    id="site-url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="h-10 rounded-xl bg-background/50 border-border/40 focus:border-primary/50"
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 relative z-10">
                {editingId ? "更新變更" : "新增網站"}
              </Button>
            </div>

            {/* 網站列表 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-xs font-black tracking-widest uppercase text-muted-foreground">現有網站列表</h3>
                <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-[10px] font-bold text-muted-foreground hover:text-primary gap-1">
                  <RotateCcw className="h-3 w-3" />
                  重置預設
                </Button>
              </div>
              <Reorder.Group
                axis="y"
                values={sites}
                onReorder={handleReorder}
                className="flex flex-col gap-2.5"
              >
                {sites.length > 0 ? (
                  sites.map((site) => (
                    <SortableSiteItem 
                      key={site.id}
                      site={site}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 bg-muted/10 rounded-3xl border border-dashed border-border/60">
                    <p className="text-xs font-bold text-muted-foreground">尚未新增任何常用網站</p>
                  </div>
                )}
              </Reorder.Group>
            </div>
          </div>

          <DialogFooter className="p-6 bg-muted/5 border-t border-border/10 shrink-0">
            <Button onClick={() => setOpen(false)} className="w-full h-11 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]">完成管理</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>確認刪除</AlertDialogTitle>
            <AlertDialogDescription>
              確定要刪除這個網站嗎？此操作無法復原。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              刪除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function SortableSiteItem({ site, onEdit, onDelete }: { site: CommonSite, onEdit: (site: CommonSite) => void, onDelete: (id: string) => void }) {
  const controls = useDragControls();

  return (
    <Reorder.Item
      value={site}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      layout="position"
      className="flex items-center gap-3 bg-background rounded-2xl p-3 border border-border/50 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group select-none touch-none"
    >
      <div 
        className="cursor-grab active:cursor-grabbing p-1.5 text-muted-foreground group-hover:text-primary transition-colors bg-muted/30 rounded-lg touch-none"
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
        style={{ touchAction: "none" }}
      >
        <GripVertical className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-bold text-sm text-foreground truncate">{site.name}</div>
        <div className="text-[10px] text-muted-foreground font-mono truncate">{site.url}</div>
      </div>
      <div className="flex gap-1 shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-primary/10 hover:text-primary"
          onClick={() => onEdit(site)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onDelete(site.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Reorder.Item>
  );
}

