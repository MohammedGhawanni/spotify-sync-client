import React, { Component } from "react";
import Spotify from "spotify-web-api-js";

// Global Var for Spotify WebAPI library
const spotify = new Spotify();

// Global var for parameters in the url

export class SpotifyController extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loggedIn: this.props.params.access_token ? true : false,
      nowPlaying: { artist: "Not Checked", albumCover: "", song: "" },
      checked: false,
      isPlaying: ''
    };
  }

  componentDidMount() {
    spotify.setAccessToken(this.props.params.access_token);
  }

  // fetch "now playing" info from Spotify account
  getNowPlaying() {
    if (this.state.loggedIn) {
      spotify.getMyCurrentPlaybackState().then((res) => {
        console.log(res);
        this.setState({
          nowPlaying: {
            artist: res.item.artists[0].name,
            albumCover: res.item.album.images[0].url,
            song: res.item.name,
          },
          checked: true,
          isPlaying: res.item.is_playing
        });
      });
    }
  }

  play(){
    if(this.state.loggedIn && !this.state.isPlaying){
      spotify.play()
      .then((res) => {
        console.log('playing:', res);
        this.setState({isPlaying:true});
      })
    }
  }

  pause(){
    if(this.state.loggedIn && this.state.isPlaying){
      spotify.pause()
      .then((res) => {
        console.log('paused: ', res);
        this.setState({isPlaying:false});
      })
    }
  }

  next(){
    if(this.state.loggedIn){
      spotify.skipToNext()
      .then((res) => {
        console.log('skip', res);
        this.getNowPlaying();
      })
    }
  }

  previous(){
    if(this.state.loggedIn){
      spotify.skipToPrevious()
      .then((res) => {
        console.log('previous', res);
        this.getNowPlaying();
      })
    }
  }

  sync(){
    let currentToken = spotify.getAccessToken();
    let guestToken = this.getGuestToken(currentToken);

    console.log('guest token:', guestToken);

    const myPlaybackState = {};
    spotify.getMyCurrentPlaybackState()
    .then((res) => {
      myPlaybackState.track = res.item.uri;
      myPlaybackState.position = res.progress_ms;
    });

    if(myPlaybackState){
      spotify.setAccessToken(guestToken);
      spotify.play({
        uris: myPlaybackState.track,
        position_ms: myPlaybackState.position
      }).then((res) => {
        console.log('should be synced, here is the response we got: ' , res);
      });
    }
  }

  getGuestToken(myToken){
    let localStorageKeys = Object.keys(window.localStorage);
    for(let i = 0 ; i < localStorageKeys.length ; i++){
      if(window.localStorage.getItem(localStorageKeys[i] !== myToken)){
        console.log('returning token:', window.localStorage.getItem(localStorageKeys[i]));
        return window.localStorage.getItem(localStorageKeys[i]);
      }
    }
  }

  render() {
    return (
      <div>
        <p>Logged In: {this.state.loggedIn.toString()}</p>
        <br />
        {this.state.checked ? (
          <div>
            <p>Now Playing:</p>
            <p><strong>{this.state.nowPlaying.song}</strong></p>
            <p>
              <strong>{this.state.nowPlaying.artist}</strong>
            </p>

            <img
              style={{ maxWidth: "25vh" }}
              src={this.state.nowPlaying.albumCover}
              alt="Now playing album cover"
            />
            <br />
          </div>
        ) : (
          <p>Please Check Playback State</p>
        )}
        <button onClick={() => this.getNowPlaying()}>Check now!</button>
        <button onClick={() => this.play()}>Play!</button>
        <button onClick={() => this.pause()}>Pause!</button>

        <br/>

        <button onClick={() => this.previous()}>  &lt;&lt;  </button>
        <button onClick={() => this.next()}>  &gt;&gt;  </button>

        <br/>

        <button onClick={() => this.sync()}><strong>~!!SYNC!!~</strong></button>
      </div>
    );
  }
}
