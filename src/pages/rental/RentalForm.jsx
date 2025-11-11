import { useContext, useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { RentalsContext } from "../../contexts/RentalsContext";
import { ClientContext } from "../../contexts/ClientContext";
import { CarsContext } from "../../contexts/CarsContext";
import { AuthContext } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { useToast } from "../../contexts/ToastContext";
import "../../../styles/pages/rental/RentalForm.css";

export default function RentalForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { createRental } = useContext(RentalsContext);
  const { clients, fetchClients } = useContext(ClientContext);
  const { cars, fetchCars } = useContext(CarsContext);
  const { user } = useContext(AuthContext);

  const searchParams = new URLSearchParams(location.search);
  const carIdFromQuery = searchParams.get("carId");

  const initialValues = useMemo(() => ({
    clienteId: null,
    carId: carIdFromQuery ? Number(carIdFromQuery) : null,
    fecha_inicio: null,
    fecha_fin: null,
  }), [carIdFromQuery]);

  const validationSchema = useMemo(() => {
    return Yup.object({
      clienteId: Yup.number().required("Cliente requerido").nullable(),
      carId: Yup.number().required("Vehículo requerido").nullable(),
      fecha_inicio: Yup.date()
        .required("Fecha de inicio requerida")
        .nullable()
        .min(new Date(), "La fecha de inicio debe ser hoy o en el futuro"),
      fecha_fin: Yup.date()
        .required("Fecha de fin requerida")
        .nullable()
        .min(Yup.ref("fecha_inicio"), "La fecha de fin debe ser posterior a la fecha de inicio"),
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        await fetchClients();
        if (isMounted) await fetchCars();
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    if (!user) {
      showToast({ severity: "error", summary: "Error", detail: "Debes iniciar sesión para crear un alquiler", life: 3000 });
      navigate("/auth/login");
      setSubmitting(false);
      return;
    }

    if (!values.clienteId) {
      setFieldError("clienteId", "Debe seleccionar un cliente");
      setSubmitting(false);
      return;
    }
    if (!values.carId) {
      setFieldError("carId", "Debe seleccionar un vehículo");
      setSubmitting(false);
      return;
    }

    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const payload = {
      carId: Number(values.carId),
      clientId: Number(values.clienteId),
      fecha_inicio: formatDate(values.fecha_inicio),
      fecha_fin: formatDate(values.fecha_fin),
    };

    const { ok, message } = await createRental(payload);

    if (ok) {
      showToast({ severity: "success", summary: "Alquiler creado", detail: message, life: 2000 });
      navigate("/vehicles");
    } else {
      showToast({ severity: "error", summary: "Error", detail: message, life: 3000 });
      if (message?.toLowerCase().includes("cliente")) setFieldError("clienteId", message);
      else if (message?.toLowerCase().includes("vehículo") || message?.toLowerCase().includes("car"))
        setFieldError("carId", message);
      else setFieldError("carId", message || "Error al crear el alquiler");
    }
    setSubmitting(false);
  };

  const clientOptions = useMemo(() =>
    clients
      .filter(client => client.is_active !== false)
      .map(client => ({
        label: `${client.nombre} ${client.apellido} (${client.documento})`,
        value: client.id
      }))
  , [clients]);

  const carOptions = useMemo(() =>
    cars
      .filter(car => car.disponible !== false)
      .map(car => {
        const marca = car.marca?.nombre || car.Brand?.nombre || car.marca || "Sin marca";
        return {
          label: `${marca} ${car.modelo} ${car.anio ? `(${car.anio})` : ""}`,
          value: car.id
        };
      })
  , [cars]);

  const leftSideStyle = {
    flex: 1,
    minWidth: "300px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    padding: "2rem",
    color: "white",
    backgroundColor: "#0D3B66",
    backgroundImage: "url('https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative"
  };

  const overlayStyle = {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(13, 59, 102, 0.7)",
    zIndex: 1
  };

  const leftContentStyle = {
    position: "relative",
    zIndex: 2
  };

  return (
    <div className="rental-auth-hero">
      <div style={leftSideStyle} className="rental-auth-hero-left">
        <div style={overlayStyle}></div>
        <div style={leftContentStyle}>
          <h1>Alquiler de Autos</h1>
          <h2>Nuevo Alquiler</h2>
          <p>Completa el formulario para alquilar un vehiculo</p>
        </div>
      </div>
      <div className="rental-auth-hero-right">
        <Card className="rental-auth-card rental-no-hover" pt={{
          root: { style: { padding: "1.5rem", maxHeight: "calc(100vh - 4rem)" } },
          body: { style: { overflow: "auto", display: "flex", flexDirection: "column" } }
        }}>
          <h2 style={{ marginBottom: "0.5rem" }}>Nuevo Alquiler</h2>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched, setFieldValue, values }) => (
              <Form className="p-fluid" pt={{ root: { style: { display: "flex", flexDirection: "column", gap: "0.3rem" } } }}>
                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="clienteId" style={{ marginBottom: "0.25rem" }}>Seleccione un cliente *</label>
                  <Field name="clienteId">
                    {({ field, form }) => (
                      <Dropdown
                        id="clienteId"
                        value={field.value}
                        options={clientOptions}
                        onChange={(e) => form.setFieldValue("clienteId", e.value)}
                        placeholder=""
                        className={`rental-dropdown ${touched.clienteId && errors.clienteId ? "p-invalid" : ""}`}
                        filter
                        showClear
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="clienteId" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="carId" style={{ marginBottom: "0.25rem" }}>Seleccione un vehículo *</label>
                  <Field name="carId">
                    {({ field, form }) => (
                      <Dropdown
                        id="carId"
                        value={field.value}
                        options={carOptions}
                        onChange={(e) => form.setFieldValue("carId", e.value)}
                        placeholder=""
                        className={`rental-dropdown ${touched.carId && errors.carId ? "p-invalid" : ""}`}
                        filter
                        showClear
                        disabled={!!carIdFromQuery}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="carId" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="fecha_inicio" style={{ marginBottom: "0.25rem" }}>Fecha de Inicio *</label>
                  <Field name="fecha_inicio">
                    {({ field, form }) => (
                      <Calendar
                        id="fecha_inicio"
                        value={field.value}
                        onChange={(e) => form.setFieldValue("fecha_inicio", e.value)}
                        dateFormat="dd/mm/yy"
                        minDate={new Date()}
                        className={touched.fecha_inicio && errors.fecha_inicio ? "p-invalid" : ""}
                        placeholder=""
                        showIcon={false}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="fecha_inicio" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="fecha_fin" style={{ marginBottom: "0.25rem" }}>Fecha de Fin *</label>
                  <Field name="fecha_fin">
                    {({ field, form }) => (
                      <Calendar
                        id="fecha_fin"
                        value={field.value}
                        onChange={(e) => form.setFieldValue("fecha_fin", e.value)}
                        dateFormat="dd/mm/yy"
                        minDate={values.fecha_inicio || new Date()}
                        className={touched.fecha_fin && errors.fecha_fin ? "p-invalid" : ""}
                        placeholder=""
                        showIcon={false}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="fecha_fin" /></small>
                </div>

                <Button 
                  type="submit" 
                  label="Crear Alquiler" 
                  icon="pi pi-calendar-plus"
                  className="p-button-raised p-button-rounded p-button-primary"
                  loading={isSubmitting}
                  pt={{ root: { style: { marginTop: "0.5rem", padding: "0.6rem 1.2rem" } } }}
                />

                <div style={{ marginTop: "0.25rem", display: "flex", justifyContent: "center" }}>
                  <Button 
                    type="button" 
                    label="Volver" 
                    icon="pi pi-arrow-left" 
                    className="p-button-text p-button-sm" 
                    onClick={() => navigate(-1)}
                    style={{ fontSize: "0.9rem" }}
                  />
                </div>
              </Form>
            )}
          </Formik>
        </Card>
      </div>
    </div>
  );
}
