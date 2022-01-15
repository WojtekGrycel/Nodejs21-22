//CALLBACKS

post("https://accounts.spotify.com/api/token", {}, urlencode({
    grant_type: 'authorization_code',
    code: getParam(tab.url, 'code'),
    redirect_uri: "https://www.lukaszuk.net/sfy.html",
    client_id: ":)",
    client_secret: ":)",
}), function (response) {
    var tokenType = response.token_type;
    var accessToken = response.access_token;
    get("https://api.spotify.com/v1/me", {
        Authorization: tokenType + ' ' + accessToken
    }, null, function (response) {
        var userId = response.id;
        post("https://api.spotify.com/v1/users/" + userId + "/playlists", {
            Authorization: tokenType + ' ' + accessToken,
            "Content-type": "application/json"
        }, JSON.stringify({
            name: localStorage.playlistTitle
        }), function (response) {
            var playlistId = response.id;
            var songs = JSON.parse(localStorage.songs);
            var i = 0;
            for (key in songs) {
                get("https://api.spotify.com/v1/search", {
                    Authorization: tokenType + ' ' + accessToken
                }, "q=" + songs[key].title + "%20album:" + songs[key].album + "%20artist:" + songs[key].artist + "&type=track", function (response) {
                    if (response.tracks.items.length) {
                        var uri = response.tracks.items[0].uri;
                        post("https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks", {
                            Authorization: tokenType + ' ' + accessToken,
                            "Content-type": "application/json"
                        }, JSON.stringify({
                            uris: [uri]
                        }), function (response) {
                            // song has been added to the playlist
                        });
                    }
                });
            };
        });
    });
});
