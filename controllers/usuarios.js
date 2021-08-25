const { response } = require('express');
const bcrypt = require('bcryptjs');

const Usuario = require('../models/usuario');
const { generarJWT } = require('../helpers/jwt');


const getUsuarios = async(req, res) => {

    const desde = Number(req.query.desde) || 0;
/*
    const usuarios = await Usuario
                            .find({},'nombre email role google')
                            .skip( desde )
                            .limit( 5 );

    const total = await Usuario.count();   
    */

    //Estas promesas se jecutan de manera simultanea
    await Promise.all([
        Usuario
            .find({},'nombre email role google img')
            .skip( desde )
            .limit( 5 ),

            Usuario.countDocuments()   
    ]);

    res.json({
        ok:true,
        usuarios,
        total
    })
}

const crearUsuario = async(req, res = response) => {
    console.log('=============Crea Usuario==================');

    console.log(req.body);

    const {email,password} = req.body;
    

    try {
        const existeEmail = await Usuario.findOne({ email });

        if( existeEmail ){
            return res.status(400).json({
                ok: false,
                msg: 'El correo ya esta registrado'
            });
        }

        const usuario = new Usuario(req.body);

        //console.log('Usuario: ' + usuario);

        //Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        usuario.password = bcrypt.hashSync(password,salt);

        //Guardar usuario
        await usuario.save();

        //Generar el JWT
        const token = await generarJWT( usuario.id);
    
        res.json({
            ok:true,
            usuario,
            token
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado... revisar logs'
        });
    }

}

const actualizarUsuario = async (req,  res = response) => {
    //TODO: Vañlidar token y comporbar si es el usuario correcto

    const uid = req.params.id;
    

    try{
        const usuarioDB = await Usuario.findById ( uid );

        if (!usuarioDB){
            return res.json(404).json({
                ok:false,
                msg: 'No existe un usuario por ese id'
            });
        }

        // de esta manera quito passsword y google
        const { password,google, email,...campos } = req.body

        if ( usuarioDB.email !== req.body.email){
           
            const existeEmail = await Usuario.findOne( { email:email } );

            if ( existeEmail ){
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya existe un usuario con ese email'
                });
            }
        }

        campos.email = email;

        const usuarioActualizado = await Usuario.findByIdAndUpdate(uid,campos, {new: true});

        res.json({
            ok: true,
            usuario: usuarioActualizado
        });

    } catch(error){
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }
}


const borrarUsuario = async(req,res = response) => {

    const uid = req.params.id;

    try {

        const usuarioDB = await Usuario.findById ( uid );

        if (!usuarioDB){
            return res.json(404).json({
                ok:false,
                msg: 'No existe un usuario por ese id'
            });
        }

        await Usuario.findByIdAndDelete(uid);

        res.json({
            ok: true,
            msg: 'Usuario eliminado'
        });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Error inesperado'
        })
    }

}

module.exports = {
    getUsuarios,
    crearUsuario,
    actualizarUsuario,
    borrarUsuario
}