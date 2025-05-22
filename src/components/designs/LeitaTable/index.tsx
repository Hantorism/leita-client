import React from "react";
import * as S from "./styles.ts";

type LeitaTableProps = {
    columns: string[];
    data: (string | number | React.ReactNode)[][];
    clickable?: boolean;
    striped?: boolean;
    hover?: boolean;
    variant?: "dark" | "light";
    size?: "sm" | "md" | "lg";
    onRowClick?: (row: (string | number | React.ReactNode)[]) => void;
};

const LeitaTable: React.FC<LeitaTableProps> = ({
                                                   columns,
                                                   data,
                                                   clickable = false,
                                                   striped = false,
                                                   hover = false,
                                                   variant = "dark",
                                                   size = "md",
                                                   onRowClick,
                                               }) => {
    return (
        <S.TableWrapper variant={variant} size={size}>
            <table className="w-full text-left border-collapse border border-gray-600">
                <thead>
                <tr>
                    {columns.map((col, idx) => (
                        <S.Th key={idx} variant={variant}>
                            {col}
                        </S.Th>
                    ))}
                </tr>
                </thead>
                <tbody>
                {data.length > 0 ? (
                    data.map((row, idx) => {
                        const isEven = idx % 2 === 0;
                        return (
                            <S.Tr
                                key={idx}
                                clickable={clickable}
                                hover={hover}
                                striped={striped}
                                isEven={isEven}
                                variant={variant}
                                onClick={() => onRowClick && onRowClick(row)}
                            >
                                {row.map((cell, cidx) => (
                                    <S.Td key={cidx} variant={variant}>
                                        {cell}
                                    </S.Td>
                                ))}
                            </S.Tr>
                        );
                    })
                ) : (
                    <tr>
                        <td colSpan={columns.length} style={{ padding: "1rem", textAlign: "center", color: "#9CA3AF" }}>
                            👾 해당 조건에 맞는 문제가 없습니다.
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </S.TableWrapper>
    );
};

export default LeitaTable;
