import { studyApi } from '@apis';
import {
  Button,
  CreateStudyModal,
  DeleteStudyModal,
  Footer,
  Header,
  JoinStudyModal,
  Pagination,
  UpdateStudyModal,
} from '@components';
import { useAlert, useAuth } from '@contexts';
import type { Study, StudyUser } from '@types';
import { Logger, type PagedResponse, extractErrorMessage } from '@utils';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const StudyPage = () => {
  const { showAlert } = useAlert();
  const { user } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'ALL' | 'MY' | 'AVAILABLE'>('ALL');
  const isMounted = useRef(true);
  const navigate = useNavigate();

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchStudies = useCallback(async () => {
    setLoading(true);
    try {
      const result = await studyApi.getStudies(page, 20);
      if (!isMounted.current) return;

      const { content, totalPages: total } = result as unknown as PagedResponse<Study>;
      // 디버깅을 위해 데이터 출력
      Logger.print('Fetched studies with joined info:', content);
      
      setStudies(content);
      setTotalPages(total || 1);
    } catch (err: any) {
      Logger.error('Failed to fetch studies:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [page]);

  const filteredStudies = studies.filter((study) => {
    if (activeTab === 'MY') return study.isJoined;
    if (activeTab === 'AVAILABLE') return !study.isJoined;
    return true;
  });

  const handleStudyClick = (study: Study) => {
    if (study.isJoined) {
      navigate(`/study/${study.id}`);
    } else {
      setSelectedStudy(study);
      setShowJoinModal(true);
    }
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
    } catch (err) {
      Logger.error('Delete Error:', err);
      showAlert('error', '삭제 실패: ' + extractErrorMessage(err));
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  };

  const currentUserEmail = user?.email?.toLowerCase().trim();

  return (
    <div className="flex flex-col min-h-screen bg-[#1A1A1A] font-Pretendard overflow-x-hidden text-white">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-10">
          {/* 타이틀 & Create 버튼 */}
          <div className="flex flex-row justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter">스터디</h1>
            </motion.div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="rounded-2xl !px-6 !py-3.5 font-black shadow-2xl shadow-[#CAFE33]/20 active:scale-95 text-sm sm:text-base"
            >
              + 스터디 생성
            </Button>
          </div>

          {/* 탭 네비게이션 */}
          <div className="flex gap-2 p-1.5 bg-white/5 rounded-2xl border border-white/5 w-fit">
            {[
              { id: 'ALL', label: '전체' },
              { id: 'MY', label: '참여' },
              { id: 'AVAILABLE', label: '미참여' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-white/10 text-[#CAFE33] shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* 로딩 / 에러 / 빈 상태 */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-12 h-12 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
              <p className="text-gray-500 font-bold">스터디를 불러오고 있어요...</p>
            </div>
          ) : error ? (
            <div className="text-center text-red-400 py-40 font-bold">{error}</div>
          ) : filteredStudies.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-40 rounded-[3rem] bg-white/5 border border-dashed border-white/10"
            >
              <p className="text-gray-500 text-xl font-bold">해당 조건에 맞는 스터디가 없어요.</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudies.map((study, index) => {
                const members = study.members || [];
                const admins = members.filter((m) => m.role === 'ADMIN');
                const isCurrentUserAdmin = currentUserEmail
                  ? admins.some((a) => a.email.toLowerCase().trim() === currentUserEmail)
                  : false;

                return (
                  <motion.div
                    key={study.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.03 }}
                    className="group relative bg-white/5 border border-white/5 rounded-[2rem] p-8 flex flex-col gap-6 cursor-pointer hover:bg-white/10 hover:border-[#CAFE33]/20 transition-all duration-300 active:scale-[0.98]"
                    onClick={() => handleStudyClick(study)}
                  >
                    {/* 상단: 상태 및 제목 */}
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-start">
                        <div
                          className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${
                            study.isJoined 
                              ? 'bg-[#CAFE33] text-black border-[#CAFE33]' 
                              : 'bg-white/5 text-gray-500 border-white/10 group-hover:border-gray-600'
                          }`}
                        >
                          {study.isJoined ? '참여 중' : '미참여'}
                        </div>
                        {isCurrentUserAdmin && (
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setUpdateTargetStudy(study);
                                setShowUpdateModal(true);
                              }}
                              className="p-2 rounded-xl bg-white/5 hover:bg-[#CAFE33] hover:text-black transition-all text-gray-400"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121(0) 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteTargetStudy(study);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 rounded-xl bg-white/5 hover:bg-red-500 hover:text-white transition-all text-gray-400"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                      <h2 className="text-2xl font-black leading-tight group-hover:text-[#CAFE33] transition-colors line-clamp-2">
                        {study.title}
                      </h2>
                    </div>

                    <p className="text-gray-500 text-sm font-medium line-clamp-3 leading-relaxed">
                      {study.description || '스터디에 대한 상세 설명이 준비되지 않았습니다.'}
                    </p>

                    {/* 하단: 정보 */}
                    <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded border border-white/5">Members</span>
                        <span className="text-xs font-black text-[#CAFE33] font-JetBrain">{study.memberCount}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Period</span>
                        <span className="text-[10px] font-bold text-gray-500 font-JetBrain">
                          {study.startDate} ~
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
}

          {/* 페이지네이션 */}
          {!loading && totalPages > 1 && (
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          )}
        </div>
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
