import { getSession, signOut } from "next-auth/react"
import { useRouter } from "next/router"

//const signInPage = "/signin"
const signInPage = "/"

function User({ user }) {
    const { push } = useRouter()

    return (
        <div>
            <h4>User session:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <button onClick={() => signOut({ redirect: signInPage })}>Sign out</button>
            <br />
            <button onClick={() => push(signInPage)}>Back to Home Page</button>
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
