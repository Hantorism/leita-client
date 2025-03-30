import { useNavigate } from "react-router-dom";

export default function JudgeButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/judge")}
            className=" bg-[#2A2A2A] bg-opacity-50 text-gray-300 hover:text-[#CAFF33] px-6 py-2 rounded-full"
        >
            내가 푼 문제 보기
        </button>
    );
}
