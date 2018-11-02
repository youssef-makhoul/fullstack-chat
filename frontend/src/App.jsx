import React, { Component } from "react";
import "./App.css";
import AuthenticationForm from "./components/AuthenticationForm";
import { connect } from "react-redux";
//{username:"bob",messageBody:"asdasd",subtime:"0000"}
class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      messageText: "",
      activeUsers: []
    };
    this.pollingChat = "";
    this.getFormatedMesseges = this.getFormatedMesseges.bind(this);
    this.handleSubmiteMessage = this.handleSubmiteMessage.bind(this);
    this.handleChangeMessageText = this.handleChangeMessageText.bind(this);
    this.updateMessages = this.updateMessages.bind(this);
    this.handleSignout = this.handleSignout.bind(this);
  }
  updateMessages() {
    fetch("/getchat", {
      method: "GET",
      credentials: "same-origin"
    })
      .then(function(res) {
        return res.text();
      })
      .then(
        function(res) {
          let parsedRes = JSON.parse(res);
          if (parsedRes.success) {
            if (!this.props.signedIn) 
              this.props.dispatch({ type: "signIn" });
            this.setState({
              messages: parsedRes.messages,
              activeUsers: parsedRes.activeUsers
            });
          }
        }.bind(this)
      )
      .catch(() => {
        clearInterval(this.pollingChat);
        this.props.dispatch({
          type: "disconnect"
        });
      });
  }
  componentDidMount() {
    this.pollingChat = setInterval(this.updateMessages, 500);
  }
  handleSubmiteMessage(event) {
    event.preventDefault();
    let message = {
      message: this.state.messageText
    };
    fetch("/newmessage", {
      method: "POST",
      credentials: "same-origin",
      body: JSON.stringify(message)
    })
      .then(function(res) {
        return res.text();
      })
      .then(
        function(res) {
          let parsedBody = JSON.parse(res);
          if (parsedBody.success)
            this.setState({
              messageText: ""
            });
        }.bind(this)
      );
  }
  handleSignout(event) {
    event.preventDefault();
    fetch('/signout',{
      method:'POST',
      credentials: "same-origin",
    })
    .then(function(res){
      return res.text();
    })
    .then(function(res){
      let parsedRes = JSON.parse(res);
      if(parsedRes.success)
        this.props.dispatch({type:"signOut"});
    }.bind(this));
  }
  handleChangeMessageText(event) {
    this.setState({ messageText: event.target.value });
  }
  getFormatedMesseges() {
    return this.state.messages.map(function(msg, index) {
      return (
        <div key={index.toString()}>
          <b>{msg.username}</b>
          {" : "}
          <span>{msg.messageBody}</span>
          {" / "}
          <span>at: {msg.subtime}</span>
        </div>
      );
    });
  }
  render() {
    let mainForm = (
      <div>
        <AuthenticationForm subject="SignUp" submitLink="/signup" />
        <AuthenticationForm subject="Login" submitLink="/login" />
      </div>
    );
    let chatForm = (
      <div>
        <div className="topcontainer">
          <div>{this.getFormatedMesseges()}</div>
          <div>
            {this.state.activeUsers.map((element, key) => {
              return <h3 key={key}>{"          " + element.username}</h3>;
            })}
          </div>
        </div>
        <div className="botcontainer">
          <form onSubmit={this.handleSubmiteMessage}>
            <div className="chat">
              <input
                type="text"
                value={this.state.messageText}
                onChange={this.handleChangeMessageText}
              />
              <input type="submit" />
            </div>
          </form>
          <button onClick={this.handleSignout}>Signout</button>
        </div>
      </div>
    );

    let disconnected = <h1>Server Went Off !</h1>;

    let usedForm = mainForm;
    if (this.props.signedIn) usedForm = chatForm;
    if (!this.props.connected) usedForm = disconnected;
    return <div className="App">{usedForm}</div>;
  }
}

let mapStateToProps = function(state) {
  return {
    signedIn: state.signedIn,
    connected: state.connected
  };
};

let ConnectedApp = connect(mapStateToProps)(App);

export default ConnectedApp;
