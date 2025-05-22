import React from "react";
import classNames from "classnames";
import { baseClasses, variantClasses, sizeClasses, shapeClasses } from "./styles.ts";

type LeitaButtonProps = {
    variant?: "primary" | "secondary" | "run" | "submit";
    size?: "sm" | "md" | "lg";
    shape?: "default" | "pill" | "round";
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit";
    onClick?: () => void;
    children?: React.ReactNode;
};

export const LeitaButton: React.FC<LeitaButtonProps> = ({
                                                            variant = "primary",
                                                            size = "md",
                                                            shape = "default",
                                                            loading = false,
                                                            disabled = false,
                                                            type = "button",
                                                            onClick,
                                                            children,
                                                        }) => {
    return (
        <button
            type={type}
            disabled={disabled || loading}
            onClick={onClick}
            className={classNames(
                baseClasses,
                variantClasses[variant],
                sizeClasses[size],
                shapeClasses[shape]
            )}
        >
            {loading ? (
                <>
                    <svg
                        className="size-5 animate-spin"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        />
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                    </svg>
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
};
