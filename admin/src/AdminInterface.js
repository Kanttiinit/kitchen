import React from 'react';
import http from 'axios';
import Table from './Table';
import Form from './Form';
import {Input} from 'react-bootstrap';

export default class AdminInterface extends React.Component {
   constructor() {
      super();

      this.state = {
         areas: [],
         restaurants: [],
         favorites: []
      };
   }
   componentDidMount() {
      this.updateAreas();
      this.updateRestaurants();
      this.updateFavorites();
   }
   updateAreas() {
      http.get('/areas').then(response => this.setState({areas: response.data}));
   }
   updateRestaurants() {
      http.get('/restaurants').then(response => this.setState({restaurants: response.data}));
   }
   updateFavorites() {
      http.get('/favorites').then(response => this.setState({favorites: response.data}));
   }
   logOut() {
      http.post('/admin/logout').then(response => {
         this.props.setLoggedIn(false);
      });
   }
   updateMenus() {
      this.setState({updatingRestaurants: true});
      http.post('/restaurants/update')
      .then(_ => this.setState({updatingRestaurants: false}));
   }
   edit(type, item) {
      this.refs[type + 'Form'].prepareForEditing(item);
   }
   delete(type, item) {
      if (confirm('Are you sure?'))
         http.delete('/' + type + 's/' + item.id)
         .then(response => {
            this.updateAreas();
            this.updateRestaurants();
            this.updateFavorites();
         });
   }
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
   }
   renderRestaurantItem(restaurant) {
      const formatUrl = (url, date) => {
      	date = date || moment();
      	return url
      		.replace('%year%', date.format('YYYY'))
      		.replace('%month%', date.format('MM'))
      		.replace('%day%', date.format('DD'));
      };

      return (
         <tr>
            <td>{restaurant.id}</td>
            <td>{restaurant.Area ? restaurant.Area.name : 'none'}</td>
            <td>{restaurant.name}</td>
            <td>{restaurant.image}</td>
            <td>{restaurant.url ? <a href={restaurant.url} target="_blank">Open</a> : null}</td>
            <td>{restaurant.menuUrl ? <a href={formatUrl(restaurant.menuUrl)} target="_blank">Open</a> : null}</td>
            <td>{restaurant.openingHours && restaurant.openingHours.length ? 'defined' : 'undefined'}</td>
            <td>{restaurant.address}</td>
            <td>
               {restaurant.latitude && restaurant.longitude ?
               <a href={'https://www.google.fi/maps/place/' + restaurant.latitude + ',' + restaurant.longitude}>
                  {restaurant.latitude}, {restaurant.longitude}
               </a>
               : null}
            </td>
            <td>
               &nbsp;<button onClick={this.edit.bind(this, 'restaurant', restaurant)} className="btn btn-xs btn-warning">Edit</button>&nbsp;
               <button onClick={this.delete.bind(this, 'restaurant', restaurant)} className="btn btn-xs btn-danger">Delete</button>
            </td>
         </tr>
      );
   }
   renderFavoriteItem(favorite) {
      return (
         <tr>
            <td>{favorite.id}</td>
            <td>{favorite.name}</td>
            <td>{favorite.regexp}</td>
            <td>{favorite.icon}</td>
            <td>
               &nbsp;<button onClick={this.edit.bind(this, 'favorite', favorite)} className="btn btn-xs btn-warning">Edit</button>&nbsp;
               <button onClick={this.delete.bind(this, 'favorite', favorite)} className="btn btn-xs btn-danger">Delete</button>
            </td>
         </tr>
      );
   }
   render() {
      return (
         <div>
            <button className="btn btn-warning pull-right" onClick={this.logOut.bind(this)} style={{marginLeft: '1em'}}>Log out</button>
            <button className="btn btn-primary pull-right" disabled={this.state.updatingRestaurants} onClick={this.updateMenus.bind(this)}>{this.state.updatingRestaurants ? 'Updating...' : 'Update menus'}</button>
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
               sortBy="name">
               {this.renderAreaItem.bind(this)}
            </Table>
            <h1>Restaurants</h1>
            <Form ref="restaurantForm" type="restaurant" onCreated={this.updateRestaurants.bind(this)}>
               <Input type="text" label="Name" name="name" />
               <Input type="text" label="Image" name="image" />
               <Input type="url" label="URL" name="url" />
               <Input type="url" label="Menu URL" name="menuUrl" />
               <Input type="text" label="Opening Hours" name="openingHours" />
               <Input type="text" label="Address" name="address" />
               <Input type="number" label="Latitude" name="latitude" step="0.0000001" />
               <Input type="number" label="Longitude" name="longitude" step="0.0000001" />
               <Input type="select" label="Area" name="AreaId">
                  {this.state.areas.map(area => <option key={area.id} value={area.id}>{area.name}</option>)}
               </Input>
            </Form>
            <Table
               headers={['ID', 'Area', 'Name', 'Image', 'URL', 'Menu URL', 'Opening Hours', 'Address', 'Location', '']}
               data={this.state.restaurants}>
               {this.renderRestaurantItem.bind(this)}
            </Table>
            <h1>Favorites</h1>
            <Form ref="favoriteForm" type="favorite" onCreated={this.updateFavorites.bind(this)}>
               <Input type="text" label="Name" name="name" />
               <Input type="text" label="Regular expression" name="regexp" />
               <Input type="text" label="Icon" name="icon" />
            </Form>
            <Table
               headers={['ID', 'Name', 'Regular Expression', 'Icon', '']}
               data={this.state.favorites}>
               {this.renderFavoriteItem.bind(this)}
            </Table>
         </div>
      );
   }
}
