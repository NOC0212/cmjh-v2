import { Home, Bell, Calendar, Github, ExternalLink, Menu, Clock, Cloud, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  { title: "倒數計時器", path: "#countdown", icon: Clock },
  { title: "天氣資訊", path: "#weather", icon: Cloud },
  { title: "常用網站", path: "#common-sites", icon: Home },
  { title: "小工具", path: "#tools", icon: Wrench },
  { title: "行政公告", path: "#announcements", icon: Bell },
  { title: "行事曆", path: "#calendar", icon: Calendar },
];

export function AppSidebar() {

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
