# HOW TO USE

1. Make an app [here](https://dev.twitch.tv/dashboard/apps)
2. Copy the client id and client secret in `config.json`, and set up its values found in `config-sample.json`
3. Visit the `Quick Access Token` link below, and fill in `acces_token` in `config.json`, leave `refresh_token` blank - it will be updated when you authorize successfully
4. Set the `port` to any number higher than `1024`, for reasons, however, if you have a domain set up, you will want to enable the `port_exposed` property, so it will be included in the redirect URI
5. Set the OAuth Redirect URI to `http://localhost:443/auth/twitch/callback` if locally testing, otherwise, use your IP or domain instead of localhost
6. Run `examples/index.js`
7. Visit `http://localhost:443/auth/twitch` to authorize

## Some Helpful Links

* [Apply for Bot Status](https://docs.google.com/forms/d/e/1FAIpQLSetA-IgasmoOdj1wDiev2Vcch9hu79M_AsRSkR0b94qrUwbIw/viewform)
* [Developer Docs](https://dev.twitch.tv/get-started)
* [Quick Access Token](http://twitchapps.com/tmi/)
