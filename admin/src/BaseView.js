import React from 'react';
import ReactDOM from 'react-dom';
import http from 'axios';
import LoginForm from './LoginForm';
import AdminInterface from './AdminInterface';
import models from './models';

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
      if (loggedIn) {
         this.changeModel(models[0]);
      }
   }
   logOut() {
      http.post('/admin/logout').then(response => {
         this.setLoggedIn(false);
      });
   }
   updateMenus() {
      this.setState({updatingRestaurants: true});
      http.post('/restaurants/update')
      .then(_ => this.setState({updatingRestaurants: false}));
   }
   changeModel(model = this.state.currentModel) {
      http.get('/' + model.name.toLowerCase())
      .then(response => {
         this.setState({
            currentModel: model,
            items: response.data
         });
      });
   }
   render() {
      if (this.state.loggedIn === undefined)
         return null;

      if (this.state.loggedIn) {
         const {currentModel, items} = this.state;
         return (
            <div>
               <br />
               <ul className="nav nav-tabs">
                  {models.map(m =>
                  <li key={m.name} className={m === currentModel ? 'active' : ''}>
                     <a href="#" onClick={this.changeModel.bind(this, m)}>{m.name}</a>
                  </li>
                  )}
               </ul>
               <div style={{position: 'absolute', top: 0, right: 0, padding: '0.5em'}}>
                  <button className="btn btn-primary btn-sm" disabled={this.state.updatingRestaurants} onClick={this.updateMenus.bind(this)}>{this.state.updatingRestaurants ? 'Updating...' : 'Update menus'}</button>
                  &nbsp;
                  <button className="btn btn-warning btn-sm" onClick={this.logOut.bind(this)}>Log out</button>
               </div>
               <AdminInterface onUpdate={() => this.changeModel()} model={currentModel} items={items} />
            </div>
         );
      }

      return <LoginForm setLoggedIn={this.setLoggedIn.bind(this)} />;
   }
}

ReactDOM.render(<BaseView />, document.querySelector('.container'));
