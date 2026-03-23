import multer from 'multer'

export function subirArchivos(){
    const storage = multer.diskStorage({
        destination: './uploads', 
        //cb=colback va hacer cuandos e termine la ejecucion de la funcion
        filename: function(req, file, cb){
            cb(null, Date.now() + file.originalname)
        }
    })//                           puedo subr mas de un archivo
    // const upload = multer({storage}).array('foto',1)
     const upload = multer({ storage }).single('foto');
    return upload
}

