import { useNavigate } from "react-router-dom";

export default function ProblemsButton() {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate("/problems")}
            className=" bg-[#2A2A2A] hover:bg-opacity-0  text-gray-300 hover:text-[#CAFF33] px-6 py-1 rounded-full font-lexend"
        >
            🚀 problems
        </button>
    );
}
