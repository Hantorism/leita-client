
import React from "react";
import { useNavigate } from "react-router-dom";

const CreateProblemButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate("/create-problem");
    };

    return (
        <button
            onClick={handleClick}
            className="create-problem-button px-4 py-1 rounded-full bg-[#2A2A2A]  rounded-full bg-[#2A2A2A] text-white text-center"
        >
            Create Problem
        </button>
    );
};

export default CreateProblemButton;
