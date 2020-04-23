import { Component } from 'preact'
import { Router } from 'preact-router'

import Header from './header'
import Footer from './footer'

// Code-splitting is automated for routes
import Home from '../routes/home'
import About from '../routes/about'
import Products from '../routes/products'

export default class App extends Component {
  /** Gets fired when the route changes.
   * @param {Object} event "change" event from [preact-router](http://git.io/preact-router)
   * @param {string} event.url The newly routed URL
  */
  handleRoute = e => {
    this.currentUrl = e.url
  };

  render () {
    return (
      <div id="app">
        <div>
          <Header />
          <div class="container mx-auto my-8">
            <Router onChange={this.handleRoute}>
              <Home path="/" />
              <About path="/about" />
              <Products path="/products" />
            </Router>
          </div>
        </div>
        <Footer />
      </div>
    )
  }
}
