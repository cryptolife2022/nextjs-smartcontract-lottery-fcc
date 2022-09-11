import "../styles/globals.css"
import "@rainbow-me/rainbowkit/styles.css"

//import { MoralisProvider } from "react-moralis"
import { createClient, configureChains, defaultChains, WagmiConfig, chain } from "wagmi"
import { InjectedConnector } from "wagmi/connectors/injected"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { WalletConnectConnector } from "wagmi/connectors/walletConnect"
import { publicProvider } from "wagmi/providers/public"
import { SessionProvider } from "next-auth/react"
import { NotificationProvider } from "web3uikit"
//import { ConnectKitProvider as RainbowKitProvider, getDefaultClient } from "connectkit"
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit"

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

/*
const client = createClient({
    provider,
    autoConnect: true,
    connectors: [
        new InjectedConnector({ chains }),
        new MetaMaskConnector({
            chains: chains,
            options: {
                shimDisconnect: true,
            },
        }),
        new WalletConnectConnector({
            chains: chains,
            options: {
                qrcode: true,
            },
        }),
    ],
})

const client = createClient(
    getDefaultClient({
        appName: "Smart Contract Lottery",
        hardhatId,
        chains,
    })
)
*/
const { connectors } = getDefaultWallets({
    appName: "Smart Contract Lottery",
    chains,
})

const client = createClient({
    provider,
    webSocketProvider,
    autoConnect: true,
    // added connectors from rainbowkit
    connectors,
})

function MyApp({ Component, pageProps }) {
    let options = {
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

    return (
        <WagmiConfig client={client}>
            <SessionProvider session={pageProps.session} refetchInterval={0}>
                {/*<RainbowKitProvider theme="auto" mode="auto" options={options}>*/}
                <RainbowKitProvider chains={chains}>
                    <NotificationProvider>
                        <Component {...pageProps} />
                    </NotificationProvider>
                </RainbowKitProvider>
            </SessionProvider>
        </WagmiConfig>
    )
}

/*
function MyApp({ Component, pageProps }) {
    return (
        <MoralisProvider initializeOnMount={false}>
            <Component {...pageProps} />
        </MoralisProvider>
    )
}
*/

export default MyApp
