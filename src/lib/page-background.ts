import type { CSSProperties } from "react";

const PAGE_BACKGROUNDS: Record<string, CSSProperties["background"]> = {
  default: "hsl(var(--background))",
};

const PRESET_BACKGROUND_IMAGES: Record<string, string> = {
  "preset-1": "/background-1.png",
  "preset-2": "/background-2.png",
};

export function isImagePageBackground(pageBackground = "default", pageBackgroundImage = "") {
  return pageBackground === "image"
    ? !!pageBackgroundImage
    : Object.prototype.hasOwnProperty.call(PRESET_BACKGROUND_IMAGES, pageBackground);
}

export function getPageBackgroundStyle(pageBackground = "default", pageBackgroundImage = ""): CSSProperties {
  const presetImage = PRESET_BACKGROUND_IMAGES[pageBackground];

  if (presetImage || (pageBackground === "image" && pageBackgroundImage)) {
    const imageUrl = presetImage ?? pageBackgroundImage;
    return {
      backgroundImage: `linear-gradient(hsl(0 0% 0% / 0.18), hsl(0 0% 0% / 0.18)), url("${imageUrl}")`,
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundAttachment: "fixed",
      backgroundColor: "hsl(var(--background))",
    };
  }

  return {
    background: PAGE_BACKGROUNDS[pageBackground] ?? PAGE_BACKGROUNDS.default,
    backgroundAttachment: pageBackground === "default" ? undefined : "fixed",
  };
}
