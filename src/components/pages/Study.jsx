import React, { useEffect, useState } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";

const Study = () => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    //
    // useEffect(() => {
    //     // Mock data
    //     const mockData = [
    //         {
    //             title: "React Study Group",
    //             description: "리액트에 대해 배웁니다",
    //             admins: [{ name: "장원영" }, { name: "장원형" }],
    //             members: [{ name: "워뇽" }, { name: "이장" }, { name: "장원" }]
    //         },
    //         {
    //             title: "Frontend Development",
    //             description: "프론트엔드 기술에 대해 논의합니다",
    //             admins: [{ name: "태림" }],
    //             members: [{ name: "태태" }, { name: "림림" }]
    //         },
    //         {
    //             title: "AI/ML Group",
    //             description: "머신러닝이란 ?",
    //             admins: [{ name: "성연" }],
    //             members: [{ name: "연연" }, { name: "연여니" }]
    //         }
    //     ];
    //
    //     setTimeout(() => {
    //         // Simulating API call delay
    //         setStudies(mockData);
    //         setLoading(false);
    //     }, 1000);
    // }, []);

    useEffect(() => {
        const fetchStudies = async () => {
            try {
                const response = await fetch("https://dev-server.leita.dev/api/study");
                if (!response.ok) throw new Error(`Failed to fetch study groups: ${response.status}`);

                const data = await response.json();
                console.log("Fetched data:", data);
                setStudies(data.content || []);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudies();
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-start h-screen text-gray-900  pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>


            {/*<h1 className="text-3xl font-bold text-white mt-6 mb-4">스터디 그룹</h1>*/}

            {!loading && !error && studies.length === 0 && (
                <p className="text-center text-gray-400 mt-10 w-full">🚀 진행 중인 스터디가 없습니다.</p>
            )}

            <div className=" flex-grow grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-20 pl-[15%] pr-[15%]">
                {studies.map((study, index) => (
                    <div
                        key={index}
                        className="bg-white bg-opacity-10 p-5 rounded-xl shadow-lg border border-gray-600
                   hover:bg-black hover:bg-opacity-70 hover:cursor-pointer"
                        onClick={() => window.open(`/study/${index}`, "_blank")} // 🆕 새 창에서 StudyDetail 열기
                    >
                        <h2 className="text-xl font-semibold text-white hover:text-[#CAFF33]">
                            {study.title}
                        </h2>
                        <p className="text-gray-400 mt-2">{study.description}</p>
                        <p className="text-gray-500 mt-2">
                            <strong>Admins:</strong> {study.admins.map((a) => a.name).join(", ")}
                        </p>
                        <p className="text-gray-500 mt-2">
                            <strong>Members:</strong> {study.members.length}명
                        </p>
                    </div>
                ))}

            </div>
            <footer className="w-full text-left mt-20">
                <Footer />
            </footer>
        </div>
    );
};

export default Study;
