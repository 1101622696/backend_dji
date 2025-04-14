import mongoose from "mongoose";

const mantenimientosSchema=new mongoose.Schema({
    codigoMantenimiento:{type:String,required:true},
    idDron: {type: mongoose.Schema.Types.ObjectId, ref: 'Dron', required: true },
    fechaMantenimiento:{type:String,required:true},
    valor:{type:String,required:true},
    empresaResponsable:{type:String,required:true},
    descripcion:{type:String,required:true},
    observaciones:{type:String,required:true},
    superoPruebas:{type:String,required:true},
    archivosMantenimiento:{type:String,required:true},
    fechaNacimiento:{type:String,required:true},

})

export default mongoose.model("Mantenimiento",mantenimientosSchema)


