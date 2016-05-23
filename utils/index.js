const cors = require('cors');
const models = require('../models');

module.exports = {
   auth(req, res, next) {
      if (req.loggedIn)
         next();
      else
         res.status(403).json({message: 'unauthorized'});
   },
   createRestApi({router, model, getListQuery = () => undefined, formatResponse}) {
      const modelName = model.name.toLowerCase();
      const modelPlural = modelName + 's';

      const modelIdString = modelName + 'Id';
      const basePath = '/' + modelPlural;
      const itemPath = basePath + '/:' + modelIdString;

      return router
      .param(modelIdString, (req, res, next) => {
         model.findById(req.params[modelIdString])
         .then(item => {
            if (item) {
               req[modelName] = item;
               next();
            } else {
               res.status(404).json({message: 'no such ' + modelName});
            }
         });
      })
      .get(basePath, cors(), (req, res) => {
         const listQuery = getListQuery(req);
         const query = typeof listQuery === 'string'
            ? models.sequelize.query(listQuery, {model})
            : model.findAll(listQuery);

         query.then(items => {
            let response = req.loggedIn ? items : items.map(i => i.getPublicAttributes());
            if (formatResponse)
               response = formatResponse(response, req);

            return res.json(response);
         });
      })
      .post(basePath, this.auth, (req, res) => {
         model.create(req.body).then(item => res.json(item));
      })
      .delete(itemPath, this.auth, (req, res) => {
         req[modelName].destroy().then(_ => res.json({message: 'deleted'}));
      })
      .put(itemPath, this.auth, (req, res) => {
         req[modelName].update(req.body).then(item => res.json(item));
      });
   }
};
