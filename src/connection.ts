import mariadb from "mariadb";

const pool = mariadb.createPool({
	host: process.env.DATABASE_HOST,
	user: process.env.DATABASE_USER,
	password: process.env.DATABASE_PWD,
	database: process.env.DATABASE_DB,
	port: 3307
});

export function getConnection() {
	return pool;
}
