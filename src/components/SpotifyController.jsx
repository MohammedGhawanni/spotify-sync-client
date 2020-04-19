import React, { Component } from "react";
import Spotify from "spotify-web-api-js";
import axios from 'axios';

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

  async sync(){
    //save current state
    const currentPlaybackState = {};
    await spotify.getMyCurrentPlaybackState()
    .then((res) => {
      currentPlaybackState.track = res.item.uri;
      currentPlaybackState.progrees = res.progress_ms;
    });

    //Get all access token we have in our DB
    axios.post(process.env.REACT_APP_API_GATEWAY_GET_ACCESS_TOKENS)
    .then((tokens) => {
      //iterate through all the tokens
      console.log('all tokens', tokens)
      for(var i = 0 ; i < tokens.data.Items.length ; i++) {
        spotify.setAccessToken(tokens.data.Items[i].access_token);
        console.log('playback state', currentPlaybackState);
        spotify.play({
          // context_uri: currentPlaybackState.context,
          uris: [currentPlaybackState.track],
          position_ms: currentPlaybackState.progrees
        }).then((res) => {
          console.log('synchronized device', res);
        })
      };
    });
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
