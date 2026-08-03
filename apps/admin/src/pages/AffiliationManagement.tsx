import React, { useEffect, useState } from 'react';
import { affiliationApi } from '@leita/api';
import type { AffiliationResponse } from '@leita/types';
import { Button, Loader, Modal } from '@leita/ui';

const AffiliationManagement: React.FC = () => {
  const [affiliations, setAffiliations] = useState<AffiliationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAffiliation, setEditingAffiliation] = useState<AffiliationResponse | null>(null);
  const [name, setName] = useState('');
  const [emailDomain, setEmailDomain] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchAffiliations = async () => {
    try {
      setLoading(true);
      const res = await affiliationApi.getAffiliations();
      setAffiliations(res || []);
    } catch (err) {
      console.error('소속 목록 조회 실패:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliations();
  }, []);

  const handleOpenCreate = () => {
    setEditingAffiliation(null);
    setName('');
    setEmailDomain('');
    setModalOpen(true);
  };

  const handleOpenEdit = (item: AffiliationResponse) => {
    setEditingAffiliation(item);
    setName(item.name);
    setEmailDomain(item.emailDomain);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !emailDomain.trim()) {
      alert('소속 이름과 이메일 도메인을 모두 입력해 주세요.');
      return;
    }

    try {
      setSubmitting(true);
      if (editingAffiliation) {
        await affiliationApi.updateAffiliation(editingAffiliation.id, {
          name: name.trim(),
          emailDomain: emailDomain.trim(),
        });
      } else {
        await affiliationApi.createAffiliation({
          name: name.trim(),
          emailDomain: emailDomain.trim(),
        });
      }
      setModalOpen(false);
      await fetchAffiliations();
    } catch (err: any) {
      console.error('소속 저장 오류:', err);
      alert(err?.response?.data?.message || err?.message || '소속 처리 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      await affiliationApi.deleteAffiliation(id);
      await fetchAffiliations();
    } catch (err: any) {
      console.error('소속 삭제 오류:', err);
      alert(err?.response?.data?.message || '소속 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-7xl mx-auto w-full pb-16">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">소속(Affiliation) 관리</h1>
          <p className="text-gray-400 text-sm font-medium mt-1">
            서비스 가입을 허용할 학교 및 단체의 이메일 도메인을 관리합니다.
          </p>
        </div>
        <Button
          onClick={handleOpenCreate}
          className="!bg-[#CAFE33] hover:!bg-[#b9e82c] !text-black !font-bold !rounded-xl !py-3 !px-5 shadow-lg shadow-[#CAFE33]/10"
        >
          + 소속 추가
        </Button>
      </div>

      {/* 목록 컨테이너 */}
      <div className="bg-[#181818] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
        {loading ? (
          <Loader text="소속 목록을 가져오고 있습니다..." />
        ) : affiliations.length === 0 ? (
          <div className="py-20 text-center text-gray-500">
            등록된 소속이 없습니다. 상단의 버튼을 눌러 추가해 주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 text-xs font-black text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 w-20">ID</th>
                  <th className="px-6 py-4">소속(학교/기관) 이름</th>
                  <th className="px-6 py-4">허용 이메일 도메인</th>
                  <th className="px-6 py-4 text-right w-36">작업</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {affiliations.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono text-gray-500">{item.id}</td>
                    <td className="px-6 py-4 font-bold text-white">{item.name}</td>
                    <td className="px-6 py-4 font-mono text-[#CAFE33]">@{item.emailDomain}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold transition-all"
                      >
                        수정
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
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
      </div>

      {/* 등록/수정 모달 */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingAffiliation ? '소속 수정' : '신규 소속 추가'}
      >
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">소속 이름</label>
            <input
              type="text"
              placeholder="예: 아주대학교, 카카오"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CAFE33]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2">허용 이메일 도메인</label>
            <input
              type="text"
              placeholder="예: ajou.ac.kr, kakao.com (@ 제외)"
              value={emailDomain}
              onChange={(e) => setEmailDomain(e.target.value)}
              className="w-full bg-[#121212] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#CAFE33]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-5 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm font-bold transition-all"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#CAFE33] hover:bg-[#b9e82c] text-black text-sm font-bold transition-all disabled:opacity-50"
            >
              {submitting ? '저장 중...' : '저장'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AffiliationManagement;
