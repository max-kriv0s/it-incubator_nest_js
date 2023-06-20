export const settings = {
  PORT: Number(process.env.PORT) || 5000,

  MONGO_URI: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/nest_js',
  // DB_NAME: process.env.DB_NAME || '',
};
