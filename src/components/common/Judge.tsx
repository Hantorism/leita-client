import { useEffect, useState } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";

interface JudgeResponse {
    message: string;
    data: JudgeData[];
}

interface JudgeData {
    problemId: number;
    problemTitle?: string;
    user: {
        name: string;
        email: string;
        profileImage?: string;
    };
    result: "CORRECT" | "WRONG" | "COMPILE_ERROR" | "RUNTIME_ERROR" | "TIME_OUT" | "MEMORY_OUT" | "UNKNOWN";
    used: {
        memory: number;
        time: number;
        language: string;
    };
    sizeOfCode: number;
    type: string;
}

const API_BASE_URL = process.env.REACT_APP_API_URL;
const ITEMS_PER_PAGE = 15;

export default function JudgePage() {
    const [allJudges, setAllJudges] = useState<JudgeData[]>([]); // 원본 데이터 유지
    const [judges, setJudges] = useState<JudgeData[]>([]); // 필터링된 데이터
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<string>("ALL");

    useEffect(() => {
        async function fetchJudges() {
            try {
                const token = localStorage.getItem("token");
                const response = await fetch(`${API_BASE_URL}/judge`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
                }

                const result: JudgeResponse = await response.json();
                setAllJudges(result.data ?? []); // 원본 데이터 저장
                setJudges(result.data ?? []); // 초기 데이터 설정
            } catch (err) {
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
                setAllJudges([]);
                setJudges([]);
            } finally {
                setLoading(false);
            }
        }

        fetchJudges();
    }, []);

    // 필터 적용 (filter가 바뀔 때마다 실행)
    useEffect(() => {
        setCurrentPage(1); // 필터 변경 시 페이지 초기화

        if (filter === "ALL") {
            setJudges(allJudges);
        } else {
            setJudges(allJudges.filter((judge) => judge.result?.toUpperCase() === filter.toUpperCase()));
        }
    }, [filter, allJudges]);
    if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;


    const totalPages = Math.ceil(judges.length / ITEMS_PER_PAGE);


    const paginatedJudges = judges.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col items-start min-h-screen text-gray-200 pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>
            <div className="flex-grow max-w-5xl mx-auto w-full pt-9 md:text-sm px-5">

                {/* 필터 버튼 */}
                <div className="flex flex-wrap gap-2 mb-3">
                    {[
                        { key: "ALL", label: "ALL" },
                        { key: "CORRECT", label: "CORRECT" },
                        { key: "WRONG", label: "WRONG" },
                        { key: "COMPILE_ERROR", label: "COMPILE_ERR" },
                        { key: "RUNTIME_ERROR", label: "RUNTIME_ERR"},
                        { key: "TIME_OUT", label: "TIME_OUT" },
                        { key: "MEMORY_OUT", label: "MEMORY_OUT" },
                        { key: "UNKNOWN", label: "UNKNOWN" },
                    ].map(({ key, label }) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-full transition ${
                                filter === key ? "bg-gray-600 text-white" : "text-gray-300"
                            }`}
                        >
                           {label}
                        </button>
                    ))}
                </div>

                {judges.length === 0 ? (
                    <p className="text-gray-500">해당 필터에 맞는 문제가 없습니다.</p>
                ) : (
                    <div className="grid grid-cols-3 gap-6">
                        {paginatedJudges.map((judge, index) => (
                            <div key={`${judge.problemId}-${index}`} className="border bg-[#2A2A2A] bg-opacity-90 p-4 rounded-lg shadow-md border-gray-600">
                                <p>
                                    <span className="font-semibold">Problem ID :</span> {judge.problemId}
                                    <span className={`ml-2 font-bold ${(judge.result)}`}>
                                    {judge.result ?? "-"}
                                     </span>
                                </p>
                                <p>
                                    <span className="">Memory :</span> {judge.used.memory} KB
                                </p>
                                <p>
                                    <span className="">Time :</span> {judge.used.time} ms
                                </p>
                                <p>
                                    <span className="">Language :</span> {judge.used.language}
                                </p>
                                <p>
                                    <span className="">Code Size :</span> {judge.sizeOfCode} bytes
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>


            {totalPages > 1 && (
                <div className=" w-full flex justify-center items-center gap-4 my-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-full transition ${
                            currentPage === 1 ? "bg-gray-700 text-white opacity-50 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                        이전
                    </button>

                    <span className="px-3 py-1  text-white rounded-full">
            {currentPage} / {totalPages}
        </span>

                    <button
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-4 py-2 rounded-full transition ${
                            currentPage === totalPages ? "bg-gray-700 text-white opacity-50 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                        다음
                    </button>
                </div>
            )}

            <footer className="w-full text-left mt-20">
                <Footer />
            </footer>
        </div>
    );
}
