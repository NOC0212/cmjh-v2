import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Ghost } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 font-sans text-white overflow-hidden relative">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="max-w-md w-full text-center z-10"
      >
        <div className="mb-8 flex justify-center">
          <motion.div
            animate={{
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-32 h-32 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-white/10 backdrop-blur-xl shadow-2xl relative"
          >
            <Ghost className="w-16 h-16 text-blue-400 opacity-80" />
            <div className="absolute inset-0 bg-blue-400/10 rounded-full blur-2xl -z-10 animate-pulse" />
          </motion.div>
        </div>

        <motion.h1
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-8xl font-black mb-2 bg-gradient-to-r from-white via-white/80 to-white/60 bg-clip-text text-transparent tracking-tighter"
        >
          404
        </motion.h1>

        <h2 className="text-2xl font-bold mb-4 text-white/90">
          哎呀！找不到這個頁面
        </h2>

        <p className="text-white/40 mb-12 leading-relaxed">
          路徑 <code className="bg-white/5 px-2 py-0.5 rounded text-blue-300 font-mono text-sm">{location.pathname}</code> 似乎並不存在。<br />
          或許它已經搬家了，或者原本就不存在這裡。
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full sm:w-auto px-8 py-3 bg-white text-black font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors hover:bg-white/90"
            >
              <Home className="w-4 h-4" />
              回到首頁
            </motion.button>
          </Link>

          <button
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-white/10 hover:border-white/20"
          >
            <ArrowLeft className="w-4 h-4" />
            返回上一頁
          </button>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5">
          <p className="text-white/20 text-sm">
            如果您認為這是網站系統的問題，請聯繫網站管理員。
          </p>
        </div>
      </motion.div>

      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  );
};

export default NotFound;
