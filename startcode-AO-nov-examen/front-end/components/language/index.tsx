import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

const Language: React.FC = () => {
  const router = useRouter();
  const { locale, pathname, asPath, query } = router;

  const handleLanguageChange = (event: { target: { value: string } }) => {
    const newLocale = event.target.value;
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath,  { locale: newLocale });
  };

  return (
    <>
      <label 
        htmlFor="language"
        className=" px-4 text-l text-white rounded-lg"
      >
        Language
      </label>
      <select
        id="language"
        className="border-2 rounded p-1 ml-1"
        value={locale}
        onChange={handleLanguageChange}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
      </select>
    </>
  );
};

export default Language;
