const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
    return;
  }
  
  res.status(403).send({
    message: "Require Admin Role!"
  });
};