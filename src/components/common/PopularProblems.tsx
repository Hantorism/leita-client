import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

interface Problem {
    problemId: number;
    title: string;
    solved: {
        totalCount: number;
        rate: number;
    };
}

const PopularProblems = () => {
    const [problems, setProblems] = useState<Problem[]>([]);
    const navigate = useNavigate();
    useEffect(() => {
    const fetchProblems = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/problem`);
            const data = await response.json();

            if (!data?.data?.content) {
                throw new Error("Invalid response format");
            }

            const sortedProblems = [...data.data.content]
                .sort((a: Problem, b: Problem) => b.solved.totalCount - a.solved.totalCount)
                .slice(0, 5);

            setProblems(sortedProblems);
        } catch (error) {
            console.error("Failed to fetch problems:", error);
        }
    };

    fetchProblems();
}, []);

    return (
        <div className="mt-20 w-full mb-20 border-collapse bg-white bg-opacity-10 rounded-xl shadow-lg   p-4">
            <h2 className="text-2xl font-normal text-white mb-4 font-lexend">🏆 Best Problems</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 font-nanum">
                {problems.map((problem) => (
                    <div
                        key={problem.problemId}
                        onClick={() => window.open(`problems/${problem.problemId}`, "_blank")}
                        className="cursor-pointer w-full h-40 bg-white bg-opacity-10 p-4 rounded-xl transition-transform duration-200 hover:scale-105 hover:bg-opacity-20"
                    >
                        <h3 className="text-lg font-semibold text-white">{problem.title}</h3>
                        <p className="text-sm text-gray-300">{problem.solved.totalCount}번 풀었어요!</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PopularProblems;
