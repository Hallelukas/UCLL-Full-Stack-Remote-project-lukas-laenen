import Header from "@components/header"
import RegisterForm from "@components/users/RegisterForm"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Head from "next/head"

const RegisterPage: React.FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <Head>
        <title>{t("login.title")}</title>
      </Head>
      <Header />
      <main>
        <section className="flex flex-col justify-center">
          <RegisterForm />
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

export default RegisterPage