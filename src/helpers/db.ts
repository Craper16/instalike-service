import { connect } from 'mongoose';

export async function connectToDb() {
  return await connect(process.env.DB_URI!);
}
