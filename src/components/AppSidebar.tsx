import { Home, Bell, Calendar, Github, ExternalLink, Menu, Clock, Cloud, Wrench, Trophy, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useSettings } from "@/hooks/SettingsContext";

const ICON_MAP: Record<string, typeof Clock> = {
  countdown: Clock,
  weather: Cloud,
  commonSites: Home,
  tools: Wrench,
  honors: Trophy,
  announcements: Bell,
  calendar: Calendar,
  lunch: Utensils,
};

const SECTION_ID_MAP: Record<string, string> = {
  commonSites: "common-sites",
};

export function AppSidebar({ expanded = false }: { expanded?: boolean }) {
  const { settings } = useSettings();

  const enabledComponents = settings.components
    .filter((c) => c.enabled)
    .sort((a, b) => a.order - b.order);

  const navItems = enabledComponents
    .filter((c) => ICON_MAP[c.id])
    .map((c) => ({
      title: c.label,
      path: `#${SECTION_ID_MAP[c.id] || c.id}`,
      icon: ICON_MAP[c.id],
    }));

  const scrollToSection = (path: string) => {
    const id = path.replace("#", "");
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size={expanded ? "default" : "icon"}
          className={expanded ? "w-full justify-start p-0 px-2 h-12 rounded-xl" : "h-12 w-12 rounded-xl"}
        >
          <div className="w-8 flex items-center justify-center shrink-0">
            <Menu className="h-5 w-5" />
          </div>
          {expanded && <span className="font-medium text-sm ml-2">快速導航</span>}
          <span className="sr-only">選單</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>快速導航</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {navItems.map((item) => (
          <DropdownMenuItem
            key={item.title}
            onClick={() => scrollToSection(item.path)}
            className="cursor-pointer"
          >
            <item.icon className="h-4 w-4 mr-2" />
            <span>{item.title}</span>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a
            href="https://github.com/NOC0212/cmjh-v2"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Github className="h-4 w-4 mr-2" />
            <span>開源 GitHub專案</span>
          </a>
        </DropdownMenuItem>

        <DropdownMenuItem asChild>
          <a
            href="https://accounts.google.com/v3/signin/identifier?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&hd=cmjh.tn.edu.tw&osid=1&sacu=1&service=mail&flowName=GlifWebSignIn&flowEntry=AddSession"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            <span>學生登入</span>
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
