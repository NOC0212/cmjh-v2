import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  Megaphone,
  Star,
  Settings,
  Shield,
  RefreshCw,
  BookOpen,
  Github,
  Menu,
  ExternalLink,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useFavorites } from "@/hooks/use-favorites";
import { isAdminUnlocked } from "@/lib/app-version";
import { FloatingTools } from "@/components/FloatingTools";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { to: "/app", label: "主頁", icon: Home },
  { to: "/search", label: "搜尋", icon: Search },
  { to: "/announcements", label: "公告", icon: Megaphone },
  { to: "/favorites", label: "收藏", icon: Star },
  { to: "/settings", label: "設定", icon: Settings },
];

const adminNavItem = { to: "/admin", label: "管理", icon: Shield };

/** App Shell — 一體式佈局 */
export function AppLayout({
  children,
}: {
  children?: React.ReactNode;
}) {
  const isMobile = useIsMobile();
  const location = useLocation();
  const showFloatingTools = location.pathname === "/app";

  if (isMobile) {
    return (
      <>
        <MobileShell>{children}</MobileShell>
        {showFloatingTools && <FloatingTools />}
      </>
    );
  }
  return (
    <>
      <DesktopShell pathname={location.pathname}>{children}</DesktopShell>
      {showFloatingTools && <FloatingTools />}
    </>
  );
}

function useNavItems() {
  const { favorites } = useFavorites();
  const items = isAdminUnlocked() ? [...navItems, adminNavItem] : navItems;
  return { items, favoriteCount: favorites.length };
}

function NavBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-1 -right-1.5 bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full h-4 min-w-[16px] flex items-center justify-center px-1 shadow-sm">
      {count > 9 ? "9+" : count}
    </span>
  );
}

// ─── 桌面版側邊欄 ────────────────────────────────────────────────────────────

function DesktopShell({ pathname, children }: { pathname: string; children?: React.ReactNode }) {
  const [isHovered, setIsHovered] = useState(false);
  const { items, favoriteCount } = useNavItems();

  return (
    <div className="h-[100dvh] w-full flex overflow-hidden bg-background">
      {/* 品牌光暈裝飾 */}
      <div
        className="fixed -right-48 -top-48 w-[800px] h-[800px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, hsl(var(--primary) / 0.05), transparent 70%)" }}
      />

      <motion.nav
        initial={false}
        animate={{ width: isHovered ? 220 : 64 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="fixed left-0 top-0 h-full z-50 flex flex-col bg-card border-r border-border/60 shadow-sm py-5 overflow-x-hidden"
      >
        {/* 品牌區 */}
        <div className={cn("mb-6 flex flex-col gap-4 px-3", isHovered ? "items-stretch" : "items-center")}>
          <div className="flex items-center overflow-hidden">
            <div className="flex items-center justify-center w-8 h-8 shrink-0 rounded-xl bg-primary/10">
              <img src="/favicon.png" alt="崇明國中v2" className="h-5 w-5" />
            </div>
            {isHovered && (
              <motion.h1
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="text-sm font-bold text-brand-gradient whitespace-nowrap ml-2"
              >
                崇明國中v2
              </motion.h1>
            )}
          </div>
        </div>

        {/* 導航項 */}
        <div className="flex-1 flex flex-col gap-1 px-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.to === "/app" ? pathname === "/app" : pathname.startsWith(item.to);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  "relative flex items-center h-10 rounded-xl transition-all duration-200",
                  isHovered ? "gap-3 px-2 w-full justify-start" : "w-10 justify-center mx-auto",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                )}
              >
                <div className="relative">
                  <Icon className={cn("h-5 w-5 shrink-0", isActive && "stroke-[2.5px]")} />
                  {item.to === "/favorites" && <NavBadge count={favoriteCount} />}
                </div>
                {isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.label}
                  </motion.span>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* 快速導航漢堡選單 */}
        <div className="mt-auto px-2 mb-1">
          <QuickNavMenu expanded={isHovered} />
        </div>
      </motion.nav>

      <div className="w-16 shrink-0" />

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl w-full mx-auto px-4 lg:px-8 py-6">{children ?? <Outlet />}</div>
      </main>
    </div>
  );
}

/* ===== 快速導航漢堡選單 ===== */

function QuickNavMenu({ expanded }: { expanded?: boolean }) {
  const navigate = useNavigate();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={expanded ? "default" : "icon"}
          className={cn(
            "h-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all",
            expanded ? "w-full justify-start gap-3 px-2" : "w-9 justify-center mx-auto",
          )}
        >
          <Menu className="h-4 w-4 shrink-0" />
          {expanded && <span className="text-sm font-medium">快速導航</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>快速導航</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/home")} className="cursor-pointer">
          <Home className="h-4 w-4 mr-2" />
          <span>首頁</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/docs")} className="cursor-pointer">
          <BookOpen className="h-4 w-4 mr-2" />
          <span>文檔</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href="https://github.com/NOC0212/cmjh-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Github className="h-4 w-4 mr-2" />
            <span>開源專案</span>
            <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground/50" />
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── 手機版：頂部列 + 底部 Tab ──────────────────────────────────────────────

function MobileShell({ children }: { children?: React.ReactNode }) {
  const { items, favoriteCount } = useNavItems();
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollY = useRef(0);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = mainRef.current;
    if (!container) return;
    const handleScroll = () => {
      const currentY = container.scrollTop;
      if (currentY > lastScrollY.current && currentY > 80) {
        setHeaderHidden(true);
      } else {
        setHeaderHidden(false);
      }
      lastScrollY.current = currentY;
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="h-[100dvh] w-full flex flex-col overflow-hidden bg-background">
      {/* 頂部列 */}
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 safe-area-top",
          headerHidden ? "-translate-y-full" : "translate-y-0",
        )}
      >
        <div className="glass">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-primary/10">
                <img src="/favicon.png" alt="崇明國中v2" className="h-5 w-5" />
              </div>
              <h1 className="text-base font-bold text-brand-gradient">崇明國中v2</h1>
            </div>
            <div className="flex items-center gap-1">
              <QuickNavMenu />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="重新整理頁面"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main ref={mainRef} className="flex-1 overflow-y-auto pt-16 pb-20">
        <div className="max-w-5xl w-full mx-auto px-4">{children ?? <Outlet />}</div>
      </main>

      {/* 底部 Tab 列 */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <nav className="glass-strong rounded-t-2xl px-2 safe-area-bottom">
          <div className="flex items-center justify-evenly h-14">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      "relative flex flex-col items-center justify-center h-12 flex-1 min-w-0 gap-0.5",
                      isActive ? "text-primary" : "text-muted-foreground",
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <motion.div
                          layoutId="nav-active-pill"
                          className="absolute top-0 mx-auto w-8 h-1 bg-primary rounded-full"
                          transition={{ type: "spring", stiffness: 500, damping: 35 }}
                        />
                      )}
                      <div className="relative">
                        <Icon
                          className={cn("h-5 w-5", isActive && "stroke-[2.5px]")}
                          fill={isActive && (item.to === "/app" || item.to === "/favorites") ? "currentColor" : "none"}
                        />
                        {item.to === "/favorites" && <NavBadge count={favoriteCount} />}
                      </div>
                      <span className="text-[10px] leading-tight font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
