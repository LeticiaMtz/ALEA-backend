const express = require('express');
const bcrypt = require('bcrypt');
const _ = require('underscore');
const {} = require('../middlewares/autenticacion');
const User = require('../models/Users'); //subir nivel
const app = express();
const mailer = require('../libraries/mails');
const jwt = require('jsonwebtoken');

//|-----------------Api GET Listado Usuarios ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que retorna un listado de usuarios                   |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/obtener            |
//|----------------------------------------------------------|
app.get('/obtener', process.middlewares, (req, res) => {
    User.find().populate({ path: 'idRole', select: 'strRole' })
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'No se pudo obtener la lista de usuarios',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Lista de usuarios generada exitosamente',
                cont: users.length,
                cnt: users
            });
        });
});


//|-----------------Api GET Listado Usuarios ---------------------|
//| Creada por: Ernesto Gaytan                                    |
//| Api que retorna un listado de usuarios por especialidad       |
//| modificada por:                                               |
//| Fecha de modificacion:                                        |
//| cambios:                                                      |
//| Ruta: http://localhost:3000/api/users/obtenerEspecialidad/:id |
//|---------------------------------------------------------------|
app.get('/obtenerEspecialidad/:id', process.middlewares, (req, res) => {
    let id = req.params.id;
    User.find({ _id: id })
        .populate('arrEspecialidadPermiso._id', 'strNombre')
        .populate('arrEspecialidadPermiso.strEspecialidad')
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar el usuario',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente el usuario',
                cont: users.length,
                cnt: users
            });
        });
});

//|-----------------Api GET Listado Usuario Id --------------|
//| Creada por: Leticia Moreno                               |
//| Api que retorna un listado de usuario por id             |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/obtener/idUser     |
//|----------------------------------------------------------|
app.get('/obtener/:id', process.middlewares, (req, res) => {
    let id = req.params.id;
    User.find({ _id: id })
        .populate('idRole', 'strRole')
        .exec((err, users) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    status: 400,
                    msg: 'Ocurrio un error al consultar el usuario',
                    cnt: err
                });
            }
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Se han consultado correctamente el usuario',
                cont: users.length,
                cnt: users
            });
        });
});

//|-----------------Api POST de Usuarios     ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que registra un usuario con token                    |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/registrar          |
//|----------------------------------------------------------|
app.post('/registrar', async(req, res) => {
    let body = req.body;
    let pass = req.body.strPassword;
    let user = new User({
        strName: req.body.strName,
        strLastName: req.body.strLastName,
        strMotherLastName: req.body.strMotherLastName,
        strEmail: req.body.strEmail,
        strPassword: bcrypt.hashSync(body.strPassword, 10),
        idRole: req.body.idRole,
        arrEspecialidadPermiso: req.body.arrEspecialidadPermiso,
        blnStatus: req.body.blnStatus

    });
    // validar el correo que ya existe
    await User.findOne({ 'strEmail': req.body.strEmail }).then(async(encontrado) => {
        if (encontrado) {
            return res.status(400).json({
                ok: false,
                resp: 400,
                msg: 'El correo ya ha sido registrado',
                cont: {
                    encontrado
                }
            });
        }
        await user.save();
        mailOptions = {
            nmbEmail: 7,
            strEmail: user.strEmail,
            subject: '??Bienvenido al sistema de Alertas Academicas!',
            html: '<h1>Tu solicitud de registro esta siendo revisada.</h1><br>' +
                '<h3>En un maximo de 24hrs. tu solicitud tendr?? que estar resuelta.</h3>'
        };

        await mailer.sendEmail(mailOptions);
        let listaDeCorreos = [];
        await User.find({ idRole: { $in: ['5f1e2419ad1ebd0b08edab74', '5eeee0db16952756482d186a'] } }).then(async(data) => {
            for (const admin of data) {
                listaDeCorreos.push(admin.strEmail);
            }
            mailOptions = {
                nmbEmail: 8,
                strFullName: `${user.strName} ${user.strLastName} ${user.strMotherLastName}`,
                strEmail: listaDeCorreos.join(','),
                subject: '??Nuevo Registro!',
                html: '<h1>??Por favor, revisa las solicitudes de registro!</h1><br>'
            };
            await mailer.sendEmail(mailOptions);

        }).catch((err) => {
            console.log(err);
        });
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: "Usuario registrado correctamente",
            cont: user.length,
            cnt: {
                user
            }
        });
    }).catch((err) => {
        console.log(err);
        return res.status(500).json({
            ok: false,
            status: 500,
            msg: 'Algo salio mal',
            cnt: {
                err: err.message
            }
        });
    });
});

//|-----------------Api PUT de Usuarios      ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que actualiza un usuario                             |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/actualizar/idUser  |
//|-----------------------------------------------------------
app.put('/actualizar/:idUser', process.middlewares, (req, res) => {
    let id = req.params.idUser;
    const userBody = _.pick(req.body, ['strName', 'strLastName', 'strMotherLastName', 'idRole', 'blnStatus']);
    User.find({ _id: id }).then((resp) => {
        if (resp.length > 0) {
            User.findByIdAndUpdate(id, userBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    status: 200,
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
//|-----------------Api DELETE de Usuarios   ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que elimina un usuario                               |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/eliminar/idUser    |
//|----------------------------------------------------------|
app.delete('/eliminar/:idUser', process.middlewares, (req, res) => {
    let id = req.params.id;
    User.findByIdAndUpdate(id, { blnStatus: false }, { new: true, runValidators: true, context: 'query' }, (err, user) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Error al eliminar el usuario',
                err
            });
        }
        return res.status(200).json({
            ok: true,
            status: 200,
            msg: 'Usuario eliminado correctamente',
            cont: user.length,
            cnt: user
        });
    });
});

//|-----------------Api POST de Usuarios     ----------------|
//| Creada por: Leticia Moreno                               |
//| Api que logea un usuario                                 |
//| modificada por:                                          |
//| Fecha de modificacion:                                   |
//| cambios:                                                 |
//| Ruta: http://localhost:3000/api/users/login              |
//|----------------------------------------------------------|
app.post('/login', (req, res) => {
    let body = req.body;
    User.findOne({ strEmail: body.strEmail }, (err, usrDB) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Algo salio mal',
                err
            });
        }
        if (!usrDB) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Usuario y/o contrase??a incorrecta',
            });
        }
        if (!bcrypt.compareSync(body.strPassword, usrDB.strPassword)) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Usuario o contrase??a incorrecta',
            });
        }
        if (usrDB.blnStatus == false) {
            return res.status(400).json({
                ok: false,
                status: 400,
                msg: 'Usuario inactivo, comun??cate con la orientadora educativa de tu direcci??n.',
            });
        } else {
            let token = jwt.sign({
                user: usrDB
            }, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN });
            return res.status(200).json({
                ok: true,
                status: 200,
                msg: 'Usuario logeado correctamente',
                cnt: usrDB,
                token
            });
        }
    });
});

//|-------------------------     Api GET de envio de correo              -----------------------|
//| Creada por: Isabel Castillo                                                                 |
//| Api que envia un correo con una URL para cambiar la contrase??a del usuario                  |
//| modificada por:                                                                             |
//| Fecha de modificacion:                                                                      |
//| cambios:                                                                                    |
//| Ruta: http://localhost:3000/api/users/forgot/:strEmail                                      |
//|---------------------------------------------------------------------------------------------|
app.get('/forgot/:strEmail', (req, res) => {
    const strEmail = req.params.strEmail;
    caducidadToken = '1hr';
    strUrl = `${process.env.URL_FRONT}/reset-password`
    if (!strEmail) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'No se recibi?? un correo v??lido',
            cont: {
                strCorreo
            }
        });
    }
    User.findOne({ strEmail }, { _id: 1, strName: 1, strLastName: 1 }).then(async(user) => {
        if (!user) {
            return res.status(404).json({
                ok: false,
                resp: 404,
                msg: 'No se encontr?? ning??n usuario que coincida con el correo electr??nico proporcionado',
                cont: {
                    strEmail
                }
            });
        }
        token = await jwt.sign({
            function(error, token) {
                if (error) {
                    return res.status(500).json({

                        ok: false,
                        resp: 500,
                        msg: error
                    });
                }
            },
            idUser: user._id,
        }, process.env.SEED, {
            expiresIn: caducidadToken
        });
        //Es un Json
        jsnEmail = {
            strName: user.strName + ' ' + user.strLastName,
            strEmail,
            strUrl: `${strUrl}/${token}`,
            subject: 'Recuperar Contrase??a',
            nmbEmail: 4
        };
        await mailer.sendEmail(jsnEmail);
        return res.status(200).json({
            ok: true,
            status: 200,
            resp: 'Verifica tu correo electr??nico.',
        })
    }).catch((err) => {
        return res.status(404).json({
            ok: false,
            resp: 404,
            msg: 'El correo electr??nico proporcionado, no existe',
            cont: {
                error: Object.keys(err).length === 0 ? err.message : err
            }
        })
    })
});

//|-------------------------     Api PUT de recuperar contrase??a         -----------------------|
//| Creada por: Isabel Castillo                                                                 |
//| Api que permite cambiar la contrase??a del usuario                                           |
//| modificada por:                                                                             |
//| Fecha de modificacion:                                                                      |
//| cambios:                                                                                    |
//| Ruta: http://localhost:3000/api/users/reset-password/:token                                 |
//|---------------------------------------------------------------------------------------------|
app.put('/reset-password/:token', async(req, res) => {
    const token = req.params.token;
    let idUser = '';
    passwords = {
        first: req.body.strFPass,
        second: req.body.strSPass,
    };
    if (!passwords.first || !passwords.second) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'No se recibi?? la contrase??a correctamente',
            cont: {
                recibido: false
            }
        });
    }
    if ((passwords.first.length != passwords.second.length) ||
        passwords.first != passwords.second) {
        return res.status(400).json({
            ok: false,
            resp: 400,
            msg: 'Las contrase??as no coinciden.',
            cont: {
                coincidencia: false
            }
        });
    }
    await jwt.verify(token, process.env.SEED, (err, dec) => { // Decodifica el token
        if (err) {
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error al decodificar el token.',
                cont: {
                    error: Object.keys(err).length === 0 ? err.message : err
                }
            });
        }
        if (dec) {
            idUser = dec.idUser ? dec.idUser : '';
        }
    });
    User.findByIdAndUpdate(idUser, { strPassword: bcrypt.hashSync(passwords.first, 10) }).then(async(user) => { //Aqui
        if (!user) {
            return res.status(404).json({
                ok: false,
                resp: 404,
                msg: 'No se encontr?? la persona',
                cont: {
                    user
                }
            });
        }
        jsnEmail = {
            strName: user.strName + ' ' + user.strLastName,
            strEmail: user.strEmail,
            strPassword: passwords.first,
            subject: 'Cambio de contrase??a',
            nmbEmail: 5
        }
        await mailer.sendEmail(jsnEmail);
        return res.status(200).json({
            ok: true,
            resp: 200,
            msg: 'La contrase??a se ha actualizado exitosamente.',
            cont: {
                user: {
                    strName: user.strName,
                    strLastName: user.strLastName,
                    strMotherLastName: user.strMotherLastName,
                    strEmail: user.strEmail
                }
            }
        });
    }).catch((err) => {
        return res.status(500).json({
            ok: false,
            resp: 500,
            msg: 'Error al intentar buscar a la persona',
            cont: {
                error: Object.keys(err).length === 0 ? err.message : err
            }
        });

    });
})

//|-------------------------     Api PUT de especialidad usuario         -----------------------|
//| Creada por: Isabel Castillo                                                                 |
//| Api que asigna especialidades a los usuarios                                                |
//| modificada por:                                                                             |
//| Fecha de modificacion:                                                                      |
//| cambios:                                                                                    |
//| Ruta: http://localhost:3000/api/users/asignar-especialidad/idUsuario                        |
//|---------------------------------------------------------------------------------------------|
app.put('/asignar-especialidad/:idUsuario', process.middlewares, (req, res) => {
    idUsuario = req.params.idUsuario;
    user = new User(req.params);
    // BUSCAR Y ACTUALIZAR EL USUARIO AL MISMO TIEMPO 
    User.findOneAndUpdate({ '_id': idUsuario }, { '$set': { 'arrEspecialidadPermiso': req.body.aJsnEspecialidad } })
        .then((usuario) => {
            if (usuario !== undefined || usuario !== null) {
                return res.status(200).json({
                    ok: true,
                    resp: 200,
                    msg: 'Se ha asignado la especialidad correctamente',
                    cont: {
                        usuario
                    }
                });
            } else {
                return res.status(400).json({
                    ok: false,
                    resp: 400,
                    msg: 'Error: No se actualiz?? la especialidad correctamente',
                    cont: {
                        err
                    }
                });
            }
        }).catch((err) => {
            console.log(err);
            return res.status(500).json({
                ok: false,
                resp: 500,
                msg: 'Error al asignar la especialidad',
                cont: {
                    err
                }
            })
        })
});

//|------------ Api PUT de campo blnNotificaciones del usuario -------------|
//| Creada por: Leticia Moreno                                              |
//| Api que actualiza el campo de blnNotificaciones de usuario              |
//| modificada por:                                                         |
//| Fecha de modificacion:                                                  |
//| cambios:                                                                |
//| Ruta: http://localhost:3000/api/users/actualizarNotificaciones/idUser   |
//|-------------------------------------------------------------------------
app.put('/actualizarNotificaciones/:idUser', (req, res) => {
    let id = req.params.idUser;
    const userBody = _.pick(req.body, ['blnNotificaciones']);
    User.find({ _id: id }).then((resp) => {
        if (resp.length > 0) {
            User.findByIdAndUpdate(id, userBody).then((resp) => {
                return res.status(200).json({
                    ok: true,
                    status: 200,
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

module.exports = app;