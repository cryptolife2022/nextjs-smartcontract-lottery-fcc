//import { useMoralis } from "react-moralis"

import { useState } from "react"
import { MetaMaskConnector } from "wagmi/connectors/metaMask"
import { signIn } from "next-auth/react"
import { useEffect } from "react"
import { useAccount, useConnect, useSignMessage, useDisconnect } from "wagmi"
import { useRouter } from "next/router"
import axios from "axios"
let connectFunc = () => {}

export default function ManualHeader() {
    const [msg, setMsg] = useState("")
    const [msg2, setMsg2] = useState("")

    const { connectAsync } = useConnect()
    const { disconnectAsync } = useDisconnect()
    /* 'connecting' | 'reconnecting' | 'connected' | 'disconnected' */
    const {
        address,
        connector,
        isConnecting,
        isReconnecting,
        isConnected,
        isDisconnected,
        status,
    } = useAccount()
    const { signMessageAsync } = useSignMessage()
    const { push } = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const handleAuth = async () => {
        //disconnects the web3 provider if it's already active
        if (isConnected) {
            handleDisconnect()
        }
        // enabling the web3 provider metamask
        const { account, chain } = await connectAsync({ connector: new MetaMaskConnector() })

        try {
            const userData = { address: account, chain: chain.id, network: "evm" }
            // making a post request to our 'request-message' endpoint
            const { data } = await axios.post("/api/auth/request-message", userData, {
                headers: {
                    "content-type": "application/json",
                },
            })
            const message = data.message
            // signing the received message via metamask
            const signature = await signMessageAsync({ message })

            console.log(signature)
        } catch (error) {
            console.log(error)
            handleDisconnect()
        }

        /*
        // redirect user after success authentication to '/user' page
        const { url } = await signIn("credentials", {
            message,
            signature,
            redirect: false,
            callbackUrl: "/user",
        })
        /**
         * instead of using signIn(..., redirect: "/user")
         * we get the url from callback and push it to the router to avoid page refreshing
         */
        //push(url)
    }

    const handleDisconnect = async () => {
        console.log("Disconnecting ...")
        await disconnectAsync()
        console.log("Disconnected.")
    }

    useEffect(() => {
        if (isConnecting || isReconnecting) {
            console.log("isConnecting - ", isConnecting, ", isReconnecting - ", isReconnecting)
        } else {
            console.log("isConnected - ", isConnected)
            if (isConnected) {
                setMsg(
                    "Connected to " +
                        address.slice(0, 6) +
                        "..." +
                        address.slice(address.length - 4) +
                        " "
                )
                connectFunc = handleDisconnect
                setMsg2("Disconnect")
            } else {
                setMsg("")
                connectFunc = handleAuth
                setMsg2("Authenticate via Metamask")
            }
            console.log("connectFunc - ", connectFunc)
        }
        setIsLoading(isConnecting || isReconnecting)
    }, [address, isConnected, isConnecting, isReconnecting])

    useEffect(() => {
        if (address != null) {
            console.log(`Account changed to ${address}`)
        }
    }, [address])
    /**
     * no dependency array: run anytime something re-renders
     * CAREFUL with this!! Because then you can get into circular render on blank dependency array, run once on load
     * dependencies in the array, run anytime somthing in there changes
     */

    return (
        <div>
            {msg}
            <button onClick={() => connectFunc()} disabled={isLoading}>
                {msg2}
            </button>
        </div>
    )
}
/*
export default function ManualHeader() {
    const { enableWeb3, account } = useMoralis()

    return (
        <div>
            {account ? (
                <div>Connected</div>
            ) : (
                <button
                    onClick={async () => {
                        await enableWeb3()
                    }}
                >
                    Connect
                </button>
            )}
        </div>
    )
}
*/
// I'm going to show you the hard way first
// Then the easy way
