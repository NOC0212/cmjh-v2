import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCommonSites } from "@/hooks/useCommonSites";
import { CommonSitesDialog } from "@/components/CommonSitesDialog";
import { useSettings } from "@/hooks/SettingsContext";

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
        <section id="common-sites" className="mb-10 scroll-mt-20">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    常用網站
                </h2>
                <div className="flex items-center gap-2">
                    <CommonSitesDialog />
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="gap-1.5 hover:bg-primary/10 transition-all text-sm"
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                    {sites.map((site, idx) => {
                        const faviconUrl = getFaviconUrl(site.url);
                        return (
                            <a
                                key={site.id}
                                href={site.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group flex items-center gap-2 px-3 py-2.5 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:bg-primary/5 hover:shadow-sm transition-all duration-200"
                                style={{ animationDelay: `${idx * 30}ms` }}
                            >
                                {/* Favicon */}
                                <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                                    {showFavicons && faviconUrl ? (
                                        <img
                                            src={faviconUrl}
                                            alt=""
                                            className="w-4 h-4 rounded-sm"
                                            onError={(e) => {
                                                (e.currentTarget as HTMLImageElement).style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                                    )}
                                </div>
                                {/* 名稱 */}
                                <span className="flex-1 min-w-0 text-xs font-medium text-card-foreground group-hover:text-primary transition-colors duration-200 leading-snug truncate">
                                    {site.name}
                                </span>
                                {/* 外連 icon */}
                                <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-primary/50 transition-colors shrink-0 opacity-0 group-hover:opacity-100" />
                            </a>
                        );
                    })}
                </div>
            )}
        </section>
    );
}
