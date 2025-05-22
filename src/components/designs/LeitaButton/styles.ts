const baseClasses =
    "flex items-center justify-center gap-2 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed font-light";

const variantClasses: Record<
    "primary" | "secondary" | "run" | "submit",
    string
> = {
    primary:
        "text-[#1A1A1A] bg-[#CAFF33] hover:bg-gradient-to-r hover:from-[#CAFF33] hover:to-[#9D5CE9] hover:scale-[1.05] hover:text-white hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)]",
    secondary:
        "bg-[#2A2A2A] text-white hover:text-[#CAFF33] hover:bg-opacity-0",
    run:
        "text-white bg-[#3E3E3E] hover:scale-105 hover:text-[#CAFF33] hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)]",
    submit:
        "text-[#1A1A1A] bg-[#CAFF33] hover:scale-105 hover:bg-gray-200 hover:text-gray-900 hover:shadow-[0px_4px_15px_rgba(202,_255,_51,_0.4)]",
};

const sizeClasses: Record<"sm" | "md" | "lg", string> = {
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
};

const shapeClasses: Record<"default" | "pill" | "round", string> = {
    default: "rounded-md",
    pill: "rounded-full",
    round: "rounded-[80px]",
};

export { baseClasses, variantClasses, sizeClasses, shapeClasses };
