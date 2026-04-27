import { problemApi } from '@apis';
import { Footer, Header, ProblemTemplate } from '@components';
import { useAlert } from '@contexts';
import type { CreateProblemRequest } from '@types';

const CreateProblemPage = () => {
  const { showAlert } = useAlert();

  const handleCreateSubmit = async (data: CreateProblemRequest) => {
    await problemApi.createProblem(data);
    showAlert('success', '문제가 성공적으로 생성되었습니다!');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-bg-main)] font-Pretendard pt-8">
      <header className="pl-[10%] pr-[10%] w-full text-left">
        <Header />
      </header>
      <ProblemTemplate
        mode="create"
        onSubmit={handleCreateSubmit}
      />
      <footer className="w-full text-left mt-20">
        <Footer />
      </footer>
    </div>
  );
};

export default CreateProblemPage;
