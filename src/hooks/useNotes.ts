import { useState, useEffect } from "react";
import { STORAGE_KEYS } from "@/lib/app-version";

const STORAGE_KEY = STORAGE_KEYS.SCRATCHPAD;

export function useNotes() {
    const [notes, setNotes] = useState<string>(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved || `# 第一級標題
## 第二級標題
### 第三級標題

**加粗**

*斜體*

~~刪除線~~

* 列表

[連結](https://google.com)

分隔線

---`;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, notes);
    }, [notes]);

    return [notes, setNotes] as const;
}
