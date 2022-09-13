import { getSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"
import { useDisconnect } from "wagmi"

import { useAccount } from "../components/utils/wagmiAccount"

const userPage = "/user"
const signOutRedirectPath = "/"
const signInPage = "/"

function User({ user }) {
    const { push } = useRouter()
    const { disconnect } = useDisconnect()
    const { address, isConnected } = useAccount(signOutRedirectPath)

    return (
        <div>
            <h4>User session:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                onClick={() => {
                    disconnect()
                }}
            >
                <div>Sign Out</div>
            </button>
            <br /> <br />
            <button
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ml-auto"
                onClick={() => push(signInPage)}
            >
                <div>Back to Home Page</div>
            </button>
        </div>
    )
}

export async function getServerSideProps(context) {
    const session = await getSession(context)

    if (!session) {
        return {
            redirect: {
                destination: signInPage,
                permanent: false,
            },
        }
    }

    return {
        props: { user: session.user },
    }
}

export default User
