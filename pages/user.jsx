import { getSession, signOut } from "next-auth/react"

//const signInPage = "/signin"
const signInPage = "/"

function User({ user }) {
    return (
        <div>
            <h4>User session:</h4>
            <pre>{JSON.stringify(user, null, 2)}</pre>
            <button onClick={() => signOut({ redirect: signInPage })}>Sign out</button>
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
