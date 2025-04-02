import { useEffect, useState } from "react";
import Header from "../common/Header";
import Footer from "../common/Footer";
import { useNavigate } from "react-router-dom";
import ProblemsButton from "./ProblemsButton.tsx";

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
    const [allJudges, setAllJudges] = useState<JudgeData[]>([]);
    const [judges, setJudges] = useState<JudgeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [filter, setFilter] = useState<string>("ALL");
    const navigate = useNavigate();

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

                if (response.status === 401) {
                    localStorage.removeItem("token");
                    window.alert("로그인이 필요합니다.");
                    navigate("/");
                    return;
                }

                if (!response.ok) {
                    throw new Error(`HTTP 오류! 상태 코드: ${response.status}`);
                }

                const result: JudgeResponse = await response.json();
                setAllJudges(result.data ?? []);
                setJudges(result.data ?? []);
            } catch (err) {
                window.alert("로그인이 필요합니다.");
                navigate("/");
                setAllJudges([]);
                setJudges([]);
            } finally {
                setLoading(false);
            }
        }

        fetchJudges();
    }, []);

    // 필터 변경 시 데이터 업데이트
    useEffect(() => {
        setCurrentPage(1);
        if (filter === "ALL") {
            setJudges(allJudges);
        } else if (filter === "CORRECT") {
            setJudges(allJudges.filter((judge) => judge.result === "CORRECT"));
        } else if (filter === "WRONG") {
            setJudges(
                allJudges.filter((judge) =>
                    ["WRONG", "COMPILE_ERROR", "RUNTIME_ERROR", "TIME_OUT", "MEMORY_OUT", "UNKNOWN"].includes(judge.result)
                )
            );
        }
    }, [filter, allJudges]);

    if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    const totalPages = Math.ceil(judges.length / ITEMS_PER_PAGE);
    const paginatedJudges = judges.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    return (
        <div className="flex flex-col items-start min-h-screen text-gray-200 pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header/>
            </header>
            <div className="pl-[63%] pr-[15%]">
                <ProblemsButton/>
            </div>

            <div className="flex-grow max-w-3xl mx-auto w-full pt-9 md:text-sm pl-5 pr-5">
                {/* 필터 버튼 */}
                <div className="flex flex-wrap gap-2 mb-3 justify-center">
                    {[
                        {key: "ALL", label: "ALL"},
                        {key: "CORRECT", label: "CORRECT"},
                        {key: "WRONG", label: "WRONG"},
                    ].map(({key, label}) => (
                        <button
                            key={key}
                            onClick={() => setFilter(key)}
                            className={`px-4 py-2 rounded-full transition ${
                                filter === key ? "bg-gray-600 text-white" : " text-white hover:bg-gray-600"
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {/* 판정 결과 테이블 */}
                <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden">
                    <table className="font-Pretend w-full text-left border-collapse border border-gray-600">
                        <thead>
                        <tr className="bg-[#2A2A2A] text-white">
                            <th className="p-3 border-b border-gray-500">문제 ID</th>
                            {/*<th className="p-3 border-b border-gray-500">제목</th>*/}
                            {/*<th className="p-3 border-b border-gray-500">유저</th>*/}
                            <th className="p-3 border-b border-gray-500">결과</th>
                            <th className="p-3 border-b border-gray-500">메모리(KB)</th>
                            <th className="p-3 border-b border-gray-500">시간(ms)</th>
                            <th className="p-3 border-b border-gray-500">언어</th>
                            <th className="p-3 border-b border-gray-500">코드 크기(bytes)</th>
                        </tr>
                        </thead>
                        <tbody>
                        {paginatedJudges.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="p-3 text-center text-gray-500">
                                    해당 필터에 맞는 문제가 없습니다.
                                </td>
                            </tr>
                        ) : (
                            paginatedJudges.map((judge, index) => (
                                <tr key={`${judge.problemId}-${index}`} className="hover:bg-gray-700">
                                    <td className="p-3 border-b border-gray-500">{judge.problemId}</td>
                                    {/*<td className="p-3 border-b border-gray-500">{judge.problemTitle || "-"}</td>*/}
                                    {/*<td className="p-3 border-b border-gray-500">{judge.user.name}</td>*/}
                                    <td className={`p-3 border-b border-gray-500 font-bold ${judge.result}`}>
                                        {judge.result}
                                    </td>
                                    <td className="p-3 border-b border-gray-500">{judge.used.memory}</td>
                                    <td className="p-3 border-b border-gray-500">{judge.used.time}</td>
                                    <td className="p-3 border-b border-gray-500">{judge.used.language}</td>
                                    <td className="p-3 border-b border-gray-500">{judge.sizeOfCode}</td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {totalPages > 1 && (
                <div className="w-full flex justify-center items-center gap-4 my-6">
                    <button
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-4 py-2 rounded-full transition ${
                            currentPage === 1 ? "bg-gray-700 text-white opacity-50 cursor-not-allowed" : "bg-gray-700 text-white hover:bg-gray-600"
                        }`}
                    >
                        이전
                    </button>

                    <span className="px-3 py-1 text-white rounded-full">
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
                <Footer/>
            </footer>
        </div>
    );
}
