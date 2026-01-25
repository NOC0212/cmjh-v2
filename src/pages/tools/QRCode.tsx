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
        <ToolLayout title="快速 QR Code 產生器">
            <div className="space-y-6">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2 text-foreground flex items-center justify-center gap-2">
                        <QrCode className="h-8 w-8 text-primary" />
                        快速 QR Code 產生器
                    </h2>
                    <p className="text-muted-foreground">輸入網址或文字，立即生成專屬 QR Code</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <Card className="p-6 space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <LinkIcon className="h-4 w-4" />
                                內容 (網址或文字)
                            </label>
                            <Input
                                placeholder="https://example.com"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                className="font-mono"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-2">
                                <RefreshCw className="h-4 w-4" />
                                顏色設定
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    type="color"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="w-12 h-10 p-1 cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={fgColor}
                                    onChange={(e) => setFgColor(e.target.value)}
                                    className="flex-1 font-mono"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={handleCopy} variant="outline" className="flex-1" disabled={!url}>
                                <Copy className="mr-2 h-4 w-4" />
                                複製連結
                            </Button>
                            <Button onClick={() => setUrl("")} variant="ghost" className="px-3">
                                清空
                            </Button>
                        </div>
                    </Card>

                    <Card className="p-6 flex flex-col items-center justify-center min-h-[300px] bg-white dark:bg-slate-900 transition-colors">
                        {url ? (
                            <div className="space-y-6 text-center">
                                <div className="p-4 bg-white rounded-xl shadow-inner inline-block">
                                    <QRCodeSVG
                                        id="qrcode-svg"
                                        value={url}
                                        size={200}
                                        fgColor={fgColor}
                                        level="H"
                                        includeMargin={false}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <Button onClick={handleDownload} className="w-full">
                                        <Download className="mr-2 h-4 w-4" />
                                        下載 PNG 圖片
                                    </Button>
                                    <p className="text-xs text-muted-foreground">
                                        建議使用於簡報、教案或班級佈告欄
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center space-y-4 text-muted-foreground">
                                <div className="w-32 h-32 mx-auto border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center opacity-50">
                                    <QrCode className="h-12 w-12" />
                                </div>
                                <p>請在左側輸入內容以生成 QR Code</p>
                            </div>
                        )}
                    </Card>
                </div>

                <Card className="p-6 bg-primary/5 border-primary/20">
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2 text-foreground">
                        <span>💡</span>
                        使用說明
                    </h3>
                    <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• 在「內容」欄位输入網址（如：學校官網）或任意文字。</li>
                        <li>• 可自由調整 QR Code 的顏色，配合您的簡報風格。</li>
                        <li>• 產生的 QR Code 具備高容錯率 (Level H)，即使稍微受損仍可掃描。</li>
                        <li>• 點擊「下載」可儲存為 PNG 格式，方便插入 Word 或 PPT。</li>
                    </ul>
                </Card>
            </div>
        </ToolLayout>
    );
}
