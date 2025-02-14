import React, { useState, useEffect } from "react";
import Header from "../common/Header";
import { Footer } from "../common/Footer";
import { useNavigate } from 'react-router-dom';

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

    const handleClick = () => {
        navigate('/problems'); // 버튼 클릭 시 /problems 경로로 이동
    };

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
                    onClick={handleClick}
                    className="font-lexend mt-[40px] px-[24px] py-[12px] text-[1.2rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-[80px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#CAFF33] hover:to-[#9D5CE9] hover:scale-[1.05] hover:text-white hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                >
                    Let's solve problems!
                </button>

                {/*<img src={"/image/pageimage.png"} class="absolute top-[40%] right-[13%] w-[30%] h-auto pl-3"/>*/}


                {/*<div className="relative w-full h-full">*/}
                {/*    {images.map((image, index) => (*/}
                {/*        <img*/}
                {/*            key={index}*/}
                {/*            src={image}*/}
                {/*            alt={`home-image-${index}`}*/}
                {/*            className={`floating-image absolute left-100 top-40 transition-all duration-1000 ease-in-out ${*/}
                {/*                currentImage >= index ? 'opacity-100 z-10' : 'opacity-0 z-0'*/}
                {/*            }`}*/}
                {/*            style={{*/}
                {/*                transform:*/}
                {/*                    currentImage === index*/}
                {/*                        ? (index === 2*/}
                {/*                            ? "translate(-10px, -20px)  scale(1.3)" // 맨 위 이미지 왼쪽 위로 이동 + 10% 크게*/}
                {/*                            : index === 1*/}
                {/*                                ? "translate(-10px, -20px) " // 두 번째 이미지 약간 왼쪽 이동*/}
                {/*                                : "translate(-10px, -20px) rotate(0)") // 첫 번째 이미지는 정중앙*/}
                {/*                        : "translateY(30px)",*/}
                {/*                transition: 'opacity 1s ease-in-out, transform 1s ease-in-out',*/}
                {/*            }}*/}
                {/*        />*/}
                {/*    ))}*/}
                {/*</div>*/}
            </div>
            {/* <Footer /> */}
        </div>
    );
};

export default Home;
