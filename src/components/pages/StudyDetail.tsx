import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_URL; // API 주소 설정

interface StudyMember {
  name: string;
  email: string;
  sub: string;
  role: 'ADMIN' | 'USER';
  profileImage?: string; // mock 데이터에 없지만, 실제 API 응답에 있을 수 있으므로 추가
}

interface StudyData {
  title: string;
  description: string;
  admins: StudyMember[];
  members: StudyMember[];
}

const StudyDetail = () => {
	const { id } = useParams();
	const [study, setStudy] = useState<StudyData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {

		/*
		 axios.get(`${API_BASE_URL}/study/${id}`)
		 .then((res) => {
		 setStudy(res.data);
		 document.title = `${res.data.title} | Leita`;
		 setLoading(false);
		 })
		 .catch((err) => {
		 console.error("스터디 정보를 불러오는 데 실패했습니다:", err);
		 setError("스터디 정보를 불러올 수 없습니다.");
		 setLoading(false);
		 });
		 */

		setTimeout(() => {
			const mockStudy: StudyData = {
				title:       `스터디 ${id}`,
				description: '이 스터디는 프론트엔드 개발에 대해 함께 공부하는 그룹입니다.',
				admins:      [
					{
						name:  '장원영',
						email: 'jang@study.com',
						// profileImage: "https://via.placeholder.com/40",
						sub:  'admin-1',
						role: 'ADMIN'
					}
				],
				members:     [
					{
						name:  '이장',
						email: 'lee@study.com',
						// profileImage: "https://via.placeholder.com/40",
						sub:  'member-1',
						role: 'USER'
					},
					{
						name:  '장원',
						email: 'jangwon@study.com',
						// profileImage: "https://via.placeholder.com/40",
						sub:  'member-2',
						role: 'USER'
					}
				]
			};

			setStudy(mockStudy);
			document.title = `${mockStudy.title} | Leita`;
			setLoading(false);
		}, 1000); // 1초 딜레이 (API 호출 느낌)
	}, [id]);

	if (loading) return <div className="text-white text-center mt-10">스터디 정보를 불러오는 중...</div>;
	if (error) return <div className="text-white text-center mt-10">{error}</div>;
	if (!study) return <div className="text-white text-center mt-10">스터디를 찾을 수 없습니다.</div>;

	return (
		<div className="h-screen flex flex-col items-center bg-[#1A1A1A] text-white py-10">
			<h1 className="text-3xl font-bold text-[#CAFF33]">{study.title}</h1>
			<p className="text-gray-400 mt-4">{study.description}</p>

			<div className="mt-6 w-full max-w-3xl">
				<h2 className="text-xl font-semibold border-b pb-2">관리자</h2>
				<ul className="mt-3">
					{study.admins.map((admin: StudyMember, index: number) => (
						<li key={index} className="flex items-center gap-3 mt-2">
							<img
								src={admin.profileImage || 'https://via.placeholder.com/40/FFFFFF/FFFFFF?text=+'}
								alt={admin.name}
								className="w-10 h-10 rounded-full bg-white"
							/>
							<span className="text-lg">{admin.name} ({admin.email})</span>
						</li>
					))}
				</ul>
			</div>

			<div className="mt-6 w-full max-w-3xl">
				<h2 className="text-xl font-semibold border-b pb-2">멤버</h2>
				<ul className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-4">
					{study.members.map((member: StudyMember, index: number) => (
						<li key={index} className="flex items-center gap-3 p-3 bg-white bg-opacity-10 rounded-lg">
							<img
								src={member.profileImage || 'https://via.placeholder.com/40/FFFFFF/FFFFFF?text=+'}
								alt={member.name}
								className="w-10 h-10 rounded-full bg-white"
							/>
							<span className="text-gray-300">{member.name}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default StudyDetail;
