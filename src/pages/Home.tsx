import { Tabs } from '@assets/images';
import { Footer, Header, PopularProblems } from '@components';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStart = () => {
    navigate('/problems');
  };

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative w-full py-12 sm:py-20 lg:py-32 px-5 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            {/* Text Side */}
            <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left z-10 w-full">
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-6 sm:mb-8 backdrop-blur-sm"
              >
                <div className="bg-[#CAFE33] rounded-full p-0.5">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="text-xs sm:text-sm font-bold text-gray-400 uppercase tracking-widest">
                  아주대학교 코딩 연습 플랫폼
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-[2.5rem] sm:text-[3.5rem] lg:text-[4.5rem] font-black leading-[1.05] tracking-tight mb-6 sm:mb-8"
              >
                START YOUR <br />
                <span className="text-[#CAFE33]">CODING JOURNEY</span> <br />
                WITH LEITA! 🚀
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-gray-400 text-base sm:text-xl mb-10 sm:mb-12 max-w-lg leading-relaxed font-medium"
              >
                다양한 프로그래밍 문제를 풀고 실시간 채점을 통해 <br className="hidden sm:block" /> 
                여러분의 코딩 실력을 한 단계 성장시켜 보세요.
              </motion.p>

              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                onClick={handleStart}
                className="w-full sm:w-auto px-10 py-5 bg-[#CAFE33] text-black text-lg font-black rounded-[2rem] shadow-2xl shadow-[#CAFE33]/20 transition-all hover:bg-[#b8e82a] active:scale-95"
              >
                지금 시작하기
              </motion.button>
            </div>

            {/* Visual Side */}
            <motion.div
              initial={{ opacity: 0, x: 40, rotate: 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="flex-1 w-full relative max-w-xl lg:max-w-none group"
            >
              {/* Subtle background glow */}
              <div className="absolute inset-0 bg-[#CAFE33]/10 blur-[120px] rounded-full opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
              <img
                src={Tabs}
                alt="LEITA Preview"
                className="relative w-full rounded-[2.5rem] shadow-2xl border border-white/5 transform hover:scale-[1.02] transition-all duration-700"
              />
            </motion.div>
          </div>
        </section>

        <div className="pl-[10%] pr-[10%] w-full text-left">
          <PopularProblems />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
