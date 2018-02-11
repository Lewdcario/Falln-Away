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
	// TODO: Better resolve handling for possible timeouts
	connect() {
		return new Promise((resolve, reject) => {
			this.ws = new WS(`wss://${this.client.options.server}:443/`, 'irc');
			this.ws.onopen = this.onOpen.bind(this);
			this.ws.onerror = (e) => this.onError(e, reject);
			this.ws.onclose = (e) => this.onClose(e, reject);
			setTimeout(() => resolve(this.client), 1000 * 15);
		}).then(() => {
			this.client.emit('ready');
			this.ws.onmessage = this.onMessage.bind(this);
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

	onMessage(message) {
		this.client.emit('debug', message && message.data ? message.data : 'empty');
		if (!message) return;
		if (/user-id=(.\d*)/.test(message.data) && /PRIVMSG #(.*) :/.test(message.data)) {
			const msg = new Message(message.data);
			this.client.emit('message', msg);
		}
		else if (message.data.includes('PING')) {
			this.ws.send('PONG :tmi.twitch.tv');
			this.client.emit('debug', 'Responded with PONG to Twitch');
		}
	}

	async onError(error, reject) {
		return reject(new Error(`WebSocket errored with code ${error.code}, message: ${error.message}`));
	}

	async onClose(error, reject) {
		return reject(new Error(`WebSocket closed with code ${error.code}, message: ${error.message}`));
	}
}

module.exports = WebSocket;
