import styles from "../styles/Home.module.css"

import Head from "next/head"
import Image from "next/image"
//import ManualHeader from "../components/ManualHeader"
import Header from "../components/Header"
import LotteryEntrance from "../components/LotteryEntrance"
import { UniswapWidget, SelectLocale } from "../components/UniswapWidget"
import { appName, favIcon } from "../constants"

export default function Home() {
    return (
        <div className={styles.container}>
            <Head>
                <title>{appName}</title>
                <meta name="description" content={appName} />
                <link rel="icon" href={favIcon} />
            </Head>
            <SelectLocale />
            {/*<ManualHeader />*/}
            <Header />
            <LotteryEntrance />
            <UniswapWidget />
            {/* header / connect button / nav bar */}
        </div>
    )
}
