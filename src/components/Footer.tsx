import { Logo } from '@assets/images';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="hidden md:block w-full bg-[#1A1A1A] text-white py-10 px-4 font-Pretendard border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Top Section: Logo & Quick Links */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <Link
            to="/"
            className="inline-block transition-opacity hover:opacity-80"
          >
            <img
              src={Logo}
              alt="LEITA Logo"
              className="h-5 opacity-80"
            />
          </Link>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-gray-500">
            <Link
              to="/problems"
              className="hover:text-white transition-colors"
            >
              문제 목록
            </Link>
            <Link
              to="/judge"
              className="hover:text-white transition-colors"
            >
              채점 현황
            </Link>
            <Link
              to="/study"
              className="hover:text-white transition-colors"
            >
              스터디
            </Link>
            <Link
              to="/terms"
              className="hover:text-white transition-colors"
            >
              이용약관
            </Link>
            <Link
              to="/privacy"
              className="hover:text-white transition-colors"
            >
              개인정보 처리방침
            </Link>
          </div>
        </div>

        {/* Bottom Section: Copyright & Info */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center pt-6 border-t border-white/5 gap-4 text-xs text-gray-600">
          <div className="flex flex-col md:flex-row gap-2 md:gap-4 items-start md:items-center">
            <p>© 2025 Leita. All rights reserved.</p>
            <span className="hidden md:block text-gray-800">|</span>
            <p>아주대학교 소프트웨어학과 (이장원, 조성연, 오태림)</p>
          </div>
          <p className="hover:text-gray-400 transition-colors">leitaajou@gmail.com</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
