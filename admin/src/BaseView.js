import React from 'react';
import ReactDOM from 'react-dom';
import http from 'axios';
import AdminInterface from './AdminInterface';
import models from './models';

http.defaults.headers.common['X-FacebookToken'] = '';

class BaseView extends React.Component {
    constructor() {
      super();
      this.state = {};
    }
   updateMenus() {
      this.setState({updatingRestaurants: true});
      http.post('/admin/update-restaurants')
      .then(() => this.setState({updatingRestaurants: false}));
   }
   changeModel(model = this.state.currentModel) {
      http.get('/admin/' + model.name.toLowerCase())
      .then(response => {
         this.setState({
            currentModel: model,
            items: response.data
         });
      });
   }
   componentDidMount() {
     this.changeModel(models[0]);
   }
   render() {
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
              <button className="btn btn-warning btn-sm">Log out</button>
           </div>
           <AdminInterface onUpdate={() => this.changeModel()} model={currentModel} items={items} />
        </div>
     );
   }
}

ReactDOM.render(<BaseView />, document.querySelector('.container'));
