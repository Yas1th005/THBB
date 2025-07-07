const isAdmin = (req, res, next) => {
  console.log('Checking admin role:', req.user);
  if (req.user && req.user.role === 'admin') {
    next();
    return;
  }
  
  res.status(403).send({
    message: "Require Admin Role!"
  });
};