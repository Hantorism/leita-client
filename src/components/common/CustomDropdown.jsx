import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io"; // 화살표 아이콘 추가

const CustomDropdown = ({ language, handleLanguageChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const languages = [
        { value: "python", label: "Python" },
        { value: "javascript", label: "JavaScript" },
        { value: "java", label: "Java" },
        { value: "c", label: "C" },
        { value: "cpp", label: "C++" },
        { value: "go", label: "Go" },
        { value: "kotlin", label: "Kotlin" },
        { value: "swift", label: "Swift" },
    ];

    const toggleDropdown = () => setIsOpen(!isOpen);

    // 언어 선택 후 드롭다운을 자동으로 접기
    const handleSelectLanguage = (value) => {
        handleLanguageChange(value); // 언어 변경
        setIsOpen(false); // 드롭다운 접기
    };

    return (
        <div className="relative z-10"> {/* z-10을 추가해 드롭다운을 다른 요소 위에 표시 */}
            <div
                className="bg-[#3E3E3E] text-gray-300 p-2 rounded-md font-lexend text-[0.9rem] cursor-pointer w-[200px] flex items-center justify-between"
                onClick={toggleDropdown}
            >
                <span>{languages.find((lang) => lang.value === language)?.label || "Select Language"}</span>
                <IoIosArrowDown className={`transition-transform ${isOpen ? "rotate-180" : "rotate-0"}`} />
            </div>

            {isOpen && (
                <ul className="absolute left-0 mt-1 w-[200px] bg-[#3E3E3E] rounded-md shadow-lg z-20">
                    {languages.map(({ value, label }) => (
                        <li
                            key={value}
                            onClick={() => handleSelectLanguage(value)} // 언어 선택 후 드롭다운 접기
                            className="px-2 py-1 hover:bg-gray-600 cursor-pointer"
                        >
                            {label}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default CustomDropdown;
