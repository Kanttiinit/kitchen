const AdminInterface = React.createClass({
   getInitialState() {
      return {
         areas: []
      };
   },
   componentDidMount() {
      this.updateAreas();
   },
   updateAreas() {
      $.get('/api/areas', response => this.setState({areas: response}));
   },
   logOut() {
      $.post('/admin/logout', () => {
         this.props.setLoggedIn(false);
      });
   },
   createArea(event) {
      event.preventDefault();
      const form = $('#area-form');
      const params = form.serializeArray().reduce((o, v) => { o[v.name] = v.value; return o; }, {});
      $.post('/api/areas/', params, response => {
         form[0].reset();
         this.toggle('showAreaForm');
         this.updateAreas();
      });
   },
   editArea(area) {

   },
   deleteArea(area) {
      if (confirm('Are you sure?'))
         $.ajax({type: 'DELETE', url: '/api/areas/' + area.id})
         .then(response => {
            this.updateAreas();
         });
   },
   toggle(what) {
      return () => {
         const o = {};
         o[what] = !this.state[what];
         this.setState(o);
      };
   },
   render() {
      return (
         <div>
            <button className="btn btn-warning pull-right" onClick={this.logOut}>Log out</button>
            <h1>Areas</h1>
            <div className="panel panel-success">
               <div className="panel-heading" onClick={this.toggle('showAreaForm')}>New area</div>
               <div className={'panel-body' + (this.state.showAreaForm ? '' : ' hide')}>
                  <form id="area-form" onSubmit={this.createArea}>
                     <div className="form-group">
                        <label for="area-name">Name</label>
                        <input type="text" name="name" className="form-control" />
                     </div>
                     <div className="form-group">
                        <label for="area-name">Image</label>
                        <input type="text" name="image" className="form-control" />
                     </div>
                     <div className="form-group">
                        <label for="area-name">Latitude</label>
                        <input type="number" min="0" step="0.0000001" name="latitude" className="form-control" />
                     </div>
                     <div className="form-group">
                        <label for="area-name">Longitude</label>
                        <input type="number" min="0" step="0.0000001" name="longitude" className="form-control" />
                     </div>
                     <div className="form-group">
                        <label for="area-name">Location radius (in kilometers)</label>
                        <input type="number" step="0.1" min="1" name="locationRadius" className="form-control" />
                     </div>
                     <button className="btn btn-primary">Create</button>
                  </form>
               </div>
            </div>
            <table className="table table-striped table-hover">
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Image</th>
                     <th>Location</th>
                     <th>Location radius</th>
                     <th></th>
                  </tr>
               </thead>
               <tbody>
                  {this.state.areas.map(area =>
                     (<tr>
                        <td>{area.name}</td>
                        <td>{area.image}</td>
                        <td>{area.latitude}, {area.longitude}</td>
                        <td>{area.locationRadius}</td>
                        <td>
                           <button onClick={this.editArea.bind(this, area)} className="btn btn-xs btn-primary">Edit</button>&nbsp;
                           <button onClick={this.deleteArea.bind(this, area)} className="btn btn-xs btn-danger">Delete</button>
                        </td>
                     </tr>)
                  )}
               </tbody>
            </table>
            <h1>Restaurants</h1>
         </div>
      );
   }
});

const LoginForm = React.createClass({
   submit(event) {
      event.preventDefault();
      $.post('/admin/login', {
         password: this.state.password
      }, response => {
         this.props.setLoggedIn(response.loggedIn);
      });
   },
   passwordChanged(event) {
      this.setState({password: event.target.value});
   },
   render() {
      return (
         <form className="form-inline" onSubmit={this.submit}>
            <h1>Log in</h1>
            <input className="form-control" type="password" onChange={this.passwordChanged} placeholder="Password" />&nbsp;
            <button type="submit" className="btn btn-primary">Log in</button>
         </form>
      );
   }
});

const BaseView = React.createClass({
   getInitialState() {
      return {loggedIn: undefined};
   },
   componentDidMount() {
      $.get('/admin/login', response => {
         this.setLoggedIn(response.loggedIn);
      });
   },
   setLoggedIn(loggedIn) {
      this.setState({loggedIn});
   },
   render() {
      if (this.state.loggedIn === undefined)
         return <p>Loading...</p>;

      if (this.state.loggedIn)
         return <AdminInterface setLoggedIn={this.setLoggedIn.bind(this)} />;

      return <LoginForm setLoggedIn={this.setLoggedIn.bind(this)} />;
   }
});

ReactDOM.render(
  <BaseView />,
  document.querySelector('.container')
);
