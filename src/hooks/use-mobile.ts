import * as React from "react";

const IS_MOBILE_QUERY = "(max-width: 768px)";

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    () => typeof window !== "undefined" && window.matchMedia(IS_MOBILE_QUERY).matches,
  );

  React.useEffect(() => {
    const mql = window.matchMedia(IS_MOBILE_QUERY);
    const onChange = () => setIsMobile(window.innerWidth <= 768);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
