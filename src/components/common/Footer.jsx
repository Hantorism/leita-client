import React from "react";

const Footer = () => {
    return (
        <footer className="bg-white bg-opacity-10 text-white py-8 font-lexend mt-auto text-center">
            <div className="container mx-auto px-6 pt-4">
                <div className="flex flex-col md:flex-row justify-between items-center">

                    {/* 왼쪽 */}
                    <div className="mb-4 md:mb-0">
                        <h3 className="text-xl font-semibold">Leita</h3>
                        <p className="text-sm text-gray-400 mt-2">
                            아주대 코딩 연습 플랫폼
                        </p>
                    </div>

                    {/* 가운데 링크 */}
                    {/*<div className="flex flex-col md:flex-row gap-4">*/}
                    {/*    <a href="/about" className="text-sm text-gray-400 hover:text-white">*/}
                    {/*        About Us*/}
                    {/*    </a>*/}
                    {/*    <a href="/contact" className="text-sm text-gray-400 hover:text-white">*/}
                    {/*        Contact*/}
                    {/*    </a>*/}
                    {/*    <a href="/privacy" className="text-sm text-gray-400 hover:text-white">*/}
                    {/*        Privacy Policy*/}
                    {/*    </a>*/}
                    {/*</div>*/}

                    {/* 오른쪽 */}
                    <div className="mt-4 md:mt-0">
                        <p className="text-sm text-gray-400">© 2025 Leita. All rights reserved.</p>
                        <p className="text-sm text-gray-400"> 아주대 소프트웨어학과 이장원, 조성연, 오태림</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
