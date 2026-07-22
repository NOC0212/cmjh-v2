interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
}

export function Loading({ fullScreen = false, message }: LoadingProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-5">
      <div className="relative w-[96px] h-[96px]">
        {/* 靜止 favicon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/favicon.png"
            alt="Loading"
            className="relative z-10"
            style={{ width: 72, height: 72 }}
            {...{ "fetchpriority": "high" }}
          />
        </div>
        {/* 光點沿正方形邊緣繞圈 */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 96 96"
        >
          <rect
            x="4" y="4" width="88" height="88" rx="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="5"
            strokeDasharray="40 280"
            strokeLinecap="round"
            className="text-primary"
            style={{ animation: "dash 0.7s linear infinite" }}
          />
        </svg>
      </div>
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        {message || "正在載入中..."}
      </p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      {content}
    </div>
  );
}
