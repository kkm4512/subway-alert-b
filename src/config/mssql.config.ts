import { config as SqlConfig } from 'mssql';

/**
 * MSSQL 연결 설정
 */
export const mssqlConfig: SqlConfig = {
	server: process.env.DB_MSSQL_HOST as string,
	port: Number(process.env.DB_MSSQL_PORT),
	user: process.env.DB_MSSQL_USER,
	password: process.env.DB_MSSQL_PASSWORD,
	database: process.env.DB_MSSQL_NAME,
	options: {
		encrypt: false,
		trustServerCertificate: true,
	},
};
