import Header from '@components/header';
import TeacherOverview from '@components/teachers/TeacherOverview';
import TeacherService from '@services/TeacherService';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import useSWR, { mutate } from 'swr';
import { useTranslation } from 'react-i18next';
import useInterval from 'use-interval';

const Teachers: React.FC = () => {
  const {t} = useTranslation();

  const fetcher = async () => {
    const response = await TeacherService.getAllTeachers();
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch teachers');
    }
    return data;
  };

  const { data, isLoading, error } = useSWR('Teachers', fetcher);

  useInterval(() => {
    mutate("Teachers", fetcher());
  }, 5000);

  return (
    <>
      <Head>
        <title>{t('header.nav.teachers', 'Teachers')}</title>
      </Head>
      <Header />
      <main className="p-6 min-h-screen flex flex-col items-center">
        <h1>{t('header.nav.teachers', 'Teachers')}</h1>

        <section className="mt-5">
          {error && <p className="text-danger">{error.message}</p>}
          {isLoading && <p>{t('loading', 'Loading...')}</p>}
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
