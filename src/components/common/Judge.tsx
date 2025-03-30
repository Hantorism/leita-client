import { useEffect, useState } from "react";

interface JudgeResponse {
    message: string;
    data: JudgeData[];
}

interface JudgeData {
    problemId: number;
    user: {
        name: string;
        email: string;
        profileImage?: string;
    };
    result: string;
    used: {
        memory: number;
        time: number;
        language: string;
    };
    sizeOfCode: number;
    type: string;
}
const API_BASE_URL = process.env.REACT_APP_API_URL;

export default function JudgePage() {
    const [judges, setJudges] = useState<JudgeData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchJudges() {
            try {
                const response = await fetch(`${API_BASE_URL}/judge`);
                const result: JudgeResponse = await response.json();
                setJudges(Array.isArray(result.data) ? result.data : []);
            } catch (err) {
                setError("데이터를 불러오는 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        }
        fetchJudges();
    }, []);

    if (loading) return <p className="text-center text-gray-500">로딩 중...</p>;
    if (error) return <p className="text-center text-red-500">{error}</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">내가 푼 문제들</h1>
            {judges.length === 0 ? (
                <p className="text-gray-500">제출한 문제가 없습니다.</p>
            ) : (
                <div className="grid gap-4">
                    {judges.map((judge) => (
                        <div key={judge.problemId} className="border p-4 rounded-lg shadow-md">
                            <div className="flex items-center gap-4">
                                <img
                                    src={judge.user.profileImage || "/default-profile.png"}
                                    alt={judge.user.name || "사용자 프로필"}
                                    className="w-12 h-12 rounded-full border"
                                />
                                <div>
                                    <p className="font-semibold">{judge.user.name}</p>
                                    <p className="text-sm text-gray-500">{judge.user.email}</p>
                                </div>
                            </div>
                            <div className="mt-2 space-y-1">
                                <p><span className="font-semibold">문제 ID:</span> {judge.problemId}</p>
                                <p>
                                    <span className="font-semibold">결과:</span>
                                    <span className={`px-2 py-1 ml-2 rounded-md text-white ${judge.result === "CORRECT" ? "bg-green-500" : "bg-red-500"}`}>
                                        {judge.result}
                                    </span>
                                </p>
                                <p><span className="font-semibold">사용한 메모리:</span> {judge.used.memory} KB</p>
                                <p><span className="font-semibold">실행 시간:</span> {judge.used.time} ms</p>
                                <p><span className="font-semibold">사용 언어:</span> {judge.used.language}</p>
                                <p><span className="font-semibold">코드 크기:</span> {judge.sizeOfCode} bytes</p>
                                <p><span className="font-semibold">제출 유형:</span> {judge.type}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
