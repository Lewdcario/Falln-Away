const options = require('../config');
const { Client } = require('../src');

const client = new Client(options);
client.login();

const prefix = '!';
const queue = [];

client.on('ready', () => console.log('Logged in successfully!'));

client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return null;
	const [command] = message.content.slice(prefix.length).split(' ');

	if (command === 'ping') return client.send(message.channel, 'pong!');
	if (command === 'queue') {
		queue.push(message.author);
		return client.send(message.channel, `I have successfully added you to the queue, ${message.author}!`);
	}
	if (command === 'viewqueue') {
		return client.send(message.channel, `Queue: ${queue.map(u => u.username).join(', ')}`);
	}
	if (command === 'next') {
		if (!message.author.mod && !message.author.broadcaster) {
			return client.send(message.channel, 'Only the broadcaster or a mod can use this command.');
		}
		queue.shift();
		if (queue.length === 0) return client.send(message.channel, 'There is nobody in the queue!');
		return client.send(message.channel, `${queue[0]}, you're up!`);
	}

	return null;
});

client.on('debug', (m) => console.log('[DEBUG]', m));

client.on('error', (e) => console.error('[ERROR]', e));
