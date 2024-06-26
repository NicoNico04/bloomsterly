import { Link } from "react-router-dom";
import { NotFound } from "../../components/templates/NotFound";
import { useUserContext } from "../../components/providers/userProvider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faMoneyBill, faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import PropTypes from 'prop-types'
import { useReservaUserContext, useReservaUserCrudContext } from "../../components/providers/reservasUserProvider";

const ReservaDetalleCard = ({
  nombre,
  direccion,
  fecha,
  telefono,
  servicios,
  estado,
  eliminarReserva,
}) => {
  const { sesionUser } = useUserContext();

  const mostrarServicio = () => {
    let texto
    texto = servicios?.join(", ")
    return texto
  }

  return (
    <article className="flex text-white flex-col z-10">
      <div className="w-full  h-full p-5 bg-dark_theme dark:bg-second_color_lt rounded-sm z-10">
        <div className="flex flex-col ">
          <h1 className="font-title font-semibold text-3xl z-10">
            Cliente {sesionUser.Username}
          </h1>

          <p className="font-title font-semibold text-lg mt-2">
            Nombre evento:
          </p>
          <h1 className="font-text">{nombre}</h1>

          <p className="font-title font-semibold text-lg mt-2">Dirección:</p>
          <h1 className="font-text">{direccion}</h1>

          <p className="font-title font-semibold text-lg mt-2">
            Fecha de realización:
          </p>
          <h1 className="font-text">{fecha}</h1>

          <p className="font-title font-semibold text-lg mt-2">Teléfono:</p>
          <h1 className="font-text">{telefono}</h1>

          <p className="font-title font-semibold text-lg mt-2">Servicios:</p>
          <h1 className="text-white">{mostrarServicio()}</h1>

          <div>
            <p className="font-title font-semibold text-lg mt-2">
              Métodos de pago:
            </p>
            <div className="flex gap-5">
              <FontAwesomeIcon
                icon={faCreditCard}
                size="xl"
                style={{ cursor: "pointer" }}
              />
              <FontAwesomeIcon
                icon={faMoneyBill}
                size="xl"
                style={{ cursor: "pointer" }}
              />
            </div>

            <p className="font-title font-semibold text-lg mt-2">
              Estado:
            </p>
            <p className="font-text">
              {estado}
            </p>
          </div>

          <div className="w-full flex flex-row-reverse font-semibold font-text gap-3">
            <button onClick={eliminarReserva} className="bg-color_font_dark hover:bg-violet-700 transition-all dark:bg-rose-400 dark:hover:bg-rose-600  px-2 rounded-sm">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

ReservaDetalleCard.propTypes = {
  COD: PropTypes.number,
  nombre: PropTypes.string,
  direccion: PropTypes.string,
  fecha: PropTypes.string,
  telefono: PropTypes.string,
  servicios: PropTypes.array,
  estado: PropTypes.string,
  setReservasUser: PropTypes.func.isRequired
}
const ReservaAddCard = () => {
  return (
    <article
      className="flex text-white flex-col items-center justify-center bg-dark_theme  dark:bg-second_color_lt z-10 min-h-56">
      <Link
        to='/reserva/crear'
        className="cursor-pointer"
      >
        <FontAwesomeIcon
          icon={faPlusCircle}
          size="2x"
        >
        </FontAwesomeIcon>
      </Link>
    </article>
  )

}


export function ReservasUser() {
  const { eliminarReserva, obtenerReservas } = useReservaUserCrudContext()
  const { reservas } = useReservaUserContext()

  useEffect(() => {
    obtenerReservas()
  }, [])

  const nombre = (dato1) => {
    let servicios1 = []
    dato1.servicios.map((servicio) => {
      let nombre = servicio?.nombre
      if (nombre !== null || nombre !== undefined) {
        servicios1.push(nombre)
      }
    });
    return servicios1
  }


  return (
    <section>
      {reservas?.length === 0 ? (
        <div className="w-full flex flex-col text-center gap-10 z-10">
          <p className="text-wrap text-4xl font-text text-white dark:text-black z-10">
            Realiza tu primera reserva
            <Link
              to={`/reserva/crear`}
              className="font-text font-extrabold text-color_font_dark text-4xl animate-pulse hover:text-yellow-300 cursor-pointer transition ease-in-out duration-300 dark:text-second_color_lt dark:hover:text-color_font_light px-2 "
            >
              aquí
            </Link>
          </p>
          <NotFound razon="reservas" />
        </div>
      ) : (
        <div className="z-10">
          <h1 className="text-white font-bloomsterly text-9xl text-center z-10 dark:text-second_color_lt">
            Reservas
          </h1>
          <div className="mx-auto grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 z-10">
            {reservas?.map((dato1) => (
              <ReservaDetalleCard
                key={dato1.COD}
                COD={dato1.COD}
                nombre={dato1.nombre}
                fecha={dato1.fecha_evento}
                direccion={dato1.direccion}
                telefono={dato1.telefono}
                servicios={nombre(dato1)}
                estado={dato1.estado}
                eliminarReserva={() => eliminarReserva(dato1.COD)}
              />
            )
            )}
            <ReservaAddCard />
          </div>
        </div>
      )}
    </section>
  );
}
