import { Tabs } from '@assets/images';
import { Footer, Header, PopularProblems } from '@components';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();
  const [startAnimation, setStartAnimation] = useState<boolean>(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStartAnimation(true);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleClick = () => {
    navigate('/problems');
  };

  return (
    <div className="flex flex-col items-start h-full text-white pt-8 bg-[#1A1A1A] font-Pretendard">
      <header className="w-full text-left pl-[10%] pr-[10%]">
        <Header />
      </header>

      <div className="flex flex-col lg:flex-row items-center justify-between w-full max-w-[1280px] mx-auto px-10 pt-12 pb-8 gap-12">
        {/* Left Column: Text Content */}
        <div className="flex flex-col items-start flex-1 max-w-[650px]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full mb-8 shadow-sm backdrop-blur-sm"
          >
            <div className="bg-[#CAFE33] rounded-full p-0.5">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="black"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <span className="font-Pretendard text-sm font-medium text-[#E0E0E0] leading-none">
              다양한 프로그래밍 문제를 풀고, 실시간 온라인 채점을 통해 실력을 확인하세요.
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <h1 className="text-[3rem] lg:text-[4rem] font-sans font-extrabold leading-[1.1] uppercase text-white mb-10 tracking-tight">
              START <br />
              YOUR CODING JOURNEY <br />
              WITH LEITA! 🚀
            </h1>
          </motion.div>
        </div>

        {/* Right Column: Image Preview */}
        <motion.div
          className="flex-1 w-full max-w-[600px]"
          initial={{ opacity: 0, x: 40, rotate: 2 }}
          animate={{ opacity: 1, x: 0, rotate: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        >
          <img
            src={Tabs}
            alt="Dashboard Preview"
            className="w-full transform transition duration-500 hover:scale-[1.02]"
          />
        </motion.div>
      </div>

      <div className="pl-[10%] pr-[10%] w-full text-left">
        <PopularProblems />
      </div>

      <footer className="w-full text-left mt-10">
        <Footer />
      </footer>
    </div>
  );
};

export default HomePage;
