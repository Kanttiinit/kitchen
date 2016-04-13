import React from 'react';
import http from 'axios';
import {connect} from 'redux-nimble';

class LoginForm extends React.Component {
   submit(event) {
      event.preventDefault();
      http.post('/admin/login', {
         password: this.state.password
      }).then(response => {
         this.props.setLoggedIn(response.data.loggedIn);
      });
   }
   passwordChanged(event) {
      this.setState({password: event.target.value});
   }
   render() {
      return (
         <form className="form-inline" onSubmit={this.submit.bind(this)}>
            <h1>Log in</h1>
            <input className="form-control" type="password" onChange={this.passwordChanged.bind(this)} placeholder="Password" />&nbsp;
            <button type="submit" className="btn btn-primary">Log in</button>
         </form>
      );
   }
}

export default connect([], ['setLoggedIn'])(LoginForm);
