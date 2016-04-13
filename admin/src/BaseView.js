import React from 'react';
import ReactDOM from 'react-dom';
import http from 'axios';
import LoginForm from './LoginForm';
import AdminInterface from './AdminInterface';
import store from './store';
import {connect, Provider} from 'redux-nimble';

class BaseView extends React.Component {
   componentDidMount() {
      http.get('/admin/login').then(response => this.props.setLoggedIn(response.data.loggedIn));
   }
   render() {
      if (this.props.loggedIn === undefined)
         return null;

      if (this.props.loggedIn)
         return <AdminInterface />;

      return <LoginForm />;
   }
}

const Base = connect(['loggedIn'], ['setLoggedIn'])(BaseView);

ReactDOM.render(
<Provider store={store}>
   <Base />
</Provider>
, document.querySelector('.container'));
