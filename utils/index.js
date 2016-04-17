module.exports = {
   auth(bypass) {
      return function(req, res, next) {
         req.loggedIn = req.session.loggedIn;
         if (req.session.loggedIn || bypass)
            next();
         else
            res.status(403).json({message: 'unauthorized'});
      }
   }
};
