// PROMISES

const retrieveAccessToken = url => {
    return new Promise(resolve => {
        post("https://accounts.spotify.com/api/token", {}, urlencode({
            grant_type: 'authorization_code',
            code: getParam(url, 'code'),
            redirect_uri: "https://www.lukaszuk.net/sfy.html",
            client_id: ":)",
            client_secret: ":)"
        }), response => {
            resolve(response);
        });
    })
};

const retrieveUserInfo = response => {
    var tokenType = response.token_type;
    var accessToken = response.access_token;
    return new Promise(resolve => {
        get("https://api.spotify.com/v1/me", {
            Authorization: tokenType + ' ' + accessToken
        }, null, response => {
            response['token_type'] = tokenType
            response['access_token'] = accessToken;
            return resolve(response);
        });
    });
};

const createAPlaylist = response => {
    var tokenType = response.token_type;
    var accessToken = response.access_token;
    var userId = response.id;
    return new Promise(resolve => {
        post("https://api.spotify.com/v1/users/" + userId + "/playlists", {
            Authorization: tokenType + ' ' + accessToken,
            "Content-type": "application/json"
        }, JSON.stringify({
            name: localStorage.playlistTitle
        }), response => {
            response['token_type'] = tokenType
            response['access_token'] = accessToken;
            response['userId'] = userId;
            return resolve(response);
        });
    });
};

const searchASong = response => {
    return new Promise(resolve => {
        get("https://api.spotify.com/v1/search", {
            Authorization: response.token_type + ' ' + response.access_token
        }, buildSearchQuery(response.song), responseFromSearch => {
            resolve(responseFromSearch.tracks.items[0]);
        });
    });
};

const getAllSongsInfo = response => {
    var tokenType = response.token_type;
    var accessToken = response.access_token;
    var playlistId = response.id;
    var userId = response.userId;
    var songs = JSON.parse(localStorage.songs);
    var allSearchPromises = [];
    for (key in songs) {
        response['song'] = songs[key];
        allSearchPromises.push(searchASong(response));
    }
    return Promise.all(allSearchPromises).then(function (response) {
        response['token_type'] = tokenType;
        response['access_token'] = accessToken;
        response['playlistId'] = playlistId;
        response['userId'] = userId;
        return response;
    });
};

const prepareToaddAllSongsToPlaylist = response => {
    var songs = [];
    for (key in response) {
        if (isNumeric(key)) {
            songs.push(response[key].uri);
        }
    }
    return new Promise(resolve => {
        response['songs'] = songs;
        resolve(response);
    });
};

const addAllSongsToPlaylist = response => {
    var tokenType = response.token_type;
    var accessToken = response.access_token;
    var playlistId = response.playlistId;
    var userId = response.userId;
    var songs = response.songs;
    return new Promise(resolve => {
        post("https://api.spotify.com/v1/users/" + userId + "/playlists/" + playlistId + "/tracks", {
            Authorization: tokenType + ' ' + accessToken,
            "Content-type": "application/json"
        }, JSON.stringify({
            uris: songs
        }), function (response) {
            resolve(response);
        });
    });
};

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function buildSearchQuery(song) {
    return "q=" + song.title +         "%20album:" + song.album +
        "%20artist:" + song.artist + "&type=track";
}

retrieveAccessToken(tab.url)
    .then(retrieveUserInfo)
    .then(createAPlaylist)
    .then(getAllSongsInfo)
    .then(prepareToaddAllSongsToPlaylist)
    .then(addAllSongsToPlaylist)
    .catch(error => {
        progress.innerHTML += "[WARNING] " + error + "<br>";
    });
