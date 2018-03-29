const WS = require('ws');
const Message = require('../structures/Message');

/**
 * The WebSocket handler of the client
 * @private
 */
// TODO: document this and handle closes better
class WebSocket {
	constructor(client) {
		/**
		 * The client that instantiated the WebSocket manager
		 * @type {Client}
		 */
		this.client = client;
	}

	/**
	 * Connects the WebSocket
	 * @returns {Promise<Client>}
	 */
	connect() {
		return new Promise((resolve, reject) => {
			this.ws = new WS(`wss://${this.client.options.server}:443/`, 'irc');
			this.ws.onopen = this.onOpen.bind(this);
			this.ws.onerror = (e) => this.onError(e, reject);
			this.ws.onclose = (e) => this.onClose(e, reject);
			this.ws.onmessage = (m) => this.onMessage(m, resolve, reject);
			setTimeout(() => reject(new Error('Took too long to receive ready, timed out (15s)')), 1000 * 15);
		});
	}

	onOpen() {
		if (this.ws !== null && this.ws.readyState === 1) {
			this.client.emit('debug', 'Connecting and authenticating...');
			this.ws.send('CAP REQ :twitch.tv/tags twitch.tv/commands twitch.tv/membership');
			this.ws.send(`PASS oauth:${this.client.options.access_token}`);
			this.ws.send(`NICK ${this.client.options.username}`);
			for (const channel of this.client.options.channels) {
				this.ws.send(`JOIN #${channel}`);
				this.client.emit('debug', `Joined channel #${channel}`);
			}
		}
	}

	onMessage(message, resolve, reject) {
		this.client.emit('debug', message && message.data ? message.data : 'empty');
		if (!message || !message.data) return null;
		if (/user-id=(.\d*)/.test(message.data) && /PRIVMSG #(.*) :/.test(message.data)) {
			this.client.emit('message', new Message(message.data));
		}
		else if (message.data.includes('PING')) {
			this.ws.send('PONG :tmi.twitch.tv');
			this.client.emit('debug', 'Responded with PONG to Twitch');
		}
		else if (message.data.includes('authentication failed')) {
			return reject(new Error('Invalid authorization token was provided'));
		}
		else if (message.data.includes('Welcome')) {
			this.client.emit('ready');
			return resolve(this.client);
		}
		return null;
	}

	async onError(error, reject) {
		return reject(new Error(`WebSocket errored with code ${error.code}, message: ${error.message}`));
	}

	async onClose(error, reject) {
		return reject(new Error(`WebSocket closed with code ${error.code}, message: ${error.message}`));
	}
}

module.exports = WebSocket;
