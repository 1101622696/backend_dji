import mongoose from "mongoose";

const pilotosSchema=new mongoose.Schema({
    idPiloto:{type:String,required:true},
    nombre:{type:String,unique:true},
    primerApellido:{type:String,required:true},
    segundoApellido:{type:String,required:true},
    tipoDocumento:{type:String,required:true},
    paisExpedicion:{type:String,required:true},
    ciudadExpedicion:{type:String,required:true},
    fechaExpedicion:{type:String,required:true},
    paisNacimiento:{type:String,required:true},
    ciudadNacimiento:{type:String,required:true},
    fechaNacimiento:{type:String,required:true},
    grupoSanguineo:{type:String,required:true},
    factorRH:{type:String,required:true},
    genero:{type:String,required:true},
    estadoCivil:{type:String,required:true},
    ciudadOrigen:{type:String,required:true},
    direccion:{type:String,required:true},
    telefono:{type:String,required:true},
    fechaExamen:{type:String,required:true},
    email:{type:String,required:true},
    contratopiloto:{type:String,required:true},
    archivos:{type:String,required:true},
    email:{type:String,required:true},
    fechaRegistro:{type:String,default: Date.now()},
    tiempoAcumulado:{type:String,required:true},
    distanciaAcumulada:{type:String,required:true},
    vuelosRealizados:{type:String,required:true},
    estado: { type: Number, default: 0 },
})

export default mongoose.model("Piloto",pilotosSchema)


