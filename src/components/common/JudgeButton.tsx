import { useNavigate } from "react-router-dom";

export default function JudgeButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/judge")}
            className=" bg-[#2A2A2A] hover:bg-opacity-0  text-gray-300 border-collapse border border-gray-800 hover:text-[#CAFF33] px-6 py-1 rounded-full font-lexend"
        >
            🏁 solved.
        </button>
    );
}
