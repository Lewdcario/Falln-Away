const { EventEmitter } = require('events');
const WebSocket = require('./WebSocket');
const axios = require('axios');
const Database = require('../auth/Database');
const { stringify } = require('querystring');
const auth = require('../auth/auth');

/**
 * The starting point for making a Twitch Bot
 * @extends {EventEmitter}
 */
class Client extends EventEmitter {
	/**
	 * @param {Object} [options] Options for the client
	 */
	// TODO: document options
	constructor(options = {}) {
		super();

		/**
		 * The options the client was instantiated with
		 * @type {Object}
		 */
		this.options = options;

		/**
		 * The WebSocket handler for the client
		 * @type {WebSocket}
		 */
		this.websocket = new WebSocket(this);

		this._database = new Database(this.options.file_path, this);
		auth.run.call(this);
	}

	/**
	 * logs the client in
	 * @returns {Promise<Client>}
	 * @example
	 * client.login()
	 * 	.then(() => console.log('Successfully logged in!'))
	 * 	.catch((e) => console.error('Failed to login', e));
	 */
	login() {
		return this.websocket.connect()
			.catch(() => this._refreshToken()
				.then(() => this.login())
				.catch((e) => this.emit('error', 'Refreshing token failed', e)));
	}

	/**
	 * Sends a message to a channel
	 * @param {string} channel The channel to send the message to
	 * @param {string} content The content to send
	 * @example
	 * client.send(message.channel, 'Hello!');
	 */
	// TODO: handle ratelimits, probably try catch, also make this a promise
	send(channel, content) {
		return this.websocket.ws.send(`PRIVMSG ${channel} :${content}`);
	}

	async _refreshToken() {
		if (!this.options.client_secret) throw new Error('MISSING CLIENT SECRET');
		if (!this.options.refresh_token) throw new Error('MISSING REFRESH TOKEN');

		const body = await axios.post('https://api.twitch.tv/kraken/oauth2/token',
			stringify({
				grant_type: 'refresh_token',
				refresh_token: this.options.refresh_token,
				client_id: this.options.client_id,
				client_secret: this.options.client_secret
			}), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

		if (!body || !body.data) throw new Error('REFRESH FAILED');

		this._database._updateFile(body.data);

		return body;
	}

	revokeToken() {
		const TOKEN_PARAMS = [
			`client_id=${this.options.client_id}`,
			`token=${this.options.access_token}`
		].join('&');

		return axios.post(`https://api.twitch.tv/kraken/oauth2/revoke?${TOKEN_PARAMS}`);
	}
}

module.exports = Client;
