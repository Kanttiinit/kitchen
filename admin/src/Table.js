import React from 'react';

export default class Table extends React.Component {
   render() {
      const {headers, data, children, sortBy} = this.props;
      let items = sortBy ? data.sort((a, b) => a[sortBy] > b[sortBy] ? 1 : -1) : data;
      return (
      <table className="table table-striped table-hover">
         <thead>
            <tr>{headers.map(h => <th key={h}>{h}</th>)}</tr>
         </thead>
         <tbody>
            {items.map(item => children(item))}
         </tbody>
      </table>
      );
   }
}
