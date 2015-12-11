const Form = React.createClass({
   getInitialState() {
      return {};
   },
   create(event) {
      event.preventDefault();
      const type = this.props.type;
      const form = $('#' + type + '-form');
      const params = form.serializeArray().reduce((o, v) => { o[v.name] = v.value; return o; }, {});
      $.post('/api/' + type + 's', params, response => {
         form[0].reset();
         this.toggle();
         this.props.onCreated(response);
      });
   },
   toggle() {
      this.setState({showForm: !this.state.showForm});
   },
   render() {
      const {type, fields} = this.props;
      return (
         <div className="panel panel-success">
            <div className="panel-heading" onClick={this.toggle}>New {type}</div>
            <div className={'panel-body' + (this.state.showForm ? '' : ' hide')}>
               <form id={type + '-form'} onSubmit={this.create}>
                  {fields.map(field =>
                     (<div className="form-group">
                        <label for="area-name">{field.title}</label>
                        <input type={field.type || 'text'} {...field.attributes} name={field.name || field.title.toLowerCase()} className="form-control" />
                     </div>)
                  )}
                  <button className="btn btn-primary">Create</button>
               </form>
            </div>
         </div>
      );
   }
});

const AdminInterface = React.createClass({
   getInitialState() {
      return {
         areas: [],
         restaurants: []
      };
   },
   componentDidMount() {
      this.updateAreas();
      this.updateRestaurants();
   },
   updateAreas() {
      $.get('/api/areas', response => this.setState({areas: response}));
   },
   updateRestaurants() {
      $.get('/api/restaurants', response => this.setState({restaurants: response}));
   },
   logOut() {
      $.post('/admin/logout', () => {
         this.props.setLoggedIn(false);
      });
   },
   edit(area) {

   },
   delete(type, item) {
      if (confirm('Are you sure?'))
         $.ajax({
            type: 'DELETE',
            url: '/api/' + type + 's/' + item.id,
            success: response => {
               this.updateAreas();
               this.updateRestaurants();
            }
         });
   },
   render() {
      return (
         <div>
            <button className="btn btn-warning pull-right" onClick={this.logOut}>Log out</button>
            <h1>Areas</h1>
            <Form type="area" onCreated={this.updateAreas} fields={[
               {title: 'Name'},
               {title: 'Image'},
               {title: 'Latitude', type: 'number', attributes: {step: '0.0000001'}},
               {title: 'Longitude', type: 'number', attributes: {step: '0.0000001'}},
               {title: 'Location radius (in kilometers)', type: 'number', attributes: {step: 0.1, min: 0.5}}
            ]} />
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
                           <button onClick={this.edit.bind(this, 'area', area)} className="btn btn-xs btn-primary">Edit</button>&nbsp;
                           <button onClick={this.delete.bind(this, 'area', area)} className="btn btn-xs btn-danger">Delete</button>
                        </td>
                     </tr>)
                  )}
               </tbody>
            </table>
            <h1>Restaurants</h1>
               <Form type="restaurant" onCreated={this.updateRestaurants} fields={[
                  {title: 'Name'},
                  {title: 'Image'},
                  {title: 'URL'},
                  {title: 'Menu URL', name: 'menuUrl'},
                  {title: 'Opening Hours', name: 'openingHours'},
                  {title: 'Latitude', type: 'number', attributes: {step: 0.0000001}},
                  {title: 'Longitude', type: 'number', attributes: {step: 0.0000001}}
               ]} />
            <table className="table table-striped table-hover">
               <thead>
                  <tr>
                     <th>Name</th>
                     <th>Image</th>
                     <th>URL</th>
                     <th>Menu URL</th>
                     <th>Opening Hours</th>
                     <th>Location</th>
                  </tr>
               </thead>
               <tbody>
                  {this.state.restaurants.map(restaurant =>
                     (<tr>
                        <td>{restaurant.name}</td>
                        <td>{restaurant.image}</td>
                        <td>{restaurant.url}</td>
                        <td>{restaurant.menuUrl}</td>
                        <td>{restaurant.openingHours}</td>
                        <td>{restaurant.latitude}, {restaurant.longitude}</td>
                        <td>
                           <button onClick={this.edit.bind(this, 'restaurant', restaurant)} className="btn btn-xs btn-primary">Edit</button>&nbsp;
                           <button onClick={this.delete.bind(this, 'restaurant', restaurant)} className="btn btn-xs btn-danger">Delete</button>
                        </td>
                     </tr>)
                  )}
               </tbody>
            </table>
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
      if (this.state.loggedIn)
         return <AdminInterface setLoggedIn={this.setLoggedIn.bind(this)} />;

      return <LoginForm setLoggedIn={this.setLoggedIn.bind(this)} />;
   }
});

ReactDOM.render(
  <BaseView />,
  document.querySelector('.container')
);
