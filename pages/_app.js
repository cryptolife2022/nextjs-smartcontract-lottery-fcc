import "../styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"

import { appName } from "../constants"
//import { MoralisProvider } from "react-moralis"
import { createClient, configureChains, defaultChains, WagmiConfig, chain } from "wagmi"
//import { InjectedConnector } from "wagmi/connectors/injected"
//import { MetaMaskConnector } from "wagmi/connectors/metaMask"
//import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"
import { SessionProvider } from "next-auth/react"
import { NotificationProvider } from "web3uikit"
//import { ConnectKitProvider as RainbowKitProvider, getDefaultClient } from "connectkit"
import {
    connectorsForWallets,
    wallet,
    getDefaultWallets,
    RainbowKitProvider,
} from "@rainbow-me/rainbowkit"

const hardhatId = process.env.HARDHAT_ID
const cchains = [
    chain.hardhat, //Top of the list for first default choice
    chain.mainnet,
    chain.polygon,
    chain.ropsten,
    chain.rinkeby,
    chain.goerli,
    chain.kovan,
    chain.sepolia,
]

//const { provider, webSocketProvider, chains } = configureChains(defaultChains, [publicProvider()])
const { provider, webSocketProvider, chains } = configureChains(cchains, [publicProvider()])

// const needsInjectedWalletFallback =
//     typeof !window?.ethereum && !window.ethereum.isMetaMask && !window.ethereum.isCoinbaseWallet

const walletConfig = {
    appName: appName,
    chains: chains,
    options: {
        shimDisconnect: true,
        shimChainChangedDisconnect: true,
        UNSTABLE_shimOnConnectSelectAccount: true,
    },
}

const connectors = connectorsForWallets([
    {
        groupName: "Suggested",
        wallets: [
            wallet.metaMask(walletConfig),
            wallet.rainbow(walletConfig),
            wallet.coinbase(walletConfig),
            wallet.walletConnect(walletConfig),
            wallet.trust(walletConfig),
            wallet.ledger(walletConfig),
            wallet.argent(walletConfig),
            //wallet.injected(walletConfig),
        ],
    },
])

/*
const connectors = [
    new InjectedConnector({
        chains: chains,
        options: {
            shimDisconnect: true,
            shimChainChangedDisconnect: true,
        },
    }),
    new MetaMaskConnector({
        chains: chains,
        options: {
            shimDisconnect: true,
            shimChainChangedDisconnect: true,
        },
    }),
    new WalletConnectConnector({
        chains: chains,
        options: {
            qrcode: true,
        },
    }),
]

const client = createClient(
    getDefaultClient({
        appName: appName,
        chains,
    })
)

const { connectors } = getDefaultWallets({
    appName: appName,
    chains,
})
*/

const client = createClient({
    provider,
    webSocketProvider,
    autoConnect: true,
    // added connectors from rainbowkit
    connectors,
})

export default function MyApp({ Component, pageProps }) {
    const disclaimer = ({ Text, Link }) => (
        <Text>
            By connecting your wallet, you agree to the{" "}
            <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://en.wikipedia.org/wiki/Terms_of_service"
            >
                Terms of Service
            </Link>{" "}
            <Link
                target="_blank"
                rel="noopener noreferrer"
                href="https://en.wikipedia.org/wiki/Privacy_policy"
            >
                Privacy Policy
            </Link>
        </Text>
    )
    /*
    const disclaimer = {
        embedGoogleFonts: true,
        //avoidLayoutShift: false,
        //walletConnectName: "Wallet Connect",
        disclaimer: (
            <>
                By connecting your wallet you agree to the{" "}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://en.wikipedia.org/wiki/Terms_of_service"
                >
                    Terms of Service
                </a>{" "}
                and{" "}
                <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href="https://en.wikipedia.org/wiki/Privacy_policy"
                >
                    Privacy Policy
                </a>
            </>
        ),
    }
    */

    return (
        <WagmiConfig client={client}>
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                {/*<RainbowKitProvider theme="auto" mode="auto" options={disclaimer}>*/}
                <RainbowKitProvider
                    chains={chains}
                    showRecentTransactions={true}
                    appInfo={{
                        appName: appName,
                        disclaimer: disclaimer,
                    }}
                >
                    <NotificationProvider>
                        <Component {...pageProps} />
                    </NotificationProvider>
                </RainbowKitProvider>
            </SessionProvider>
        </WagmiConfig>
    )
}

/*
export default function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <Component {...pageProps} />
        </MoralisProvider>
    )
}
*/
