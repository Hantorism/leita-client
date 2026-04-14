import { problemApi } from '@apis';
import type { ProblemDetail } from '@types';
import { Logger, type PagedResponse } from '@utils';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';

const SCROLL_DURATION = 200;

const PopularProblems = () => {
    const [problems, setProblems] = useState<ProblemDetail[]>([]);
    const isMounted = useRef(true);
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        const container = scrollRef.current;
        const gap = 20;
        const cardWidth = (container.clientWidth - 3 * gap) / 4;
        const scrollAmount = direction === 'right' ? cardWidth + gap : -(cardWidth + gap);
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
            try {
                const res = await problemApi.getProblems(0, 20);
                if (!isMounted.current) return;

                const { content } = res as unknown as PagedResponse<ProblemDetail>;

                const sortedProblems = [...content]
                    .sort((a, b) => (b.solved?.totalCount || 0) - (a.solved?.totalCount || 0))
                    .slice(0, 10);

                setProblems(sortedProblems);
            } catch (error) {
                Logger.error('Failed to fetch problems:', error);
            }
        };

        fetchProblems();
        return () => {
            isMounted.current = false;
        };
    }, []);

    if (problems.length === 0) return null;

    return (
        <section className="w-full py-4">
            {/* Section Header */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="flex items-center gap-3 mb-8"
            >
                <h2 className="text-3xl font-extrabold text-white tracking-tight font-Pretendard">인기 문제</h2>
                <span className="text-2xl">🔥</span>
            </motion.div>

            {/* Problem Cards - Horizontal Scroll */}
            <div className="relative">
                {/* Left Button */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10
            w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-white/10
            flex items-center justify-center
            hover:bg-[#3a3a3a] hover:border-[#CAFE33]/40 transition-all duration-200
            text-gray-400 hover:text-white shadow-lg"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="15 18 9 12 15 6" />
                    </svg>
                </button>

                {/* Right Button */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10
            w-10 h-10 rounded-full bg-[var(--color-bg-surface)] border border-white/10
            flex items-center justify-center
            hover:bg-[#3a3a3a] hover:border-[#CAFE33]/40 transition-all duration-200
            text-gray-400 hover:text-white shadow-lg"
                >
                    <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <polyline points="9 18 15 12 9 6" />
                    </svg>
                </button>

                <div
                    ref={scrollRef}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide outline-none"
                    style={{ scrollSnapType: 'x mandatory' }}
                >
                    {problems.map((problem, index) => {
                        const successRate = problem.solved?.rate ?? 0;

                        return (
                            <motion.div
                                key={problem.problemId}
                                initial={{ opacity: 0, y: 24 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.08 }}
                                onClick={() => window.open(`problems/${problem.problemId}`, '_blank')}
                                className="group relative cursor-pointer rounded-2xl p-6
                bg-[var(--color-bg-surface)] border border-white/5
                hover:border-[#CAFE33]/40 hover:shadow-[0_0_24px_rgba(202,254,51,0.15)]
                transition-all duration-300 active:scale-[0.97]
                flex flex-col justify-between min-h-[320px] shrink-0"
                                style={{ width: 'calc((100% - 3 * 1.25rem) / 4)', scrollSnapAlign: 'start' }}
                            >
                                {/* Rank Badge */}
                                <div className="flex items-start justify-between mb-4">
                                    <div
                                        className="w-10 h-10 rounded-xl flex items-center justify-center
                  bg-[#CAFE33] text-black
                  font-JetBrain font-black text-sm
                  transition-transform duration-300 group-hover:scale-110"
                                    >
                                        {String(index + 1).padStart(2, '0')}
                                    </div>
                                </div>

                                {/* Problem Title */}
                                <h3 className="text-lg font-bold text-white leading-snug line-clamp-2 mb-3 group-hover:text-[#CAFE33] transition-colors duration-300">
                                    {problem.title}
                                </h3>

                                {/* Category Tags */}
                                {problem.category && problem.category.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5 mb-4">
                                        {problem.category.map((cat) => (
                                            <span
                                                key={cat}
                                                className="text-[10px] font-semibold text-gray-400 bg-white/5 px-2 py-0.5 rounded-md"
                                            >
                        {cat}
                      </span>
                                        ))}
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="mt-auto pt-4 border-t border-white/5 flex flex-col gap-3">
                                    {/* Success Rate */}
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-semibold text-gray-500 font-Pretendard">정답률</span>
                                            <span className="text-sm font-bold text-white font-Pretendard">{successRate.toFixed(1)}%</span>
                                        </div>
                                        <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(successRate, 100)}%` }}
                                                transition={{ duration: 0.8, delay: 0.3 + index * 0.08 }}
                                                className="h-full rounded-full bg-[#CAFE33]"
                                            />
                                        </div>
                                    </div>

                                    {/* Solved Count */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold text-gray-500 font-Pretendard">제출 수</span>
                                        <span className="text-sm font-bold text-white font-Pretendard">
                      {(problem.solved?.totalCount || 0).toLocaleString()}회
                    </span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default PopularProblems;
