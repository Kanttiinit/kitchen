import React from 'react';

export default class Table extends React.Component {
   constructor() {
      super();

      this.state = {
         order: {
            key: 'name',
            reverse: false
         }
      };
   }
   changeOrder(column) {
      this.setState({
         order: {
            key: column.key,
            reverse: this.state.order.key === column.key ? !this.state.order.reverse : false
         }
      });
   }
   render() {
      const {headers, items, children} = this.props;
      const {order} = this.state;
      return (
      <table className="table table-striped table-hover">
         <thead>
            <tr>
               {headers.map(h =>
               <th key={h.key} style={{cursor: 'pointer'}} onClick={this.changeOrder.bind(this, h)}>
                  {h.title + ' '}
                  {h.key === order.key && order.reverse ? <span>&darr;</span> : h.key === order.key ? <span>&uarr;</span> : ''}
               </th>
               )}
            </tr>
         </thead>
         <tbody>
            {items
               .sort((a, b) => (order.reverse ? -1 : 1) * (b[order.key] > a[order.key] ? -1 : 1))
               .map(item => children(item))
            }
         </tbody>
      </table>
      );
   }
}
