const Input = ReactBootstrap.Input;

const Form = React.createClass({
   getInitialState() {
      return {};
   },
   save(event) {
      event.preventDefault();
      const type = this.props.type;
      const promise = this.state.editing
         ? axios.put('/' + type + 's/' + this.refs.id.refs.input.value, this.refs.form.serialize({ignore: ['id']}))
         : axios.post('/' + type + 's', this.refs.form.serialize({ignore: ['id']}));

      promise.then(response => {
         this.refs.form.reset();
         this.toggle();
         this.props.onCreated(response.data);
      });
   },
   prepareForEditing(data) {
      this.setState({editing: true, showForm: true});
      this.refs.form.populate(data);
   },
   cancelEditing() {
      this.setState({editing: false, showForm: false});
      this.refs.form.reset();
   },
   toggle() {
      this.setState({showForm: !this.state.showForm});
   },
   render() {
      const {type, children} = this.props;
      const {editing, showForm} = this.state;
      return (
         <div className="panel panel-success">
            <div className="panel-heading" onClick={this.toggle}>{editing ? 'Edit' : 'New'} {type}</div>
            <div className={'panel-body' + (showForm ? '' : ' hide')}>
               <form ref="form" onSubmit={this.save}>
                  {children}
                  <Input ref="id" type="hidden" name="id" />
                  <button type="submit" className="btn btn-primary">{editing ? 'Save' : 'Create'}</button>&nbsp;
                  {editing ? <button onClick={this.cancelEditing} className="btn btn-warning">Cancel</button> : null}
               </form>
            </div>
         </div>
      );
   }
});

const Table = React.createClass({
   render() {
      const {headers, data, renderItem, sortBy} = this.props;
      let items = sortBy ? data.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1) : data;
      return (
      <table className="table table-striped table-hover">
         <thead>
            <tr>{headers.map(h => <th>{h}</th>)}</tr>
         </thead>
         <tbody>
            {items.map(item => renderItem(item))}
         </tbody>
      </table>
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
   edit(type, item) {
      this.refs[type + 'Form'].prepareForEditing(item);
   },
   delete(type, item) {
      if (confirm('Are you sure?'))
         axios.delete('/' + type + 's/' + item.id)
         .then(response => {
            this.updateAreas();
            this.updateRestaurants();
         });
   },
   fetchMenu(restaurant) {
      axios.post('/restaurants/fetch/' + restaurant.id)
      .then(() => console.log('asd'));
   },
   renderAreaItem(area) {
      return (
         <tr>
            <td>{area.id}</td>
            <td>{area.name}</td>
            <td>{area.image}</td>
            <td>{area.latitude}, {area.longitude}</td>
            <td>{area.locationRadius}</td>
            <td>
               <button onClick={this.edit.bind(this, 'area', area)} className="btn btn-xs btn-warning">Edit</button>&nbsp;
               <button onClick={this.delete.bind(this, 'area', area)} className="btn btn-xs btn-danger">Delete</button>
            </td>
         </tr>
      );
   },
   renderRestaurantItem(restaurant) {
      return (
         <tr>
            <td>{restaurant.id}</td>
            <td>{restaurant.Area ? restaurant.Area.name : 'none'}</td>
            <td>{restaurant.name}</td>
            <td>{restaurant.image}</td>
            <td>{restaurant.url ? <a href={restaurant.url} target="_blank">Open</a> : null}</td>
            <td>{restaurant.menuUrl ? <a href={restaurant.menuUrl} target="_blank">Open</a> : null}</td>
            <td>{restaurant.openingHours}</td>
            <td>{restaurant.latitude}, {restaurant.longitude}</td>
            <td>
               <button onClick={this.fetchMenu.bind(this, restaurant)} className="btn btn-xs btn-primary">Fetch menu</button>&nbsp;
               <button onClick={this.edit.bind(this, 'restaurant', restaurant)} className="btn btn-xs btn-warning">Edit</button>&nbsp;
               <button onClick={this.delete.bind(this, 'restaurant', restaurant)} className="btn btn-xs btn-danger">Delete</button>
            </td>
         </tr>
      );
   },
   render() {
      return (
         <div>
            <button className="btn btn-warning pull-right" onClick={this.logOut}>Log out</button>
            <h1>Areas</h1>
            <Form ref="areaForm" type="area" onCreated={this.updateAreas}>
               <Input type="text" label="Name" name="name" />
               <Input type="text" label="Image" name="image" />
               <Input type="number" label="Latitude" name="latitude" step="0.0000001" />
               <Input type="number" label="Longitude" name="longitude" step="0.0000001" />
               <Input type="number" label="Location radius (in kilometers)" name="locationRadius" step="0.1" min="0.5" />
            </Form>
            <Table
               headers={['ID', 'Name', 'Image', 'Location', 'Location radius', '']}
               data={this.state.areas}
               renderItem={this.renderAreaItem}
               sortBy="name" />
            <h1>Restaurants</h1>
               <Form ref="restaurantForm" type="restaurant" onCreated={this.updateRestaurants}>
                  <Input type="text" label="Name" name="name" />
                  <Input type="text" label="Image" name="image" />
                  <Input type="url" label="URL" name="url" />
                  <Input type="url" label="Menu URL" name="menuUrl" />
                  <Input type="text" label="Opening Hours" name="openingHours" />
                  <Input type="number" label="Latitude" name="latitude" step="0.0000001" />
                  <Input type="number" label="Longitude" name="longitude" step="0.0000001" />
                  <Input type="select" label="Area" name="AreaId">
                     {this.state.areas.map(area => <option value={area.id}>{area.name}</option>)}
                  </Input>
               </Form>
            <Table
               headers={['ID', 'Area', 'Name', 'Image', 'URL', 'Menu URL', 'Opening Hours', 'Location', '']}
               data={this.state.restaurants}
               renderItem={this.renderRestaurantItem}
               sortBy="name" />
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
      axios.get('/admin/login').then(response => this.setLoggedIn(response.data.loggedIn));
   },
   setLoggedIn(loggedIn) {
      this.setState({loggedIn});
   },
   render() {
      if (this.state.loggedIn === undefined)
         return null;

      if (this.state.loggedIn)
         return <AdminInterface setLoggedIn={this.setLoggedIn.bind(this)} />;

      return <LoginForm setLoggedIn={this.setLoggedIn.bind(this)} />;
   }
});

ReactDOM.render(<BaseView />, document.querySelector('.container'));

HTMLFormElement.prototype.populate = function(values) {
   for (var name in values) {
      var element = this.querySelector('[name=' + name + ']');
      if (element)
         element.value = values[name];
   }
};

HTMLFormElement.prototype.serialize = function(options) {
   options = options || {};
   options.ignore = options.ignore || [];
   return [].slice.call(this.elements).reduce((obj, element) => {
      if (element.nodeName !== 'BUTTON' && options.ignore.indexOf(element.name) === -1 && element.value) {
         obj[element.name] = isNaN(element.value) ? element.value : Number(element.value);
      }
      return obj;
   }, {});
};
