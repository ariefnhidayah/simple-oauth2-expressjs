require('dotenv').config()
const express = require("express")
const jwt = require("jsonwebtoken")
const axios = require("axios")
const cors = require('cors')
const cookieParser = require('cookie-parser')
const querystring = require('querystring')

const {
    PORT,
    API_URL,
    JWT_SECRET,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_CLIENT_ID,
    GOOGLE_API_URL
} = process.env

const urlServer = API_URL + ":" + PORT

const redirectURL = "auth/google"

const app = express()

app.use(cors())
app.use(express.json())
app.use(cookieParser())
app.use(express.urlencoded({
    extended: false
}))

function getGoogleAuthURL() {
    const options = {
        redirect_uri: `${urlServer}/${redirectURL}`,
        client_id: GOOGLE_CLIENT_ID,
        access_type: 'offline',
        response_type: 'code',
        prompt: "consent",
        scope: [
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/userinfo.email"
        ].join(" ")
    }
    return `${GOOGLE_API_URL}?${querystring.stringify(options)}`
}

app.get("/auth/google/url", (req, res) => {
    return res.send(getGoogleAuthURL())
})

function getTokens({
    code,
    clientId,
    clientSecret,
    redirectUri,
}) {
    const url = "https://oauth2.googleapis.com/token";
    const values = {
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
    };
    return axios.post(url, querystring.stringify(values), {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
        })
        .then(res => res.data)
        .catch(err => {
            console.error(`Failed to fetch auth tokens`);
            throw new Error(err.message);
        })
}

app.get(`/${redirectURL}`, async (req, res) => {
    const code = req.query.code;
    const {
        id_token,
        access_token
    } = await getTokens({
        code,
        clientId: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        redirectUri: `${urlServer}/${redirectURL}`,
    });

    const googleuser = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`, {
            headers: {
                Authorization: `Bearer ${id_token}`
            }
        })
        .then(res => res.data)
        .catch((error) => {
            console.error(`Failed to fetch user`);
            throw new Error(error.message);
        });

    const token = jwt.sign(googleuser, JWT_SECRET)
    res.json({
        token: token
    })
})

app.get("/auth/me", async (req, res) => {
    const {
        token
    } = req.query
    if (!token) {
        return res.status(409).json({
            status: 'error'
        })
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return res.json(decoded);
    } catch (error) {
        console.log(err);
        return res.status(409).json({
            status: 'error'
        })
    }
})

function main() {
    app.listen(PORT, () => {
        console.log(`App listen in port ${PORT}`)
    })
}

main()