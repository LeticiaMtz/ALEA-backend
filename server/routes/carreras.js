const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Carrera = require('../models/carreras');
const app = express();

//|-----------------     Api GET de carreras             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de carreras                               |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/obtener                     |
//|----------------------------------------------------------------------|
//Obtiene todos las carreras
app.get('/obtener', process.middlewares, (req, res) => {
    Carrera.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .sort({
            strCarrera: -1
        })
        .exec((err, carrera) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las carreras',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carreras consultadas exitosamente',
                cont: carrera.length,
                cnt: carrera
            });
        });
});

//|-----------------     Api GET de carreras             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de carreras  segun id                     |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/obtener/id                  |
//|----------------------------------------------------------------------|
app.get('/obtener/:id', process.middlewares, (req, res) => {
    let id = req.params.id;
    Carrera.find({ _id: id })
        .exec((err, carrera) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carrera consultada exitosamente',
                cont: carrera.length,
                cnt: carrera
            });
        });
});

//|------------------------------------     Api POST de carreras            ----------------------------|
//| Creada por: Leticia Moreno                                                                          |
//| Api que registra una carrera                                                                        |
//| modificada por: Isabel Castillo                                                                     |
//| Fecha de modificacion:   1) 11-08-2020                                                              |
//|                          2) 03-09-2020                                                              |
//| cambios: 1) Se modifico el estatus 200 por un 400 en un mensaje de error                            |
//|          2) Se agrego una validaci??n para que la primera letra de la primera palabra sea may??scula  |
//| Ruta: http://localhost:3000/api/carreras/registrar                                                  |
//|-----------------------------------------------------------------------------------------------------|
app.post('/registrar', process.middlewares, (req, res) => {
    let body = req.body;

    let carrera = new Carrera({
        strCarrera: body.strCarrera
    });
    Carrera.findOne({ _id: { $ne: [mongoose.Types.ObjectId(req.params.idCarrera)] }, strCarrera: { $regex: `^${carrera.strCarrera}$`, $options: 'i' } }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'La carrera ya ha sido registrada',
                cnt: encontrado
            });
        }
        new Carrera(carrera).save((err, carDB) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al registrar la carrera',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                resp: 200,
                msg: 'Se ha registrado correctamente la carrera',
                cont: carDB.length,
                cnt: {
                    carDB
                }
            });

        });
    });
});

//|-----------------     Api PUT de carreras             ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una carrera                                        |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/actualizar/idCarrera        |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idCarrera', process.middlewares, (req, res) => {
    let id = req.params.idCarrera;
    let numParam = Object.keys(req.body).length;

    let careerBody;
    if (numParam == 7) {
        careerBody = _.pick(req.body, ['strCarrera', 'blnStatus']);
    }
    if (numParam == 2) {
        careerBody = _.pick(req.body, ['blnStatus']);
    }
    if (numParam !== 7 && numParam !== 2) {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar la carrera',
            err: 'El n??mero de parametros enviados no concuerdan con los que requiere la API'
        });
    }

    Carrera.findOne({ _id: { $ne: [id] }, strCarrera: { $regex: `^${careerBody.strCarrera}$`, $options: 'i' } }).then((resp) => {
        if (resp) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: `La carrera ${careerBody.strCarrera} ya existe `,
                err: resp
            });
        }
        Carrera.findByIdAndUpdate(id, careerBody).then((resp) => {
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carrera actualizada exitosamente',
                cont: resp.length,
                cnt: resp
            });
        }).catch((err) => {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar la carrera',
                err: err
            });
        });
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar',
            err: err
        });
    });
});

//|-----------------     Api GET de carreras             --------------------|
//| Creada por:                                                              |
//| Api que obtiene el listado de carreras relacionado con su especialidad   |
//| modificada por:                                                          |
//| Fecha de modificacion:                                                   |
//| cambios:                                                                 |
//| Ruta: http://localhost:3000/api/carreras/obtener/id                      |
//|--------------------------------------------------------------------------|
app.get('/obtenerCarreras', process.middlewares, (req, res) => {
    Carrera.find().populate([{ path: 'aJsnEspecialidad._id', select: 'strEspecialidad' }]) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, carrera) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al consultar las carreras',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Carreras consultadas exitosamente',
                cont: carrera.length,
                cnt: carrera
            });
        });
});

//|-----------------     Api DELETE de carreras          ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una carrera                                          |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/carreras/eliminar/idCarrera          |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idCarrera', process.middlewares, (req, res) => {
    let id = req.params.idCarrera;

    Carrera.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar la carrera',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente la carrera',
            cont: resp.length,
            cnt: resp
        });
    });
});

module.exports = app;