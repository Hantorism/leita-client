import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CreateStudyModal from '../components/CreateStudyModal';
import { Logger } from '../utils';

const API_BASE_URL = process.env.REACT_APP_API_URL;

interface User {
  name: string;
  email: string;
}

interface Study {
  id: number;
  title: string;
  description: string;
  admins: User[];
  members: User[];
  requirement?: string;
}

const StudyPage: React.FC = () => {
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [size] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [showStudyDetailModal, setShowStudyDetailModal] = useState<boolean>(false);

  const fetchStudies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), size: String(size) });
      const response = await fetch(`${API_BASE_URL}/study-class?${params}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch study groups: ${response.status}`);
      }

      const result = await response.json();
      setStudies(result.data?.content || []);
      setTotalPages(result.data?.totalPages || 1);
    } catch (err: any) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const fetchStudyDetails = async (studyId: number) => {
    try {
      const response = await fetch(`${API_BASE_URL}/study-class/${studyId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch study details');
      }

      const result = await response.json();
      const studyData: Study = result.data;

      const storedUser = localStorage.getItem('user');
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const currentUserEmail = currentUser?.data?.email?.toLowerCase().trim();

      if (currentUserEmail) {
        Logger.print('Current Email:', currentUserEmail);

        const isAdmin = studyData.admins.some(a => a.email.toLowerCase().trim() === currentUserEmail);
        const isMember = studyData.members.some(m => m.email.toLowerCase().trim() === currentUserEmail);

        if (isMember || isAdmin) {
          window.open(`/study/${studyId}`, '_blank');
          return;
        }
      }

      setSelectedStudy(studyData);
      setShowStudyDetailModal(true);
    } catch (err) {
      Logger.error('에러 발생:', err);
      alert('스터디 정보를 불러오는 데 실패했습니다.');
    }
  };

  useEffect(() => {
    fetchStudies();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  return (
    <div className="flex flex-col items-start min-h-screen text-gray-900 pt-[5%] bg-[#1A1A1A] font-Pretendard">
      <header className="pl-[10%] pr-[10%] w-full text-left">
        <Header />
      </header>

      <div className="pl-[15%] pr-[15%] mt-6 w-full flex justify-end font-Pretendard">
        <button
          onClick={() => setShowModal(true)}
          className=" bg-white bg-opacity-30 text-white px-6 py-2 font-Pretendard rounded-full hover:text-[#b0e82e] hover:bg-opacity-10"
        >
          Create Study
        </button>
      </div>
      <div className="flex-grow max-w-3xl mx-auto w-full">
        {!loading && !error && studies.length === 0 ? (
          <p className="text-center text-gray-400 mt-10 w-full">
            🚀 진행 중인 스터디가 없습니다.
          </p>
        ) : (
          <div className="flex-grow max-w-3xl mx-auto w-full pt-9 md:text-sm pl-5 pr-5 font-Pretendard">
            <div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden border-collapse border border-gray-600">
              <table className=" w-full text-left ">
                <thead>
                  <tr className="bg-[#2A2A2A] text-white">
                    <th className="p-3 border-b border-gray-500">Title</th>
                    <th className="p-3 border-b border-gray-500">Description</th>
                    <th className="p-3 border-b border-gray-500">Admin</th>
                    <th className="p-3 border-b border-gray-500">Members</th>
                  </tr>
                </thead>
                <tbody className="bg-white bg-opacity-5">
                  {studies.map((study, index) => (
                    <tr
                      key={study.id}
                      className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
                        index % 2 === 0 ? 'bg-white bg-opacity-10' : 'bg-[#2A2A2A] bg-opacity-20'
                      }`}
                      onClick={() => {
                        fetchStudyDetails(study.id);
                      }}
                    >
                      <td className="px-4 py-5 ">{study.title}</td>
                      <td className="px-4 py-5 ">
                        {study.description.length > 15
                          ? `${study.description.slice(0, 15)}...`
                          : study.description}
                      </td>
                      <td className="px-4 py-5 text-gray-300">
                        {study.admins.map(a => a.name).join(', ')}
                      </td>
                      <td className="px-4 py-5 text-gray-300">{study.members.length}명</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex justify-center mt-4 mb-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => handlePageChange(i)}
              className={`px-3 py-1 mx-1 rounded-full transition ${
                page === i ? 'bg-[#CAFF33] text-black' : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {showModal && <CreateStudyModal onClose={() => setShowModal(false)} onCreated={fetchStudies} />}
      {showStudyDetailModal && selectedStudy && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-gray-100 rounded-xl p-8 w-full max-w-md shadow-lg ">
            <h2 className="text-xl font-extrabold mb-4 font-NanumSquare">{selectedStudy.title}</h2>
            <p className="mb-3 font-bold text-gray-600 font-NanumSquare">{selectedStudy.description}</p>
            <p className="mb-10 text-sm text-gray-600 font-NanumSquare">
              모집 조건: {selectedStudy.requirement}
            </p>
            <div className="flex justify-end space-x-2">
              <button
                className="px-4 py-2 bg-gray-300  rounded-full hover:bg-gray-500"
                onClick={() => setShowStudyDetailModal(false)}
              >
                close
              </button>
              <button
                className="px-4 py-2  bg-gray-600 text-white rounded-full  hover:text-[#CAFF33]"
                onClick={() => {
                  alert('🚀 가입 요청을 전송했습니다.');
                  setShowStudyDetailModal(false);
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>
      )}

      <footer className="w-full text-left mt-20">
        <Footer />
      </footer>
    </div>
  );
};

export default StudyPage;