import { useEffect, useState } from 'react';
import { Header, Footer } from '@components';
import { Solved } from '@assets/images';
import { Logger } from '@utils';
import { problemApi, judgeApi } from '@apis';
import { useAlert } from '@contexts';

interface Problem {
	problemId: number;
	title: string;
	category: string[];
	solved: {
		rate: number;
	};
}

interface JudgedProblem {
	problemId: number;
	result: string;
}

const Problems = () => {
	const { showAlert } = useAlert();
	const [problems, setProblems] = useState<Problem[]>([]);
	const [judgedProblems, setJudgedProblems] = useState<JudgedProblem[]>([]);
	const [searchQuery, setSearchQuery] = useState('');
	const [currentPage, setCurrentPage] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	const problemsPerPage = 10;
	const [filter, setFilter] = useState<'ALL' | 'SOLVED' | 'UNSOLVED'>('ALL');

	useEffect(() => {
		const fetchProblems = async () => {
			try {
				const filterValue = filter !== 'ALL' ? filter : undefined;

				const res = await problemApi.getProblems(
					currentPage,
					problemsPerPage,
					searchQuery,
					filterValue as any
				);

				const content = res.data?.content ?? res.content ?? [];
				const total = res.data?.totalPages ?? res.totalPages ?? 1;

				if (!Array.isArray(content)) {
					throw new Error('Invalid response format');
				}

				setProblems(content);
				setTotalPages(total);
			} catch (error) {
				Logger.error('Failed to fetch problems:', error);
				setProblems([]);
			}
		};

		const fetchJudgedProblems = async () => {
			try {
				const res = await judgeApi.getJudges();
				const judgedData = res.data ?? res ?? [];
				setJudgedProblems(judgedData.filter((judge: JudgedProblem) => judge.result === 'CORRECT'));
			} catch (error) {
				Logger.error('Failed to fetch judged problems:', error);
			}
		};

		fetchProblems();
		fetchJudgedProblems();
	}, [currentPage, searchQuery, filter]);

	const handlePageChange = (page: number) => {
		if (page >= 0 && page < totalPages) {
			setCurrentPage(page);
		}
	};

	const isProblemSolved = (problemId: number) => {
		return judgedProblems.some(judge => judge.problemId === problemId);
	};

	const filteredProblems = problems.filter(problem => {
		const matchesSearch =
			problem.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
			problem.problemId.toString().includes(searchQuery);

		if (!matchesSearch) return false;

		if (filter === 'ALL') return true;
		if (filter === 'SOLVED') return isProblemSolved(problem.problemId);
		if (filter === 'UNSOLVED') return !isProblemSolved(problem.problemId);

		return true;
	});

	return (
		<div className="flex flex-col items-start min-h-screen text-gray-900 pt-8 bg-[#1A1A1A] font-Pretendard">
			<header className="pl-[10%] pr-[10%] w-full text-left">
				<Header/>
			</header>

			<div className="flex w-full mt-6 items-center justify-center gap-4">
				<div className="flex flex-wrap gap-2 w-[25%] rounded-full justify-center">
					{[
						{ key: 'ALL', label: 'ALL' },
						{ key: 'SOLVED', label: 'SOLVED' },
						{ key: 'UNSOLVED', label: 'UNSOLVED' },
					].map(({ key, label }) => (
						<button
							key={key}
							onClick={() => setFilter(key as 'ALL' | 'SOLVED' | 'UNSOLVED')}
							className={`px-4 py-1 rounded-full transition ${
								filter === key
									? 'bg-[#2A2A2A] text-white '
									: 'text-white hover:text-[#CAFF33]  hover:bg-opacity-0 '
							}`}
						>
							{label}
						</button>
					))}
				</div>
				<input
					type="text"
					placeholder=" Search by Title or ID"
					className="w-[20%] p-2 py-1 rounded-full bg-[#2A2A2A] text-white text-center"
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
				/>
			</div>

			<div className="flex-grow max-w-3xl mx-auto w-full pt-9 md:text-sm pl-5 pr-5">
				<div className="bg-[#2A2A2A] bg-opacity-90 text-white rounded-lg shadow-md overflow-hidden border-collapse border border-gray-600">
					<table className=" w-full text-left ">
						<thead>
						<tr className="bg-[#2A2A2A] text-white">
							<th className="p-3 border-b border-gray-500">ID</th>
							<th className="p-3 border-b border-gray-500">Title</th>
							<th className="p-3 border-b border-gray-500">Correct rate</th>
						</tr>
						</thead>
						<tbody>
						{filteredProblems.length > 0 ? (
							filteredProblems.map((problem, index) => (
								<tr
									key={problem.problemId}
									onClick={() => {
										const token = localStorage.getItem('user');
										if (!token) {
											showAlert('error', '로그인이 필요합니다.');
											return;
										}

										const problemUrl = `problems/${problem.problemId}`;
										window.open(problemUrl, '_blank');
									}}
									className={`cursor-pointer border-b border-gray-500 hover:bg-black hover:text-[#CAFF33] transition ${
										index % 2 === 0
											? 'bg-white bg-opacity-10'
											: 'bg-[#2A2A2A] bg-opacity-20'
									}`}
								>
									<td className="p-4">{problem.problemId}</td>
									<td className="p-3 font-Pretendard">
										{problem.title || '제목 없음'}
										{isProblemSolved(problem.problemId) && (
											<img
												src={Solved}
												alt="solved"
												className="ml-2 w-3 h-3 mb-1 inline-block"
											/>
										)}
										<div className="flex flex-wrap gap-2 mt-1">
											{problem.category?.map((cat, i) => (
												<span
													key={i}
													className="px-2 py-1 text-xs text-gray-200 border border-gray-500 rounded-full"
												>
                            {cat}
                          </span>
											)) || <span className="text-xs text-gray-400">없음</span>}
										</div>
									</td>
									<td className="p-3">
										{problem.solved?.rate != null ? `${problem.solved.rate.toFixed(2)}%` : 'N/A'}
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={3} className="p-3 text-center text-gray-400">
									👾 해당 조건에 맞는 문제가 없습니다.
								</td>
							</tr>
						)}
						</tbody>
					</table>
				</div>

				<div className="flex justify-center mt-4 mb-4">
					{Array.from({ length: totalPages }, (_, i) => (
						<button
							key={i}
							onClick={() => handlePageChange(i)}
							className={`px-3 py-1 mx-1 rounded-full transition ${
								currentPage === i
									? 'bg-[#CAFF33] text-black'
									: 'bg-gray-700 text-white hover:bg-gray-600'
							}`}
						>
							{i + 1}
						</button>
					))}
				</div>
			</div>

			<footer className="w-full text-left mt-20">
				<Footer/>
			</footer>
		</div>
	);
};

export default Problems;