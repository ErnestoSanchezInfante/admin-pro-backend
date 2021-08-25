const Usuario = require('../models/usuario');
const bcrypt = require('bcryptjs');
const { generarJWT } = require('../helpers/jwt');




const login = async (req, res = response) => {

    console.log('=================Controller password========================')

    const { email, password} = req.body;

    try {
        //Verificar Email
        const usuarioDB = await Usuario.findOne({ email });

        if (!usuarioDB){
            return res.satus(404).json({
                ok: false,
                msg: 'Email no encontrado'
            });
        }

        //Verificar contraseña
        const validPassword = bcrypt.compareSync(password, usuarioDB.password);

        if( !validPassword){
            return res.satus(400).json({
                ok: false,
                msg: 'Contraseña no valida'
            })
        }

        //Generar el token JWT 
        const token = await generarJWT( usuarioDB.id);

        res.json({
            ok: true,
            msg: token
        })
        
    } catch (error) {
        console.log(error);
        res.satus(500).json({
            ok: false,
            msg: 'Hable con el administrador'
        });
    }

}

module.exports = {
    login
}