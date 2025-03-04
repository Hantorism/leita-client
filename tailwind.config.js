// tailwind.config.js
module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                lexend: ['Lexend', 'sans-serif'],
                pan: ['pan', 'sans-serif'],
                LINE: ['LINE', 'sans-serif'],
                nanum: ['nanum', 'sans-serif'],
                Pretend:['Pretend', 'sans-serif'],
                D2Coding:['D2Coding', 'sans-serif'],

            },
        },
    },
    plugins: [require("tailwind-scrollbar-hide")],

}
