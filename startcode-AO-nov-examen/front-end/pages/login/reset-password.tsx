import Header from "@components/header"
import ResetSubmitForm from "@components/users/ResetSubmitForm"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Head from "next/head"
import { useRouter } from "next/router"

const Login: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter();
  const { token } = router.query;
  
  return (
    <>
      <Head>
        <title>{t("login.title")}</title>
      </Head>
      <Header />
      <main>
        <section className="flex flex-col justify-center">
          <ResetSubmitForm token={String(token)} />
        </section>
      </main>
    </>
  )
}

export const getServerSideProps = async (context) => {
  const { locale } = context

  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common"])),
    },
  }
}

export default Login