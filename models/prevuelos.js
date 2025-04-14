import mongoose from "mongoose";

const prevuelosSchema=new mongoose.Schema({
    consecutivoprevuelo:{type:String,required:true},
    idUsuario: {type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    solicitudesAprobadas:{type:String,unique:true},
    permiso:{type:String,required:true},
    fechaInicio:{type:Date,required:true},
    ubicacion:{type:String,required:true},
    modeloDron:{type:String,required:true},
    proposito:{type:String,required:true},
    autorizacion:{type:String},
    autorizado_por:{type:String},
    fecha_autorizacion:{type:String},
    item1:{type:String,required:true},
    item2:{type:String,required:true},
    item3:{type:String,required:true},
    item4:{type:String,required:true},
    item5:{type:String,required:true},
    item6:{type:String,required:true},
    item7:{type:String,required:true},
    item8:{type:String,required:true},
    item9:{type:String,required:true},
    item10:{type:String,required:true},
    item11:{type:String,required:true},
    item12:{type:String,required:true},
    item13:{type:String,required:true},
    item14:{type:String,required:true},
    item15:{type:String,required:true},
    item16:{type:String,required:true},
    item17:{type:String,required:true},
    item18:{type:String,required:true},
    item19:{type:String,required:true},
    item20:{type:String,required:true},
    item21:{type:String,required:true},
    item22:{type:String,required:true},
    notas:{type:String,required:true},
    Estado:{type:String},
    fechadeCreacion:{type:String,default: Date.now()},
})

export default mongoose.model("Prevuelo",prevuelosSchema)


