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
      messageText: ""
    };
    this.getFormatedMesseges = this.getFormatedMesseges.bind(this);
    this.handleSubmiteMessage = this.handleSubmiteMessage.bind(this);
    this.handleChangeMessageText = this.handleChangeMessageText.bind(this);
  }
  componentDidMount() {
    let update = function() {
      if (!this.props.signedIn) return;
      fetch("/getmessages", {
        method: "POST",
        body: JSON.stringify({
          sessionId: this.props.sessionId
        })
      })
        .then(function(res) {
          return res.text();
        })
        .then(
          function(res) {
            let parsedRes = JSON.parse(res);
            if (parsedRes.success) {
              this.setState({
                messages: parsedRes.messages
              });
            }
          }.bind(this)
        )
        .catch(() => {
          clearInterval(int);
          this.props.dispatch({
            type: "disconnect"
          });
        });
    }.bind(this);
    let int = setInterval(update, 1000);
  }
  handleSubmiteMessage(event) {
    event.preventDefault();
    let message = {
      sessionId: this.props.sessionId,
      message: this.state.messageText
    };
    fetch("/newmessage", {
      method: "POST",
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
              messages: parsedBody.messages,
              messageText: ""
            });
        }.bind(this)
      );
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
        <div className="topcontainer">{this.getFormatedMesseges()}</div>
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
    sessionId: state.sessionId,
    connected: state.connected
  };
};

let ConnectedApp = connect(mapStateToProps)(App);

export default ConnectedApp;
