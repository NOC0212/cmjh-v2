import { motion } from "framer-motion";
import { Construction, TrafficCone } from "lucide-react";

/** 道路施工風格維護動畫 */
export default function ConstructionAnimation() {
  return (
    <div className="relative w-full max-w-sm mx-auto select-none" aria-hidden="true">
      {/* 施工警告牌 */}
      <motion.div
        animate={{ rotate: [0, -8, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="relative mx-auto w-24 h-24 rounded-full border-8 border-amber-400 bg-yellow-300 shadow-lg flex items-center justify-center"
      >
        <Construction className="w-10 h-10 text-slate-900" strokeWidth={2.5} />
        {/* 閃爍警示燈 */}
        <motion.span
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"
        />
        <motion.span
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
        />
      </motion.div>

      {/* 施工場景 */}
      <div className="relative mt-3 mx-auto w-56 h-40">
        {/* 工人 */}
        <motion.div
          initial={{ x: "-50%", y: 0 }}
          animate={{ x: "-50%", y: [0, 2, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-4 left-1/2 flex flex-col items-center"
        >
          {/* 頭 */}
          <div className="relative z-30 flex flex-col items-center">
            {/* 安全帽 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="h-5 w-10 rounded-t-full bg-amber-400 shadow-sm" />
              <div className="absolute left-1/2 top-0.5 h-3.5 w-1 -translate-x-1/2 rounded-full bg-amber-600/60" />
              <div className="-mt-1 h-1.5 w-12 rounded-full bg-amber-500 shadow-sm" />
            </div>
            {/* 臉 */}
            <div className="relative -mt-1.5 h-7 w-8 rounded-full bg-[#ffd9b0]">
              {/* 眼睛 */}
              <span className="absolute left-1.5 top-2.5 h-1.5 w-1 rounded-full bg-slate-800" />
              <span className="absolute right-1.5 top-2.5 h-1.5 w-1 rounded-full bg-slate-800" />
              {/* 腮紅 */}
              <span className="absolute bottom-1 left-0.5 h-1 w-1.5 rounded-full bg-rose-300/80" />
              <span className="absolute bottom-1 right-0.5 h-1 w-1.5 rounded-full bg-rose-300/80" />
              {/* 微笑 */}
              <span className="absolute bottom-1 left-1/2 h-1.5 w-2.5 -translate-x-1/2 rounded-b-full border-2 border-slate-800 border-t-0" />
            </div>
          </div>

          {/* 脖子 */}
          <div className="z-0 -mt-0.5 h-1.5 w-2 rounded-sm bg-[#eebd93]" />

          {/* 反光背心 */}
          <div className="relative z-10 h-9 w-12 rounded-md border-2 border-orange-500 bg-orange-400">
            {/* 反光條 */}
            <div className="absolute inset-x-1 top-1.5 h-1.5 rounded-sm bg-yellow-50/90" />
            <div className="absolute inset-x-1 bottom-1.5 h-1.5 rounded-sm bg-yellow-50/90" />
            {/* 拉鍊 */}
            <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-orange-600/60" />
            {/* 左手臂 */}
            <div className="absolute -left-2 top-0.5 h-7 w-3 rounded-full border border-orange-500/60 bg-orange-400" />
          </div>

          {/* 腿 + 靴子 */}
          <div className="z-10 mt-0.5 flex items-start gap-2.5">
            <div className="flex flex-col items-center">
              <div className="h-5 w-2.5 rounded-b bg-slate-600" />
              <div className="-mt-px h-2 w-3.5 rounded-sm bg-slate-800" />
            </div>
            <div className="flex flex-col items-center">
              <div className="h-5 w-2.5 rounded-b bg-slate-600" />
              <div className="-mt-px h-2 w-3.5 rounded-sm bg-slate-800" />
            </div>
          </div>

          {/* 揮動的鎚子 */}
          <motion.div
            animate={{ rotate: [-45, 30, -45] }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-8 top-[60px] z-20 origin-top-left"
            style={{ transformOrigin: "top left" }}
          >
            {/* 握柄 */}
            <div className="h-1.5 w-24 rounded-full bg-gradient-to-r from-amber-800 via-amber-700 to-amber-600" />
            <div className="absolute -top-1 right-3 h-3.5 w-1.5 rounded-full bg-slate-500" />
            {/* 鎚頭 */}
            <div className="absolute -right-2 -top-3 h-6 w-5 rounded-[3px] bg-slate-600 shadow-sm">
              <div className="h-1.5 w-5 rounded-t-[3px] bg-slate-400/60" />
            </div>
            {/* 右手 */}
            <div className="absolute -left-2 -top-2 h-5 w-5 rounded-full border-2 border-orange-500 bg-orange-400 shadow-sm" />
          </motion.div>
        </motion.div>

        {/* 封鎖線 */}
        <div
          className="absolute left-0 right-0 top-[70%] h-3 opacity-85"
          style={{
            background:
              "repeating-linear-gradient(90deg, #fbbf24 0 10px, #1f2937 10px 20px)",
          }}
        />

        {/* 地面 */}
        <div className="absolute bottom-0 left-0 right-0 h-4 rounded-lg bg-slate-600/80 shadow-inner" />
        {/* 敲擊裂縫 */}
        <motion.div
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="absolute bottom-4 right-1 w-10 h-3 rounded-full bg-amber-300/70"
        />

        {/* 碎石飛濺 */}
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -18 - i * 5], opacity: [1, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1, ease: "easeOut" }}
            className="absolute bottom-5 right-4 w-1.5 h-1.5 rounded-sm bg-amber-500"
            style={{ marginRight: i * 8 }}
          />
        ))}
      </div>

      {/* 警示錐 */}
      <div className="flex justify-between items-end mt-1 px-6">
        {[0, 1].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.4 }}
            className="relative"
          >
            <motion.span
              animate={{ opacity: [1, 0.15, 1] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.3 }}
              className="absolute -top-2 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)] z-10"
            />
            <TrafficCone className="w-9 h-12 text-orange-500" strokeWidth={2} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}