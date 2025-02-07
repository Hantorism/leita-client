import React from "react";
import Header from "../common/Header";
import { Footer } from "../common/Footer";

const Home = () => {
    return (
        <div className="flex flex-col items-start h-screen text-white pl-[10%] pr-[10%] pt-[5%]">
            {/* Header */}
            <header className="w-full text-left">
                <Header />
            </header>

            <div className="flex flex-col items-start justify-center w-[80%] max-w-[600px] p-5 pl-[6%] pt-[8%]">
                <div className="inline-flex items-center gap-1 bg-white bg-opacity-10 px-3 py-2 rounded-[60px] w-fit mb-5">
                    <img src="/image/Icon.svg" className="w-[24px] h-[24px]" />
                    <a className="font-lexend text-sm font-light text-[#E0E0E0] leading-[1.5]">
                        다양한 프로그래밍 문제를 풀고, 실시간 온라인 채점을 통해 실력을 확인하세요.
                    </a>
                </div>
                <div className="text-left">
                    <h1 className="text-[2.5rem] font-sans font-extrabold leading-[1.3] uppercase text-white">
                        START <br />
                        YOUR CODING JOURNEY<br />
                        WITH LEITA! 🏁
                    </h1>
                </div>
                <button
                    className="font-lexend mt-[40px] px-[24px] py-[12px] text-[1.2rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-[80px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#CAFF33] hover:to-[#9D5CE9] hover:scale-[1.05] hover:text-white hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                >
                    Let's start
                </button>
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default Home;
