import _ from 'lodash';

export default {
  parsePublicParams: (model, params, lang) => {
    return Object.assign(
      _.pick(model.dataValues, params),
      model.attributes
      .filter(v => v.endsWith('_i18n'))
      .reduce((output, key) => {
        const field = model.getDataValue(key);
        const normalizedKey = key.replace('_i18n', '');
        const value = lang in field ? field[lang] : field[Object.keys(field)[0]];
        return Object.assign({}, output, {[normalizedKey]: value});
      }, {})
    );
  }
};
