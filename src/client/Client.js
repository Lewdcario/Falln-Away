const { EventEmitter } = require('events');
const WebSocket = require('./WebSocket');
const axios = require('axios');
const Database = require('../auth/Database');
const { stringify } = require('querystring');
const auth = require('../auth/auth');

const Collector = require('../structures/Collector');
const User = require('../structures/User');

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
	 * Logs the client in
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
	 * @returns {Promise}
	 * @example
	 * client.send(message.channel, 'Hello!')
	 * 	.then(console.log)
	 * 	.catch(console.error);
	 */
	send(channel, content) {
		return new Promise((resolve, reject) => {
			this.once('ratelimit', reject);
			setTimeout(() => resolve(), 500);
			this.websocket.ws.send(`PRIVMSG ${channel} :${content}`, e => e && reject(e));
		});
	}

	/**
	 * Sends a whisper to this user
	 * @param {string} channel The channel the whisper will be sent in
	 * @param {User|string} user The user to send the whisper to
	 * @param {string} content The content to send
	 */
	whisper(channel, user, content) {
		const destination = user instanceof User ? user.username : user;
		return this.send(channel, `/w ${destination} ${content}`);
	}

	/**
	 * Promisified version of Collector
	 * @param {Object} [options={}] The options to use
	 * @param {function} options.filter The filter function to use
	 * @param {number} [options.max] How many messages to attempt to filter
	 * @param {number} [options.maxMatches] How many messages to collect after passing the filter
	 * @param {Channel} [options.channel] The channel to collect messages in, or none for all channels
	 * @returns {Promise<Map>}
	 */
	awaitMessages({ filter, max, maxMatches, channel }) {
		if (typeof filter !== 'function') throw new Error('awaitMessages: filter function required');
		return new Promise((resolve) => {
			const collector = new Collector(this, { filter, max, maxMatches, channel });
			collector.once('end', resolve);
		});
	}

	/**
	 * Revokes the token used to log in.
	 * @returns {Promise}
	 */
	revokeToken() {
		const TOKEN_PARAMS = [
			`client_id=${this.options.client_id}`,
			`token=${this.options.access_token}`
		].join('&');

		return axios.post(`https://api.twitch.tv/kraken/oauth2/revoke?${TOKEN_PARAMS}`);
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
}

module.exports = Client;
