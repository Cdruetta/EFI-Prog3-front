import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ClientContext } from "../../contexts/ClientContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { useToast } from "../../contexts/ToastContext";
import "../../../styles/pages/client/ClientRegisterForm.css";

export default function ClientRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { id } = useParams();

  const { registerClient, editClient, getClient } = useContext(ClientContext);
  
  const clientDataFromState = location.state?.clientData;
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState({
    nombre: "",
    apellido: "",
    documento: "",
    correo: "",
    telefono: "",
    is_active: true
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      nombre: Yup.string().required("Nombre requerido"),
      apellido: Yup.string().required("Apellido requerido"),
      documento: Yup.string()
        .required("Documento requerido")
        .matches(/^\d+$/, "El documento solo debe contener números"),
      correo: Yup.string().email("Correo inválido"),
      telefono: Yup.string().matches(/^\d*$/, "El teléfono solo debe contener números")
    });
  }, []);

  const loadClientData = useCallback(async () => {
    if (!isEdit || !id) return;
    
    let clientData = clientDataFromState;
    
    if (!clientData) {
      const { ok, data } = await getClient(Number(id));
      if (!ok || !data) return;
      clientData = data;
    }
    
    setInitialValues({
      nombre: clientData.nombre || "",
      apellido: clientData.apellido || "",
      documento: clientData.documento || "",
      correo: clientData.correo || "",
      telefono: clientData.telefono || "",
      is_active: clientData.is_active !== undefined ? clientData.is_active : true
    });
  }, [id, isEdit, getClient, clientDataFromState]);

  useEffect(() => {
    loadClientData();
  }, [loadClientData]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const payload = {
      nombre: values.nombre.trim(),
      apellido: values.apellido.trim(),
      documento: values.documento,
      ...(values.correo && { correo: values.correo.trim() }),
      ...(values.telefono && { telefono: values.telefono }),
      is_active: values.is_active !== undefined ? values.is_active : true
    };

    let result;
    if (isEdit) {
      result = await editClient(Number(id), payload);
    } else {
      result = await registerClient(payload);
    }

    const { ok, message } = result;
    if (ok) {
      showToast({ 
        severity: "success", 
        summary: isEdit ? "Actualizado" : "Registrado", 
        detail: message, 
        life: 2000 
      });
      navigate("/client/list");
    } else {
      showToast({ severity: "error", summary: "Error", detail: message, life: 3000 });
      setFieldError("documento", message || (isEdit ? "Error al actualizar" : "Error en el registro"));
    }
    setSubmitting(false);
  };

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
    <div className="client-register-auth-hero">
      <div style={leftSideStyle} className="client-register-auth-hero-left">
        <div style={overlayStyle}></div>
        <div style={leftContentStyle}>
          <h1>Gestión de Autos</h1>
          <h2>{isEdit ? "Editar cliente" : "Registrar cliente"}</h2>
          <p>{isEdit ? "Modifica los datos del cliente" : "Completa el formulario para registrar un cliente"}</p>
        </div>
      </div>
      <div className="client-register-auth-hero-right">
        <Card className="client-register-auth-card client-register-no-hover" pt={{
          root: { style: { padding: "1rem", maxHeight: "calc(100vh - 4rem)" } },
          body: { style: { overflow: "auto", display: "flex", flexDirection: "column" } }
        }}>
          <h2 style={{ marginBottom: "0.5rem" }}>{isEdit ? "Editar Cliente" : "Registro de Cliente"}</h2>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched, setFieldValue }) => (
              <Form className="p-fluid" pt={{ root: { style: { display: "flex", flexDirection: "column", gap: "0.3rem" } } }}>
                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="nombre" style={{ marginBottom: "0.25rem" }}>Nombre *</label>
                  <Field name="nombre">
                    {({ field }) => (
                      <InputText 
                        id="nombre" 
                        {...field} 
                        placeholder="" 
                        className={touched.nombre && errors.nombre ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="nombre" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="apellido" style={{ marginBottom: "0.25rem" }}>Apellido *</label>
                  <Field name="apellido">
                    {({ field }) => (
                      <InputText 
                        id="apellido" 
                        {...field} 
                        placeholder="" 
                        className={touched.apellido && errors.apellido ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="apellido" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="documento" style={{ marginBottom: "0.25rem" }}>Documento (DNI) *</label>
                  <Field name="documento">
                    {({ field }) => (
                      <InputText 
                        id="documento" 
                        {...field} 
                        placeholder=""
                        inputMode="numeric"
                        onInput={(e) => {
                          const value = e.target.value.replace(/\D+/g, "");
                          setFieldValue("documento", value);
                        }}
                        className={touched.documento && errors.documento ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="documento" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="correo" style={{ marginBottom: "0.25rem" }}>Correo</label>
                  <Field name="correo">
                    {({ field }) => (
                      <InputText 
                        id="correo" 
                        {...field} 
                        type="email"
                        placeholder="" 
                        className={touched.correo && errors.correo ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="correo" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="telefono" style={{ marginBottom: "0.25rem" }}>Teléfono</label>
                  <Field name="telefono">
                    {({ field }) => (
                      <InputText 
                        id="telefono" 
                        {...field} 
                        placeholder=""
                        inputMode="numeric"
                        onInput={(e) => {
                          const value = e.target.value.replace(/\D+/g, "");
                          setFieldValue("telefono", value);
                        }}
                        className={touched.telefono && errors.telefono ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error"><ErrorMessage name="telefono" /></small>
                </div>

                <div className="p-field" style={{ marginBottom: "0.3rem" }}>
                  <label htmlFor="is_active" style={{ marginBottom: "0.25rem" }}>Cliente activo</label>
                  <Field name="is_active">
                    {({ field }) => (
                      <InputSwitch 
                        id="is_active" 
                        checked={field.value}
                        onChange={(e) => setFieldValue("is_active", e.value)}
                        pt={{ root: { style: { marginTop: "0.25rem" } } }}
                      />
                    )}
                  </Field>
                </div>

                <Button 
                  type="submit" 
                  label={isEdit ? "Actualizar" : "Registrar"} 
                  className="p-button-primary" 
                  loading={isSubmitting} 
                  icon={isEdit ? "pi pi-check" : "pi pi-user-plus"}
                  pt={{ root: { style: { marginTop: "0.5rem", padding: "0.5rem" } } }}
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
