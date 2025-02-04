import React, { useContext } from "react";
import "./Home.css"
import Header from "../common/Header/Header";
import { Footer } from "../common/Footer";
import { AuthContext } from "../../context/AuthContext"; // ✅ 올바른 import

const Home = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <Header />
            <div className={"homeContainer"}>
                <div className={"subcontinent"}>
                    <div className={"describeContainer"} id={"homeDescribe"}>
                    <img src="/image/Icon.svg"  />
                        <a>다양한 프로그래밍 문제를 풀고, 실시간 온라인 채점을 통해 실력을 확인하세요.</a>
                    </div>
                    <div className={"title"}>
                        <h1>START <br/>YOUR CODING JOURNEY<br/> WITH LEITA! 🏁</h1>
                    </div>
                </div>
                <button id={"startButton"}> let's start </button>
            </div>
            {/*<Footer />*/}
        </div>
    );
};

export default Home;
