import { ExternalLink, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCommonSites } from "@/hooks/useCommonSites";
import { CommonSitesDialog } from "@/components/CommonSitesDialog";
import { CommonSitesAddDialog } from "@/components/CommonSitesAddDialog";
import { useSettings } from "@/hooks/SettingsContext";
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
    const { sites } = useCommonSites();
    const { settings } = useSettings();
    const showFavicons = settings.showSiteFavicons;

    return (
        <section id="common-sites">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className="section-header-icon">
                        <Globe className="h-4 w-4" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">常用網站</h2>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5">
                    {sites.map((site) => {
                        const faviconUrl = getFaviconUrl(site.url);
                        return (
                            <a
                                key={site.id}
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-border/60 bg-card transition-all duration-200 hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm active:scale-[0.98]"
                            >
                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                    {showFavicons && faviconUrl ? (
                                        <img
                                            src={faviconUrl}
                                            alt=""
                                            className="w-4 h-4 rounded"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </div>
                                <span className="flex-1 min-w-0 text-xs font-medium text-card-foreground group-hover:text-primary transition-colors leading-snug truncate">
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
                </div>
            )}
        </section>
    );
}
