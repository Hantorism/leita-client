import { studyApi } from '@apis';
import {
  Button,
  CreateStudyModal,
  DeleteStudyModal,
  Footer,
  Header,
  JoinStudyModal,
  UpdateStudyModal,
} from '@components';
import { useAlert } from '@contexts';
import type { Study, StudyUser } from '@types';
import { getCurrentUserEmail, Logger } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';

const StudyPage = () => {
  const { showAlert } = useAlert();
  const [studies, setStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [selectedStudy, setSelectedStudy] = useState<Study | null>(null);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [updateTargetStudy, setUpdateTargetStudy] = useState<Study | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [deleteTargetStudy, setDeleteTargetStudy] = useState<Study | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await studyApi.getStudies(page, 10);
      const content: Study[] = result.data?.content || result.content || [];
      setStudies(content);
      setTotalPages(result.data?.totalPages || result.totalPages || 1);
    } catch (err: any) {
      Logger.error('Failed to fetch studies:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [page]);

  const handleStudyClick = (study: Study) => {
    const currentUserEmail = getCurrentUserEmail();
    if (currentUserEmail) {
      const members: StudyUser[] = study.members || [];
      const userInStudy = members.find((m) => m.email.toLowerCase().trim() === currentUserEmail);
      if (userInStudy?.role === 'ADMIN' || userInStudy?.role === 'MEMBER') {
        window.location.href = `/study/${study.id}`;
        return;
      }
    }
    setSelectedStudy(study);
    setShowJoinModal(true);
  };

  useEffect(() => {
    fetchStudies();
  }, [fetchStudies]);

  const handleDeleteStudy = async () => {
    if (!deleteTargetStudy) return;
    setIsDeleting(true);
    try {
      await studyApi.deleteStudy(deleteTargetStudy.id);
      setShowDeleteModal(false);
      setDeleteTargetStudy(null);
      fetchStudies();
    } catch (err: any) {
      Logger.error('Delete Error:', err);
      showAlert('error', '삭제 실패: ' + (err.response?.data?.message || err.message || '알 수 없는 오류'));
    } finally {
      setIsDeleting(false);
    }
  };

  const currentUserEmail = getCurrentUserEmail();

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        {/* 타이틀 & Create 버튼 */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter">스터디</h1>
          </motion.div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto rounded-[1.5rem] !px-8 !py-5 font-black shadow-2xl shadow-[#CAFE33]/20 active:scale-95"
          >
            + 스터디 생성
          </Button>
        </div>

        {/* 로딩 / 에러 / 빈 상태 */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40">
            <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold">스터디 목록을 불러오고 있어요...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-40 font-bold">{error}</div>
        ) : studies.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-40 rounded-[3rem] bg-white/5 border border-dashed border-white/10"
          >
            <p className="text-gray-500 text-xl font-bold">참여 가능한 스터디가 아직 없어요.</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {studies.map((study, index) => {
              const members = study.members || [];
              const admins = members.filter((m) => m.role === 'ADMIN');
              const memberCount = members.filter((m) => m.role === 'MEMBER').length;
              const isCurrentUserAdmin = currentUserEmail
                ? admins.some((a) => a.email.toLowerCase().trim() === currentUserEmail)
                : false;

              return (
                <motion.div
                  key={study.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="group bg-white/5 border border-white/5 rounded-[2.5rem] p-8 sm:p-10 flex flex-col gap-8 cursor-pointer hover:bg-white/10 hover:border-white/10 transition-all duration-500 shadow-2xl active:scale-[0.98]"
                  onClick={() => handleStudyClick(study)}
                >
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight group-hover:text-[#CAFE33] transition-colors">{study.title}</h2>
                    {isCurrentUserAdmin && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUpdateTargetStudy(study);
                            setShowUpdateModal(true);
                          }}
                          className="p-3 rounded-2xl bg-white/5 hover:bg-[#CAFE33] hover:text-black transition-all text-gray-400"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTargetStudy(study);
                            setShowDeleteModal(true);
                          }}
                          className="p-3 rounded-2xl bg-white/5 hover:bg-red-500 hover:text-white transition-all text-gray-400"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6" />
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-gray-500 text-lg font-medium leading-relaxed line-clamp-3">
                    {study.description || '스터디에 대한 상세 설명이 준비되지 않았습니다.'}
                  </p>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-auto pt-8 border-t border-white/5 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-xs font-black text-gray-500">AD</div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Admin</span>
                        <span className="text-sm sm:text-base font-bold text-gray-400">
                          {admins.length ? admins[0].name : '—'}
                          {admins.length > 1 && ` 외 ${admins.length - 1}명`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-[1.5rem] border border-white/5 w-fit">
                      <span className="text-xs font-black text-gray-600 uppercase tracking-widest">Members</span>
                      <span className="text-lg font-black text-[#CAFE33] font-JetBrain">{memberCount}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* 페이지네이션 */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-center mt-16 gap-4">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-14 h-14 rounded-3xl font-black font-JetBrain text-lg transition-all duration-300 ${
                  page === i 
                    ? 'bg-[#CAFE33] text-black shadow-[0_10px_30px_-5px_rgba(202,254,51,0.3)]' 
                    : 'bg-white/5 text-gray-600 hover:text-white hover:bg-white/10'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </main>

      {/* 모달 */}
      {showCreateModal && (
        <CreateStudyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={fetchStudies}
        />
      )}
      {showJoinModal && selectedStudy && (
        <JoinStudyModal
          study={selectedStudy}
          onClose={() => setShowJoinModal(false)}
        />
      )}
      {showUpdateModal && updateTargetStudy && (
        <UpdateStudyModal
          study={updateTargetStudy}
          onClose={() => setShowUpdateModal(false)}
          onUpdated={fetchStudies}
        />
      )}

      {/* 삭제 확인 모달 */}
      {showDeleteModal && deleteTargetStudy && (
        <DeleteStudyModal
          study={deleteTargetStudy}
          isDeleting={isDeleting}
          onConfirm={handleDeleteStudy}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteTargetStudy(null);
          }}
        />
      )}

      <Footer />
    </div>
  );
};

export default StudyPage;
