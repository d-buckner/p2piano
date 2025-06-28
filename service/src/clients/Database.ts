import { MongoClient } from 'mongodb';
import ConfigProvider from '../config/ConfigProvider';

const client = new MongoClient(ConfigProvider.getMongoUri());

export default client.db('p2piano');
