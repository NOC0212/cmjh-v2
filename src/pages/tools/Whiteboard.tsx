import { useState, useRef, useEffect, useCallback } from "react";
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
    const pendingUndoRef = useRef(false);
    const { toast } = useToast();

    useEffect(() => {
        const handleFSChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFSChange);
        return () => document.removeEventListener("fullscreenchange", handleFSChange);
    }, []);

    useEffect(() => {
        const resizeCanvas = () => {
            const canvas = canvasRef.current;
            const container = containerRef.current;
            if (!canvas || !container) return;

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
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                };
                img.onerror = () => {
                    ctx.lineCap = "round";
                    ctx.lineJoin = "round";
                };
            }
        };

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

    const undo = useCallback(() => {
        if (history.length === 0 || pendingUndoRef.current) return;
        const lastState = history[history.length - 1];
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (canvas && ctx) {
            pendingUndoRef.current = true;
            setHistory(prev => prev.slice(0, -1));
            const img = new Image();
            img.onload = () => {
                ctx.globalCompositeOperation = "source-over";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                pendingUndoRef.current = false;
            };
            img.onerror = () => {
                pendingUndoRef.current = false;
            };
            img.src = lastState;
        }
    }, [history]);

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
        <div className={`flex flex-wrap items-stretch gap-2 ${isFullscreen ? 'w-full max-w-3xl mx-auto' : ''}`}>
            <Card className={`flex flex-wrap items-center gap-1.5 p-2 bg-card/90 backdrop-blur-md border-primary/10 shadow-xl flex-1 ${isFullscreen ? 'mb-4' : 'sticky top-0 z-30'}`}>
                <div className="flex items-center gap-1">
                    <Button variant={mode === "pencil" ? "default" : "outline"} size="icon" onClick={() => setMode("pencil")} title="畫筆" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant={mode === "line" ? "default" : "outline"} size="icon" onClick={() => setMode("line")} title="直線" className="h-8 w-8">
                        <Slash className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant={mode === "dashed-line" ? "default" : "outline"} size="icon" onClick={() => setMode("dashed-line")} title="虛線" className="h-8 w-8">
                        <Grid className="h-3.5 w-3.5 rotate-45" />
                    </Button>
                    <Button variant={mode === "eraser" ? "default" : "outline"} size="icon" onClick={() => setMode("eraser")} title="橡皮擦" className="h-8 w-8">
                        <Eraser className="h-3.5 w-3.5" />
                    </Button>
                    <div className="h-6 w-px bg-border/50 mx-1" />
                    <Button variant="outline" size="icon" onClick={undo} disabled={history.length === 0} title="復原" className="h-8 w-8">
                        <Undo2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={clearCanvas} title="清除全部" className="h-8 w-8">
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                </div>

                <div className="flex items-center gap-1.5 ml-auto">
                    <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => { setShowColors(!showColors); setShowWidths(false); }} className="h-8 gap-1.5 text-xs">
                            <div className="w-3.5 h-3.5 rounded-full border border-border/50" style={{ backgroundColor: color }} />
                            <span className="hidden sm:inline">顏色</span>
                            {showColors ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                        {showColors && (
                            <div className={`absolute p-2 bg-card border border-border/50 shadow-2xl rounded-xl grid grid-cols-4 gap-1.5 z-50 min-w-[140px] ${isFullscreen ? 'bottom-10 left-0' : 'top-10 left-0'}`}>
                                {colors.map((c) => (
                                    <button
                                        key={c.val}
                                        className={`w-7 h-7 rounded-full transition-all hover:scale-125 active:scale-90 ${color === c.val ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'}`}
                                        style={{ backgroundColor: c.val }}
                                        onClick={() => { setColor(c.val); setShowColors(false); }}
                                        title={c.name}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="relative">
                        <Button variant="outline" size="sm" onClick={() => { setShowWidths(!showWidths); setShowColors(false); }} className="h-8 gap-1.5 text-xs font-mono">
                            粗細: {lineWidth}
                            {showWidths ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        </Button>
                        {showWidths && (
                            <div className={`absolute p-2 bg-card border border-border/50 shadow-2xl rounded-xl grid grid-cols-5 gap-1 z-50 min-w-[160px] ${isFullscreen ? 'bottom-10 left-0' : 'top-10 left-0'}`}>
                                {widths.map((w) => (
                                    <button
                                        key={w}
                                        className={`h-7 rounded-lg text-xs font-bold transition-all active:scale-90 ${lineWidth === w ? 'bg-primary text-primary-foreground' : 'hover:bg-muted'}`}
                                        onClick={() => { setLineWidth(w); setShowWidths(false); }}
                                    >
                                        {w}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="h-6 w-px bg-border/50 mx-0.5" />

                    <Button variant="outline" size="icon" onClick={toggleFullscreen} title={isFullscreen ? "退出全螢幕" : "全螢幕"} className="h-8 w-8">
                        {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="outline" size="sm" onClick={download} className="h-8 gap-1.5 text-xs">
                        <Download className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">下載</span>
                    </Button>
                </div>
            </Card>
        </div>
    );

    return (
        <ToolLayout title="電子白板">
            <div 
                ref={containerRef} 
                className={`flex flex-col gap-3 bg-background relative ${isFullscreen ? 'h-screen w-screen p-3 sm:p-4' : 'h-[calc(100vh-180px)] min-h-[450px]'}`}
            >
                {!isFullscreen && <Toolbar />}

                <div className={`flex-1 relative bg-white rounded-2xl border border-primary/10 shadow-inner overflow-hidden cursor-crosshair touch-none ${isFullscreen ? 'rounded-3xl border-0 shadow-2xl' : ''}`}>
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
                        <div className="absolute bottom-3 right-3 pointer-events-none opacity-10 select-none">
                            <Palette className="h-4 w-4 text-black" />
                        </div>
                    )}
                </div>

                {isFullscreen && <Toolbar />}
            </div>
        </ToolLayout>
    );
}
