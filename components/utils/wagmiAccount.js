import { useSession, signOut } from "next-auth/react"
import { useAccount as wagmiAccount } from "wagmi"
import { publish } from "./events"

/*
const {
    address,
    connector,
    isConnecting,
    isReconnecting,
    isConnected,
    isDisconnected,
    //status, // : 'connecting' | 'reconnecting' | 'connected' | 'disconnected'
}
*/

function useAccount(signOutRedirectPath) {
    const { status } = useSession()

    return wagmiAccount({
        fetchEns: true,
        onConnect({ address, connector, isReconnected }) {
            console.log("Connected to Web3 Wallet", { address, connector, isReconnected })
            publish("web3_onConnect", { address, connector, isReconnected })
        },
        onDisconnect() {
            const path = signOutRedirectPath
                ? { callbackUrl: signOutRedirectPath }
                : { redirect: false }
            console.log("Disconnected from Web3 Wallet redirectPath(", path, ")")
            publish("web3_onDisconnect")

            if (status !== "unauthenticated") signOut(path)
        },
    })
}

export { useAccount }
