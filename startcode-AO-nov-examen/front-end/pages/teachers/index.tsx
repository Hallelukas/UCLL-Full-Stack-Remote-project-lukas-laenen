import Header from '@components/header';
import TeacherOverview from '@components/teachers/TeacherOverview';
import TeacherService from '@services/TeacherService';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import useSWR from 'swr';
import { useTranslation } from 'react-i18next';

const Teachers: React.FC = () => {
  const {t} = useTranslation();

  const fetcher = async (key: string) => {
    const response = await TeacherService.getAllTeachers();
    return response.json();
  };

  const { data, isLoading, error } = useSWR('Teachers', fetcher);

  return (
    <>
      <Head>
        <title>Teachers</title>
      </Head>
      <Header />
      <main className="p-6 min-h-screen flex flex-col items-center">
        <h1>{t('header.nav.teachers')}</h1>

        <section className="mt-5">
          {error && <p className="text-danger">{error}</p>}
          {isLoading && <p>Loading...</p>}
          {data && (
            <TeacherOverview teachers = {data}/>
          )}
        </section>
      </main>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { locale } = context;

  return {
    props: {
      ...(await serverSideTranslations(locale ?? 'en', ['common'])),
    },
  };
};

export default Teachers;
