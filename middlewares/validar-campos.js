const { response } = require('express');
const { validationResult } = require('express-validator');

const Usuario = require('../models/usuario');

const validarCampos = (req, res = response, next) => {
    console.log('============Validar usuarios=============');
    const usuario = new Usuario( req.body )
    console.log(usuario);

    const errores = validationResult( req );

    if (!errores.isEmpty()){
        return res.status(400).json({
            ok:false,
            errors: errores.mapped()
        });
    }
    next();
}

module.exports = {
    validarCampos
}