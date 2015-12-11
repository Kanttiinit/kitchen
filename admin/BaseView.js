const AdminInterface = React.createClass({
   getInitialState() {
      return {};
   },
   logOut() {
      $.post('/admin/logout', () => {
         this.props.setLoggedIn(false);
      });
   },
   createArea(event) {
      event.preventDefault();
      const params = $('#area-form').serializeArray().reduce((o, v) => { o[v.name] = v.value; return o; }, {});
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
                        <input type="number" name="latitude" className="form-control" />
                     </div>
                     <div className="form-group">
                        <label for="area-name">Longitude</label>
                        <input type="number" name="longitude" className="form-control" />
                     </div>
                     <div className="form-group">
                        <label for="area-name">Location radius (in kilometers)</label>
                        <input type="number" name="locationRadius" className="form-control" />
                     </div>
                     <button className="btn btn-primary">Create</button>
                  </form>
               </div>
            </div>
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
            <input className="form-control" type="password" onChange={this.passwordChanged} placeholder="Password" />
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
