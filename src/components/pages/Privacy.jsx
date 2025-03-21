import React from "react";
import Footer from "../common/Footer";
import Header from "../common/Header";

export default function PrivacyPolicy() {
    return (
        <div className="flex flex-col items-start h-screen text-white  pt-[5%]">

            <header className="w-full text-left pl-[10%] pr-[10%]">
                <Header />
            </header>
        <div className="max-w-3xl mx-auto p-6 pb-20">

            <h2 className="text-xl font-bold mb-4 mt-8">개인정보 처리방침</h2>
            <p>[leita] (이하 "leita")는 사용자의 개인정보를 중요하게 생각하며, 개인정보 보호법 및 관련 법령을 준수합니다. 본 개인정보 처리방침은 서비스 이용 시 수집되는 개인정보, 이용 목적, 보관 및 보호 방법 등에 대해 설명합니다.</p>

            <h3 className="text-lg font-semibold mt-4">1. 개인정보의 수집 및 이용 목적</h3>
            <p>서비스는 구글 OAuth 인증을 통해 다음과 같은 개인정보를 수집하며, 이는 아래의 목적에 따라 사용됩니다.</p>
            <ul className="list-disc pl-5">
                <li>구글 계정 이메일: 회원 인증 및 로그인 기능 제공</li>
                <li>구글 계정 ID: 사용자 식별 및 서비스 운영</li>
                <li>프로필 정보 (이름, 프로필 사진) (선택): 개인화된 서비스 제공 및 프로필 설정</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">2. 개인정보의 보관 및 파기</h3>
            <ul className="list-disc pl-5">
                <li>사용자의 개인정보는 서비스 이용 기간 동안 보관되며, 회원 탈퇴 시 즉시 삭제됩니다.</li>
                <li>관련 법률에 따라 일정 기간 보관해야 하는 정보는 해당 법령에 따라 보존됩니다.</li>
                <li>개인정보는 저장 목적이 달성되면 안전한 방법으로 즉시 파기됩니다.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">3. 개인정보의 제3자 제공</h3>
            <p>서비스는 원칙적으로 사용자의 개인정보를 외부에 제공하지 않습니다. 다만, 다음의 경우에는 예외적으로 제공될 수 있습니다.</p>
            <ul className="list-disc pl-5">
                <li>사용자가 사전에 동의한 경우</li>
                <li>법령에 의해 제공이 요구되는 경우</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">4. 개인정보의 보호 조치</h3>
            <ul className="list-disc pl-5">
                <li>데이터 암호화 및 안전한 저장</li>
                <li>외부 공격 및 해킹 방지를 위한 보안 시스템 운영</li>
                <li>개인정보 접근 권한 최소화 및 내부 교육 강화</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">5. 사용자의 권리 및 행사 방법</h3>
            <ul className="list-disc pl-5">
                <li>사용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있습니다.</li>
                <li>사용자는 회원 탈퇴를 통해 개인정보 삭제를 요청할 수 있으며, 서비스는 즉시 처리합니다.</li>
                <li>개인정보 관련 문의는 아래 연락처로 요청할 수 있습니다.</li>
            </ul>

            <h3 className="text-lg font-semibold mt-4">6. 개인정보 처리방침 변경</h3>
            <p>본 개인정보 처리방침은 법령 변경 및 서비스 운영 정책에 따라 개정될 수 있습니다. 변경 사항은 서비스 내 공지사항을 통해 안내됩니다.</p>

            <h3 className="text-lg font-semibold mt-4">7. 문의처</h3>
            <p>개인정보 보호 관련 문의는 아래 이메일을 통해 접수할 수 있습니다.</p>
            <p><strong>이메일:</strong> leitaajou@gmail.com</p>

        </div>
            <footer className="w-full text-left">
                <Footer />
            </footer>
            </div>

    );
}