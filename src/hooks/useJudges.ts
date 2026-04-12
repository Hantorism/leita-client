import { useState, useEffect } from 'react';
import { judgeApi } from '@apis';
import { type JudgeData } from '@types';
import { Logger } from '@utils';
import { useAlert } from '@contexts';
import { useNavigate } from 'react-router-dom';

export const useJudges = () => {
  const [judges, setJudges] = useState<JudgeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showAlert } = useAlert();
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const fetchJudges = async () => {
      try {
        setLoading(true);
        const result = await judgeApi.getJudges();
        if (isMounted) {
          const data = (result as unknown as JudgeData[]) || [];
          setJudges(data);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          Logger.error('Failed to fetch judges:', err);
          const errorResp = (err as any).response;
          if (errorResp?.status === 401) {
            showAlert('error', '로그인이 필요합니다.');
            navigate('/');
          } else {
            setError('데이터를 가져오는 중 오류가 발생했습니다.');
          }
          setJudges([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchJudges();

    return () => {
      isMounted = false;
    };
  }, [showAlert, navigate]);

  return { judges, loading, error };
};
