import { authApi, fileApi, gitApi } from '@apis';
import { Button, Footer, Header } from '@components';
import { useAlert, useAuth } from '@contexts';
import { useJudges } from '@hooks';
import { Logger, formatMemory, formatTime, formatDateTime } from '@utils';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyPage = () => {
  const { user, fetchUserInfo } = useAuth();
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'profile' | 'history'>('profile');
  const [name, setName] = useState(user?.name || '');
  const [profileImage, setProfileImage] = useState(user?.profileImage || '');
  const [department, setDepartment] = useState(user?.department || '');
  const [mainLanguage, setMainLanguage] = useState(user?.mainLanguage || 'undefined');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch only current user's judges
  const { judges: userJudges, loading: historyLoading } = useJudges(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setProfileImage(user.profileImage || '');
      setDepartment(user.department || '');
      setMainLanguage(user.mainLanguage || 'undefined');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await authApi.updateAuthInfo({
        name: name || null,
        profileImage: profileImage || null,
        department: department || null,
        mainLanguage: mainLanguage === 'undefined' ? null : mainLanguage,
      });
      await fetchUserInfo();
      
      // Sync local storage for CodeEditor immediately
      if (mainLanguage !== 'undefined') {
        localStorage.setItem('selectedLanguage', mainLanguage);
      } else {
        localStorage.removeItem('selectedLanguage');
      }
      
      showAlert('success', '정보가 성공적으로 저장되었습니다.');
    } catch (error) {
      Logger.error('Failed to update user info', error);
      showAlert('error', '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showAlert('error', '파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    try {
      setIsUploading(true);
      const extension = file.name.split('.').pop();
      const objectName = `profiles/${user?.email}_${Date.now()}.${extension}`;
      
      // 1. Generate PAR
      const res = await fileApi.generatePAR({ objectName });
      
      // 2. Upload file to OCI
      await fetch(res.url, {
        method: 'PUT',
        body: file,
      });

      // 3. Construct final URL
      const finalUrl = `https://objectstorage.ap-chuncheon-1.oraclecloud.com/n/axujpj9ptdme/b/test-leita-bucket/o/${objectName}`;
      setProfileImage(finalUrl);
      showAlert('success', '프로필 이미지가 업로드되었습니다. 저장 버튼을 눌러 확정하세요.');
    } catch (error) {
      Logger.error('Profile image upload failed', error);
      showAlert('error', '이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleLinkGithub = async () => {
    try {
      const res = await gitApi.getGitInstallationUrl();
      if (res && res.installationUrl) {
        window.open(res.installationUrl, '_blank');
      }
    } catch (error) {
      Logger.error('Failed to get github installation url', error);
      showAlert('error', 'GitHub 연동 주소를 가져오는데 실패했습니다.');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1A1A1A] flex flex-col justify-center items-center text-white font-Pretendard">
        <p className="text-xl font-bold">로그인이 필요합니다.</p>
        <Button variant="primary" onClick={() => navigate('/')} className="mt-6">
          홈으로 가기
        </Button>
      </div>
    );
  }

  const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'c', label: 'C' },
    { value: 'cpp', label: 'C++' },
    { value: 'go', label: 'Go' },
    { value: 'kotlin', label: 'Kotlin' },
    { value: 'swift', label: 'Swift' },
  ];

  return (
    <div className="flex flex-col min-h-screen text-white bg-[#1A1A1A] font-Pretendard overflow-x-hidden">
      <Header />

      <main className="flex-grow w-full max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 py-10 sm:py-20">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-black text-white tracking-tight">마이페이지</h1>
            <p className="text-gray-500 font-medium">프로필 및 서비스 설정을 관리하세요.</p>
          </div>

          {/* Profile Card */}
          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#CAFE33]/5 blur-[100px] -mr-32 -mt-32 rounded-full" />
            
            <div className="relative group/avatar">
              <div className="w-28 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white/10 shadow-xl relative z-10 bg-black/20">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#CAFE33] text-black flex items-center justify-center text-4xl font-black">
                    {name.charAt(0) || user.name.charAt(0)}
                  </div>
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
                    <div className="w-6 h-6 border-2 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin" />
                  </div>
                )}
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 w-10 h-10 bg-[#CAFE33] rounded-full z-30 flex items-center justify-center text-black border-4 border-[#1A1A1A] hover:scale-110 transition-transform shadow-lg"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>
                </svg>
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            <div className="flex flex-col gap-3 text-center sm:text-left relative z-10">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <h2 className="text-3xl font-black text-white">{user.name}</h2>
                {user.role === 'ADMIN' && (
                  <span className="px-3 py-1 bg-white/10 text-[#CAFE33] rounded-full text-xs font-bold w-fit mx-auto sm:mx-0">
                    관리자
                  </span>
                )}
              </div>
              <p className="text-lg text-gray-400 font-medium">{user.email}</p>
            </div>
          </div>

          {/* Tab Menu */}
          <div className="flex gap-2 p-1 bg-white/5 border border-white/10 rounded-2xl w-fit">
            {[
              { key: 'profile', label: '프로필 설정' },
              { key: 'history', label: '내 제출 내역' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-8 py-3 rounded-xl text-sm font-black transition-all duration-300 ${
                  activeTab === tab.key
                    ? 'bg-white/10 text-[#CAFE33] shadow-lg shadow-black/20'
                    : 'text-gray-500 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="min-h-[400px]">
            {activeTab === 'profile' ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch"
              >
                {/* Left: Settings */}
                <div className="lg:col-span-2">
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-8 space-y-8 h-full flex flex-col justify-between">
                    <div className="space-y-8">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="w-2 h-6 bg-[#CAFE33] rounded-full" />
                        기본 정보 설정
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">이름</label>
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="사용자 이름"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold"
                          />
                        </div>

                        <div className="flex flex-col gap-3">
                          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">학과 이름</label>
                          <input
                            type="text"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
                            placeholder="예: 소프트웨어학과"
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold"
                          />
                        </div>
                      </div>

                      <div className="flex flex-col gap-3">
                        <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">주 언어 (기본 설정)</label>
                        <div className="relative">
                          <select
                            value={mainLanguage}
                            onChange={(e) => setMainLanguage(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold appearance-none cursor-pointer"
                          >
                            <option value="undefined">선택 안 함</option>
                            {languages.map((lang) => (
                              <option key={lang.value} value={lang.value}>
                                {lang.label}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                            ▼
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto pt-8 border-t border-white/5">
                      <div className="flex flex-col gap-4">
                        <Button
                          variant="primary"
                          onClick={handleSave}
                          disabled={isSaving}
                          className="!w-full !rounded-xl !py-4 shadow-lg shadow-[#CAFE33]/10 text-base"
                        >
                          {isSaving ? '저장 중...' : '변경사항 저장하기'}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Actions & Integrations */}
                <div className="flex flex-col gap-8 h-full">
                  {/* GitHub Card */}
                  <div className="bg-[#24292e] border border-white/10 rounded-3xl p-8 flex flex-col gap-6 shadow-xl relative overflow-hidden group h-full">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                      <svg width="64" height="64" viewBox="0 0 24 24" fill="white">
                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.521-1.304.87-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-white relative z-10">GitHub 연동</h3>
                    <p className="text-sm text-gray-400 font-medium relative z-10">
                      문제 풀이 완료 시 코드를 자동 커밋합니다.
                    </p>

                    <div className="flex flex-col gap-4 mt-auto relative z-10">
                      <div
                        className={`px-4 py-3 rounded-xl text-center text-sm font-bold border ${user.isGithubLinked ? 'bg-[#CAFE33]/10 border-[#CAFE33]/20 text-[#CAFE33]' : 'bg-white/5 border-white/10 text-gray-500'}`}
                      >
                        {user.isGithubLinked ? (
                          <div className="flex flex-col gap-0.5">
                            <span>✅ GitHub 연동됨</span>
                            <span className="text-[11px] opacity-70">(@{user.githubUserName})</span>
                          </div>
                        ) : '미연동 상태'}
                      </div>
                      <Button
                        variant="ghost"
                        onClick={handleLinkGithub}
                        className="!w-full !rounded-xl !py-4 bg-white/10 hover:bg-white/20 text-white font-bold transition-all text-base"
                      >
                        {user.isGithubLinked ? '연동 다시하기' : 'GitHub 연동하기'}
                      </Button>

                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden"
              >
                <div className="p-8 border-b border-white/10">
                   <h3 className="text-xl font-bold text-white flex items-center gap-2">
                      <span className="w-2 h-6 bg-[#CAFE33] rounded-full" />
                      내 제출 내역
                    </h3>
                </div>
                
                <div className="p-4">
                  {historyLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center">
                       <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                       <p className="text-gray-500 font-bold">내역을 가져오고 있습니다...</p>
                    </div>
                  ) : userJudges.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="text-left border-b border-white/10">
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">문제</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">언어</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">결과</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">메모리</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest">시간</th>
                            <th className="px-6 py-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">제출 일시</th>
                          </tr>
                        </thead>
                        <tbody>
                          {userJudges.map((judge, idx) => (
                            <tr 
                              key={`${judge.id}-${idx}`} 
                              className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group"
                              onClick={() => navigate(`/judge/${judge.id}`)}
                            >
                              <td className="px-6 py-5">
                                <span className="text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                  #{judge.problemId}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-xs font-black text-gray-500 uppercase">{judge.used.language}</span>
                              </td>
                              <td className="px-6 py-5">
                                <span className={`text-xs font-bold ${judge.result === 'CORRECT' ? 'text-[#CAFE33]' : 'text-red-500'}`}>
                                  {judge.result}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-sm font-bold font-JetBrain text-gray-500 group-hover:text-white">
                                  {formatMemory(judge.used.memory)}
                                </span>
                              </td>
                              <td className="px-6 py-5">
                                <span className="text-sm font-bold font-JetBrain text-gray-500 group-hover:text-white">
                                  {formatTime(judge.used.time)}
                                </span>
                              </td>
                              <td className="px-6 py-5 text-right">
                                <span className="text-[11px] font-medium text-gray-600 group-hover:text-gray-400 transition-colors">
                                  {formatDateTime(judge.createdAt)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-20 text-center">
                       <p className="text-gray-500 font-bold">아직 제출한 내역이 없습니다.</p>
                       <Button variant="ghost" onClick={() => navigate('/problems')} className="mt-4 !text-[#CAFE33]">
                         문제 풀러 가기
                       </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyPage;
