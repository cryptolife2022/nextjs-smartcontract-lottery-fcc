import { ConnectButton } from "@rainbow-me/rainbowkit"
//import { ConnectKitButton as ConnectButton } from "connectkit"
import { signIn, useSession } from "next-auth/react"
import { useAccount, useSignMessage, useNetwork } from "wagmi"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { publish } from "./events"

const userPage = "/user"

export default function Header() {
    const {
        address,
        connector,
        isConnecting,
        isReconnecting,
        isConnected,
        isDisconnected,
        //status, // : 'connecting' | 'reconnecting' | 'connected' | 'disconnected'
    } = useAccount({
        onConnect({ address, connector, isReconnected }) {
            console.log("Connected to Web3 Wallet", { address, connector, isReconnected })
            publish("web3_onConnect", { address, connector, isReconnected })
        },
        onDisconnect() {
            console.log("Disconnected from Web3 Wallet")
            publish("web3_onDisconnect")
        },
    })
    const { status } = useSession()
    const { chain } = useNetwork()

    const { signMessageAsync } = useSignMessage()
    const { push } = useRouter()

    useEffect(() => {
        const handleAuth = async () => {
            const userData = { address, chain: chain.id, network: "evm" }
            const { data } = await axios.post("/api/auth/request-message", userData, {
                headers: {
                    "content-type": "application/json",
                },
            })
            const message = data.message
            const signature = await signMessageAsync({ message })

            // redirect user after success authentication to 'userPage' page
            const { url } = await signIn("credentials", {
                message,
                signature,
                redirect: false, //let user go to "userPage" if they want to ... demo purposes only
                callbackUrl: userPage,
            })
            // instead of using signIn(..., redirect: userPage)
            // we get the url from callback and push it to the router to avoid page refreshing
            push(url)
        }
        if (status === "unauthenticated" && isConnected) {
            handleAuth()
        } else {
            console.log("Header login: status - ", status)
        }
    }, [status, isConnected])

    return (
        <div className="p-5 border-b-2 flex flex-row">
            <h1 className="py-4 px-4 font-blog text-3xl"> Decentralized Lottery</h1>
            <div className="ml-auto py-2 px-4">
                {/*<ConnectButton showBalance="true" showAvatar="true" label="Connect Wallet" />*/}
                <ConnectButton />
            </div>
        </div>
    )
}
