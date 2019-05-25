module.exports = {
    server: 'mssql-server-main.database.windows.net',
    database: 'APPDB01',
    user: 'toor',
    password: 'asdfASDF1234',
    encrypt: true,
    pool: {
        max: 100,
        min: 0,
        idleTimeoutMillis: 10000
    }
}