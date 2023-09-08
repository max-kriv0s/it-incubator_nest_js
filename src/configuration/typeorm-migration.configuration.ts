import { DataSource, DataSourceOptions } from 'typeorm';
import TYPE_ORM_CONFIG from './typeorm-service.configuration';

const DATA_SOUCE_CONFIGURATION: DataSourceOptions = {
  ...TYPE_ORM_CONFIG,
};
const AppDataSource = new DataSource(DATA_SOUCE_CONFIGURATION);

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
  })
  .catch((err) => {
    console.error('Error during Data Source initialization', err);
  });

export default AppDataSource;
