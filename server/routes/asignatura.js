const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Asignatura = require('../models/asignatura');
const app = express();

//|----------------- Api GET de Asignatura ----------------------|
//| Creada por: Martin Palacios                                  |
//| Api que obtiene todas las asignaturas registradas            |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/asignatura/obtener           |
//|--------------------------------------------------------------|
app.get('/obtener', process.middlewares, (req, res) => {
    Asignatura.find()
        //solo aceptan valores numericos
        .exec((err, asignatura) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las asignaturas',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Asignaturas consultadas exitosamente',
                cont: asignatura.length,
                cnt: asignatura
            });
        });
});

//|----------------- Api GET by id de Asignatura ----------------|
//| Creada por: Martin Palacios                                  |
//| Api que obtiene una asignatura especifica mediante           |
//| un ID                                                        |
//| modificada por:                                              |
//| Fecha de modificacion:                                       |
//| cambios:                                                     |
//| Ruta: http://localhost:3000/api/asignatura/obtener/id        |
//|--------------------------------------------------------------|
app.get('/obtener/:id', process.middlewares, (req, res) => {
    let id = req.params.id;
    Asignatura.find({ _id: id })
        .exec((err, asignatura) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar la asignatura',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Asignatura consultada exitosamente',
                cont: asignatura.length,
                cnt: asignatura
            });
        });
});

//|----------------- Api POST de Asignatura-- -------------------------------------------------------|
//| Creada por: Martin Palacios                                                                      |
//| Api que registra la asignatura                                                                   |
//| modificada por: Isabel Castillo                                                                  |
//| Fecha de modificacion: 02/09/20                                                                  |
//| cambios: Se agrego una validaci??n para que la primera letra de la primera palabra sea may??scula  |
//| Ruta: http://localhost:3000/api/asignatura/registrar                                             |
//|--------------------------------------------------------------------------------------------------|

app.post('/registrar', process.middlewares, async(req, res) => {
    let body = req.body;
    //para poder mandar los datos a la coleccion
    let asignatura = new Asignatura({
        strAsignatura: body.strAsignatura,
        strSiglas: body.strSiglas,
        blnStatus: body.blnStatus
    });
    Asignatura.findOne({ _id: { $ne: [mongoose.Types.ObjectId(req.params.idAsignatura)] }, strAsignatura: { $regex: `^${asignatura.strAsignatura}$`, $options: 'i' } }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'La asignatura ya ha sido registrada',
                cnt: encontrado

            });
        }
        asignatura.save((err, asignatura) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al registrar la asignatura',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Asignatura registrada exitosamente",
                cont: asignatura.length,
                cnt: asignatura
            });
        });
    });

});

//|----------------- Api POST Masivo de Asignatura---------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que registra masivamente las asignaturas                      |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/asignatura/registrar/cargaMasiva  |
//|-------------------------------------------------------------------|
app.post('/registrar/cargaMasiva', process.middlewares, async(req, res) => {
    let asignatura = new Asignatura();
    let elem = 0;
    let body = req.body;
    
    body.cargaMasiva.forEach(element => {
        asignatura = new Asignatura({
            strAsignatura: element.strAsignatura,
            strSiglas: element.strSiglas,
            blnStatus: element.blnStatus
        });
        elem++
        insertToDatabase(asignatura, element.strAsignatura, elem);
    });
    res.json({
        status: 'Carga Masiva finalizada'
    })
});

//|-------------------Api PUT de Asignatura----------------------------|
//| Creada por: Martin Palacios                                        |
//| Api que actualiza la asignatura                                    |
//| modificada por:                                                    |
//| Fecha de modificacion:                                             |
//| cambios:                                                           |
//| Ruta: http://localhost:3000/api/asignatura/actualizar/idAsignatura |
//|--------------------------------------------------------------------|
app.put('/actualizar/:idAsignatura', process.middlewares, (req, res) => {
    let id = req.params.idAsignatura;

    const asignaturaBody = _.pick(req.body, ['strAsignatura', 'strSiglas', 'blnStatus']);
    Asignatura.findOne({ _id: { $ne: [id] }, strAsignatura: { $regex: `^${asignaturaBody.strAsignatura}$`, $options: 'i' } }).then((resp) => {
        if (resp) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: `La asignatura ${asignaturaBody.strAsignatura} ya existe `,
                err: resp
            });
        }
        Asignatura.findByIdAndUpdate(id, asignaturaBody).then((resp) => {
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Asignatura actualizada exitosamente',
                cont: resp.length,
                cnt: resp
            });
        }).catch((err) => {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar asignatura',
                err: Object.keys(err).length === 0 ? err.message : err
            });
        });
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar',
            err: Object.keys(err).length === 0 ? err.message : err
        });
    });
});

//|-------------------Api DELETE de Asignatura---------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que elimina (desactiva) la asignatura                         |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/asignatura/eliminar/idModalidad   |
//|-------------------------------------------------------------------|
app.delete('/eliminar/:idAsignatura', process.middlewares, (req, res) => {
    let id = req.params.idAsignatura;

    Asignatura.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al eliminar la asignatura',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Asignatura eliminada exitosamente',
            cont: resp.length,
            cnt: resp
        });
    });
});

//|-------------------Api ACTivo de Asignatura---------------------------|
//| Creada por: Martin Palacios                                       |
//| Api que elimina (desactiva) la asignatura                         |
//| modificada por:                                                   |
//| Fecha de modificacion:                                            |
//| cambios:                                                          |
//| Ruta: http://localhost:3000/api/asignatura/activo/idModalidad   |
//|-------------------------------------------------------------------|

app.delete('/activo/:idAsignatura', process.middlewares, (req, res) => {
    let id = req.params.idAsignatura;

    Asignatura.findByIdAndUpdate(id, { blnStatus: true }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar la asignatura',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Asignatura actualizada exitosamente',
            cont: resp.length,
            cnt: resp
        });
    });
});

//|---------------METODO de carga masiva de Asignatura----------------|
//| Creado por: Martin Palacios                                       |
//| Descripci??n: El metodo va procesando y guardando cada uno de los  |
//| registros que obtiene como parametros desde la api CARGA MASIVA   |
//| la cual esta invocando al mismo.                                  |
//| Modificado por:                                                   |
//| Fecha de modificaci??n:                                            |
//| Cambios:                                                          |
//|-------------------------------------------------------------------|
let insertToDatabase = (asignatura, strAsignaturaParam, elem) => {
    Asignatura.findOne({ 'strAsignatura': strAsignaturaParam }).then(encontrado => {
        if (encontrado) return console.log(`registro ${strAsignaturaParam} repetido: num registro ${elem}`);

        asignatura.save().then(guardado => {
            if (!guardado) return console.log(`error al guardar ${strAsignaturaParam}, num registro ${elem}`);
            if (guardado) return console.log(`asignatura: ${strAsignaturaParam} guardada: num registro ${elem}`);
        }).catch(err => {
            return console.log(`error de METODO al guardar: se que quedo en el registro ${elem}: ${err}`);
        });
    }).catch(err => {
        return console.log(`error de METODO al buscar duplicados: se que quedo en el registro ${elem}: ${err}`);
    });
}

module.exports = app;