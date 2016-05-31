import React from 'react';
import http from 'axios';
import Table from './Table';
import moment from 'moment';
import Ace from 'react-ace';

import 'brace/mode/json';
import 'brace/theme/github';

export default class AdminInterface extends React.Component {
   constructor() {
      super();
      this.state = {items: []};
   }
   getBasePath() {
      return '/' + this.props.model.name.toLowerCase();
   }
   save() {
      const item = JSON.parse(this.state.editorContent);
      http.put(this.getBasePath() + '/' + item.id, item)
      .then(r => console.log(r));
   }
   edit(item) {
      this.setState({
         editorContent: JSON.stringify(item, null, '  '),
         mode: 'editing'
      });
   }
   delete(item) {
      if (confirm('Are you sure?')) {
         http.delete(this.getBasePath() + '/' + item.id)
         .then(response => this.update());
      }
   }
   renderItem(item) {
      return (
         <tr>
            {Object.keys(this.props.model.tableFields).map(key =>
            <td key={key}>{item[key]}</td>
            )}
            <td>
               &nbsp;<button onClick={this.edit.bind(this, item)} className="btn btn-xs btn-warning">Edit</button>&nbsp;
               <button onClick={this.delete.bind(this, item)} className="btn btn-xs btn-danger">Delete</button>
            </td>
         </tr>
      );
   }
   render() {
      const {model, items} = this.props;
      const {mode, editorContent} = this.state;

      if (!items) {
         return <p>Loading...</p>;
      }

      const headers = Object.keys(model.tableFields).map(key => model.tableFields[key]).concat('');

      return (
         <div>
            <h1>{model.name}</h1>
            {mode &&
            <div className="panel panel-primary">
               <div className="panel-heading">Editing</div>
               <div className="panel-body">
                  <Ace
                     width='100%'
                     height='200px'
                     onChange={editorContent => this.setState({editorContent})}
                     value={editorContent}
                     theme="github"
                     mode="json" />
                  <button onClick={this.save.bind(this)} className="btn btn-primary">Save</button>&nbsp;
                  <button onClick={() => this.setState({mode: undefined})} className="btn btn-warning">Cancel</button>
               </div>
            </div>
            }
            <Table
               headers={headers}
               data={items}>
               {this.renderItem.bind(this)}
            </Table>
         </div>
      );
   }
}
