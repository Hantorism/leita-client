import Header from "../common/Header";
import React from "react";
import Footer from "../common/Footer";


export default function TermsOfService() {
    return (
        <div className="flex flex-col items-start h-screen text-white  pt-[5%]">

            <header className="w-full text-left pl-[10%] pr-[10%] ">
                <Header />
            </header>
        <div className="max-w-3xl mx-auto p-6 pb-20">
            <h2 className="text-xl font-bold mb-4">이용약관</h2>
            <h3 className="text-lg font-semibold mt-4">제 1조 (목적)</h3>
            <p>이 약관은 [leita] (이하 "leita")이 구글 OAuth 인증을 통해 제공하는 서비스 이용에 관한 조건을 정함을 목적으로 합니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 2조 (이용계약의 성립)</h3>
            <p>1. 사용자는 본 약관을 읽고 동의한 후, 구글 OAuth 인증을 통해 서비스를 이용할 수 있습니다.</p>
            <p>2. 서비스의 이용자는 본 약관에 동의한 것으로 간주됩니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 3조 (개인정보의 수집 및 이용)</h3>
            <p>1. 서비스는 구글 OAuth 인증을 통해 사용자의 구글 계정 정보에 접근하며, 이는 사용자 인증 및 서비스 제공에만 사용됩니다.</p>
            <p>2. 수집되는 정보는 다음과 같습니다:</p>
            <ul className="list-disc pl-5">
                <li>구글 계정 이메일</li>
                <li>구글 계정 ID</li>
            </ul>
            <p>3. 서비스는 이용자의 개인정보를 보호하기 위해 합리적인 보안 조치를 취하고 있으며, 개인정보는 관련 법령에 따라 안전하게 처리됩니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 4조 (서비스 이용)</h3>
            <p>1. 사용자는 구글 OAuth 인증을 통해 자신의 구글 계정 정보를 서비스에 제공함으로써, 서비스에 로그인하고 다양한 기능을 이용할 수 있습니다.</p>
            <p>2. 서비스는 이용자가 제공한 정보를 기반으로 기능을 제공합니다. 사용자가 제공하는 정보는 정확해야 하며, 이를 통해 발생하는 문제는 사용자가 책임집니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 5조 (서비스의 변경 및 중지)</h3>
            <p>1. 서비스는 필요한 경우, 사전 통지 없이 서비스의 내용을 변경하거나 중지할 수 있습니다.</p>
            <p>2. 서비스가 중지될 경우, 이용자는 이에 대한 책임을 지지 않으며, 중지 전에 저장된 데이터는 삭제될 수 있습니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 6조 (이용자의 의무)</h3>
            <p>1. 사용자는 서비스를 이용함에 있어 구글 OAuth 인증을 통해 제공한 정보를 정확하게 입력해야 하며, 이를 타인에게 양도하거나 공유할 수 없습니다.</p>
            <p>2. 사용자는 서비스를 불법적이거나 부적절한 방식으로 사용해서는 안 됩니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 7조 (개인정보 보호)</h3>
            <p>1. 서비스는 개인정보 보호법을 준수하며, 개인정보의 수집, 이용, 제공에 대한 이용자의 동의를 받습니다.</p>
            <p>2. 개인정보는 서비스 제공과 관련된 목적 외에는 사용되지 않으며, 이용자의 동의 없이 제3자에게 제공되지 않습니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 8조 (면책조항)</h3>
            <p>1. 서비스는 사용자가 제공한 정보의 정확성에 대해 보증하지 않으며, 사용자로 인해 발생하는 문제에 대해서는 책임을 지지 않습니다.</p>
            <p>2. 서비스의 이용 중 발생하는 손해에 대해서 서비스는 법적 책임을 지지 않습니다.</p>

            <h3 className="text-lg font-semibold mt-4">제 9조 (약관의 변경)</h3>
            <p>1. 서비스는 본 약관을 언제든지 변경할 수 있습니다. 변경된 약관은 서비스 내에 게시된 날로부터 효력을 발생합니다.</p>
            <p>2. 변경된 약관에 동의하지 않을 경우, 사용자는 서비스 이용을 중단할 수 있습니다.</p>
        </div>

    <footer className="w-full text-left">
        <Footer />
    </footer>
</div>
    );
}
