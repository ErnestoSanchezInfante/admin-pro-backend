const path = require('path');
const fs = require('fs');

const { response } = require("express");
const { v4: uuidv4 } = require('uuid');
const { actualizarImagen } = require("../helpers/actualizar-imagen");


const fileUpload = ( req , res = response) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    //Validar tipo
    const tiposValidos = ['hospitales','medicos','usuarios'];

    if( !tiposValidos.includes(tipo)) {
        return res.status(400).json({
            ok: false,
            msg: 'No es un medico, usuario u hospital (tipo)'
        });
    }

    //Validar que existe aun archivo
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            msg: 'No hay ningun archivo'
        });
      }

    //Procesar la imagen  
    const file = req.files.imagen;

    const nombreCortado = file.name.split(','); //wolverine.1.2.jpg
    const extencionArchivo = nombreCortado [ nombreCortado.length -1 ];

    //validar extencion
    const extencionesValidas = ['png','jpg','jpeg','gig'];

    if( !extencionesValidas.includes(extencionArchivo)){

        return res.status(400).json({
            ok: false,
            msg: 'No es una extencion permitida'
        });

    }

    //Generar el nombre archivo
    const nombreArchivo = `${ uuidv4() }.${ extencionArchivo }`;

    //Path para guardar la imagen
    const path = `./uploads/${ tipo }/${ nombreArchivo }`;

    // Mover la imagen
    file.mv(path, (err) => {
        if (err) {
            console.log(err);
            return res.status(500).json({
                ok: false,
                msg: 'Error al mover la imagen'
            });
        }

        //Actualizar Base de Datos
        actualizarImagen( tipo, id, path, nombreArchivo );

        res.json({
            ok: true,
            msg: 'Archivo subido',
            nombreArchivo
        });
    });


}


const retornaImagen = ( req, res = response) => {
    const tipo = req.params.tipo;
    const foto = req.params.foto;

    const pathImg = path.join(__dirname, `../upload/${ tipo }/${ foto }` );

    //imagen por defecto

    if (fs.existsSync( pathImg ) ){
        res.sendFile( pathImg );

    } else {

        const pathImg = path.join(__dirname, `../upload/no-img.png` );
        res.sendFile( pathImg );
    }

}

module.exports = {
    fileUpload,
    retornaImagen
}