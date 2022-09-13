import { ConnectButton } from "@rainbow-me/rainbowkit"
//import { ConnectKitButton as ConnectButton } from "connectkit"
import { signIn, useSession, signOut } from "next-auth/react"
import { useAccount, useSignMessage, useNetwork, useDisconnect } from "wagmi"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { publish } from "./utils/events"

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
    const { disconnectAsync } = useDisconnect()
    const { push } = useRouter()

    useEffect(() => {
        const handleAuth = async () => {
            const userData = { address, chain: chain.id, network: "evm" }
            const { data } = await axios.post("/api/auth/request-message", userData, {
                headers: {
                    "content-type": "application/json",
                },
            })
            console.log("request-message: ", data)
            const message = data.message
            try {
                const signature = await signMessageAsync({ message })

                console.log("request-message: signature - ", signature)
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
            } catch (error) {
                console.log("SignIn Rejected")
                ;(async () => {
                    await disconnectAsync()
                    signOut({ redirect: false })
                })()
            }
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
