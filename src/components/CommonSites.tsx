import { ExternalLink, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useCommonSites } from "@/hooks/useCommonSites";
import { CommonSitesDialog } from "@/components/CommonSitesDialog";

export function CommonSites() {
  const [isExpanded, setIsExpanded] = useState(true);
  const { sites } = useCommonSites();

  return (
    <section id="common-sites" className="mb-12 scroll-mt-20">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">常用網站</h2>
        <div className="flex items-center gap-2">
          <CommonSitesDialog />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2 hover:bg-primary/10 transition-all"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                收起
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                展開
              </>
            )}
          </Button>
        </div>
      </div>
      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
          {sites.map((site, idx) => (
            <a
              key={site.id}
              href={site.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative rounded-xl p-6 border border-primary/20 overflow-hidden transition-all duration-500 hover:scale-105 hover:shadow-[var(--shadow-glow)]"
              style={{
                background: 'var(--gradient-site)',
                animationDelay: `${idx * 50}ms`
              }}
            >
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="relative z-10 flex items-start justify-between gap-3">
                <span className="font-semibold text-card-foreground group-hover:text-primary transition-all duration-300 leading-snug">
                  {site.name}
                </span>
                <ExternalLink className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-300 flex-shrink-0" />
              </div>

              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
