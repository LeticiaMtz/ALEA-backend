const express = require('express');
var mongoose = require('mongoose');
const _ = require('underscore');
const Crde = require('../models/crde');
const app = express();

//|-----------------     Api GET de categoria crde       ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de categorias de crde                         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/obtener                         |
//|----------------------------------------------------------------------|
app.get('/obtener', process.middlewares, (req, res) => {
    Crde.find() //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, crde) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'error al generar la lista',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista generada exiosamente',
                count: crde.length,
                cnt: crde
            });
        });
});

//|-----------------     Api GET de categoria crde       ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene listado de categorias de crde segun id                |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/obtener/id                      |
//|----------------------------------------------------------------------|
app.get('/obtener/:id', process.middlewares, (req, res) => {
    let id = req.params.id;
    Crde.find({ _id: id })
        .exec((err, crde) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar las categorias de crde',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente la categori crde',
                cont: crde.length,
                cnt: crde
            });
        });
});

//|-----------------     Api POST de categoria crde      --------------------------------------------|
//| Creada por: Leticia Moreno                                                                       |
//| Api que registra una categoria de crde                                                           |
//| modificada por: Isabel Castillo                                                                  |
//| Fecha de modificacion: 03/09/20                                                                  |
//| cambios: Se agrego una validaci??n para que la primera letra de la primera palabra sea may??scula  |
//| Ruta: http://localhost:3000/api/crde/registrar                                                   |
//|--------------------------------------------------------------------------------------------------|
app.post('/registrar', process.middlewares, async(req, res) => {
    let body = req.body;

    //para poder mandar los datos a la coleccion
    let crde = new Crde({
        strCategoria: body.strCategoria,
        blnStatus: body.blnStatus

    });

    Crde.findOne({ _id: { $ne: [mongoose.Types.ObjectId(req.params.idCrde)] }, strCategoria: { $regex: `^${body.strCategoria}$`, $options: 'i' } }).then((encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'El nombre de la categoria ya ha sido registrada',
                cnt: encontrado

            });
        }
        crde.save((err, crde) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'No se pudo guardar la nueva categoria',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: "Categoria de crde registrada correctamente",
                cont: crde.length,
                cnt: {
                    crde
                }
            });
        });
    });

});

//|-----------------     Api PUT de categoria crde       ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una categoria de crde mediante un ID               |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/actualizar/idCrde               |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idCrde', process.middlewares, (req, res) => {
    let id = req.params.idCrde;
    let numParam = Object.keys(req.body).length;

    let crdeBody;
    if (numParam == 7) {
        crdeBody = _.pick(req.body, ['strCategoria', 'blnStatus']);
    }
    if (numParam == 1) {
        crdeBody = _.pick(req.body, ['blnStatus']);
    }
    if (numParam !== 7 && numParam !== 1) {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar CRDE',
            err: 'El n??mero de parametros enviados no concuerdan con los que requiere la API'
        });
    }

    Crde.findOne({ _id: { $ne: [id] }, strCategoria: { $regex: `^${crdeBody.strCategoria}$`, $options: 'i' } }).then((resp) => {
        if (resp) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: `La categoria ${crdeBody.strCategoria} ya existe `,
                err: resp
            });
        }
        Crde.findByIdAndUpdate(id, crdeBody).then((resp) => {
            return res.status(200).json({
                ok: true,
                status: 400,
                msg: 'Actualizada con ??xito',
                cont: resp.length,
                cnt: resp
            });
        }).catch((err) => {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al actualizar',
                cnt: err
            });
        });
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400,
            msg: 'Error al actualizar',
            cnt: err
        });
    });

});

//|-----------------     Api DELETE de categoria crde    ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una categoria de crde por ID                         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/crde/eliminar/idCrde                 |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idCrde', process.middlewares, (req, res) => {
    let id = req.params.idCrde;

    Crde.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ha ocurrido un error al eliminar el crde',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se ha eliminado correctamente el crde',
            cont: resp.length,
            cnt: resp
        });
    });
});

module.exports = app;