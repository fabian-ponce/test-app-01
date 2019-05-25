const cors = require('cors');
const express = require('express');
const bodyParser = require('body-parser');
const port = process.env.PORT || 8080;

const app = express();
const sql = require('mssql');

app.locals.dbConfig = require('./db-config');
app.locals.executeStoredProcedure = async function (req, res, spName, spAttrsAndValues) { // Tiene detección automática de tipos string=sql.VarChar number=sql.Int.
    // spAttrsAndValues - objeto o array de objetos con cualquiera de las siguientes sintaxis:
    // Format1: {spParameter: <parameterName>, type <parameterTypeOfsqlObject>:, value: <value>}
    // Format2: {<parameterName>: <value>, <parameterName2>: <value2>, ...}
    // Format3: {<parameterName>: [Object with Format1]} // Don't  implemented. Require convert JSON to XML format.
    var $ = req.app.locals;
    var result;
    var request;
    var setParameters = function (dbRequest, spAttrsAndValues) {
        var attr;
    
        for (let i in spAttrsAndValues) {
            attr = spAttrsAndValues[i];
    
            // En los casos donde se omite el tipo, este es determinado implicitamente por mssql.
            // String -> sql.NVarChar
            // Number -> sql.Int
            // Boolean -> sql.Bit
            // Date -> sql.DateTime
            // Buffer -> sql.VarBinary
            // sql.Table -> sql.TVP
            // undefined -> null
            // NaN       -> null

            // Format: 1
            if (attr.spParameter !== undefined && attr.value !== undefined) {

                if (attr.type === undefined) dbRequest.input(attr.spParameter, attr.value);
                else dbRequest.input(attr.spParameter, attr.type, attr.value);
            }
            // Format: 2
            else for (let spParameter in attr) dbRequest.input(spParameter, attr[spParameter]);
        }
    }

    if (spAttrsAndValues && !Array.isArray(spAttrsAndValues)) spAttrsAndValues = [spAttrsAndValues];

    try {
        request = res.locals.sql.request();
        if (spAttrsAndValues) setParameters(request, spAttrsAndValues); // No todos requieren atributos.
        result = await request.execute(spName);
        return result;
    }
    catch (e) {
        console.log("ERRROR: ", e.message, spName, e.stack);
        return false;
    }
}
app.locals.connectToSql = async function (req, res, sql) {
    var err;
    console.info('Connecting to db...');
    
    res.locals.sql = await new sql.ConnectionPool(req.app.locals.dbConfig).connect().catch(e => err = e);
    
    if (err) {
        console.log('ERROR al conectarse a la DB: ', err);
        return false;
    }
    
    console.info('Connected successfuly!');
    
    res.locals.sqlRequest = res.locals.sql.request();

    return true;
}
app.locals.closeSql = function (res) {
    console.info('Connected ended!');
    res.locals.sql.close();
}

// Política CORS
app.use(cors());

// Parsear a json
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Conectar a sql
app.use('/*', async function (req, res, next) {
    
    var result = await req.app.locals.connectToSql(req, res, sql);
    next();
})



// Rutas
app.get('/grupos', async function (req, res) {
    var result = (await req.app.locals.executeStoredProcedure(req, res, 'SP_SelectGrupo')).recordset;
    req.app.locals.closeSql(res);
    return res.send(result);
})
app.post('/grupos', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_InsertGrupo', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.put('/grupos', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_UpdateGrupo', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.delete('/grupos/:id', async function (req, res) {
    console.log(req.params)
    await req.app.locals.executeStoredProcedure(req, res, 'SP_DeleteGrupo', {idGrupo: req.params.id});
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})

app.get('/estudiantes', async function (req, res) {
    var result = (await req.app.locals.executeStoredProcedure(req, res, 'SP_SelectEstudiante')).recordset;
    req.app.locals.closeSql(res);
    return res.send(result);
})
app.post('/estudiantes', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_InsertEstudiante', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.put('/estudiantes', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_UpdateEstudiante', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.delete('/estudiantes/:id', async function (req, res) {
    console.log(req.params)
    await req.app.locals.executeStoredProcedure(req, res, 'SP_DeleteEstudiante', {idEstudiante: req.params.id});
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})

app.get('/materias', async function (req, res) {
    var result = (await req.app.locals.executeStoredProcedure(req, res, 'SP_SelectMateria')).recordset;
    req.app.locals.closeSql(res);
    return res.send(result);
})
app.post('/materias', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_InsertMateria', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.put('/materias', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_UpdateMateria', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.delete('/materias/:id', async function (req, res) {
    console.log(req.params)
    await req.app.locals.executeStoredProcedure(req, res, 'SP_DeleteMateria', {idMateria: req.params.id});
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})

app.get('/salas', async function (req, res) {
    var result = (await req.app.locals.executeStoredProcedure(req, res, 'SP_SelectSala')).recordset;
    req.app.locals.closeSql(res);
    return res.send(result);
})
app.post('/salas', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_InsertSala', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.put('/salas', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_UpdateSala', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.delete('/salas/:id', async function (req, res) {
    console.log(req.params)
    await req.app.locals.executeStoredProcedure(req, res, 'SP_DeleteSala', {idSala: req.params.id});
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})

app.get('/horarios', async function (req, res) {
    var result = (await req.app.locals.executeStoredProcedure(req, res, 'SP_SelectHorario')).recordset;
    req.app.locals.closeSql(res);
    return res.send(result);
})
app.post('/horarios', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_InsertHorario', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.put('/horarios', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_UpdateHorario', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.delete('/horarios/:id', async function (req, res) {
    console.log(req.params)
    await req.app.locals.executeStoredProcedure(req, res, 'SP_DeleteHorario', {idHorario: req.params.id});
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.get('/asignacion-horarios', async function (req, res) {
    var result = (await req.app.locals.executeStoredProcedure(req, res, 'SP_SelectHorariosXMateria')).recordset;
    req.app.locals.closeSql(res);
    return res.send(result);
})
app.post('/asignacion-horarios', async function (req, res) {
    console.log(req.body);
    await req.app.locals.executeStoredProcedure(req, res, 'SP_InsertAsignaciones', req.body);
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})
app.delete('/asignacion-horarios/:id', async function (req, res) {
    console.log(req.params)
    await req.app.locals.executeStoredProcedure(req, res, 'SP_DeleteAsignaciones', {id_asignacion_materia: req.params.id});
    req.app.locals.closeSql(res);
    return res.sendStatus(200);
})


app.use('/login', async function (req, res) {

})
app.use('/logout', async function (req, res) {

})
app.get('/*', express.static('./www/'));






/////////////////////// CONTROL DE BAJAS

var cluster = require('cluster');
var numCPUs = require('os').cpus().length;
var server;

if (cluster.isMaster)
{
    for (var i = 0; i < numCPUs; ++i) cluster.fork();

    cluster.on('exit', (worker, code, signal) => {
        console.info(`     █████    WORKER ${worker.process.pid}\tdied!`);
        cluster.fork();
    });
}
else
{
    server = app.listen(port, function () {
        console.log('PROCESS ID LOCAL:', process.pid, '  \t', `Http server listening on port ${port}...`);
    });
    server.timeout = 15*1000;
}