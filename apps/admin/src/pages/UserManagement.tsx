import React, { useEffect, useState } from 'react';
import { adminUserApi, affiliationApi } from '@leita/api';
import type { AdminUserResponse, AffiliationResponse } from '@leita/types';
import { Loader, Pagination } from '@leita/ui';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUserResponse[]>([]);
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [selectedAffiliationId, setSelectedAffiliationId] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const fetchAffiliations = async () => {
    try {
      const res = await affiliationApi.getAffiliations();
      setAffiliations(res || []);
    } catch (err) {
      console.error('소속 목록 조회 오류:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminUserApi.getUsers({
        affiliationId: selectedAffiliationId,
        page,
        size: 10,
      });
      setUsers(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('유저 목록 조회 오류:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliations();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [selectedAffiliationId, page]);

  const handleAffiliationFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAffiliationId(val ? Number(val) : undefined);
    setPage(0);
  };

  const handleToggleRole = async (userItem: AdminUserResponse) => {
    const nextRole = userItem.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (!confirm(`'${userItem.name}' 님의 권한을 ${nextRole}(으)로 변경하시겠습니까?`)) return;

    try {
      await adminUserApi.updateUserRole(userItem.id, nextRole);
      await fetchUsers();
    } catch (err: any) {
      console.error('유저 권한 변경 오류:', err);
      alert(err?.response?.data?.message || '권한 변경 중 오류가 발생했습니다.');
    }
  };

  const handleDeleteUser = async (id: number, name: string) => {
    if (!confirm(`정말 '${name}' 유저를 탈퇴/삭제하시겠습니까?`)) return;
    try {
      await adminUserApi.deleteUser(id);
      await fetchUsers();
    } catch (err: any) {
      console.error('유저 삭제 오류:', err);
      alert(err?.response?.data?.message || '유저 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-16">
      {/* 헤더 및 필터 영역 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">유저 관리</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">
            서비스 가입 회원 목록을 소속별로 필터링하고 권한을 관리합니다.
          </p>
        </div>

        {/* 소속 필터 셀렉터 */}
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-gray-400">소속 필터:</span>
          <select
            value={selectedAffiliationId ?? ''}
            onChange={handleAffiliationFilterChange}
            className="bg-[#181818] border border-white/10 text-white text-sm font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#CAFE33]"
          >
            <option value="">전체 소속 보기</option>
            {affiliations.map((aff) => (
              <option key={aff.id} value={aff.id}>
                {aff.name} (@{aff.emailDomain})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 유저 테이블 컨테이너 */}
      <div className="bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {loading ? (
          <Loader text="유저 정보를 불러오고 있습니다..." />
        ) : users.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            해당 조건의 가입된 유저가 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-black text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 w-20">ID</th>
                  <th className="px-6 py-4">이름 / 이메일</th>
                  <th className="px-6 py-4">소속</th>
                  <th className="px-6 py-4">학과</th>
                  <th className="px-6 py-4">권한</th>
                  <th className="px-6 py-4 text-right w-44">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{u.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {u.profileImage ? (
                          <img
                            src={u.profileImage}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover border border-white/10 shrink-0"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-bold text-xs text-gray-300 shrink-0">
                            {u.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-white leading-tight">{u.name}</p>
                          <p className="text-xs text-gray-500 font-mono">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold bg-[#CAFE33]/10 text-[#CAFE33]">
                        {u.affiliationName}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{u.department || '-'}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                            : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleToggleRole(u)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                      >
                        {u.role === 'ADMIN' ? 'USER로 변경' : 'ADMIN 부여'}
                      </button>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.name)}
                        className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all"
                      >
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 페이징 네비게이션 */}
        {!loading && totalPages > 1 && (
          <div className="mt-8 flex justify-center">
            <Pagination
              currentPage={page + 1}
              totalPages={totalPages}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
