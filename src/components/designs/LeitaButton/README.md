# LeitaButton 컴포넌트

Leita 프로젝트에서 사용하는 버튼 컴포넌트입니다.  
`styled-components`를 사용하여 다양한 스타일과 크기, 모양을 지원합니다.

---

## Props

| 이름       | 타입                              | 기본값      | 설명                               |
|------------|---------------------------------|------------|----------------------------------|
| `onClick`  | `() => void`                    | `undefined`| 클릭 이벤트 핸들러               |
| `variant`  | `"primary"` \| `"secondary"`   | `"primary"`| 버튼 스타일 종류                 |
| `size`     | `"sm"` \| `"md"` \| `"lg"`     | `"md"`     | 버튼 크기                        |
| `shape`    | `"pill"` \| `"round"` \| `"square"` | `"pill"` | 버튼 모양 (둥근 정도)            |
| `disabled` | `boolean`                      | `false`    | 비활성화 여부                    |
| `children` | `React.ReactNode`               | 필수       | 버튼 내부에 표시할 내용           |
| `type`     | `"button"` \| `"submit"` \| `"reset"` | `"button"` | 버튼 타입 (폼 제출 등 용도)      |

---

## 사용 예제

```tsx
import LeitaButton from "../components/LeitaButton";

function Example() {
  return (
    <div>
      <LeitaButton onClick={() => alert("clicked!")}>Primary Button</LeitaButton>
      <LeitaButton variant="secondary" size="sm" shape="round">
        Secondary Small Round
      </LeitaButton>
      <LeitaButton disabled>Disabled Button</LeitaButton>
    </div>
  );
}
