import { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';
import { languageApi } from '@leita/api';

interface LanguageOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  language: string;
  handleLanguageChange: (value: string) => void;
}

const DEFAULT_LANGUAGES: LanguageOption[] = [
  { value: 'python', label: 'Python' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'cs', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
  { value: 'rust', label: 'Rust' },
];

const CustomDropdown = ({ language, handleLanguageChange }: CustomDropdownProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [languages, setLanguages] = useState<LanguageOption[]>(DEFAULT_LANGUAGES);

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const res = await languageApi.getLanguages();
        if (res && res.length > 0) {
          setLanguages(res.map((item) => ({ value: item.code, label: item.name })));
        }
      } catch (err) {
        console.error('동적 언어 목록 fetch 오류:', err);
      }
    };
    fetchLanguages();
  }, []);

  const toggleDropdown = (): void => setIsOpen(!isOpen);

  const handleSelectLanguage = (value: string): void => {
    handleLanguageChange(value);
    setIsOpen(false);
  };

  return (
    <div className="relative z-10">
      <div
        className="bg-[#3E3E3E] text-gray-300 p-2 rounded-md font-Pretendard text-[0.9rem] cursor-pointer w-[200px] flex items-center justify-between"
        onClick={toggleDropdown}
      >
        <span>{languages.find((lang) => lang.value === language)?.label || language || 'Select Language'}</span>
        <FiChevronDown className={`transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
      </div>
      {isOpen && (
        <ul className="absolute left-0 mt-1 w-[200px] bg-[#3E3E3E] rounded-md shadow-lg z-20 max-h-60 overflow-y-auto">
          {languages.map(({ value, label }) => (
            <li
              key={value}
              onClick={() => handleSelectLanguage(value)}
              className="px-2 py-1 hover:bg-gray-600 cursor-pointer"
            >
              {label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CustomDropdown;
