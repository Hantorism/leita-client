import { problemApi } from '@leita/api';
import type { PopularPeriod, ProblemDetail } from '@leita/types';
import { Logger } from '@utils';
import { motion } from 'framer-motion';
import { useAlert, useAuth } from '@contexts';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_DURATION = 200;

const PopularProblems = () => {
    const [problems, setProblems] = useState<ProblemDetail[]>([]);
    const [period, setPeriod] = useState<PopularPeriod>('ALL');
    const [loading, setLoading] = useState(true);
    const isMounted = useRef(true);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { isAuthenticated } = useAuth();
    const { showAlert } = useAlert();

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const card = container.querySelector<HTMLDivElement>('div');
        const gap = 20;
        const scrollAmount = direction === 'right' 
            ? (card?.clientWidth || container.clientWidth / 4) + gap 
            : -((card?.clientWidth || container.clientWidth / 4) + gap);
        const start = container.scrollLeft;
        let startTime: number | null = null;

        container.style.scrollSnapType = 'none';

        const animate = (time: number) => {
            if (!startTime) startTime = time;
            const progress = Math.min((time - startTime) / SCROLL_DURATION, 1);
            const ease = 1 - (1 - progress) ** 3;
            container.scrollLeft = start + scrollAmount * ease;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                container.style.scrollSnapType = 'x mandatory';
            }
        };
        requestAnimationFrame(animate);
    }, []);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            scroll('left');
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            scroll('right');
        }
    };

    useEffect(() => {
        isMounted.current = true;
        const fetchProblems = async () => {
            setLoading(true);
            try {
                const res = await problemApi.getPopularProblems(period, 10);
                if (!isMounted.current) return;

                setProblems(res as unknown as ProblemDetail[] || []);
            } catch (error) {
                Logger.error('Failed to fetch popular problems:', error);
            } finally {
                if (isMounted.current) setLoading(false);
            }
        };

        fetchProblems();
        return () => {
            isMounted.current = false;
        };
    }, [period]);

    return (
        <section className="w-full py-4">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center gap-3"
                >
                    <h2 className="text-3xl font-extrabold text-white tracking-tight font-Pretendard">인기 문제</h2>
                    <span className="text-2xl">🔥</span>
                </motion.div>

                {/* Period Selector */}
                <motion.div
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex gap-1 bg-white/5 p-1.5 rounded-2xl border border-white/5"
                >
                    {[
                        { key: 'ALL', label: '전체' },
                        { key: 'WEEK', label: '이번 주' },
                        { key: 'MONTH', label: '이번 달' },
                    ].map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setPeriod(item.key as PopularPeriod)}
                            className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all duration-300 ${
                                period === item.key 
                                    ? 'bg-white/10 text-[#CAFE33] shadow-lg' 
                                    : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </motion.div>
            </div>

            {/* Problem Cards - Horizontal Scroll */}
            <div className="relative group/container min-h-[320px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 w-full">
                        <div className="w-10 h-10 border-4 border-[#CAFE33]/20 border-t-[#CAFE33] rounded-full animate-spin mb-4" />
                        <p className="text-gray-500 font-bold">인기 문제를 불러오는 중...</p>
                    </div>
                ) : problems.length > 0 ? (
                    <>
                        {/* Navigation Buttons */}
                        <button
                            onClick={() => scroll('left')}
                            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
                                    w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-white/10
                                    hidden md:flex items-center justify-center
                                    hover:bg-[#3a3a3a] hover:border-[#CAFE33]/40 transition-all duration-200
                                    text-gray-400 hover:text-white shadow-lg opacity-0 group-hover/container:opacity-100"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>

                        <button
                            onClick={() => scroll('right')}
                            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
                                    w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-white/10
                                    hidden md:flex items-center justify-center
                                    hover:bg-[#3a3a3a] hover:border-[#CAFE33]/40 transition-all duration-200
                                    text-gray-400 hover:text-white shadow-lg opacity-0 group-hover/container:opacity-100"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>

                        <div
                            ref={scrollRef}
                            onKeyDown={handleKeyDown}
                            tabIndex={0}
                            className="flex flex-col md:flex-row gap-5 md:overflow-x-auto pb-6 scrollbar-hide outline-none px-1"
                            style={{ scrollSnapType: 'x mandatory' }}
                        >
                            {problems.map((problem, index) => {
                                const successRate = problem.solved?.rate ?? 0;

                                return (
                                    <motion.div
                                        key={problem.problemId}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, delay: index * 0.1 }}
                                        onClick={() => {
                                            if (!isAuthenticated) {
                                                showAlert('error', '로그인이 필요합니다.');
                                                return;
                                            }
                                            if (problem.problemId) {
                                                window.open(`/problems/${problem.problemId}`, '_blank');
                                            }
                                        }}
                                        className="w-full md:w-[280px] lg:w-[320px] bg-white/5 border border-white/10 rounded-[2rem] p-8
                                                hover:bg-white/10 hover:border-[#CAFE33]/40 hover:shadow-[0_0_24px_rgba(202,254,51,0.15)]
                                                transition-all duration-300 active:scale-[0.97]
                                                flex flex-col justify-between min-h-[280px] md:min-h-[320px] shrink-0
                                                cursor-pointer snap-start"
                                    >
                                        <div>
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="px-3 py-1 bg-white/5 rounded-lg text-xs font-black text-gray-500 font-JetBrain tracking-tighter">
                                                    #{problem.problemId}
                                                </div>
                                                <div className="flex gap-1">
                                                    {problem.category?.slice(0, 2).map((cat, i) => (
                                                        <span key={i} className="text-[10px] font-black text-[#CAFE33] bg-[#CAFE33]/10 px-2 py-0.5 rounded uppercase">
                                                            {cat}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-black text-white leading-tight mb-4 group-hover:text-[#CAFE33] transition-colors line-clamp-2">
                                                {problem.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center justify-between mt-auto pt-6 border-t border-white/5">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-1">Success Rate</span>
                                                <span className="text-lg font-black text-white font-JetBrain tracking-tighter">
                                                    {successRate.toFixed(1)}%
                                                </span>
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-[#CAFE33] transition-all duration-300">
                                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 group-hover:text-black">
                                                    <polyline points="9 18 15 12 9 6" />
                                                </svg>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 w-full rounded-[2rem] bg-white/5 border border-dashed border-white/10">
                        <p className="text-gray-500 font-bold">인기 문제가 아직 없습니다.</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default PopularProblems;
