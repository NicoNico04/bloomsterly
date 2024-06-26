import {
  Municipios,
  Administradores,
  Usuarios,
  Empresas,
  Reservas,
  Servicios,
  Categorias,
  ControlUsuarios,
  DescripcionReserva,
  Fechas,
  SolicitudEmpresas,
  AdministradorSolicitud,
  Subcategorias,
  ImagesServicios
} from "../models/associations.js";
import session from "express-session";
import bcrypt from "bcrypt";
import Sequelize from 'sequelize';

//Esto cierra la sesion del usuario
export const getlogout = async (req, res) => {
  req.session.user.destroy((error) => {
    if (error) {
      console.log("error al cerrar sesion ", error);
      res.status(500).json({ message: "error al cerrar sesion" });
    } else {
      res.clearCookie("connect.sid");
      res.status(200).json({ message: "sesion cerrada correctamente" });
    }
  });
};
export const editarPerfil = async (req, res) => {
  const { nombre, username, COD_municipios, contrasena, email } = req.body;

  try {
    console.log(req.userCOD);
    const hashedPassword = await bcrypt.hash(contrasena, 5);
    await Usuarios.update(
      {
        nombre_c : nombre,
        COD_municipios,
        contrasena: hashedPassword,
        username,
        email,
      },
      { where: { COD: req.userCOD } }
    );

    res.status(201).json({ message: "Perfil actualizado" });
  } catch (error) {
    if (error instanceof Sequelize.UniqueConstraintError) {
      // Manejar el error de restricción de unicidad
      res.status(400).json({
        message: `Los datos ingresados ya existen en el sistema`,
        error: error.errors,
      });
    } else if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res
        .status(400)
        .json({ message: `Error de base datos`, error: error.message });
    } else {
      // Manejar otros tipos de errores
      res
        .status(400)
        .json({ message: "Hubo un error al editar perfil", error });
    }
  }
};
export const eliminacionPerfil = async (req, res) => {
  try {
    await Usuarios.destroy({ where: { COD: req.userCOD } });
    res.status(200).json({ message: "Perfil eliminado correctamente" });
  } catch (error) {
    res
      .status(400)
      .json({ message: "Hubo un error al eliminar el perfil", error: error });
  }
};
// esto sirve para obtener las subcategorias
export const subcategorias = async (req, res) => {
  try {
    const subcategoria = await Subcategorias.findAll();
    res.status(200).json(subcategoria);
  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res
        .status(400)
        .json({ message: `Error de base datos`, error: error.message });
    } else {
      // Manejar otros tipos de errores
      res.status(400).json({
        message: "Hubo error al traer la información de la categoria",
        error,
      });
    }
  }
};
// esto sirve para extraer todos los servicios 
export const servicios = async (req, res) => {
  try {
    const servicio = await Servicios.findAll({
      include:[
        {
          model: ImagesServicios,
          attributes:['image']
        }
      ]
    });
    res.status(200).json(servicio)
  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res
        .status(400)
        .json({ message: `Error de base datos`, error: error.message });
    } else {
      // Manejar otros tipos de errores
      res.status(400).json({
        message: "Hubo error al traer la información de servicios",
        error,
      });
    }
  }
}
export const getAllEmpresas = async (req, res) => {
  try {
    const empresas = await Empresas.findAll();
    res.status(200).json(empresas);
  } catch (error) {
    res
      .status(400)
      .json({ message: "Error al traer a todas las empresas", error: error });
  }
};
// Esta parte trae la informacion del usuario con el token
export const getuser = async (req, res) => {
  try {
    const dato = req.userCOD
    const datos = await Usuarios.findOne({
      where: { COD: dato },
      include: [
        {
          model:Municipios,
          attributes:["municipio"],
        },
      ]
    })
    res.status(200).json(datos)
  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res.status(400).json({ message: `Error de base datos`, error: error.message })
    } else {
      // Manejar otros tipos de errores
      res.status(400).json({ message: 'Hubo un error al obtener informacion del usuario', error });
    }
  }
}
// Esta funcion sirve para hacer una reserva el cliente
export const reserva = async (req, res) => {
  const {
    nombre,
    direccion,
    fecha_evento,
    telefono,
    servicios
  } = req.body

  let dato
  let suma = 0
  let descripción = "Esto es una descripcion"
  let COD_reservas
  servicios.map(async (id_servicio, index) => {
    //inicio
    try {
      dato = await Servicios.findOne({
        attributes: ['valor_servicio'],
        where: { ID: id_servicio }
      })
      suma = suma + dato?.valor_servicio
      //inicio
      if (index === (servicios.length - 1)) {
        try {
          console.log("la suma es: ", suma)
          COD_reservas= await Reservas.create({
            COD_usuarios: req.userCOD,
            fecha_reserva: Date.now(),
            fecha_evento,
            valor_total: suma,
            direccion,
            telefono,
            nombre,
            estado: "Pendiente"
          })
          servicios.map(async (id_servicio, indice) => {
            try {
              dato = await Servicios.findOne({
                attributes: ['valor_servicio'],
                where: { ID: id_servicio }
              })
              await DescripcionReserva.create({
                COD_reservas:COD_reservas.COD,
                ID_servicios: id_servicio,
                descripción,
                valor_servicio: dato?.valor_servicio
              })
              if ((servicios.length-1) === indice){
                res.status(201).json({ message: "Reserva realizada correctamente" })
              }
            } catch (error) {
              if (error instanceof Sequelize.DatabaseError) {
                // Manejar el error de base de datos
                res.status(400).json({ message: `Error de base datos`, error: error.message })
              } else {
                // Manejar otros tipos de errores
                res.status(400).json({ message: 'Hubo un error al crear las descripcion de la reserva', error });
              }
            }
          });
        } catch (error) {
          if (error instanceof Sequelize.DatabaseError) {
            // Manejar el error de base de datos
            res.status(400).json({ message: `Error de base datos`, error: error.message })
          } else {
            // Manejar otros tipos de errores
            res.status(400).json({ message: 'Hubo un error al crear las descripcion de la reserva', error });
          }
        }
      }// fin

    // fin
    } catch (error) {
      if (error instanceof Sequelize.DatabaseError) {
        // Manejar el error de base de datos
        res.status(400).json({ message: `Error de base datos`, error: error.message })
      } else {
        // Manejar otros tipos de errores
        res.status(400).json({ message: 'Hubo un error al crear las descripcion de la reserva', error });
      }
    }
  });
}

// Esta funcion sirve para obtener todas las categorias
export const categorias = async (req, res) => {
  try {
    const datos = await Categorias.findAll()
    res.status(200).json(datos)
  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res.status(400).json({ message: `Error de base datos`, error: error.message })
    } else {
      // Manejar otros tipos de errores
      res.status(400).json({ message: 'Hubo un error al obtener informacion de las categorias', error });
    }
  }
}

// Esta funcion trae todas los servicios
export const servicio = async (req,res)=>{

}
// Esta funcion trae las reservas realizada por el cliente
export const obtenerReservas = async(req,res)=>{
  try {
    const reservas = await Reservas.findAll({
      where: { COD_usuarios: req.userCOD },
      include: [
        {
          model: Servicios,
          attributes: ["nombre"],
          through: {
            model: DescripcionReserva,
          },
        },
      ],
    });
    res.status(200).json(reservas)
  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res.status(400).json({ message: `Error de base datos`, error: error.message });
    } else {
      // Manejar otros tipos de errores
      res.status(400).json({message: "Hubo un error al obtener informacion de reserva",error});
    }
  }
}
// Esta funcion sirve para eliminar una reserva
export const eliminarReserva = async(req,res)=>{
  const { COD }=req.body
  try {
    await DescripcionReserva.destroy({where:{COD_reservas:COD}})
    await Reservas.destroy({where:{COD:COD}})
    res.status(200).json({message: "Reserva eliminada correctamente"})
  } catch (error) {
    if (error instanceof Sequelize.DatabaseError) {
      // Manejar el error de base de datos
      res.status(400).json({ message: `Error de base datos`, error: error.message });
    } else {
      // Manejar otros tipos de errores
      res.status(400).json({message: "Hubo un error al eliminar la reserva",error});
    }
  }
} 