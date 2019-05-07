# HOW TO USE

1. Make an app [here](https://dev.twitch.tv/dashboard/apps)
2. Copy the client id and client secret in `config.json`, and set up its values found in `config-sample.json`
3. Visit the `Quick Access Token` link below, and fill in `access_token` in `config.json`, leave `refresh_token` blank - it will be updated when you authorize successfully
4. Set the `port` to any number higher than `1024`, for reasons, however, if you have a domain set up, you will want to enable the `port_exposed` property, so it will be included in the redirect URI
5. Set the OAuth Redirect URI to `http://localhost:443/auth/twitch/callback` if locally testing, otherwise, use your IP or domain instead of localhost
6. Visit `http://localhost:443/auth/twitch` to authorize
7. Add all of the desired channels to join in the `channels` array in `config.json`, but do not include `#` in the names
8. Run `examples/index.js`

## Some Helpful Links

* [Quick Access Token](http://twitchapps.com/tmi/)
* [Apply for Bot Status](https://docs.google.com/forms/d/e/1FAIpQLSetA-IgasmoOdj1wDiev2Vcch9hu79M_AsRSkR0b94qrUwbIw/viewform)
* [Developer Docs](https://dev.twitch.tv/get-started)
