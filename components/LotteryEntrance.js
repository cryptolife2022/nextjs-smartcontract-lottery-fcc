import { readContract, writeContract, eventContract } from "./utils/wagmiContract"
import { useAccount } from "./utils/wagmiAccount"
import { subscribe, unsubscribe, publish, useIsSSR } from "./utils/events"
import { useEffect, useState } from "react"
import { BigNumber, ethers } from "ethers"
//import { useWeb3Contract, useMoralis } from "react-moralis"
import { useSession } from "next-auth/react"
import { useDisconnect, useEnsName, useNetwork, useSwitchNetwork } from "wagmi"
import { useAddRecentTransaction } from "@rainbow-me/rainbowkit"
import { useNotification } from "web3uikit"

const signInPage = "/"
const signOutRedirectPath = "/"

function LotteryEntrance() {
    //
    // Used for logging into the WEBSITE, not into the wallet
    //
    const { data: session, status } = useSession({
        required: false,
        onUnauthenticated() {
            console.log(`Session NOT Authenticated ... redirected to Sign in Page`)
        },
    })
    //
    // Connecting with Web3 Wallet
    //
    const { disconnect } = useDisconnect()
    const { address: walletAddress } = useAccount()
    const { chain } = useNetwork()
    const { chains, error, isLoading, pendingChainId, switchNetwork } = useSwitchNetwork({
        throwForSwitchChainNotSupported: true,
        onSuccess(data) {
            console.log("useSwitchNetwork Success", data)
        },
        onError(error) {
            console.log("useSwitchNetwork Error", error)
        },
    })
    //const { chainId } = useMoralis()

    switch (status) {
        case "authenticated":
            // {
            //     user: {
            //         name: string
            //         email: string
            //         image: string
            //         address: string
            //     },
            //     expires: Date // This is the expiry of the session, not any of the tokens within the session
            // }
            //console.log(`Signed in as ${JSON.stringify(session.user)}`)
            break
        case "loading":
            //console.log("Signing in ...")
            break
        default:
        //console.log(`Signed in as ${status}`)
    }

    //
    // UI Interaction
    //
    const dispatch = useNotification()
    const addRecentTransaction = useAddRecentTransaction()
    //
    // Component Rendered UI Interaction
    //
    const [chainId, setChainId] = useState(0)
    const [hideButton, setHideButton] = useState(true)
    const [entranceFee, setEntranceFee] = useState(BigNumber.from("0"))
    const [numPlayers, setNumPlayers] = useState(0)
    const [recentWinner, setRecentWinner] = useState("")
    const [lotteryConnector, setLotteryConnector] = useState(null)

    // UI Hydration Bug fix
    const isSSR = useIsSSR()

    const {
        contractReadRCs,
        lAddress: lotteryAddress,
        isSuccessAll,
    } = readContract(
        [
            {
                func: "getEntranceFee",
                onError: (error) => {
                    console.log(`On Contract getEntranceFee ${error}`)
                },
                onSuccess: (data) => {
                    console.log(
                        `On Contract getEntranceFee Success`,
                        ethers.utils.formatUnits(data, "ether") + " ETH"
                    )
                    publish("lottery_getEntranceFee", { data })
                },
            },
            {
                func: "getNumPlayers",
                onError: (error) => {
                    console.log(`On Contract getNumPlayers ${error}`)
                },
                onSuccess: (data) => {
                    console.log("On Contract getNumPlayers Success", data.toNumber())
                    publish("lottery_getNumPlayers", { data })
                },
            },
            {
                func: "getRecentWinner",
                onError: (error) => {
                    console.log(`On Contract getRecentWinner ${error}`)
                },
                onSuccess: (data) => {
                    console.log("On Contract getRecentWinner Address Success", data)
                    publish("lottery_getRecentWinner", { data })
                },
            },
        ],
        chain
    )

    eventContract(lotteryAddress, "WinnerPicked", (event) => {
        console.log("WinnerPicked - ", event, "numPlayers = ", numPlayers)
        // Prevent old events from coming through the queue ...
        if (numPlayers == 0) return

        // Notify User
        dispatch({
            type: "info",
            message: "Winner Picked! " + event[1].args["winner"],
            title: "Lottery Notification",
            icon: "bell",
            position: "topR",
        })
        // Update Stats on screen
        publish("lottery_getNumPlayers", { data: 0 })
        publish("lottery_getRecentWinner", { data: event[1].args["winner"] })
        // updateUI(false,[false,true,true])
    })

    const updateUI = (refreshAll, refreshSelect) => {
        contractReadRCs.forEach(function (item, index) {
            if (refreshAll || (refreshSelect && refreshSelect[index])) item.refetch()
            isSuccessAll &&= item.isSuccess
        })
    }

    const handleNewNotification = (type, icon, position) => {
        updateUI(true)
        dispatch({
            type: type || "info",
            message: "Transaction Complete!",
            title: "Transaction Notification",
            icon: icon || "bell",
            position: position || "topR",
        })
    }

    const handleErrorNotification = (msg, type, icon, position) => {
        dispatch({
            type: type || "error",
            message: msg,
            title: "Failed to Enter Lottery",
            icon: icon || "bell",
            position: position || "topR",
        })
    }

    const { writeRCs, isBusy } = writeContract(
        [
            {
                func: "enterLottery",
                overrides: {
                    value: contractReadRCs[0]["data"],
                },
                onError: (error) => {
                    // {code, message}
                    var msg = JSON.parse(
                        error.message
                            .split("[ethjs-query] while formatting outputs from RPC ")[1]
                            .slice(1, -1)
                    ).value.data.message

                    console.log("On Contract enterLottery Error - ", msg)
                    handleErrorNotification(msg)
                },
                onSuccess: (tx) => {
                    ;(async () => {
                        console.log("On Contract enterLottery Success", tx) // {hash, wait}
                        addRecentTransaction({
                            hash: tx.hash,
                            description: "Entered Smart Contract Lottery",
                            confirmations: 1,
                        })
                        await tx.wait(1)
                        handleNewNotification()
                    })()
                },
            },
        ],
        lotteryAddress
    )

    useEffect(() => {
        if (!chain) return

        let cchainId = chain?.id ?? -1
        if (cchainId != chainId) setChainId(cchainId)

        // Only care about contracts on valid networks
        if (!lotteryAddress) {
            console.log(`Invalid Chain ID detected: ${chain.id}`)
            setHideButton(true)

            // Only switchNetwork if Connector is avail
            if (lotteryConnector) {
                console.log(`Optional2: Switching back to Hardhat Chain ID,`)
                //switchNetwork(31337)
            }
        } else {
            console.log(`Chain ID : ${chain.id}`)
        }
    }, [chain])

    useEffect(() => {
        if (chainId == 0) return

        console.log(`Chain ID Choosen: ${chainId}, WalletAddress is: ${walletAddress}`)
        subscribe("web3_onConnect", (e) => {
            setLotteryConnector(e.detail.connector)
            console.log(
                "web3_onConnect : Contract Address - ",
                lotteryAddress,
                ", Connected to Wallet Address",
                e.detail.address,
                ", e.detail.connector ",
                lotteryConnector
            )
            /*
                if (lotteryAddress) {
                    //refetch1()
                } else if (switchNetwork) {
                    //console.log(`Optional1. Switching back to Hardhat Chain ID,`)
                    //switchNetwork(31337)
                }
                */
        })
        subscribe("web3_onDisconnect", (e) => {
            setLotteryConnector(null)
            setHideButton(true)
        })

        subscribe("lottery_getEntranceFee", (e) => {
            //console.log("lottery_getEntranceFee")
            setEntranceFee(e.detail.data)
            setHideButton(false)
        })
        subscribe("lottery_getNumPlayers", (e) => {
            //console.log("lottery_getNumPlayers")
            setNumPlayers(e.detail.data.toString())
        })
        subscribe("lottery_getRecentWinner", (e) => {
            //console.log("lottery_getRecentWinner")
            setRecentWinner(e.detail.data)
        })

        return () => {
            console.log("Effect Cleanup")
            unsubscribe("web3_onConnect")
            unsubscribe("web3_onDisconnect")

            unsubscribe("lottery_getEntranceFee")
            unsubscribe("lottery_getNumPlayers")
            unsubscribe("lottery_getRecentWinner")
        }
    }, [chainId])

    useEffect(() => {
        console.log(`WalletAddress is now set to : ${walletAddress}`)
    }, [walletAddress])

    // Have a function to enter the Lottery
    return (
        <div className="p-5">
            Hi from lottery entrance!
            <div>
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                    disabled={!writeRCs[0]?.write || !isSuccessAll || isBusy}
                    hidden={hideButton}
                    onClick={() => writeRCs[0]?.write?.()}
                >
                    {isBusy ? (
                        <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                    ) : (
                        <div>Enter Lottery</div>
                    )}
                </button>
                {!isSSR && lotteryAddress ? (
                    <div>
                        <div>
                            Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                        </div>
                        <div>Number of Players: {numPlayers}</div>
                        <div>Recent Winners : {recentWinner}</div>
                    </div>
                ) : (
                    <div>Connection to Lottery Not Established</div>
                )}
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                    hidden={status !== "authenticated"}
                    onClick={() => {
                        disconnect()
                    }}
                >
                    <div>Sign Out</div>
                </button>
            </div>
        </div>
    )
}

export default LotteryEntrance
