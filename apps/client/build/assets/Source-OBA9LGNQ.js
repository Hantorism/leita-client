import{C as e,F as t,O as n,P as r,nt as i,x as a}from"./index-Ce6QzN11.js";var o=i(),s=()=>{let i=n(),s=`#include <stdio.h>
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
`;return(0,o.jsxs)(`div`,{className:`min-h-screen bg-[#121212] text-white font-Pretendard flex flex-col`,children:[(0,o.jsx)(a,{}),(0,o.jsxs)(`main`,{className:`flex-1 container mx-auto px-6 py-12 max-w-4xl`,children:[(0,o.jsxs)(`div`,{className:`mb-8`,children:[(0,o.jsx)(`button`,{onClick:()=>i(-1),className:`text-gray-400 hover:text-white text-sm mb-4 inline-flex items-center gap-1 transition-colors`,children:`← 뒤로 가기`}),(0,o.jsxs)(`div`,{className:`flex flex-col gap-2`,children:[(0,o.jsx)(`h1`,{className:`text-3xl font-bold text-[var(--color-brand)]`,children:`제출 소스 코드`}),(0,o.jsx)(`p`,{className:`text-gray-400 text-sm`,children:`현재는 예시로 C언어 팰린드롬 확인 코드를 보여줍니다.`})]})]}),(0,o.jsxs)(`div`,{className:`bg-[var(--color-bg-card)] rounded-xl border border-gray-700/50 shadow-xl overflow-hidden p-6 mb-8`,children:[(0,o.jsxs)(`div`,{className:`flex flex-col md:flex-row justify-between items-start md:items-center mb-4 border-b border-gray-800 pb-4 gap-4`,children:[(0,o.jsxs)(`div`,{className:`flex flex-wrap items-center gap-3`,children:[(0,o.jsx)(`span`,{className:`bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-md text-sm font-bold inline-block`,children:`정답`}),(0,o.jsx)(`span`,{className:`text-gray-300 text-sm`,children:`언어: C`}),(0,o.jsx)(`span`,{className:`text-gray-500 text-sm`,children:`|`}),(0,o.jsxs)(`span`,{className:`text-gray-300 text-sm`,children:[`메모리: `,r(1024)]}),(0,o.jsx)(`span`,{className:`text-gray-500 text-sm`,children:`|`}),(0,o.jsxs)(`span`,{className:`text-gray-300 text-sm`,children:[`시간: `,t(0)]})]}),(0,o.jsx)(`button`,{onClick:()=>{navigator.clipboard.writeText(s),alert(`코드가 클립보드에 복사되었습니다.`)},className:`bg-[#2a2a2a] hover:bg-[#3a3a3a] text-gray-300 px-3 py-1.5 rounded-md text-sm transition-colors border border-gray-700`,children:`복사하기`})]}),(0,o.jsx)(`div`,{className:`bg-[#1a1a1a] p-5 rounded-lg overflow-x-auto border border-gray-800`,children:(0,o.jsx)(`pre`,{className:`text-gray-300 text-sm leading-relaxed whitespace-pre`,style:{fontFamily:`"JetBrains Mono", source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace`},children:s})})]})]}),(0,o.jsx)(e,{})]})};export{s as default};