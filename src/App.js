import React, { Component } from 'react';
import Navigation from './components/Navigation/Navigation';
import Logo from './components/Logo/Logo';
import ImageLinkForm from './components/ImageLinkForm/ImageLinkForm';
import Rank from './components/Rank/Rank';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';

const app = new Clarifai.App({
 apiKey: '86aef2717afe4258a40232d7978eaac9'
});


const particlesOption = {
    particles: {
    number: {
      value: 100,
      density: {
        enable: true,
        value_area: 800
      }
    }
  }
}

class App extends Component {
  constructor(){
    super();
    this.state={
      input:'',
      imageURL:'',
      box:{},
      route:'signin',
      isSignedIn: false,
    }
  }

  calculateFacelocation = (data) => {
    const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
    const image = document.getElementById('inputImage');
    const width = Number(image.width);
    const height = Number(image.height);
    return {
      leftCol: clarifaiFace.left_col*width,
      topRow: clarifaiFace.top_row*height,
      rightCol: width - (clarifaiFace.right_col*width),
      bottomRow: height - (clarifaiFace.bottom_row*height)
    }
  }

  displayFaceLocation =(faceBox) => {
    this.setState({box: faceBox});
  }

  onInputChange = (event) => {
    this.setState({input: event.target.value})
  }

  onSubmitDetect = () => {
    this.setState({imageURL: this.state.input});
    app.models.predict(
      Clarifai.FACE_DETECT_MODEL, 
      this.state.input)
      .then(response => this.displayFaceLocation(this.calculateFacelocation(response)))
        // do something with response _(response.outputs[0].data.regions[0].region_info.bounding_box);
      .catch(err => console.log(err)) 
  }

onRouteChange =( wherearewe ) => {
  if (wherearewe === 'signout') {
      this.setState({isSignedIn: false})
    } else if (wherearewe === 'home') {
      this.setState({isSignedIn:true})
    } 
  this.setState({ route: wherearewe });
  }

  render() {
    const {isSignedIn, imageURL, box, route} = this.state
    return (
      <div className="App"> 
        <Particles className='particles'
          params={particlesOption} 
        />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        {route === 'home' 
          ? <div>
            <Logo />
            <Rank />
            <ImageLinkForm 
            onInputChange={this.onInputChange} 
            onSubmitDetect={this.onSubmitDetect}/>
            <FaceRecognition 
            imageURL={imageURL}
            box={box} />
            </div>

            : (this.state.route === 'signin'
              ? <SignIn onRouteChange={this.onRouteChange}/>
              : <Register onRouteChange={this.onRouteChange}/>
              )
        } 
      </div>
    )
  }
}

export default App;
