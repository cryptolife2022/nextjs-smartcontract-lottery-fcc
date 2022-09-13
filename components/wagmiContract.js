import { abi, contractAddresses } from "../constants"
import {
    useContractRead,
    useContractReads,
    useContractWrite,
    usePrepareContractWrite,
    useContractEvent,
} from "wagmi"

export function readContract(methods, chain) {
    let lAddress = chain ? (chain.id in contractAddresses ? contractAddresses[chain.id][0] : 0) : 0
    let contractReadRCs = []
    var isSuccessAll = true

    const readConfig = {
        addressOrName: lAddress,
        contractInterface: abi,
        enabled: lAddress ? true : false,
    }

    methods.forEach((method) => {
        /* const { data,isSuccess,isError,isLoading,refetch } = */
        contractReadRCs.push(
            useContractRead({
                ...readConfig,
                functionName: method["func"],
                onError: method["onError"],
                onSuccess: method["onSuccess"],
            })
        )
    })

    return { contractReadRCs, lAddress, isSuccessAll }
}

export function writeContract(methods, lotteryAddress) {
    let writeRCs = []
    let isBusy = false

    methods.forEach((method, index) => {
        /*{config,error,isError,isLoading,isFetching}=*/
        const preWriteRC = usePrepareContractWrite({
            addressOrName: lotteryAddress,
            contractInterface: abi,
            functionName: method["func"],
            overrides: method["overrides"],
        })

        writeRCs.push(
            useContractWrite({
                ...preWriteRC.config,
                onError: method["onError"],
                onSuccess: method["onSuccess"],
            })
        )

        isBusy ||=
            preWriteRC.isLoading ||
            preWriteRC.isFetching ||
            writeRCs[index].isLoading ||
            writeRCs[index].isFetching
    })

    return { writeRCs, isBusy }
}

export function eventContract(lotteryAddress, eventName, listener) {
    useContractEvent({
        addressOrName: lotteryAddress,
        contractInterface: abi,
        eventName: eventName,
        once: true,
        listener: listener,
    })
}
