import { Logo } from '@assets/images';
import { Login } from '@components';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `nav-link px-4 py-2 text-sm font-semibold transition-colors duration-200 ${
      isActive ? 'text-[#CAFE33]' : 'text-gray-400 hover:text-white'
    }`;

  const mobileNavLinkStyle = ({ isActive }: { isActive: boolean }) =>
    `text-4xl font-black transition-all ${isActive ? 'text-[#CAFE33] translate-x-2' : 'text-white'}`;

  return (
    <>
      <header className="sticky top-0 z-[100] w-full bg-[#1A1A1A]/80 backdrop-blur-xl border-b border-white/5">
        <nav className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-10">
            <Link to="/" className="flex-shrink-0 transition-transform hover:scale-105 active:scale-95">
              <img src={Logo} alt="Leita Logo" className="h-7 sm:h-8" />
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden md:flex items-center gap-4 list-none m-0 p-0">
              <li>
                <NavLink
                  to="/"
                  className={navLinkStyle}
                >
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/problems"
                  className={navLinkStyle}
                >
                  Problems
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/judge"
                  className={navLinkStyle}
                >
                  Solved
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/study"
                  className={navLinkStyle}
                >
                  Study
                </NavLink>
              </li>
            </ul>
          </div>

          {/* Right: Login & Hamburger */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:block">
              <Login />
            </div>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-3 text-white hover:bg-white/5 rounded-2xl transition-colors z-[110] relative"
              aria-label="Toggle Menu"
            >
              <div className="w-7 h-5 relative flex flex-col justify-between">
                <span
                  className={`w-full h-1 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`}
                />
                <span
                  className={`w-full h-1 bg-white rounded-full transition-opacity duration-300 ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`}
                />
                <span
                  className={`w-full h-1 bg-white rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[8px]' : ''}`}
                />
              </div>
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Moved outside header to ensure absolute layering */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[200] md:hidden">
            {/* Background Dim Overlay (Solid Black) */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            />

            {/* Slide-out Menu (Solid Background) */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="absolute top-0 right-0 bottom-0 w-[85%] max-w-[360px] bg-[#1A1A1A] border-l border-white/10 flex flex-col p-10 pt-32 shadow-2xl shadow-black"
            >
              <div className="flex flex-col gap-12">
                <NavLink
                  to="/"
                  className={mobileNavLinkStyle}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Home
                </NavLink>
                <NavLink
                  to="/problems"
                  className={mobileNavLinkStyle}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Problems
                </NavLink>
                <NavLink
                  to="/judge"
                  className={mobileNavLinkStyle}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Solved
                </NavLink>
                <NavLink
                  to="/study"
                  className={mobileNavLinkStyle}
                  onClick={() => setIsMenuOpen(false)}
                >
                  Study
                </NavLink>
              </div>

              {/* Mobile Footer Info inside Menu */}
              <div className="mt-auto pt-10 flex flex-col gap-10">
                <div className="sm:hidden border-t border-white/10 pt-10">
                  <Login />
                </div>

                <div className="space-y-6">
                  <div className="flex flex-col gap-3">
                    <Link
                      to="/terms"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-base font-bold text-gray-400 hover:text-white"
                    >
                      이용약관
                    </Link>
                    <Link
                      to="/privacy"
                      onClick={() => setIsMenuOpen(false)}
                      className="text-base font-bold text-gray-400 hover:text-white"
                    >
                      개인정보 처리방침
                    </Link>
                  </div>
                  <div className="pt-6 border-t border-white/5">
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-3">Developed by</p>
                    <p className="text-sm font-bold text-gray-400 leading-relaxed">
                      아주대학교<br />
                      이장원, 조성연, 오태림
                    </p>
                    <p className="text-sm font-bold text-[#CAFE33] mt-3">leitaajou@gmail.com</p>
                  </div>
                  <p className="text-xs font-bold text-gray-700">© 2025 Leita. All rights reserved.</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
