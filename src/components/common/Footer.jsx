import React from "react";
import {Link} from "react-router-dom";
import logo from "../../assets/Logo.png";

const Footer = () => {
    return (
        <footer className="bg-white bg-opacity-10 text-white py-8 font-lexend mt-auto text-center">
            <div className="container mx-auto px-6 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-center">

                    {/* 왼쪽 */}
                    <div className="mb-4 md:mb-0">
                        <Link to="/">
                            <img src={logo}  alt="LEITA Logo" className="h-8" />
                        </Link>
                        <p className="text-sm text-gray-400 mt-2">
                            아주대 코딩 연습 플랫폼
                        </p>
                    </div>

                    {/* 가운데 링크 */}
                    <div className="flex flex-col md:flex-row gap-4">
                    {/*    <a href="/about" className="text-sm text-gray-400 hover:text-white">*/}
                    {/*        About Us*/}
                    {/*    </a>*/}
                        <a href="/terms" className="text-sm text-gray-400 hover:text-white">
                           이용약관
                        </a>
                        <a href="/privacy" className="text-sm text-gray-400 hover:text-white">
                           개인정보 처리방침
                        </a>
                    </div>

                    {/* 오른쪽 */}
                    <div className="mt-4 md:mt-0">
                        <p className="text-sm text-gray-400">© 2025 Leita. All rights reserved.</p>
                        {/*<p className="text-sm text-gray-400"> 아주대 소프트웨어학과 이장원, 조성연, 오태림</p>*/}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
