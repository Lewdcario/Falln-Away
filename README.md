# HOW TO USE

1. Make an app [here](https://dev.twitch.tv/dashboard/apps)
2. Copy the client id and client secret in `config.json`, and set up its values found in `config-sample.json`
3. Set the OAuth Redirect URI to `http://localhost:443/auth/twitch/callback` if locally testing, otherwise, use your IP or domain instead of localhost
4. Run `examples/index.js`
5. Visit `http://localhost:443/auth/twitch` to authorize

## Some Helpful Links

* [Apply for Bot Status](https://docs.google.com/forms/d/e/1FAIpQLSetA-IgasmoOdj1wDiev2Vcch9hu79M_AsRSkR0b94qrUwbIw/viewform)
* [Developer Docs](https://dev.twitch.tv/get-started)
* [Quick Access Token](http://twitchapps.com/tmi/)
