import styles from "../styles/Home.module.css"

import { subscribe, unsubscribe, useIsSSR } from "./utils/events"
import { useEffect, useRef } from "react"

import { useNetwork, useDisconnect, useSignMessage } from "wagmi"
import { useAccount, handleAuth } from "./utils/wagmiAccount"

import { useRouter } from "next/router"
import { ConnectButton } from "@rainbow-me/rainbowkit"
//import { ConnectKitButton as ConnectButton } from "connectkit"
import { signIn, useSession } from "next-auth/react"
import { useNotification } from "web3uikit"

export default function Header() {
    // When a user clicks "Connect your wallet" in the SwapWidget, this callback focuses the connectors.
    const connectors = useRef(null)
    const { push: router } = useRouter()
    const { chain } = useNetwork()
    const { status } = useSession()
    const { address, isConnected } = useAccount()
    const dispatch = useNotification()
    const { disconnect } = useDisconnect()
    const { signMessageAsync } = useSignMessage()

    // UI Hydration Bug fix
    // Not neccessary with signals
    const isSSR = useIsSSR()

    useEffect(() => {
        if (status === "unauthenticated" && isConnected) {
            handleAuth({
                userData: { address: address, chain: chain.id, network: "evm" },
                router: router,
                disconnect: (errorMsg) => {
                    disconnect()
                    dispatch({
                        type: "error",
                        message: errorMsg,
                        title: "SignIn Failed",
                        icon: "bell",
                        position: "topR",
                    })
                },
                signMessageAsync: signMessageAsync,
                signIn: signIn,
            })
        } else {
            console.log("Header login: status - ", status)
        }

        if (!isSSR && status !== "loading") {
            console.log("Wallet Focus Effect Registration")
            subscribe("web3_focusWalletConnector", function () {
                connectors.current?.focus()
            })

            return () => {
                console.log("Wallet Focus Effect Cleanup")
                unsubscribe("web3_focusWalletConnector")
            }
        }
    }, [status, isConnected])

    return (
        <div className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-blog text-3xl"> Decentralized Lottery</h1>
            {isSSR || status === "loading" ? (
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                    disabled
                >
                    <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-fullc float-left"></div>
                    Loading Account...
                </button>
            ) : (
                <div
                    className={`ml-auto py-2 px-4 ${styles.connectors}`}
                    ref={connectors}
                    tabIndex={-1}
                >
                    {/*<ConnectButton showBalance="true" showAvatar="true" label="Connect Wallet" />*/}
                    <ConnectButton />
                </div>
            )}
        </div>
    )
}
