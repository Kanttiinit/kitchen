const ua = require('universal-analytics');

const models = require('../models');
const visitor = ua(process.env.UA_ID);

module.exports = {
   auth(bypass) {
      return function(req, res, next) {
         req.loggedIn = req.session.loggedIn;
         if (req.session.loggedIn || bypass)
            next();
         else
            res.status(403).json({message: 'unauthorized'});
      }
   },
   track(action, label) {
      visitor.event('API Call', action, label).send();
   },
   getParamParser(model, param) {
      return function(req, res, next) {
         models[model].findById(req.params[param])
         .then(item => {
            if (item) {
               req[model.toLowerCase()] = item;
               next();
            } else {
               res.status(404).json({message: 'no such ' + model});
            }
         });
      };
   }
};
