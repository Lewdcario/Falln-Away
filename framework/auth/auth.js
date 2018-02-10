const config = require('../../config');

const path = require('path');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const { parse } = require('url');

const app = express();
app.use(express.static('public'));

const TWITCH_CLIENT_ID = config.client_id;
const TWITCH_SECRET = config.client_secret;
const CALLBACK_URL = `${config.base}:${config.port}/auth/twitch/callback`;

const save = (grant) => {
	const file = JSON.parse(fs.readFileSync(path.resolve(config.file_path)));
	file.access_token = grant.access_token;
	file.refresh_token = grant.refresh_token;
	fs.writeFileSync(path.resolve(config.file_path), JSON.stringify(file, null, 4));
};

const handleCallback = async(req, res) => {
	const CODE = parse(req.url, true).query.code;

	const TOKEN_PARAMS = [
		`client_id=${TWITCH_CLIENT_ID}`,
		`client_secret=${TWITCH_SECRET}`,
		`redirect_uri=${encodeURIComponent(CALLBACK_URL)}`,
		'grant_type=authorization_code',
		`code=${CODE}`
	].join('&');

	const URI = `https://api.twitch.tv/kraken/oauth2/token?${TOKEN_PARAMS}`;
	const response = await axios.post(URI).catch(console.error);

	if (!response || !response.body || [401, 404].includes(response.body.status)) {
		return res.redirect('https://discordapp.com/oauth2/error');
	}

	return save(response.body)
		.then(() => res.redirect('https://discordapp.com/oauth2/authorized'))
		.catch(() => res.redirect('https://discordapp.com/oauth2/error'));
};

const handleAuth = async(req, res) => {
	if (res.statusCode !== 200) {
		return res.redirect('https://discordapp.com/oauth2/error');
	}

	const TOKEN_PARAMS = [
		`client_id=${TWITCH_CLIENT_ID}`,
		`redirect_uri=${encodeURIComponent(CALLBACK_URL)}`,
		'force_verify=true',
		'response_type=code',
		'scope=chat_login'
	].join('&');

	const URI = `https://api.twitch.tv/kraken/oauth2/authorize?${TOKEN_PARAMS}`;
	const response = await axios.get(URI).catch(console.error);

	if (!response || !response.body || [401, 404].includes(response.body.status)) {
		return res.redirect('https://discordapp.com/oauth2/error');
	}

	return res.redirect(`https://api.twitch.tv/kraken/oauth2/authorize?action=authenticate&${TOKEN_PARAMS}`);
};

module.exports.run = function run() {
	// Set route to start OAuth link, this is where you define scopes to request, then redirect to the authorization url
	app.get('/auth/twitch', async(req, res) => {
		return handleAuth(req, res);
	});

	// If user has an authenticated session, display it, otherwise display link to authenticate
	app.get('/auth/twitch/callback', async(req, res) => {
		return handleCallback(req, res);
	});

	app.listen(config.port, () => {
		console.log(`Twitch auth server listening on port ${config.port}!`);
	});
};

