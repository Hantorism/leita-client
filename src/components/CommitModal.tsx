import { Button, Modal } from '@components';
import { useAlert } from '@contexts';
import { gitApi, judgeApi } from '@apis';
import type { RepositoryResponse, JudgeData } from '@types';
import { Logger } from '@utils';
import { useEffect, useState } from 'react';

interface CommitModalProps {
  isOpen: boolean;
  onClose: () => void;
  judge: JudgeData;
}

const CommitModal = ({ isOpen, onClose, judge }: CommitModalProps) => {
  const { showAlert } = useAlert();
  const [repositories, setRepositories] = useState<RepositoryResponse[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>('');
  const [commitMessage, setCommitMessage] = useState(`Solve: #${judge.problemId}`);
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    const fetchRepos = async () => {
      try {
        setLoadingRepos(true);
        const res = await gitApi.getInstalledRepositories();
        // RepositoryResponse is an array based on the API definition
        const repos = res as unknown as RepositoryResponse[];
        setRepositories(repos || []);
        if (repos && repos.length > 0) {
          setSelectedRepo(repos[0].repositoryName);
        }
      } catch (err) {
        Logger.error('Failed to fetch repositories:', err);
        showAlert('error', 'GitHub 레포지토리 목록을 불러오는 데 실패했습니다.');
      } finally {
        setLoadingRepos(false);
      }
    };
    
    fetchRepos();
  }, [isOpen, showAlert]);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!selectedRepo) {
      showAlert('info', '레포지토리를 선택해주세요.');
      return;
    }

    try {
      setIsSubmitting(true);
      await judgeApi.addReview({
        submitId: judge.id,
        description,
        commitMessage,
        repositoryName: selectedRepo,
      });
      showAlert('success', 'GitHub에 코드가 성공적으로 커밋되었습니다!');
      onClose();
    } catch (err) {
      Logger.error('Failed to auto-commit:', err);
      showAlert('error', 'GitHub 커밋에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal title="GitHub에 커밋하기" onClose={onClose}>
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">레포지토리 선택</label>
          {loadingRepos ? (
             <div className="animate-pulse h-12 bg-white/5 rounded-xl" />
          ) : (
             <div className="relative">
              <select
                value={selectedRepo}
                onChange={(e) => setSelectedRepo(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold appearance-none cursor-pointer"
              >
                {repositories.length === 0 && <option value="">설치된 레포지토리가 없습니다</option>}
                {repositories.map((repo) => (
                  <option key={repo.repositoryName} value={repo.repositoryName}>
                    {repo.repositoryName}
                  </option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                ▼
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">커밋 메시지</label>
          <input
            type="text"
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold"
            placeholder="커밋 메시지를 입력하세요"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-bold text-gray-400 uppercase tracking-widest">리뷰 메모 (Markdown 지원)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-[#CAFE33] transition-all font-semibold resize-none"
            placeholder="문제 풀이 방식, 느낀 점 등을 기록해보세요."
          />
        </div>

        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={isSubmitting || loadingRepos || repositories.length === 0}
          className="mt-2 !rounded-xl !py-4 shadow-lg shadow-[#CAFE33]/10 text-base"
        >
          {isSubmitting ? '커밋 중...' : 'GitHub에 커밋 전송'}
        </Button>
      </div>
    </Modal>
  );
};

export default CommitModal;