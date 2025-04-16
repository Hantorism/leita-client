import React, { useState } from "react";

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.post("/problem", {
                title,
                description,
                limit,
                testCases,
                source,
                category,
            });

            console.log(response.data.message); // Display message or handle data
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
        <div className="create-problem-container max-w-5xl mx-auto p-6  rounded-lg shadow-lg">
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
                    <label className="block text-lg font-medium text-white">Test Cases</label>
                    {testCases.map((testCase, index) => (
                        <div key={index} className="space-y-3">
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
                                    className="w-full p-3 border  bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
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
                                    className="w-full p-3 border  bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                                    rows={3}
                                />
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setTestCases(testCases.filter((_, i) => i !== index))
                                }
                                className="px-2 py-1 rounded-full transition bg-[#2A2A2A] text-white
                                hover:text-[#CAFF33]  hover:bg-opacity-0 "
                            >
                                Remove Test Case (-)
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() =>
                            setTestCases([...testCases, {input: "", output: ""}])
                        }
                        className=" px-2 py-1 rounded-full transition bg-[#2A2A2A] text-white
                              hover:text-[#CAFF33]  hover:bg-opacity-0 "
                    >
                        Add Test Case (+)
                    </button>
                </div>

                <div>
                    <label className="block text-lg font-medium text-white">Source</label>
                    <input
                        type="text"
                        value={source}
                        onChange={(e) => setSource(e.target.value)}
                        className="mt-2 p-3 w-full border  bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                    />
                </div>

                <div>
                    <label className="block text-lg font-medium text-white">Category</label>
                    <div className="space-y-3">
                        {category.map((cat, index) => (
                            <div key={index} className="flex gap-2">
                                <input
                                    type="text"
                                    value={cat}
                                    onChange={(e) => {
                                        const newCategories = [...category];
                                        newCategories[index] = e.target.value;
                                        setCategory(newCategories);
                                    }}
                                    className="p-3 w-full border bg-white bg-opacity-30 border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#CAFF33]"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCategory(category.filter((_, i) => i !== index))
                                    }
                                    className="px-3 py-[0.2] rounded-full transition bg-[#2A2A2A] text-white
                                hover:text-[#CAFF33]  hover:bg-opacity-0 "
                                >
                                  -
                                </button>
                            </div>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => setCategory([...category, ""])}
                        className="px-2 py-1 rounded-full transition bg-[#2A2A2A] text-white
                                hover:text-[#CAFF33]  hover:bg-opacity-0 "
                    >
                        카테고리 추가
                    </button>
                </div>


                <button
                    type="submit"
                    className="font-lexend mt-[40px] px-[24px] py-[12px] text-[1.2rem] font-light text-[#1A1A1A] bg-[#CAFF33] rounded-[80px] transition-all duration-300 ease-in-out hover:bg-gradient-to-r hover:from-[#CAFF33] hover:to-[#9D5CE9] hover:scale-[1.05] hover:text-white hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)] text-left"
                >
                    Create Problem
                </button>
            </form>
        </div>
            <footer className="w-full text-left mt-20">
                <Footer/>
            </footer>
        </div>
    );
};

export default CreateProblem;
