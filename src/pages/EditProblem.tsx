import { problemApi } from '@apis';
import { Footer, Header, ProblemTemplate } from '@components';
import { useAlert } from '@contexts';
import type { CreateProblemRequest } from '@types';
import { DecodeBase64, Logger } from '@utils';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const EditProblemPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const [previousData, setPreviousData] = useState<CreateProblemRequest | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) return;
      try {
        const data = await problemApi.getProblem(id);
        
        // Decode test cases and prepare data for template
        const decodedData: CreateProblemRequest = {
          title: data.title,
          description: data.description,
          limit: data.limit,
          source: data.source,
          category: data.category,
          testCases: data.testCases.map((tc) => ({
            input: DecodeBase64(tc.input),
            output: DecodeBase64(tc.output),
            isShow: tc.isShow,
          })),
        };
        
        setPreviousData(decodedData);
      } catch (error) {
        Logger.error('Error fetching problem', error);
        showAlert('error', '문제 정보를 불러오는 데 실패했습니다.');
        navigate('/problems');
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id, navigate, showAlert]);

  const handleEditSubmit = async (data: CreateProblemRequest) => {
    if (!id) return;
    await problemApi.updateProblem(id, data);
    showAlert('success', '문제가 성공적으로 수정되었습니다!');
    navigate(`/problems/${id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-main)] font-Pretendard pt-8">
      <header className="pl-[10%] pr-[10%] w-full text-left">
        <Header />
      </header>
      {loading ? (
        <div className="flex items-center justify-center text-white text-2xl py-20">
          Loading...
        </div>
      ) : (
        <ProblemTemplate
          mode="edit"
          onSubmit={handleEditSubmit}
          previousData={previousData}
        />
      )}
      <footer className="w-full text-left mt-20">
        <Footer />
      </footer>
    </div>
  );
};

export default EditProblemPage;
