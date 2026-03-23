import { useState, useRef, useEffect } from 'react';
import { Login } from '@components';
import { Logo } from '@assets/images';
import { User } from '@types';
import { Link, NavLink } from 'react-router-dom';

const Header = () => {
	const [user, setUser] = useState<User | null>(null);
	const [menuWidth, setMenuWidth] = useState<number | string>('auto');
	const menuRef = useRef<HTMLUListElement>(null);

	// 메뉴 영역의 실제 내용물 너비를 측정하여 상단 라인의 너비로 설정
	useEffect(() => {
		const updateWidth = () => {
			if (menuRef.current) {
				const rect = menuRef.current.getBoundingClientRect();
				setMenuWidth(rect.width);
			}
		};

		const timer = setTimeout(updateWidth, 100);
		window.addEventListener('resize', updateWidth);
		return () => {
			window.removeEventListener('resize', updateWidth);
			clearTimeout(timer);
		};
	}, []);

	return (
		<header className="font-Pretendard px-0 min-[1000px]:px-4 pt-4">
			<nav className="bg-white bg-opacity-30 p-2 min-[1000px]:p-4 rounded-3xl min-[1000px]:rounded-full flex flex-col min-[1000px]:flex-row items-center justify-between gap-3 min-[1000px]:gap-0 mx-2 min-[1000px]:mx-0">
				
				{/* 1단/상단 영역: 하단 메뉴 너비를 최대로 사용하며 양 끝으로 정렬 */}
				<div 
					className="flex justify-between items-center mx-auto min-[1000px]:mx-0 min-[1000px]:w-auto min-[1000px]:!max-w-none px-0"
					style={{ 
						// 1000px 미만일 때 하단 메뉴의 총합 너비를 그대로 가져옴
						width: window.innerWidth < 1000 ? (typeof menuWidth === 'number' ? `${menuWidth}px` : '100%') : 'auto',
					}}
				>
					{/* 로고 */}
					<Link to="/" className="flex-shrink-0">
						<img src={Logo} alt="LEITA Logo" className="h-7 min-[1000px]:h-8"/>
					</Link>
					
					{/* 1000px 미만에서만 표시되는 사용자 정보 */}
					<div className="min-[1000px]:hidden flex-shrink-0">
						<Login user={user} setUser={setUser}/>
					</div>
				</div>

				{/* 2단/중앙 영역: 버튼 사이의 간격을 넓혀(gap-4 md:gap-6) 전체 너비를 확보 */}
				<ul 
					ref={menuRef}
					className="w-fit mx-auto min-[1000px]:mx-0 flex items-center justify-between list-none p-0 m-0 font-light tracking-wide overflow-x-auto no-scrollbar whitespace-nowrap gap-4 min-[1000px]:gap-1 py-1"
				>
					<li className="flex-shrink-0">
						<NavLink
							to="/"
							className={({ isActive }) => isActive
								? 'nav-link bg-black bg-opacity-50 text-[#CAFF33] px-5 py-2 rounded-full whitespace-nowrap inline-block'
								: 'nav-link text-white px-5 py-2 rounded-full whitespace-nowrap inline-block'
							}
						>
							Home
						</NavLink>
					</li>
					<li className="flex-shrink-0">
						<NavLink
							to="/problems"
							className={({ isActive }) => isActive
								? 'nav-link bg-black bg-opacity-50 text-[#CAFF33] px-5 py-2 rounded-full whitespace-nowrap inline-block'
								: 'nav-link text-white px-5 py-2 rounded-full whitespace-nowrap inline-block'
							}
						>
							Problems
						</NavLink>
					</li>
					<li className="flex-shrink-0">
						<NavLink
							to="/judge"
							className={({ isActive }) => isActive
								? 'nav-link bg-black bg-opacity-50 text-[#CAFF33] px-5 py-2 rounded-full whitespace-nowrap inline-block'
								: 'nav-link text-white px-5 py-2 rounded-full whitespace-nowrap inline-block'
							}
						>
							Solved
						</NavLink>
					</li>
					<li className="flex-shrink-0">
						<NavLink
							to="/study"
							className={({ isActive }) => isActive
								? 'nav-link bg-black bg-opacity-50 text-[#CAFF33] px-5 py-2 rounded-full whitespace-nowrap inline-block'
								: 'nav-link text-white px-5 py-2 rounded-full whitespace-nowrap inline-block'
							}
						>
							Study
						</NavLink>
					</li>
				</ul>

				{/* 1000px 이상일 때만 우측에 고정되는 로그인 영역 */}
				<div className="hidden min-[1000px]:block flex-shrink-0 ml-4">
					<Login user={user} setUser={setUser}/>
				</div>
			</nav>
		</header>
	);
};

export default Header;