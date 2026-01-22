import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { StickyNote, Edit3, Eye, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNotes } from "@/hooks/useNotes";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ScratchpadProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function Scratchpad({ open, onOpenChange }: ScratchpadProps) {
    const [notes, setNotes] = useNotes();
    const { toast } = useToast();

    const handleCopy = () => {
        navigator.clipboard.writeText(notes);
        toast({
            title: "已複製",
            description: "內容已複製到剪貼簿",
        });
    };

    const handleClear = () => {
        if (window.confirm("確定要清空所有內容嗎？")) {
            setNotes("");
            toast({
                title: "已清空",
                description: "便籤內容已清空",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-[95vw] max-w-3xl h-[80vh] flex flex-col p-4 sm:p-6 gap-4 rounded-2xl sm:rounded-[2rem] overflow-hidden">
                <DialogHeader className="flex-row items-center justify-between space-y-0">
                    <div>
                        <DialogTitle className="flex items-center gap-2">
                            <StickyNote className="h-5 w-5 text-primary" />
                            Markdown 快速便籤
                        </DialogTitle>
                        <DialogDescription>
                            您的內容會自動儲存在本地瀏覽器中。
                        </DialogDescription>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <TabsList className="grid grid-cols-2 w-40 rounded-xl">
                            <TabsTrigger value="edit" className="flex items-center gap-2 rounded-lg">
                                <Edit3 className="h-4 w-4" />
                                編輯
                            </TabsTrigger>
                            <TabsTrigger value="preview" className="flex items-center gap-2 rounded-lg">
                                <Eye className="h-4 w-4" />
                                預覽
                            </TabsTrigger>
                        </TabsList>

                        <div className="flex items-center gap-1 sm:gap-2">
                            <Button variant="ghost" size="icon" onClick={handleCopy} title="複製全部" className="rounded-full">
                                <Copy className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={handleClear} className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-full" title="清空全部">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <TabsContent value="edit" className="flex-1 mt-0 overflow-hidden">
                        <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="在這裡輸入 Markdown 內容..."
                            className="h-full resize-none font-mono text-sm border-2 rounded-xl focus-visible:ring-primary/20 p-4 transition-all"
                        />
                    </TabsContent>

                    <TabsContent value="preview" className="flex-1 mt-0 overflow-hidden">
                        <ScrollArea className="h-full border-2 rounded-xl p-4 bg-muted/30 transition-all">
                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {notes || "*無內容*"}
                                </ReactMarkdown>
                            </div>
                        </ScrollArea>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
