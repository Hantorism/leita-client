# Leita - Client (Monorepo)

이 저장소는 **pnpm workspace**와 **Turborepo**를 사용하여 구성된 Leita 서비스의 프론트엔드 모노레포입니다.

---

## 🛠️ 기술 스택 및 버전

### 모노레포 & 툴체인
- **Package Manager**: pnpm `10.30.1`
- **Build System**: Turborepo `2.3.3`
- **Linter & Formatter**: Biome `2.4.10`

### 프레임워크 & 라이브러리
- **Library**: React `19.2.0`
- **Build Tool**: Vite `8.0.7`
- **Language**: TypeScript `5.9.3`
- **Routing**: React Router DOM `7.9.3`
- **Styling**: Tailwind CSS `3.4.19`
- **Editor**: Tiptap Editor, Monaco Editor
- **Animation**: Framer Motion

---

## 📁 프로젝트 구조

```text
client/
├── apps/
│   ├── client/         # 메인 클라이언트 웹 애플리케이션 (Vite + React 19)
│   └── admin/          # 관리자 대시보드 웹 애플리케이션 (Vite + React 19)
└── packages/
    ├── api/            # Axios 기반 공통 API 서비스 모듈
    ├── ui/             # 공통 UI 컴포넌트 라이브러리
    ├── types/          # 공통 TypeScript 타입 정의
    ├── tsconfig/       # 공유 TypeScript 설정
    └── tailwind-config/# 공유 Tailwind CSS 설정
```

---

## 🚀 시작하기

### 사전 준비 사항

- [Node.js](https://nodejs.org/) (v18 이상 권장)
- [pnpm](https://pnpm.io/) (v10 이상 권장)

### 패키지 설치

```bash
pnpm install
```

### 스크립트 실행

루트 디렉토리(`client/`)에서 Turborepo를 사용하여 모든 프로젝트 혹은 특정 프로젝트의 스크립트를 조작할 수 있습니다.

#### 1. 개발 서버 실행 (Local Development)

모든 애플리케이션(`client`, `admin`)의 개발 서버를 동시에 실행합니다:
```bash
pnpm dev
```

특정 애플리케이션만 실행하려면 `--filter` 옵션을 사용합니다:
```bash
# 메인 클라이언트 앱만 실행
pnpm --filter client dev

# 관리자 앱만 실행
pnpm --filter admin dev
```

#### 2. 프로덕션 빌드 (Build)

모든 패키지와 애플리케이션을 빌드합니다:
```bash
pnpm build
```

특정 애플리케이션만 빌드합니다:
```bash
pnpm --filter client build
```

#### 3. 코드 검사 및 포맷팅 (Lint & Format)

Biome을 사용하여 전체 코드의 포맷을 자동으로 정리하고 문제를 검사합니다:
```bash
# 코드 포맷 자동 정리
pnpm format

# 코드 검사 및 자동 수정
pnpm check

# Turborepo를 통한 전체 린트 검사
pnpm lint
```
