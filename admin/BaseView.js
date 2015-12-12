const Input = ReactBootstrap.Input;

const Form = React.createClass({
   getInitialState() {
      return {};
   },
   create(event) {
      event.preventDefault();
      const type = this.props.type;
      const form = document.querySelector('#' + type + '-form');
      axios.post('/' + type + 's', form.serialize())
      .then(response => {
         form.reset();
         this.toggle();
         this.props.onCreated(response.data);
      });
   },
   toggle() {
      this.setState({showForm: !this.state.showForm});
   },
   render() {
      const {type, children} = this.props;
      return (
         <div className="panel panel-success">
            <div className="panel-heading" onClick={this.toggle}>New {type}</div>
            <div className={'panel-body' + (this.state.showForm ? '' : ' hide')}>
               <form id={type + '-form'} onSubmit={this.create}>
                  {children}
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
      axios.get('/areas').then(response => this.setState({areas: response.data}));
   },
   updateRestaurants() {
      axios.get('/restaurants').then(response => this.setState({restaurants: response.data}));
   },
   logOut() {
      axios.post('/admin/logout').then(response => {
         this.props.setLoggedIn(false);
      });
   },
   edit(area) {

   },
   delete(type, item) {
      if (confirm('Are you sure?'))
         axios.delete('/' + type + 's/' + item.id)
         .then(response => {
            this.updateAreas();
            this.updateRestaurants();
         });
   },
   render() {
      return (
         <div>
            <button className="btn btn-warning pull-right" onClick={this.logOut}>Log out</button>
            <h1>Areas</h1>
            <Form type="area" onCreated={this.updateAreas}>
               <Input type="text" label="Name" name="name" />
               <Input type="text" label="Image" name="image" />
               <Input type="number" label="Latitude" name="latitude" step="0.0000001" />
               <Input type="number" label="Longitude" name="longitude" step="0.0000001" />
               <Input type="number" label="Location radius (in kilometers)" name="locationRadius" step="0.1" min="0.5" />
            </Form>
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
               <Form type="restaurant" onCreated={this.updateRestaurants}>
                  <Input type="text" label="Name" name="name" />
                  <Input type="text" label="Image" name="image" />
                  <Input type="url" label="URL" name="url" />
                  <Input type="url" label="Menu URL" name="menuUrl" />
                  <Input type="text" label="Opening Hours" name="openingHours" />
                  <Input type="number" label="Latitude" name="latitude" step="0.0000001" />
                  <Input type="number" label="Longitude" name="longitude" step="0.0000001" />
               </Form>
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
      axios.post('/admin/login', {
         password: this.state.password
      }).then(response => {
         this.props.setLoggedIn(response.data.loggedIn);
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
      axios.get('/admin/login').then(response => {
         this.setLoggedIn(response.data.loggedIn);
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

ReactDOM.render(<BaseView />, document.querySelector('.container'));

HTMLFormElement.prototype.serialize = function() {
   var valueFunctions = {
      'INPUT/number': function(element) { return Number(element.value); },
      'INPUT/radio': function(element) { return true; },
      'INPUT/checkbox': function(element) { return element.checked; }
   };
   return [].slice.call(this.querySelectorAll('input, select, textarea'))
   .reduce((obj, element) => {
      var valueFunction = valueFunctions[element.nodeName + '/' + element.type];
      obj[element.name] = valueFunction ? valueFunction(element) : element.value;
      return obj;
   }, {});
};
