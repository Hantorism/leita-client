import React, { useEffect } from "react";
import { useParams } from "react-router-dom";

const StudyDetail = () => {
    const { id } = useParams();

    useEffect(() => {
        document.title = `스터디 상세 정보 - ${id} | Leita`; // 🆕 타이틀 동적 변경
    }, [id]);

    return (
        <div className="h-screen flex flex-col justify-center items-center bg-[#1A1A1A] text-white">
            <h1 className="text-3xl font-bold">Study Detail - ID: {id}</h1>
            <p className="text-gray-400 mt-4">이곳에서 스터디 상세 정보를 보여줍니다.</p>
        </div>
    );
};

export default StudyDetail;
