# 代碼優化建議

## 🔴 高優先級（影響功能與安全性）

### 1. TypeScript 配置過於寬鬆
**問題位置**: `tsconfig.json`
```json
{
  "noImplicitAny": false,
  "strictNullChecks": false,
  "noUnusedLocals": false,
  "noUnusedParameters": false
}
```

**建議**:
- 逐步啟用嚴格模式，提高類型安全
- 至少啟用 `strictNullChecks` 和 `noImplicitAny`

**優化後**:
```json
{
  "noImplicitAny": true,
  "strictNullChecks": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true
}
```

### 2. API 密鑰硬編碼
**問題位置**: `src/components/WeatherWidget.tsx:9`
```typescript
const API_KEY = "CWA-6AEC6F91-948A-464F-9DC1-AC1B8361153D";
```

**建議**:
- 使用環境變數 `import.meta.env.VITE_CWA_API_KEY`
- 在 `.env` 文件中管理，並加入 `.gitignore`

### 3. 內存洩漏風險
**問題位置**: `src/hooks/useScrollAnimation.tsx:25-29`
```typescript
return () => {
  if (ref.current) {
    observer.unobserve(ref.current);  // ❌ ref.current 可能已改變
  }
};
```

**建議**:
```typescript
useEffect(() => {
  const currentRef = ref.current;
  if (!currentRef) return;
  
  const observer = new IntersectionObserver(/* ... */);
  observer.observe(currentRef);
  
  return () => {
    observer.disconnect();  // ✅ 直接 disconnect，更安全
  };
}, []);
```

### 4. 錯誤處理不一致
**問題位置**: `src/components/CountdownTimer.tsx:158, 166, 173`
```typescript
alert("請填寫標題和目標日期");  // ❌ 使用原生 alert
```

**建議**:
- 統一使用 `useToast` hook 顯示錯誤提示
- 已安裝 `sonner`，可以使用 toast 通知

---

## 🟡 中優先級（性能優化）

### 5. 缺少 useCallback 導致不必要的重新渲染
**問題位置**: `src/components/WeatherWidget.tsx:114`
```typescript
const fetchWeather = async (district: string) => {
  // 每次組件渲染都會創建新函數
};
```

**建議**:
```typescript
const fetchWeather = useCallback(async (district: string) => {
  // ...
}, []);  // 或加入必要的依賴
```

### 6. 組件在每次渲染時重新創建
**問題位置**: `src/pages/Index.tsx:29-54`
```typescript
const componentMap = {
  countdown: {
    element: <CountdownTimer />,  // ❌ 每次渲染都創建新元素
    anim: countdownAnim,
  },
  // ...
};
```

**建議**:
- 使用 `useMemo` 緩存組件映射
- 或將組件改為函數引用，在渲染時調用

```typescript
const componentMap = useMemo(() => ({
  countdown: {
    element: <CountdownTimer />,
    anim: countdownAnim,
  },
  // ...
}), [countdownAnim, weatherAnim, /* ... */]);
```

### 7. Timer 組件的 interval 邏輯問題
**問題位置**: `src/pages/tools/Timer.tsx:25-42`
```typescript
useEffect(() => {
  if (isCountdownRunning && timeLeft > 0) {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsCountdownRunning(false);  // ❌ 在 setState 回調中調用 setState
          // ...
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }
}, [isCountdownRunning, timeLeft]);  // ❌ timeLeft 變化會重新創建 interval
```

**建議**:
```typescript
useEffect(() => {
  if (!isCountdownRunning || timeLeft <= 0) return;
  
  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  
  return () => clearInterval(timer);
}, [isCountdownRunning]);  // ✅ 只依賴 isCountdownRunning

useEffect(() => {
  if (timeLeft === 0 && isCountdownRunning) {
    setIsCountdownRunning(false);
    if (audioRef.current) {
      audioRef.current.play();
    }
  }
}, [timeLeft, isCountdownRunning]);
```

### 8. localStorage 操作未使用 try-catch
**問題位置**: 多處，如 `src/hooks/useFavorites.tsx:24`
```typescript
localStorage.setItem("favorites", JSON.stringify(newFavorites));
// ❌ 可能因存儲空間不足或私密模式失敗
```

**建議**:
```typescript
try {
  localStorage.setItem("favorites", JSON.stringify(newFavorites));
} catch (error) {
  console.error("Failed to save favorites:", error);
  // 可選：顯示用戶友好的錯誤提示
}
```

---

## 🟢 低優先級（代碼質量）

### 9. 類型安全問題
**問題位置**: `src/components/CountdownTimer.tsx:78`
```typescript
const configs = parsed.map((c: any) => ({  // ❌ 使用 any
```

**建議**:
```typescript
interface StoredCountdownConfig {
  id: string;
  targetDate: string;
  startDate?: string;
  label: string;
  progressLabel: string;
  isDefault?: boolean;
}

const configs = parsed.map((c: StoredCountdownConfig) => ({
  // ...
}));
```

### 10. 重複的日期格式化邏輯
**問題位置**: `src/components/CountdownTimer.tsx:201-208`
```typescript
const formatDateForInput = (date: Date): string => {
  // 這個邏輯可能在其他地方也需要
};
```

**建議**:
- 創建 `src/lib/dateUtils.ts` 統一管理日期工具函數
- 使用 `date-fns`（已安裝）進行日期格式化

### 11. 重複的 localStorage 操作
**問題位置**: 多處組件中都有類似的 localStorage 操作

**建議**:
- 創建 `src/lib/storage.ts` 統一管理
```typescript
export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
};
```

### 12. 缺少錯誤邊界（Error Boundary）
**建議**:
- 添加 React Error Boundary 組件
- 防止單個組件錯誤導致整個應用崩潰

### 13. 環境變數管理
**建議**:
- 創建 `.env.example` 文件
- 在 `vite.config.ts` 中配置環境變數類型

### 14. 代碼分割（Code Splitting）
**問題**: 所有工具頁面都在主 bundle 中

**建議**:
```typescript
// src/App.tsx
const Wheel = lazy(() => import("./pages/tools/Wheel"));
const Grouping = lazy(() => import("./pages/tools/Grouping"));
// ...

<Suspense fallback={<Loading />}>
  <Route path="/tools/wheel" element={<Wheel />} />
</Suspense>
```

### 15. 優化 Vite 配置
**建議**: 在 `vite.config.ts` 中添加構建優化
```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', /* ... */]
        }
      }
    }
  }
});
```

---

## 📊 性能監控建議

### 16. 添加性能監控
- 使用 React DevTools Profiler
- 考慮添加 Web Vitals 監控

### 17. 圖片優化
- 檢查是否有未優化的圖片
- 考慮使用 WebP 格式
- 添加 lazy loading

---

## 🔧 開發體驗優化

### 18. 添加 Prettier 配置
**建議**: 統一代碼格式

### 19. 添加 Husky + lint-staged
**建議**: 提交前自動檢查代碼

### 20. 改進 README
**建議**: 
- 添加環境變數說明
- 添加開發指南
- 添加故障排除章節

---

## 總結

**立即修復**（高優先級）:
1. ✅ 修復 useScrollAnimation 內存洩漏
2. ✅ 將 API 密鑰移至環境變數
3. ✅ 統一錯誤處理（移除 alert）
4. ✅ 啟用 TypeScript 嚴格檢查

**短期優化**（中優先級）:
5. ✅ 添加 useCallback/useMemo
6. ✅ 修復 Timer 組件邏輯
7. ✅ 統一 localStorage 操作

**長期改進**（低優先級）:
8. ✅ 代碼分割
9. ✅ 錯誤邊界
10. ✅ 性能監控

