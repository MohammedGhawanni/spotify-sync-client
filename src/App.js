import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import { SpotifyController } from './components/SpotifyController';
import axios from 'axios';

class App extends Component{

  constructor(){
    super()

    this.state = {
      params : this.getHashParams()
    }
  }

  // get access toke & refreash token from url
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
        // eslint-disable-next-line
    while ( e = r.exec(q)) {
        hashParams[e[1]] = decodeURIComponent(e[2]);
    }

    return hashParams;
  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <p>
            Edit <code>src/App.js</code> and save to reload.
          </p>
        </header>
          <a
            href="http://localhost:8888">
            <button>
              Login With Spotify
            </button>
          </a>
  
        <SpotifyController params={this.state.params}/>
      </div>
    );
  }
}

export default App;
