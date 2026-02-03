import { useState, useRef, useEffect } from "react";
import { ToolLayout } from "@/components/ToolLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
    Pencil, 
    Eraser, 
    Trash2, 
    Download, 
    Undo2, 
    Palette,
    Maximize2,
    Minimize2,
    ChevronDown,
    ChevronUp,
    Slash,
    Grid
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

type DrawMode = "pencil" | "eraser" | "line" | "dashed-line";

export default function Whiteboard() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState("#3b82f6");
    const [lineWidth, setLineWidth] = useState(5);
    const [mode, setMode] = useState<DrawMode>("pencil");
    const [history, setHistory] = useState<string[]>([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showColors, setShowColors] = useState(false);
    const [showWidths, setShowWidths] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const snapshotRef = useRef<ImageData | null>(null);
    const { toast } = useToast();

    // 監聽全螢幕變化
    useEffect(() => {
        const handleFSChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFSChange);
        return () => document.removeEventListener("fullscreenchange", handleFSChange);
    }, []);

    // 初始化與調整畫布
    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

            // 在調整尺寸前獲取最新快照
            const tempImage = canvas.toDataURL();
            const rect = container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            canvas.width = rect.width;
            canvas.height = rect.height;

            const ctx = canvas.getContext("2d");
            if (ctx) {
                const img = new Image();
                img.src = tempImage;
                img.onload = () => {
                    // 使用 drawImage 縮放至新尺寸
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                };
            }
        };

        // 監聽尺寸變化 (包括全螢幕切換導致的容器變化)
        const resizeObserver = new ResizeObserver(() => {
            resizeCanvas();
        });
        
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => resizeObserver.disconnect();
    }, []);

    const saveToHistory = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        setHistory(prev => [...prev.slice(-19), canvas.toDataURL()]);
    };

    const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;
        
        setIsDrawing(true);
        saveToHistory();

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;
        
        setStartPos({ x, y });
        snapshotRef.current = ctx.getImageData(0, 0, canvas.width, canvas.height);

        if (mode === "pencil") {
            ctx.globalCompositeOperation = "source-over";
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if (mode === "eraser") {
            ctx.globalCompositeOperation = "destination-out";
            ctx.beginPath();
            ctx.moveTo(x, y);
        }
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
            ctx.beginPath();
            snapshotRef.current = null;
        }
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        const rect = canvas.getBoundingClientRect();
        const x = ("touches" in e ? e.touches[0].clientX : e.clientX) - rect.left;
        const y = ("touches" in e ? e.touches[0].clientY : e.clientY) - rect.top;

        ctx.lineWidth = lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.setLineDash(mode === "dashed-line" ? [lineWidth * 2, lineWidth * 2] : []);

        if (mode === "pencil" || mode === "eraser") {
            ctx.lineTo(x, y);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(x, y);
        } else if ((mode === "line" || mode === "dashed-line") && snapshotRef.current) {
            ctx.globalCompositeOperation = "source-over";
            ctx.putImageData(snapshotRef.current, 0, 0);
            ctx.beginPath();
            ctx.moveTo(startPos.x, startPos.y);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            saveToHistory();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            toast({ title: "畫布已清除" });
        }
    };

    const undo = () => {
        if (history.length === 0) return;
        const lastState = history[history.length - 1];
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            const img = new Image();
            img.src = lastState;
            img.onload = () => {
                ctx.globalCompositeOperation = "source-over";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
            };
            setHistory(prev => prev.slice(0, -1));
        }
    };

    const download = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext("2d");
        if (tempCtx) {
            tempCtx.fillStyle = "#ffffff";
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(canvas, 0, 0);
            const link = document.createElement("a");
            link.download = `whiteboard-${Date.now()}.png`;
            link.href = tempCanvas.toDataURL("image/png");
            link.click();
            toast({ title: "圖片已儲存" });
        }
    };

    const colors = [
        { name: "黑", val: "#000000" }, { name: "灰", val: "#6b7280" },
        { name: "紅", val: "#ef4444" }, { name: "粉", val: "#ec4899" },
        { name: "橙", val: "#f97316" }, { name: "黃", val: "#eab308" },
        { name: "綠", val: "#22c55e" }, { name: "碧", val: "#10b981" },
        { name: "藍", val: "#3b82f6" }, { name: "靛", val: "#6366f1" },
        { name: "紫", val: "#a855f7" }, { name: "棕", val: "#a16207" }
    ];

    const widths = [2, 4, 6, 8, 10, 15, 20, 30, 40, 50];

    const Toolbar = () => (
        <Card className={`flex flex-wrap items-center justify-between gap-4 bg-card/80 backdrop-blur-md border-primary/20 shadow-xl p-4 ${isFullscreen ? 'w-[90%] mx-auto mb-6' : 'sticky top-0 z-30'}`}>
            <div className="flex items-center gap-2">
                <Button variant={mode === "pencil" ? "default" : "outline"} size="icon" onClick={() => setMode("pencil")} title="畫筆">
                    <Pencil className="h-4 w-4" />
                </Button>
                <Button variant={mode === "line" ? "default" : "outline"} size="icon" onClick={() => setMode("line")} title="直線">
                    <Slash className="h-4 w-4" />
                </Button>
                <Button variant={mode === "dashed-line" ? "default" : "outline"} size="icon" onClick={() => setMode("dashed-line")} title="虛線">
                    <Grid className="h-4 w-4 rotate-45" />
                </Button>
                <Button variant={mode === "eraser" ? "default" : "outline"} size="icon" onClick={() => setMode("eraser")} title="橡皮擦">
                    <Eraser className="h-4 w-4" />
                </Button>
                <div className="h-8 w-[2px] bg-border mx-1" />
                <Button variant="outline" size="icon" onClick={undo} disabled={history.length === 0} title="復原">
                    <Undo2 className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={clearCanvas} title="清除全部">
                    <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => { setShowColors(!showColors); setShowWidths(false); }} className="gap-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                        <span className="hidden sm:inline text-xs">顏色</span>
                        {showColors ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    <AnimatePresence>
                        {showColors && (
                            <motion.div 
                                initial={{ opacity: 0, y: isFullscreen ? 10 : -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: isFullscreen ? 10 : -10 }}
                                className={`absolute p-3 bg-card border shadow-2xl rounded-xl grid grid-cols-4 gap-2 z-50 min-w-[160px] ${isFullscreen ? 'bottom-12 left-0' : 'top-12 left-0'}`}
                            >
                                {colors.map((c) => (
                                    <button
                                        key={c.val}
                                        className={`w-8 h-8 rounded-full transition-all hover:scale-125 ${color === c.val ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80'}`}
                                        style={{ backgroundColor: c.val }}
                                        onClick={() => { setColor(c.val); setShowColors(false); }}
                                        title={c.name}
                                    />
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="relative">
                    <Button variant="outline" size="sm" onClick={() => { setShowWidths(!showWidths); setShowColors(false); }} className="gap-2 font-mono">
                        <span className="text-xs">粗細: {lineWidth}</span>
                        {showWidths ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </Button>
                    <AnimatePresence>
                        {showWidths && (
                            <motion.div 
                                initial={{ opacity: 0, y: isFullscreen ? 10 : -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: isFullscreen ? 10 : -10 }}
                                className={`absolute p-2 bg-card border shadow-2xl rounded-xl grid grid-cols-5 gap-1 z-50 min-w-[180px] ${isFullscreen ? 'bottom-12 left-0' : 'top-12 left-0'}`}
                            >
                                {widths.map((w) => (
                                    <button
                                        key={w}
                                        className={`h-8 rounded-lg text-xs font-bold transition-all hover:bg-primary/10 ${lineWidth === w ? 'bg-primary text-primary-foreground' : ''}`}
                                        onClick={() => { setLineWidth(w); setShowWidths(false); }}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "退出全螢幕" : "全螢幕分享"}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={download} className="gap-2">
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">下載</span>
                    </Button>
                </div>
            </div>
        </Card>
    );

    return (
        <ToolLayout title="電子白板">
            <div 
                ref={containerRef} 
                className={`flex flex-col gap-4 bg-background relative ${isFullscreen ? 'h-screen w-screen p-6' : 'h-[calc(100vh-200px)] min-h-[500px]'}`}
            >
                {!isFullscreen && <Toolbar />}

                <div className={`flex-1 relative bg-white rounded-2xl border-2 border-primary/10 shadow-inner overflow-hidden cursor-crosshair touch-none ${isFullscreen ? 'rounded-3xl border-0 shadow-2xl mb-4' : ''}`}>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                        className="absolute inset-0"
                    />
                    
                    {!isFullscreen && (
                        <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 select-none">
                            <div className="text-black text-xs font-bold flex items-center gap-2">
                                <Palette className="h-3 w-3" /> 崇明國中 v2 電子白板
                            </div>
                        </div>
                    )}
                </div>

                {isFullscreen && <Toolbar />}
            </div>
        </ToolLayout>
    );
}
