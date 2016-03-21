import React from 'react';
import http from 'axios';
import Table from './Table';
import Form from './Form';
import {Input} from 'react-bootstrap';
import moment from 'moment';
import config from '../../cms.config.json';
import page from 'page';
import {connect} from 'react-redux';

class RelationSelect extends React.Component {
   constructor() {
      super();
      this.state = {
         items: []
      };
   }
   componentDidMount() {
      http.get('/' + this.props.field.contentType)
      .then(response => this.setState({items: response.data}));
   }
   render() {
      const {field, basicProps} = this.props;
      return (
         <Input type="select" {...basicProps}>
            {this.state.items.map(_ =>
            <option key={_.id} value={_.id}>{_[field.displayField]}</option>
            )}
         </Input>
      );
   }
}

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

      if (field.type === 'relation')
         return <RelationSelect basicProps={basicProps} field={field} />

      return (
         <Input type={field.type} {...basicProps} {...this.getSpecificProps()} />
      );
   }
}

class ContentTypeEditor extends React.Component {
   constructor() {
      super();

      this.state = {
         items: undefined
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
   shouldComponentUpdate(props, state) {
      return props.type.id !== this.props.type.id
         || state.items && !this.state.items
         || state.items.length !== this.state.items.length;
   }
   componentWillReceiveProps(props) {
      if (props.type.id !== this.props.type.id)
         this.setState({items: undefined});
   }
   componentDidMount() {
      this.update();
   }
   componentDidUpdate() {
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
         <div style={{marginTop: '1em'}}>
            <Form ref="form" type={type.id} onCreated={this.update.bind(this)}>
               {type.fields.map(f => <InputField key={f.id} field={f} /> )}
            </Form>
            {items ?
            <Table
               headers={tableColumns}
               items={this.state.items}
               sortBy="name">
               {this.renderItem.bind(this)}
            </Table>
            : <p>Loading...</p>}
         </div>
      );
   }
}

class AdminInterface extends React.Component {
   constructor() {
      super();

      config.contentTypes.filter(_ => !_.hidden)
      .forEach((_, i) => {
         const url = '/admin/' + _.id;
         page(url, e => {
            this.props.dispatch({
               type: 'SET_CURRENT_PAGE',
               page: _.id
            });
         });

         if (i === 0)
            page('/admin', url);
      });

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
   componentDidMount() {
      page();
   }
   render() {
      const {page} = this.props;
      const contentType = config.contentTypes.find(_ => _.id === page);
      return (
         <div>
            <div style={{position: 'absolute', top: '1em', right: '1em'}}>
               <button className="btn btn-primary" disabled={this.state.updatingRestaurants} onClick={this.updateMenus.bind(this)}>{this.state.updatingRestaurants ? 'Updating...' : 'Update menus'}</button>
               <button className="btn btn-warning" onClick={this.logOut.bind(this)} style={{marginLeft: '1em'}}>Log out</button>
            </div>

            <ul className="nav nav-tabs" style={{marginTop: '3em'}}>
               {config.contentTypes.filter(_ => !_.hidden).map(_ =>
                  <li key={_.id} role="presentation" className={_.id === page ? 'active' : undefined}>
                     <a href={'/admin/' + _.id}>{_.title}</a>
                  </li>
               )}
            </ul>

            {contentType ?
            <ContentTypeEditor type={contentType} />
            : <p>Content type not found.</p>
            }
         </div>
      );
   }
}

export default connect(
   state => ({
      page: state.currentPage
   })
)(AdminInterface);
