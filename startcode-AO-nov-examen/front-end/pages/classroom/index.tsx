import Header from '@components/header';
import ClassroomForm from '@components/classrooms/ClassroomForm';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Head from 'next/head';
import { useTranslation } from 'next-i18next';
import { useState, useEffect } from 'react';
import { User } from '@types';

const Classroom: React.FC = () => {
    const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
    const [ error, setError ] = useState<string>();

    const { t } = useTranslation();

    useEffect(() => {
        setError('');
        const loggedInUserString = sessionStorage.getItem('loggedInUser');
        if (loggedInUserString !== null) {
            const user: User = JSON.parse(loggedInUserString);
            setLoggedInUser(user);
            if ( user.role !== 'admin') {
                setError(
                    t("login.fault")
                );
            }
        } else {
            setError(
                t("login.fault")
            );
        }
    }, []);

    return (
        <>
        <Head>
            <title>{t("header.nav.classrooms")}</title>
        </Head>
        <Header />
        <main className="p-6 min-h-screen flex flex-col items-center">
            <h1>{t("header.nav.classrooms")}</h1>

            <section className="mt-5">
            {error && <p className="text-danger">{error}</p>}
            {!error && (
                <ClassroomForm/>
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

export default Classroom;
