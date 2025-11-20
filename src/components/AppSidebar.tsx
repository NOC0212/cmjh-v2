import { Home, Bell, Calendar, Github, ExternalLink, Menu, Sun, Moon, Palette, Clock, Cloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";

const navItems = [
  { title: "倒數計時器", path: "#countdown", icon: Clock },
  { title: "天氣資訊", path: "#weather", icon: Cloud },
  { title: "常用網站", path: "#common-sites", icon: Home },
  { title: "行政公告", path: "#announcements", icon: Bell },
  { title: "行事曆", path: "#calendar", icon: Calendar },
];

const themes = [
  { name: "淺色", value: "light", icon: Sun },
  { name: "深色", value: "dark", icon: Moon },
  { name: "藍色", value: "blue", icon: Palette },
  { name: "綠色", value: "green", icon: Palette },
  { name: "橙色", value: "orange", icon: Palette },
  { name: "紅色", value: "red", icon: Palette },
  { name: "紫色", value: "purple", icon: Palette },
];

export function AppSidebar() {
  const [activeTheme, setActiveTheme] = useState("light");

  useEffect(() => {
    const savedTheme = localStorage.getItem("active-theme") || "light";
    setActiveTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (value: string) => {
    const root = document.documentElement;
    const body = document.body;

    // Remove all theme classes and attributes on both html and body
    [root, body].forEach((el) => {
      el.classList.remove("dark");
      ["blue", "green", "orange", "red", "purple"].forEach((name) => {
        el.classList.remove(`theme-${name}`);
      });
      el.removeAttribute("data-theme");
    });

    // Apply new theme
    if (value === "dark") {
      root.classList.add("dark");
      body.classList.add("dark");
    } else if (value !== "light") {
      const cls = `theme-${value}`;
      root.classList.add(cls);
      body.classList.add(cls);
      root.setAttribute("data-theme", value);
      body.setAttribute("data-theme", value);
    }

    localStorage.setItem("active-theme", value);
    setActiveTheme(value);
  };

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
        <Button variant="ghost" size="icon">
          <Menu className="h-5 w-5" />
          <span className="sr-only">選單</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>選擇主題</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            onClick={() => applyTheme(t.value)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <t.icon className="h-4 w-4" />
            <span className={activeTheme === t.value ? "font-semibold" : ""}>
              {t.name}
            </span>
            {activeTheme === t.value && (
              <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
            )}
          </DropdownMenuItem>
        ))}
        
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
            href="https://github.com/PRO-DEV0212/cmjh"
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <Github className="h-4 w-4 mr-2" />
            <span>開源 GitHub</span>
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
