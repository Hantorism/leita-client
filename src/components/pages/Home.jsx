import React, { useState, useEffect } from "react";
import Header from "../common/Header";
import  Footer  from "../common/Footer";
import { useNavigate } from 'react-router-dom';
import PopularProblems from "../common/PopularProblems.tsx";
import { motion } from "framer-motion";

const Home = () => {
    // const [currentImage, setCurrentImage] = useState(0);
    // const images = [
    //     "/image/Comment.png",
    //     "/image/Comment%20(1).png",
    //     "/image/Component%206.png"
    // ];
    //
    // useEffect(() => {
    //     const timeout1 = setTimeout(() => {
    //         setCurrentImage(1);
    //     }, 1000);
    //
    //     const timeout2 = setTimeout(() => {
    //         setCurrentImage(2);
    //     }, 2000);
    //
    //     return () => {
    //         clearTimeout(timeout1);
    //         clearTimeout(timeout2);
    //     };
    // }, []);

    const navigate = useNavigate();
    const [startAnimation, setStartAnimation] = useState(false);

    useEffect(() => {
        // 페이지 로딩 직후 애니메이션 시작
        const timer = setTimeout(() => {
            setStartAnimation(true);
        }, 500); // 약간의 delay

        return () => clearTimeout(timer);
    }, []);

    const handleClick = () => {
        navigate('/problems'); // 버튼 클릭 시 /problems 경로로 이동
    };

    return (
        <div className="flex flex-col items-start h-screen text-white  pt-[5%]">
            {/* Header */}
            <header className="w-full text-left pl-[10%] pr-[10%]">
                <Header />
            </header>

            <div className="flex flex-col items-start justify-center w-[90%] max-w-[900px] p-5 pl-[13%] pt-[8%]">
                <div className="inline-flex items-center gap-1 bg-white bg-opacity-10 px-3 py-2 rounded-[60px] w-fit mb-5">
                    <img src="/image/Icon.svg" className="w-[24px] h-[24px]" />
                    <a className="font-lexend text-sm font-light text-[#E0E0E0] leading-[1.5]">
                        다양한 프로그래밍 문제를 풀고, 실시간 온라인 채점을 통해 실력을 확인하세요.
                    </a>
                </div>


                <motion.div
                    className="text-left"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 1.5,
                        ease: "easeOut",
                    }}
                >

                <div className="text-left">
                    <h1 className="text-[2.5rem] font-sans font-extrabold leading-[1.3] uppercase text-white">
                        START <br />
                        YOUR CODING JOURNEY<br />
                        WITH LEITA! 🚀
                    </h1>
                </div>
                </motion.div>
                <motion.div
                    className="text-left"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                        duration: 3,
                        ease: "easeOut",
                    }}
                >
                <button
                    onClick={handleClick}
                    className="font-lexend mt-[40px] px-[24px] py-[12px] text-[1.2rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-[80px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#CAFF33] hover:to-[#9D5CE9] hover:scale-[1.05] hover:text-white hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                >
                    Let's solve problems!
                </button>
                </motion.div>
                <div className="mt-20">
                </div>
            </div>

            <div className="  pl-[10%]  pr-[10%] p-10 pt-3 w-full text-left">
                <PopularProblems />
            </div>
            <footer className="w-full text-left">
                <Footer />
            </footer>
        </div>
    );
};

export default Home;
