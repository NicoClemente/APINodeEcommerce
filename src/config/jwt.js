const jwtConfig = {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h',
    options: {
      algorithms: ['HS256']
    }
  };
  
  export default jwtConfig;