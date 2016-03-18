import {createStore} from 'redux';

function reducer(state = {}, action) {
   switch (action.type) {
      case 'SET_CURRENT_PAGE':
         return Object.assign({}, state, {
            currentPage: action.page
         });
      default:
         return state;
   }
}

export default createStore(reducer);
