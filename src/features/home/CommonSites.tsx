import { ExternalLink, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SITE_CATEGORIES, useCommonSites } from "@/hooks/use-common-sites";
import { CommonSitesAddDialog, CommonSitesDialog } from "@/features/home/CommonSitesDialogs";
import { useSettings } from "@/hooks/settings-context";
import { cn } from "@/lib/utils";

function getFaviconUrl(url: string) {
    try {
        const { hostname } = new URL(url);
        return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
    } catch {
        return null;
    }
}

export function CommonSites() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [activeCategory, setActiveCategory] = useState<string>("all");
    const { sites } = useCommonSites();
    const { settings } = useSettings();
    const showFavicons = settings.showSiteFavicons;

    // 只有有網站的類別才顯示標籤
    const availableCategories = SITE_CATEGORIES.filter((category) =>
        sites.some((site) => site.category === category.value)
    );

    const filteredSites =
        activeCategory === "all"
            ? sites
            : sites.filter((site) => site.category === activeCategory);

    return (
        <section id="common-sites">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="section-icon">
                        <Globe className="h-4 w-4" />
                    </span>
                    <h2 className="text-lg font-bold text-foreground">常用網站</h2>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{sites.length} 個網站</span>
                </div>
                <div className="flex items-center gap-1">
                    <CommonSitesAddDialog />
                    <CommonSitesDialog />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-1 h-8 px-2 rounded-lg text-xs hover:bg-primary/10 transition-all"
                    >
                        {isExpanded ? (
                            <><ChevronUp className="h-3.5 w-3.5" />收起</>
                        ) : (
                            <><ChevronDown className="h-3.5 w-3.5" />展開</>
                        )}
                    </Button>
                </div>
            </div>

            {isExpanded && (
                <>
                {availableCategories.length > 1 && (
                    <div className="mb-3 flex flex-wrap items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => setActiveCategory("all")}
                            className={cn(
                                "rounded-full px-3 py-1 text-xs font-bold transition-all",
                                activeCategory === "all"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            )}
                        >
                            全部
                            <span className="ml-1 opacity-70">{sites.length}</span>
                        </button>
                        {availableCategories.map((category) => (
                            <button
                                key={category.value}
                                type="button"
                                onClick={() => setActiveCategory(category.value)}
                                className={cn(
                                    "rounded-full px-3 py-1 text-xs font-bold transition-all",
                                    activeCategory === category.value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                                )}
                            >
                                {category.label}
                                <span className="ml-1 opacity-70">
                                    {sites.filter((site) => site.category === category.value).length}
                                </span>
                            </button>
                        ))}
                    </div>
                )}
                <div className="flex flex-wrap gap-2">
                    {filteredSites.map((site) => {
                        const faviconUrl = getFaviconUrl(site.url);
                        return (
                            <a
                                key={site.id}
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group inline-flex max-w-full items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
                            >
                                <div className="flex h-4 w-4 shrink-0 items-center justify-center">
                                    {showFavicons && faviconUrl ? (
                                        <img
                                            src={faviconUrl}
                                            alt=""
                                            className="h-4 w-4 rounded"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </div>
                                <span className="text-sm font-medium leading-snug text-card-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                                    {site.name}
                                </span>
                                <ExternalLink className={cn(
                                    "h-3 w-3 shrink-0 transition-all duration-200",
                                    "text-muted-foreground/40 group-hover:text-primary/50",
                                    "opacity-0 group-hover:opacity-100"
                                )} />
                            </a>
                        );
                    })}
                    {filteredSites.length === 0 && (
                        <p className="w-full py-4 text-center text-xs text-muted-foreground">此分類尚無網站</p>
                    )}
                </div>
                </>
            )}
        </section>
    );
}
