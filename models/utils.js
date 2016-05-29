module.exports = {
   parsePublicParams(model, params, lang) {
      return Object.assign(
         params.reduce((o, p) => {
            o[p] = model.getDataValue(p);
            return o;
         }, {}),
         model.attributes
         .filter(v => v.endsWith('_i18n'))
         .reduce((output, key) => {
            output[key.replace('_i18n', '')] = model.getDataValue(key)[lang];
            return output;
         }, {})
      );
   }
};
