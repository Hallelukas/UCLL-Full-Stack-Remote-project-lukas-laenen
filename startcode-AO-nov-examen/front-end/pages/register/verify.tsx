import Header from "@components/header"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Head from "next/head"
import { useRouter } from "next/router"
import { useEffect } from "react"

const Verify: React.FC = () => {
  const { t } = useTranslation()
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/login")
    }, 3000)

    return () => clearTimeout(timer) // cleanup als component unmount
  }, [router])
  
  return (
    <>
      <Head>
        <title>{t("login.title")}</title>
      </Head>
      <Header />
      <main>
        <section className="flex flex-col justify-center">
            <div className="max-w-sm m-auto">
                <div>
                    <h3 className="px-0">Registration</h3>
                </div>
                <div className="row">
                    <p className="ml-2 text-sm font-medium mt-3 mb-3">
                        Verification successful. Redirecting to login page...
                    </p>
                </div>
            </div>
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

export default Verify
