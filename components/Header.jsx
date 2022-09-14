import { useRouter } from "next/router"
import { ConnectButton } from "@rainbow-me/rainbowkit"
//import { ConnectKitButton as ConnectButton } from "connectkit"
import { signIn, useSession } from "next-auth/react"
import { useNetwork, useDisconnect, useSignMessage } from "wagmi"
import { useEffect } from "react"
import { useAccount, handleAuth } from "./utils/wagmiAccount"
import { useNotification } from "web3uikit"

export default function Header() {
    const { push: router } = useRouter()
    const { chain } = useNetwork()
    const { status } = useSession()
    const { address, isConnected } = useAccount()
    const dispatch = useNotification()
    const { disconnect } = useDisconnect()
    const { signMessageAsync } = useSignMessage()

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
