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

const initialState = {
      input:'',
      imageURL:'',
      box:{},
      route:'signin',
      isSignedIn: false,
      user: {
        id: "",
        name: "",
        email: "",
        entries: 0,
        joined:""
      }
    }

class App extends Component {
  constructor(){
    super();
    this.state=initialState;
  }

  loadUser = (data) => {
    this.setState({user: {
      id: data.id,
      name: data.name,
      email: data.email,
      entries: data.entries,
      joined:data.joined
      }
    })
  }

  // componentDidMount(){
  //   fetch('http://localhost:3000/')
  //   .then(response => response.json())
  //   .then(console.log)
  // }

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

    // app.models.predict(
    //   Clarifai.FACE_DETECT_MODEL, 
    //   this.state.input)
    //moving this to the backend
    fetch('https://secret-thicket-41710.herokuapp.com/imageurl',{
            method: 'post',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              input: this.state.input
            })
          })
    .then (response => response.json())
    .then(response => {
        if (response){
          fetch('https://secret-thicket-41710.herokuapp.com/image',{
            method: 'put',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
              id: this.state.user.id
            })
          })
          .then (response => response.json())
          .then (count => {
            this.setState(Object.assign(this.state.user, {entries: count}))
          })
          .catch(console.log('fetch error'))
        }
        this.displayFaceLocation(this.calculateFacelocation(response))
      })
        // do something with response _(response.outputs[0].data.regions[0].region_info.bounding_box);
      .catch(err => console.log(err)); 
  }
  


  onRouteChange =( wherearewe ) => {
    if (wherearewe === 'signout') {
        this.setState(initialState)
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
              <Rank name={this.state.user.name} entries={this.state.user.entries}/>
              <ImageLinkForm 
              onInputChange={this.onInputChange} 
              onSubmitDetect={this.onSubmitDetect}/>
              <FaceRecognition 
              imageURL={imageURL}
              box={box} />
              </div>

              : (this.state.route === 'signin'
                ? <SignIn loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                : <Register loadUser={this.loadUser} onRouteChange={this.onRouteChange}/>
                )
          } 
        </div>
      )
    }
  }


export default App;
