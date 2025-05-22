/** @jsxImportSource @emotion/react */
import styled from "@emotion/styled";

type Variant = "dark" | "light";

export const TableWrapper = styled.div<{ variant: Variant; size: "sm" | "md" | "lg" }>`
  width: 100%;
  max-width: 100%;
  color: ${({ variant }) => (variant === "dark" ? "#fff" : "#000")};
  font-family: "Pretendard", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
    Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
  font-size: ${({ size }) =>
    size === "sm" ? "0.8rem" : size === "lg" ? "1.125rem" : "1rem"};
`;

export const Th = styled.th<{ variant: Variant }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ variant }) => (variant === "dark" ? "#4B5563" : "#9CA3AF")};
  background-color: ${({ variant }) => (variant === "dark" ? "#2A2A2A" : "#F3F4F6")};
  font-weight: 600;
`;

export const Td = styled.td<{ variant: Variant }>`
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${({ variant }) => (variant === "dark" ? "#4B5563" : "#D1D5DB")};
  vertical-align: middle;
  font-weight: 400;
`;

type TrProps = {
    clickable: boolean;
    hover: boolean;
    striped: boolean;
    isEven: boolean;
    variant: Variant;
};

export const Tr = styled.tr<TrProps>`
  background-color: ${({ striped, isEven, variant }) =>
    striped
        ? isEven
            ? variant === "dark"
                ? "rgba(255, 255, 255, 0.1)"
                : "rgba(0,0,0,0.05)"
            : variant === "dark"
                ? "rgba(42, 42, 42, 0.8)"
                : "#fff"
        : "transparent"};
  cursor: ${({ clickable }) => (clickable ? "pointer" : "default")};
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background-color: ${({ hover, clickable }) =>
    hover && clickable ? "#000000" : undefined};
    color: ${({ hover, clickable }) =>
    hover && clickable ? "#CAFF33" : undefined};
  }
`;
