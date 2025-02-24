import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface Problem {
    problemId: number;
    title: string;
    solved: {
        count: number;
        rate: number;
    };
}

const PopularProblems = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
        fetch("https://dev-server.leita.dev/api/problem")
            .then((res) => res.json())
            .then((data) => {
                // 문제들을 solved.count 기준으로 내림차순 정렬
                const sortedProblems = data.content.sort((a: Problem, b: Problem) => b.solved.count - a.solved.count);
                // 상위 6개 문제만 추출
                setProblems(sortedProblems.slice(0, 5));
            })
            .catch((err) => console.error("Failed to fetch problems", err));
    }, []);

    return (
        <div className="mt-20 w-full mb-20 border-collapse bg-white bg-opacity-10 rounded-xl shadow-lg   p-4">
            <h2 className="text-2xl font-normal text-white mb-4 font-lexend">🏆 Best Problems</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 font-nanum">
                {problems.map((problem) => (
                    <div
                        key={problem.problemId}
                        onClick={() => window.open(`http://localhost:3000/problems/${problem.problemId}`, "_blank")}
                        className="cursor-pointer w-full h-40 bg-white bg-opacity-10 p-4 rounded-xl transition-transform duration-200 hover:scale-105 hover:bg-opacity-20"
                    >
                        <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                        <p className="text-sm text-gray-300">{problem.solved.count}명이 풀었어요!</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularProblems;
