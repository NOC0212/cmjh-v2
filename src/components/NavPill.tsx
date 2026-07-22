import { useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavPillLink {
  label: string;
  href: string;
}

interface NavPillProps {
  links: NavPillLink[];
  isScrolled?: boolean;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

export function NavPill({ links, isScrolled = false, isDarkMode = false, onToggleTheme }: NavPillProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 md:px-8 pt-4 pointer-events-none">
      <div
        className={cn(
          "flex items-center justify-between w-full transition-all duration-300 ease-out pointer-events-auto",
          isScrolled
            ? "max-w-[min(92%,400px)] sm:max-w-[min(50%,400px)] rounded-[14px] sm:rounded-[18px] px-[12px] sm:px-[16px] py-[4px] sm:py-[6px] shadow-[0_8px_30px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04)] backdrop-blur-[12px] border " + (
                isDarkMode
                  ? "bg-slate-950/90 border-white/10"
                  : "bg-white/85 border-black/10"
              )
            : "max-w-full rounded-none px-0 shadow-none backdrop-blur-none border-none bg-transparent"
        )}
      >
        <div className="flex items-center gap-0.5 sm:gap-2 pl-1 py-1 sm:py-2">
          <img
            src="/favicon.png" alt="logo"
            className={cn("transition-all duration-300 ease-out cursor-pointer", isScrolled ? "w-[24px] sm:w-[30px] h-[24px] sm:h-[30px]" : "w-[32px] sm:w-[36px] h-[32px] sm:h-[36px]")}
            onClick={() => navigate("/home")}
          />
          <span
            className={cn(
              "font-semibold tracking-tight transition-all duration-300 ml-0.5 sm:ml-2",
              isScrolled ? "text-xs sm:text-base" : "text-sm sm:text-xl",
              isDarkMode ? "text-white" : "text-slate-900"
            )}
          >CMJH-V2</span>
          <div className="flex items-center gap-0.5 sm:gap-2 ml-1 sm:ml-4">
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <button
                  key={link.href}
                  onClick={() => navigate(link.href)}
                  className={cn(
                    "relative px-2 sm:px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap",
                    active
                      ? "text-cyan-600 dark:text-cyan-400"
                      : isDarkMode
                        ? "text-white/70 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                  )}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-[calc(100%-8px)] sm:w-[calc(100%-16px)] h-[2px] sm:h-[3px] rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
        {onToggleTheme && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className={cn(
              "rounded-xl mr-0.5 sm:mr-1 mt-0.5 sm:mt-1 transition-all duration-300 ease-out",
              isScrolled ? "w-[26px] sm:w-[32px] h-[26px] sm:h-[32px]" : "w-[34px] sm:w-[40px] h-[34px] sm:h-[40px]",
              isDarkMode ? "hover:bg-white/10" : "hover:bg-black/10"
            )}
            title={isDarkMode ? "切換至淺色模式" : "切換至深色模式"}
          >
            {isDarkMode ? (
              <Sun className={cn("text-amber-400 transition-all duration-300 ease-out", isScrolled ? "w-3 sm:w-4 h-3 sm:h-4" : "w-4 sm:w-5 h-4 sm:h-5")} />
            ) : (
              <Moon className={cn("text-slate-600 transition-all duration-300 ease-out", isScrolled ? "w-3 sm:w-4 h-3 sm:h-4" : "w-4 sm:w-5 h-4 sm:h-5")} />
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
