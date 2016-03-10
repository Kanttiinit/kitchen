import React from 'react';
import http from 'axios';
import Table from './Table';
import Form from './Form';
import {Input} from 'react-bootstrap';
import moment from 'moment';
import config from '../../cms.config.json';

class InputField extends React.Component {
   getSpecificProps() {
      const {field} = this.props;

      switch (field.type) {
         case 'text':
            return {
               type: field.format || 'text',
               pattern: field.pattern,
               minLength: field.min,
               maxLength: field.max
            };
         case 'number':
            return {
               max: field.max,
               min: field.min,
               step: field.step
            };
         default:
            return {};
      }
   }
   render() {
      const {field} = this.props;

      const basicProps = {
         key: field.id,
         label: field.title,
         name: field.id
      };

      if (field.type === 'relation') {
         return (
            <Input type="select" {...basicProps}>

            </Input>
         );
      }

      return (
         <Input type={field.type} {...basicProps} {...this.getSpecificProps()} />
      );
   }
}

class ContentTypeEditor extends React.Component {
   constructor() {
      super();

      this.state = {
         items: []
      };
   }
   update() {
      http.get('/' + this.props.type.id)
      .then(response => this.setState({items: response.data}));
   }
   edit(item) {
      this.refs['form'].prepareForEditing(item);
   }
   delete(item) {
      if (confirm('Are you sure?'))
         http.delete('/' + this.props.type.id + '/' + item.id)
         .then(response => this.update());
   }
   componentDidMount() {
      this.update();
   }
   renderItem(item) {
      return (
         <tr key={item.id}>
            <td>{item.id}</td>
            {this.props.type.fields.filter(_ => !_.hideInListing).map(f =>
            <td key={f.id}>{item[f.id]}</td>
            )}
            <td>
               <button onClick={this.edit.bind(this, item)} className="btn btn-xs btn-warning">Edit</button>&nbsp;
               <button onClick={this.delete.bind(this, item)} className="btn btn-xs btn-danger">Delete</button>
            </td>
         </tr>
      );
   }
   render() {
      const {type} = this.props;
      const {items} = this.state;
      const tableColumns = [{key: 'id', title: 'ID'}]
         .concat(
            type.fields
            .filter(_ => !_.hideInListing)
            .map(f => ({key: f.id, title: f.title}))
         )
         .concat([{key: 'actions', title: 'Actions'}]);
      return (
         <div>
            <h1>{type.title}</h1>
            <Form ref="form" type={type.id} onCreated={this.update.bind(this)}>
               {type.fields.map(f => <InputField key={f.id} field={f} /> )}
            </Form>
            <Table
               headers={tableColumns}
               items={this.state.items}
               sortBy="name">
               {this.renderItem.bind(this)}
            </Table>
         </div>
      );
   }
}

export default class AdminInterface extends React.Component {
   constructor() {
      super();

      this.state = {};
   }
   logOut() {
      http.post('/admin/logout').then(_ => this.props.setLoggedIn(false));
   }
   updateMenus() {
      this.setState({updatingRestaurants: true});
      http.post('/restaurants/update')
      .then(_ => this.setState({updatingRestaurants: false}));
   }
   render() {
      return (
         <div>
            <button className="btn btn-warning pull-right" onClick={this.logOut.bind(this)} style={{marginLeft: '1em'}}>Log out</button>
            <button className="btn btn-primary pull-right" disabled={this.state.updatingRestaurants} onClick={this.updateMenus.bind(this)}>{this.state.updatingRestaurants ? 'Updating...' : 'Update menus'}</button>

            {config.contentTypes.filter(t => !t.hidden).map(t => <ContentTypeEditor key={t.id} type={t} />)}
         </div>
      );
   }
}
