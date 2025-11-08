import React from "react";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import LanguageSelector from "./LanguageSelector";

interface HeaderProps {
  titleKey: string;
}

const Header: React.FC<HeaderProps> = ({ titleKey }) => {
  const { t } = useTranslation();

  return (
    <header className="flex justify-between items-center p-4 border-b border-gray-800 bg-black">
      <div className="flex items-center space-x-4">
        <Image src="/x-logo.svg" alt="X Logo" width={30} height={30} />
        <h1 className="text-xl font-bold text-white">{t(titleKey)}</h1>
      </div>
      <LanguageSelector />
    </header>
  );
};

export default Header;
