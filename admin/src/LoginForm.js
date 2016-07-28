import React from 'react';
import http from 'axios';

export default class LoginForm extends React.Component {
   constructor() {
      super();
      this.state = {password: ''};
   }
   submit(event) {
      event.preventDefault();
      http.post('/admin/login', {
         password: this.state.password
      }).then(response => {
         if (!response.data.loggedIn) {
            alert('wrong password');
         }
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
