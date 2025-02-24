import React, { useEffect, useState } from "react";
import Header from "../common/Header";

const Study = () => {
    const [studies, setStudies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {
        // Mock data
        const mockData = [
            {
                title: "React Study Group",
                description: "Learn React and its ecosystem.",
                admins: [{ name: "John Doe" }, { name: "Jane Smith" }],
                members: [{ name: "Alice" }, { name: "Bob" }, { name: "Charlie" }]
            },
            {
                title: "Frontend Development",
                description: "Discuss the latest trends in frontend technologies.",
                admins: [{ name: "Tom Lee" }],
                members: [{ name: "Sarah" }, { name: "David" }]
            },
            {
                title: "AI/ML Group",
                description: "Collaborate on machine learning and AI projects.",
                admins: [{ name: "Mark Wong" }],
                members: [{ name: "Linda" }, { name: "Ethan" }]
            }
        ];

        setTimeout(() => {
            // Simulating API call delay
            setStudies(mockData);
            setLoading(false);
        }, 1000);
    }, []);

    // useEffect(() => {
    //     const fetchStudies = async () => {
    //         try {
    //             const response = await fetch("https://dev-server.leita.dev/api/study");
    //             if (!response.ok) throw new Error(`Failed to fetch study groups: ${response.status}`);
    //
    //             const data = await response.json();
    //             console.log("Fetched data:", data);
    //             setStudies(data.content || []);
    //         } catch (err) {
    //             if (err instanceof Error) {
    //                 setError(err.message);
    //             } else {
    //                 setError("An unknown error occurred");
    //             }
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //
    //     fetchStudies();
    // }, []);

    return (
        <div className="flex flex-col items-start h-screen text-gray-900 pl-[10%] pr-[10%] pt-[5%] bg-[#1A1A1A] font-lexend">
            <header className="w-full text-left">
                <Header />
            </header>


            {/*<h1 className="text-3xl font-bold text-white mt-6 mb-4">스터디 그룹</h1>*/}

            {/*{loading && <p className="text-white">Loading...</p>}*/}
            {error && <p className="text-red-500">Error: {error}</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full mt-20">
                {studies.map((study, index) => (
                    <div
                        key={index}
                        className="bg-white bg-opacity-10 p-5 rounded-xl shadow-lg   hover:bg-black hover:bg-opacity-70 hover:cursor-pointer"
                    >
                        <h2 className="text-xl font-semibold text-white hover:text-[#CAFF33] ">{study.title}</h2>
                        <p className="text-gray-400 mt-2">{study.description}</p>
                        <p className="text-gray-500 mt-2">
                            <strong>Admins:</strong> {study.admins.map((a) => a.name).join(", ")}
                        </p>
                        <p className="text-gray-500 mt-2">
                            <strong>Members:</strong> {study.members.length}명
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Study;
