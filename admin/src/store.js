import Store from 'redux-nimble';

const reducers = {
   setCurrentPage(state, page) {
      return {page};
   },
   setLoggedIn(state, loggedIn) {
      return {loggedIn};
   }
};

const store = new Store(reducers, {}, {});

export default store;
