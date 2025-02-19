const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS.split(','),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  };
  
  export default corsOptions;