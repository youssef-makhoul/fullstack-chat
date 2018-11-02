import React, { Component } from "react";
import { connect } from "react-redux";

class AuthenticationForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      usernameCurrentValue: "",
      passwordCurrentValue: "",
      operationFailed: false,
      operationResponse: ""
    };
    this.usernameChanged = this.usernameChanged.bind(this);
    this.passwordChanged = this.passwordChanged.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.retryOpertaion = this.retryOpertaion.bind(this);
  }
  usernameChanged(event) {
    this.setState({
      usernameCurrentValue: event.target.value
    });
  }
  passwordChanged(event) {
    this.setState({
      passwordCurrentValue: event.target.value
    });
  }
  retryOpertaion(event) {
    event.preventDefault();
    this.setState({ operationFailed: false });
  }
  onSubmit(event) {
    event.preventDefault();
    fetch(this.props.submitLink, {
      method: "POST",
      body: JSON.stringify({
        username: this.state.usernameCurrentValue,
        password: this.state.passwordCurrentValue
      })
    })
      .then(function(res) {
        return res.text();
      })
      .then(
        function(res) {
          let parsedBody = JSON.parse(res);
          let success = parsedBody.success;
          if (success) {
            this.props.dispatch({
              type: "updateSessionId",
              sessionId: parsedBody.sessionId
            });
          } else {
            this.setState({
              operationFailed: true,
              operationResponse: parsedBody.message,
              usernameCurrentValue: "",
              passwordCurrentValue: ""
            });
          }
        }.bind(this)
      );
  }
  render() {
    if (this.state.operationFailed)
      return (
        <div>
          <h1>{this.state.operationResponse}</h1>
          <button onClick={this.retryOpertaion}>Retry</button>
        </div>
      );
    return (
      <div>
        <h1>{this.props.subject}</h1>
        <form onSubmit={this.onSubmit}>
          <label htmlFor="username">User Name:</label>
          <input
            type="text"
            name="username"
            id="username"
            value={this.state.usernameCurrentValue}
            onChange={this.usernameChanged}
          />
          <br />
          <label htmlFor="password">Password:</label>
          <input
            type="text"
            name="password"
            id="password"
            value={this.state.passwordCurrentValue}
            onChange={this.passwordChanged}
          />
          <br />
          <input type="submit" value={this.props.subject} />
        </form>
      </div>
    );
  }
}


let ConnectedAuthenticationForm = connect()(AuthenticationForm);

export default ConnectedAuthenticationForm;
