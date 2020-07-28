const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const { verificaToken } = require('../middlewares/autenticacion');
const { rolMenuUsuario } = require('../middlewares/permisosUsuarios');
const Alert = require('../models/Alerts'); //subir nivel
const app = express();
const fileUpload = require('../libraries/subirArchivo(1)');
const User = require('../models/Users');
const { select } = require('underscore');

const idProfesor = '5eeee0db16952756482d1868';
const idDirector = '5eeee0db16952756482d1869';
const idCoordinador = '5eeee0db16952756482d186a';
const idAdministrador = "5f1e2419ad1ebd0b08edab74";

//|-----------------          Api GET de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de las alertas registradas                |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/obtener                       |
//|----------------------------------------------------------------------|
app.get('/obtener', [], (req, res) => {
    Alert.find({ blnStatus: true }) //select * from usuario where estado=true
        //solo aceptan valores numericos
        .exec((err, alerts) => { //ejecuta la funcion
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al generar la lista',
                    err
                });
            }
            console.log(req.alert);
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista de alertas generada exitosamente',
                count: alerts.length,
                cnt: alerts
            });
        });
});

//|-----------------          Api GET de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que obtiene el listado de las alertas registradas por id         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/obtener/idAlert               |
//|----------------------------------------------------------------------|
//Obtener por id
app.get('/obtener/:idAlert', [], (req, res) => {
    Alert.findById(req.params.id)
        .exec((err, alerts) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Error al encontrar la alerta ',
                    err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Alerta encontrada',
                cont: alerts.length, 
                cnt: alerts
            });
        });
});

//|-----------------          Api POST de alertas        ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que registra una alerta                                          |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/registrar                     |
//|----------------------------------------------------------------------|
//Agregar nueva alerta
app.post('/registrar', async(req, res) => {

    let aJsnEvidencias = [];
    if (req.files) {

        for (const archivo of req.files.aJsnEvidencias) {
            let strNombreFile = await fileUpload.subirArchivo(archivo, 'evidencias');
            aJsnEvidencias.push({
                strNombre: strNombreFile,
                strFileEvidencia: `/envidencias/${strNombreFile}`,
                blnActivo: true
            })
        }

        // console.log('Sí entró');
        // console.log(req.files);
    }

    let body = req.body;
    //para poder mandar los datos a la coleccion
    console.log(aJsnEvidencias);
    let alert = new Alert({
        idUser: body.idUser,
        idEstatus: body.idEstatus,
        strMatricula: body.strMatricula,
        strNombreAlumno: body.strNombreAlumno,
        idAsigantura: body.idAsigantura,
        idEspecialidad: body.idEspecialidad,
        strGrupo: body.strGrupo,
        chrTurno: body.chrTurno,
        idModalidad: body.idModalidad,
        strDescripcion: body.strDescripcion,
        arrCrde: body.arrCrde,
        blnStatus: body.blnStatus,
        aJsnEvidencias
    });

    console.log(alert);

    alert.save((err, alert) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400, 
                msg: 'Ocurrio un error, la alerta no se pudo registrar', 
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: "Alerta registrada correctamente",
            cont: alert.length, 
            cnt: {
                alert
            }
        });
    });
});



//|-----------------          Api PUT de alertas         ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que actualiza una alerta                                         |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/actualizar/idAlert            |
//|----------------------------------------------------------------------|
app.put('/actualizar/:idAlert', [verificaToken], (req, res) => {
    let id = req.params.idAlert;
    console.log(req.params.idAlert)
    const alertBody = _.pick(req.body, ['idUser', 'idEstatus', 'strMatricula', 'strNombreAlumno', 'idAsigantura', 'idEspecialidad', 'strGrupo', 'chrTurno', 'idModalidad', 'strDescripcion', 'arrCrde', 'aJsnEvidencias', 'aJsnSeguimiento', 'blnStatus']);
    Alert.find({ _id: id }).then((resp) => {
        if (resp.length > 0) {
            Alert.findByIdAndUpdate(id, alertBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    status: 200, 
                    msg: 'Actualizada con éxito',
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
        }
    }).catch((err) => {
        return res.status(400).json({
            ok: false,
            status: 400, 
            msg: 'Error al actualizar',
            cnt: err
        });
    });
});

//|-----------------          Api DELETE de alertas      ----------------|
//| Creada por: Leticia Moreno                                           |
//| Api que elimina una alerta                                           |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/eliminar/idAlert              |
//|----------------------------------------------------------------------|
app.delete('/eliminar/:idAlert', [verificaToken], (req, res) => {
    let id = req.params.id;

    //update from - set 
    Alert.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, resp) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al eliminar alerta',
                cnt: err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Alerta eliminada correctamente',
            cont: resp.length, 
            cnt: resp
        });
    });
});

//|------------------- Api GET de alertas por usuario -------------------|
//| Creada por: Abraham Carranza                                         |
//| Api que obtiene alertas dependiendo del rol del usuario              |
//| modificada por:                                                      |
//| Fecha de modificacion:                                               |
//| cambios:                                                             |
//| Ruta: http://localhost:3000/api/alerts/obtenerAlertas/idRol/idUser   |
//|----------------------------------------------------------------------|

app.get('/obtenerAlertas/:idRol/:idUser', async(req, res) => {
    let idRol = req.params.idRol;
    let idUser = req.params.idUser;

    if (idRol == idProfesor) {
        Alert.find({ idUser: idUser }).sort({ updatedAt: 'desc' }).limit(5).populate([{ path: 'idEstatus', select: 'strNombre' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }, { path: 'arrCrde' }]).then((resp) => {

            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente las alertas',
                cont: resp.length,
                cnt: resp
            });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ocurrio un error al consultar las alertas',
                cnt: err
            });
        });
    } else if (idRol == idAdministrador) {

        Alert.find().sort({ updatedAt: 'desc' }).limit(5).populate([{ path: 'idEstatus', select: 'strNombre' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }, { path: 'arrCrde' }]).then((resp) => {

            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente',
                cont: resp.length,
                cnt: resp
            });
        }).catch((err) => {
            console.log(err);
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ocurrio un error al consultar el rol',
                cnt: err
            });
        });
    } else if (idRol == idCoordinador || idRol == idDirector) {

        let usuario = await User.findById(idUser);

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Ocurrio un error al consultar el rol',
                cnt: err
            });
        }

        let arrEspecialidad = usuario.arrEspecialidadPermiso;
        let arrAlertas = [];

        for (const idEspecialidad of arrEspecialidad) {
            console.log(idEspecialidad);
            await Alert.find({ idEspecialidad }).sort({ updatedAt: 'desc' }).limit(5).populate([{ path: 'idEstatus', select: 'strNombre' }, { path: 'idEspecialidad', select: 'strEspecialidad' }, { path: 'idModalidad', select: 'strModalidad' }, { path: 'arrCrde' }]).then(async(alertas) => {

                console.log(alertas);
                await arrAlertas.push(alertas);
            })
        };
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Se han consultado correctamente',
            cont: arrAlertas.length,
            cnt: arrAlertas
        });
    };

});

module.exports = app;