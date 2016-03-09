import React from 'react';
import ReactDOM from 'react-dom';
import http from 'axios';
import LoginForm from './LoginForm';
import AdminInterface from './AdminInterface';

class BaseView extends React.Component {
   constructor() {
      super();

      this.state = {loggedIn: undefined};
   }
   componentDidMount() {
      http.get('/admin/login').then(response => this.setLoggedIn(response.data.loggedIn));
   }
   setLoggedIn(loggedIn) {
      this.setState({loggedIn});
   }
   render() {
      if (this.state.loggedIn === undefined)
         return null;

      if (this.state.loggedIn)
         return <AdminInterface setLoggedIn={this.setLoggedIn.bind(this)} />;

      return <LoginForm setLoggedIn={this.setLoggedIn.bind(this)} />;
   }
}

ReactDOM.render(<BaseView />, document.querySelector('.container'));
