import { useState } from "react";
import { Settings, Trash2, ChevronUp, ChevronDown, RotateCcw, Edit } from "lucide-react";
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

export function CommonSitesDialog() {
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", url: "" });
  const { sites, addSite, updateSite, deleteSite, moveSiteUp, moveSiteDown, resetToDefault } =
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

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">管理</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="w-[calc(100vw-2rem)] max-w-lg md:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-foreground">管理常用網站</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* 新增/編輯表單 */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-foreground">
                  {editingId ? "編輯網站" : "新增網站"}
                </h3>
                {editingId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setFormData({ name: "", url: "" });
                    }}
                  >
                    取消編輯
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="site-name" className="text-foreground">網站名稱</Label>
                  <Input
                    id="site-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="例如：學校官網"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="site-url" className="text-foreground">網址</Label>
                  <Input
                    id="site-url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://example.com 或 /path/to/file"
                  />
                </div>
              </div>
              <Button onClick={handleSave} className="w-full">
                {editingId ? "更新" : "新增"}
              </Button>
            </div>

            {/* 網站列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-sm font-semibold text-foreground">網站列表（可調整順序）</h3>
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-2 shrink-0">
                  <RotateCcw className="h-4 w-4" />
                  <span className="hidden sm:inline">重置為預設</span>
                  <span className="sm:hidden">重置</span>
                </Button>
              </div>
              <div className="space-y-2">
                {sites.length > 0 ? (
                  sites.map((site, index) => (
                    <div
                      key={site.id}
                      className="flex items-center gap-2 bg-background rounded-md p-3 border border-border"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate text-foreground">{site.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{site.url}</div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(site)}
                          title="編輯"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveSiteUp(site.id)}
                          disabled={index === 0}
                          title="上移"
                        >
                          <ChevronUp className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => moveSiteDown(site.id)}
                          disabled={index === sites.length - 1}
                          title="下移"
                        >
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(site.id)}
                          title="刪除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    沒有網站，請新增
                  </p>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setOpen(false)}>完成</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 刪除確認對話框 */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
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

