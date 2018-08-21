import { pick } from 'lodash';

export default {
  parsePublicParams: (model, params, lang) => {
    const basicAttrs = pick(model.dataValues, params);
    const langAttrs = model.attributes
    .filter(v => v.endsWith('_i18n'))
    .reduce((output, key) => {
      const field = model.getDataValue(key);
      const normalizedKey = key.replace('_i18n', '');
      const value =
          lang in field ? field[lang] : field[Object.keys(field)[0]];
      return { ...output, [normalizedKey]: value };
    }, {});
    return { ...basicAttrs, ...langAttrs };
  }
};
