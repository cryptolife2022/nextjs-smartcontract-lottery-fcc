const contractAddresses = require("./contractAddresses.json")
const abi = require("./abi.json")
const appName = "Smart Contract Lottery"
const favIcon = "/favicon.ico"
const userPage = "/user"
const signOutRedirectPath = "/"
const signInPage = "/"

module.exports = {
    userPage,
    signOutRedirectPath,
    signInPage,
    appName,
    favIcon,
    abi,
    contractAddresses,
}
