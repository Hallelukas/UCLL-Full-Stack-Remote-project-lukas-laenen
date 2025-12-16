import Header from "@components/header"
import ResetRequestForm from "@components/users/ResetRequestForm"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Head from "next/head"

const Reset: React.FC = () => {
  const { t } = useTranslation()
  return (
    <>
      <Head>
        <title>{t("login.title")}</title>
      </Head>
      <Header />
      <main>
        <section className="flex flex-col justify-center">
          <ResetRequestForm />
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

export default Reset
