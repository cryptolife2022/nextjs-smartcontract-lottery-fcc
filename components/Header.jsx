import { userPage } from "../constants"
import { ConnectButton } from "@rainbow-me/rainbowkit"
//import { ConnectKitButton as ConnectButton } from "connectkit"
import { signIn, useSession } from "next-auth/react"
import { useSignMessage, useNetwork, useDisconnect } from "wagmi"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"
import { useAccount } from "./utils/wagmiAccount"
import { useNotification } from "web3uikit"

export default function Header() {
    const { status } = useSession()
    const { chain } = useNetwork()

    const { signMessageAsync } = useSignMessage()
    const { disconnect } = useDisconnect()
    const { push } = useRouter()
    const { address, isConnected } = useAccount()

    const dispatch = useNotification()

    useEffect(() => {
        const handleAuth = async () => {
            try {
                const userData = { address, chain: chain.id, network: "evm" }
                const { data } = await axios.post("/api/auth/request-message", userData, {
                    headers: {
                        "content-type": "application/json",
                    },
                })
                console.log("request-message: ", data)
                const message = data.message
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
                const errorMsg = !error.message.__proto__.constructor.name.includes("Array")
                    ? error.message
                    : "SignIn denied by user"
                console.log("SignIn Rejected - ", errorMsg)
                disconnect()

                // Notify User
                dispatch({
                    type: "error",
                    message: errorMsg,
                    title: "SignIn Failed",
                    icon: "bell",
                    position: "topR",
                })
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
