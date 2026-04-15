import path from 'path';
import dotenv from 'dotenv';

const envPath = path.resolve(__dirname, '../.env');
const loaded = dotenv.config({ path: envPath });

if (loaded.error) {
  dotenv.config();
}
