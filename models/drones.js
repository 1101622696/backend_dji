import mongoose from "mongoose";

const dronesSchema=new mongoose.Schema({
    idDron:{type:String,required:true},
    numeroSerie:{type:String,unique:true},
    marca:{type:String,required:true},
    modelo:{type:String,required:true},
    peso:{type:String,required:true},
    dimensiones:{type:String,required:true},
    autonomiaVuelo:{type:String,required:true},
    alturaMaxima:{type:String,required:true},
    velocidadMaxima:{type:String,required:true},
    fechaCompra:{type:String,required:true},
    capacidadBateria:{type:String,required:true},
    tipoCamaras:{type:String,required:true},
    archivos:{type:String,required:true},
    fechaRegistro:{type:String,default: Date.now()},
    estado: { type: Number, default: 0 },
    fechaPoliza:{type:String,required:true},
    tiempoAcumulado:{type:String,required:true},
    distanciaAcumulada:{type:String,required:true},
    vuelosRealizados:{type:String,required:true},
    contratodron:{type:String,required:true},
    ubicacion:{type:String,required:true},
    ocupadodron:{type:String,required:true},
})

export default mongoose.model("Dron",dronesSchema)


