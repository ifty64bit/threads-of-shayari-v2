import { drizzle } from 'drizzle-orm/libsql';

function getDB({ url, authToken }: { url: string; authToken: string }) {
  return drizzle({
    connection: {
      url,
      authToken,
    },
  });
}

export default getDB;
