import Head from "next/head"
import Image from "next/image"
import styles from "../styles/Home.module.css"
//import ManualHeader from "../components/ManualHeader"
import Header from "../components/Header"
import LotteryEntrance from "../components/LotteryEntrance"
import { appName, favIcon } from "../constants"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>{appName}</title>
                <meta name="description" content={appName} />
                <link rel="icon" href={favIcon} />
            </Head>
            {/*<ManualHeader />*/}
            <Header />
            <LotteryEntrance />
            {/* header / connect button / nav bar */}
        </div>
    )
}
