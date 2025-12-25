import { useEffect, useRef, useState } from "react";

export function useScrollAnimation() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentRef = ref.current;

    // 若無引用對象，則延遲顯示以作保修
    if (!currentRef) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    }

    // 建立 Intersection Observer 觀察元素是否進入可視範圍
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting || entry.intersectionRatio > 0) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      {
        threshold: [0, 0.01, 0.1],
        rootMargin: "50px", // 提前 50px 觸發動畫
      }
    );

    observer.observe(currentRef);

    // 安全備援機制：強制於 1.5 秒後顯示
    const safetyTimer = setTimeout(() => {
      setIsVisible(true);
      observer.disconnect();
    }, 1500);

    return () => {
      clearTimeout(safetyTimer);
      observer.disconnect();
    };
  }, []);

  return { ref, isVisible };
}
