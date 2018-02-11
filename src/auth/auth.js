const express = require('express');
const axios = require('axios');
const { parse } = require('url');

const app = express();
app.use(express.static('public'));

// TODO: Get own success/error images for the end redirects
module.exports.run = function run() {
	const config = this._database.file;

	const TWITCH_CLIENT_ID = config.client_id;
	const TWITCH_SECRET = config.client_secret;
	const CALLBACK_URL = `${config.base}${config.port_exposed ? `:${config.port}` : ''}${config.callback}`;

	// Set route to start OAuth link, this is where you define scopes to request, then redirect to the authorization url
	app.get(config.redirect, async(req, res) => {
		if (res.statusCode !== 200) {
			this.emit('error', `Error on ${config.redirect}`, req);
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
		const response = await axios.get(URI).catch(e => this.emit('error', 'Error authorizing', e));

		if (!response || !response.data || [401, 404].includes(response.data.status)) {
			return res.redirect('https://discordapp.com/oauth2/error');
		}

		return res.redirect(`https://api.twitch.tv/kraken/oauth2/authorize?action=authenticate&${TOKEN_PARAMS}`);
	});

	// If user has an authenticated session, display it, otherwise display link to authenticate
	app.get(config.callback, async(req, res) => {
		if (res.statusCode !== 200) {
			this.emit('error', `Error on ${config.callback}`, req);
			return res.redirect('https://discordapp.com/oauth2/error');
		}
		const CODE = parse(req.url, true).query.code;

		const TOKEN_PARAMS = [
			`client_id=${TWITCH_CLIENT_ID}`,
			`client_secret=${TWITCH_SECRET}`,
			`redirect_uri=${encodeURIComponent(CALLBACK_URL)}`,
			'grant_type=authorization_code',
			`code=${CODE}`
		].join('&');

		const URI = `https://api.twitch.tv/kraken/oauth2/token?${TOKEN_PARAMS}`;
		const response = await axios.post(URI).catch(e => this.emit('error', 'Error requesting access token', e));

		if (!response || !response.data || [401, 404].includes(response.data.status)) {
			return res.redirect('https://discordapp.com/oauth2/error');
		}

		this._database._updateFile(response.data);
		return res.redirect('https://discordapp.com/oauth2/success');
	});

	app.listen(config.port, () => {
		this.emit('debug', `Twitch auth server listening on port ${config.port}!`);
	});
};

