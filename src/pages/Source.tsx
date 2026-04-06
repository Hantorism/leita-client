import { Footer, Header } from '@components';
import { useNavigate } from 'react-router-dom';

const SourcePage = () => {
  const navigate = useNavigate();

  const dummyCode = `#include <stdio.h>
#include <string.h>

int isPalindrome(char str[]) {
    int l = 0;
    int h = strlen(str) - 1;

    while (h > l) {
        if (str[l++] != str[h--]) {
            return 0;
        }
    }
    return 1;
}

int main() {
    char str[] = "level";
    if (isPalindrome(str)) {
        printf("%s is a palindrome\\n", str);
    } else {
        printf("%s is not a palindrome\\n", str);
    }
    return 0;
}
`;

  return (
    <div className="min-h-screen bg-[#121212] text-white font-Pretendard flex flex-col">
      <Header />

      <main className="flex-1 container mx-auto px-6 py-12 max-w-4xl">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors"
          >
            ← 뒤로 가기
          </button>
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold text-[#CAFE33]">제출 소스 코드</h1>
            <p className="text-gray-400 text-sm">현재는 예시로 C언어 팰린드롬 확인 코드를 보여줍니다.</p>
          </div>
        </div>

        <div className="bg-[#1f1f1f] rounded-xl border border-gray-700/50 shadow-xl overflow-hidden p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-gray-800 pb-4 gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md text-xs font-bold inline-block">정답</span>
              <span className="text-gray-300 text-sm">언어: C</span>
              <span className="text-gray-500 text-sm">|</span>
              <span className="text-gray-300 text-sm">메모리: 1024 KB</span>
              <span className="text-gray-500 text-sm">|</span>
              <span className="text-gray-300 text-sm">시간: 0 ms</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(dummyCode);
                alert('코드가 클립보드에 복사되었습니다.');
              }}
              className="bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 px-3 py-1.5 rounded-md text-xs transition-colors border border-gray-700"
            >
              복사하기
            </button>
          </div>
          
          <div className="bg-[#1a1a1a] p-5 rounded-lg overflow-x-auto border border-gray-800">
            <pre className="text-gray-300 text-sm leading-relaxed whitespace-pre" style={{ fontFamily: '"JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace' }}>
              {dummyCode}
            </pre>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SourcePage;
