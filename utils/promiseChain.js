module.exports = function(callbacks) {
   let chainedPromise = Promise.resolve();
   callbacks.forEach(callback => {
      chainedPromise = chainedPromise.then(() => callback());
   });
   return chainedPromise;
};
