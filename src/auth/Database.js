const fs = require('fs');
const path = require('path');

/**
 * The Database handler for this application
 */
class Database {
	constructor(dir, client) {
		/**
		 * The client that instantiated this database handler
		 * @type {Client}
		 */
		this.client = client;

		/**
		 * The path of the file
		 * @type {string}
		 */
		this.path = path.resolve(dir);
	}

	/**
	 * The contents of this file
	 * @type {Object}
	 * @readonly
	 */
	get file() {
		return JSON.parse(fs.readFileSync(this.path));
	}

	/**
	 * The access token for the client
	 * @type {string}
	 * @readonly
	 */
	get access_token() {
		return this.file.access_token;
	}

	/**
	 * The refresh token for the client
	 * @type {string}
	 * @readonly}
	 */
	get refresh_token() {
		return this.file.refresh_token;
	}

	_updateFile(data) {
		const file = this.file;
		file.access_token = data.access_token;
		file.refresh_token = data.refresh_token;
		if (!file.access_token || !file.refresh_token) throw new Error('MISSING ACCESS OR REFRESH TOKEN');
		fs.writeFileSync(path.resolve(this.client.options.file_path), JSON.stringify(file, null, 4));
		Object.assign(this.client.options, file);
	}
}

module.exports = Database;
