import { useState } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { QrCode, Download, Copy, RefreshCw, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeSVG } from "qrcode.react";

export default function QRCodeGenerator() {
    const [url, setUrl] = useState("");
    const [fgColor, setFgColor] = useState("#000000");
    const { toast } = useToast();

    const handleDownload = () => {
        const svg = document.getElementById("qrcode-svg");
        if (!svg) return;

        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = "qrcode.png";
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));

        toast({
            title: "已開始下載",
            description: "QR Code 圖片已生成並開始下載。",
        });
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast({
                title: "已複製連結",
                description: "網址已成功複製到剪貼簿。",
            });
        } catch (err) {
            toast({
                title: "複製失敗",
                description: "無法複製連結，請手動複製。",
                variant: "destructive",
            });
        }
    };

    return (
        <ToolLayout title="QR Code 產生器">
            <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6">
                    <Card className="lg:col-span-2 p-4 sm:p-5 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <LinkIcon className="h-4 w-4 text-primary" />
                                內容
                            </label>
                            <Input
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="font-mono text-sm h-10"
                            />
                            <p className="text-[11px] text-muted-foreground/60">輸入網址或文字</p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <RefreshCw className="h-4 w-4 text-primary" />
                                顏色
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="w-11 h-10 p-1 cursor-pointer shrink-0"
                                />
                                <Input
                                    type="text"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="flex-1 font-mono text-sm h-10"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleCopy} variant="outline" className="flex-1 h-10" disabled={!url}>
                                <Copy className="mr-1.5 h-4 w-4" />
                                複製
                            </Button>
                            <Button onClick={() => setUrl("")} variant="ghost" className="h-10 px-4">
                                清空
                            </Button>
                        </div>
                    </Card>

                    <Card className="lg:col-span-3 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[280px] bg-white dark:bg-slate-900 transition-colors">
                        {url ? (
                            <div className="space-y-5 text-center">
                                <div className="p-4 bg-white rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)] inline-block">
                                    <QRCodeSVG
                                        id="qrcode-svg"
                                        value={url}
                                        size={200}
                                        fgColor={fgColor}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <Button onClick={handleDownload} className="w-full sm:w-auto">
                                    <Download className="mr-1.5 h-4 w-4" />
                                    下載 PNG
                                </Button>
                            </div>
                        ) : (
                            <div className="text-center space-y-3 text-muted-foreground/50">
                                <div className="w-24 h-24 mx-auto border-2 border-dashed rounded-2xl flex items-center justify-center">
                                    <QrCode className="h-10 w-10" />
                                </div>
                                <p className="text-sm">輸入內容以生成 QR Code</p>
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </ToolLayout>
    );
}
