import React, { useState } from "react";
import {LeitaButton} from "../designs/LeitaButton/index.tsx";



import Header from "../common/Header";
import axios from "axios";
import Footer from "../common/Footer";

const CreateProblem = () => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState({
        problem: "",
        input: "",
        output: "",
    });
    const [limit, setLimit] = useState({
        memory: 0,
        time: 0,
    });
    const [testCases, setTestCases] = useState([{ input: "", output: "" }]);
    const [source, setSource] = useState("");
    const [category, setCategory] = useState([""]);
    const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정
    const encodeBase64 = (str: string): string => {
        const trimmed = str.replace(/[\n\t\s]+$/g, "");
        const utf8Bytes = new TextEncoder().encode(trimmed);
        const binary = Array.from(utf8Bytes)
            .map(byte => String.fromCharCode(byte))
            .join('');
        return btoa(binary);
    };
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const token = localStorage.getItem("token");
        const encodedTestCases = testCases.map(tc => ({
            input: encodeBase64(tc.input),
            output: encodeBase64(tc.output),
        }));
        if (testCases.length < 5) {
            alert("👽 테스트 케이스는 최소 5개 이상이어야 합니다!");
            return;
        }

        try {
            const response = await axios.post(`${API_BASE_URL}/problem`,{
                title,
                description,
                limit,
                testCases: encodedTestCases,
                source,
                category,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            console.log(response.data.message);
            alert("Problem created successfully!");
        } catch (error) {
            console.error("Error creating problem", error);
            alert("Error creating problem.");
        }
    };


    return (
        <div className="flex flex-col items-start min-h-screen text-gray-900 pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="pl-[10%] pr-[10%] w-full text-left">
                <Header />
            </header>
        <div className="create-problem-container max-w-5xl mx-auto p-6  rounded-lg ">
            <h2 className="text-3xl  text-center mb-6 text-white">Create Problem 👾</h2>
            <form onSubmit={handleSubmit} className="space-y-6 ">
                <div>
                    <label className="block text-lg font-medium text-white">Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-2 p-3 w-full border  bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-white">Problem Description</label>
                    <textarea
                        value={description.problem}
                        onChange={(e) => setDescription({...description, problem: e.target.value})}
                        required
                        className="mt-2 p-3 w-full border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                        rows={4}
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-white">Input Description</label>
                    <textarea
                        value={description.input}
                        onChange={(e) => setDescription({...description, input: e.target.value})}
                        required
                        className="mt-2 p-3 w-full border  bg-white bg-opacity-30 border-gray-700  rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-white">Output Description</label>
                    <textarea
                        value={description.output}
                        onChange={(e) => setDescription({...description, output: e.target.value})}
                        required
                        className="mt-2 p-3 w-full border  bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                        rows={3}
                    />
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-lg font-medium text-white">Memory Limit (KB)</label>
                        <input
                            type="number"
                            value={limit.memory}
                            onChange={(e) => setLimit({...limit, memory: Number(e.target.value)})}
                            required
                            className="mt-2 p-3 w-full border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                        />
                    </div>

                    <div>
                        <label className="block text-lg font-medium text-white">Time Limit (ms)</label>
                        <input
                            type="number"
                            value={limit.time}
                            onChange={(e) => setLimit({...limit, time: Number(e.target.value)})}
                            required
                            className="mt-2 p-3 w-full border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-lg font-medium text-white mb-2">Test Cases (최소 5개)</label>
                    {testCases.map((testCase, index) => (
                        <div key={index}
                             className="space-y-3 mb-6 p-4 border border-gray-600 rounded-lg bg-white bg-opacity-10">
                            <h3 className="text-white font-semibold mb-2">Test Case #{index + 1}</h3>

                            <div>
                <textarea
                    placeholder="Test case input"
                    value={testCase.input}
                    onChange={(e) =>
                        setTestCases([
                            ...testCases.slice(0, index),
                            {...testCase, input: e.target.value},
                            ...testCases.slice(index + 1),
                        ])
                    }
                    className="w-full p-3 border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                    rows={3}
                />
                            </div>
                            <div>
                <textarea
                    placeholder="Test case output"
                    value={testCase.output}
                    onChange={(e) =>
                        setTestCases([
                            ...testCases.slice(0, index),
                            {...testCase, output: e.target.value},
                            ...testCases.slice(index + 1),
                        ])
                    }
                    className="w-full p-3 border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                    rows={3}
                />
                            </div>

                            {testCases.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setTestCases(testCases.filter((_, i) => i !== index))
                                    }
                                    className="px-2 py-1 rounded-full transition bg-[#2A2A2A] text-white hover:text-[#CAFF33] hover:bg-opacity-0"
                                >
                                    Remove Test Case (-)
                                </button>
                            )}
                        </div>
                    ))}

                    <LeitaButton
                        onClick={() =>
                            setTestCases([...testCases, {input: "", output: ""}])
                        }
                        variant="secondary"
                        size="sm"
                        shape="pill"
                    >
                        Add Category (+)
                    </LeitaButton>

                </div>


                <div>
                    <label className="block text-lg font-medium text-white">Source</label>
                    <input
                        placeholder="출처"
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className=" p-3 w-full border  bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-white">Category</label>
                    <div className="space-y-3">
                        {category.map((cat, index) => (
                            <div key={index} className="flex pb-2">
                                <input
                                    placeholder="ex) 자료구조"
                                    type="text"
                                    value={cat}
                                    onChange={(e) => {
                                        const newCategories = [...category];
                                        newCategories[index] = e.target.value;
                                        setCategory(newCategories);
                                    }}
                                    className="p-3 w-full border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                                />

                                <LeitaButton
                                    onClick={() =>
                                        setCategory(category.filter((_, i) => i !== index))
                                    }
                                variant="secondary"
                                size="sm"
                                shape="pill"
                            >
                               (-)
                            </LeitaButton>

                            </div>
                        ))}
                    </div>


                    <LeitaButton
                        onClick={() => setCategory([...category, ""])}
                        variant="secondary"
                        size="sm"
                        shape="pill"
                    >
                        Add Category (+)
                    </LeitaButton>

                </div>

                <LeitaButton
                    type="submit"
                    variant="primary"
                    shape="round"
                    size="lg"
                >
                    Create Problem
                </LeitaButton>

            </form>
        </div>
            <footer className="w-full text-left mt-20">
                <Footer/>
            </footer>
        </div>
    );
};

export default CreateProblem;
