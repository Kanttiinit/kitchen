import * as express from 'express';

export default model => {
  const modelName = model.name.toLowerCase();

  const basePath = '/' + modelName + 's';
  const itemPath = basePath + '/:' + modelName;

  return express
    .Router()
    .param(modelName, async (req, res, next) => {
      const item = await model.findById(req.params[modelName]);
      if (item) {
        req[modelName] = item;
        next();
      } else {
        res.status(404).json({ message: 'no such ' + modelName });
      }
    })
    .get(basePath, async (req, res) => {
      const items = await model.findAll();
      res.json(items);
    })
    .post(basePath, async (req, res, next) => {
      try {
        const item = await model.create(req.body);
        res.json(item);
      } catch (e) {
        next({
          code: 401,
          message: 'Validation error: ' + e.message
        });
      }
    })
    .delete(itemPath, async (req, res) => {
      await req[modelName].destroy();
      res.json({ message: 'deleted' });
    })
    .put(itemPath, async (req, res) => {
      const item = await req[modelName].update(req.body);
      res.json(item);
    });
};
