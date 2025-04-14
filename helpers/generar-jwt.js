import jwt from 'jsonwebtoken';

const generarJWT = (id, rol) => {
  return new Promise((resolve, reject) => {
    const payload = { id, rol };
    jwt.sign(payload, process.env.SECRETORPRIVATEKEY, {
      expiresIn: '4h',
    }, (err, token) => {
      if (err) {
        reject('No se pudo generar el token');
      } else {
        resolve(token);
      }
    });
  });
};

export { generarJWT };
