import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { UserContext } from "../../contexts/UserContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { useToast } from "../../contexts/ToastContext";
import "../../../styles/pages/user/UserRegisterForm.css";

export default function UserRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { id } = useParams();

  const { user } = useContext(AuthContext);
  const { roles, registerUser, editUser, getUserById } = useContext(UserContext);
  
  // Obtener datos del usuario desde el state de navegación
  const userDataFromState = location.state?.userData;

  const isAdmin = user?.rol === "admin";
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    rol: ""
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      nombre: Yup.string().required("Nombre requerido"),
      correo: Yup.string().email("Correo inválido").required("Correo requerido"),
      password: isEdit 
        ? Yup.string().min(6, "Mínimo 6 caracteres")
        : Yup.string().min(6, "Mínimo 6 caracteres").required("Contraseña requerida"),
      ...(!isEdit && {
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("password")], "Las contraseñas no coinciden")
          .required("Confirmación requerida"),
      }),
      rol: isAdmin 
        ? Yup.string().required("Rol requerido")
        : Yup.string()
    });
  }, [isEdit, isAdmin]);

  const loadUserData = useCallback(async () => {
    if (!isEdit || !id) return;
    
    let userData = userDataFromState;
    
    if (!userData) {
      userData = await getUserById(Number(id));
      if (!userData) return;
    }
    
    setInitialValues({
      nombre: userData.nombre || "",
      correo: userData.correo || userData.email || "",
      password: "",
      confirmPassword: "",
      rol: userData.rol || ""
    });
  }, [id, isEdit, getUserById, userDataFromState]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const roleOptions = useMemo(() => {
    return (roles || []).map((r) => ({ label: r?.nombre ?? r, value: r?.nombre ?? r }));
  }, [roles]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    let payload;
    
    if (isEdit) {
      payload = {
        nombre: values.nombre.trim(),
        correo: values.correo.trim(),
        ...(values.password && { password: values.password }),
        ...(isAdmin && values.rol && { rol: values.rol })
      };
    } else {
      payload = {
        nombre: values.nombre.trim(),
        correo: values.correo.trim(),
        password: values.password
      };
      
      if (isAdmin && values.rol) {
        payload.rol = values.rol;
      } else if (!isAdmin) {
        payload.rol = "cliente";
      }
    }

    let result;
    if (isEdit) {
      result = await editUser(Number(id), payload);
    } else {
      result = await registerUser(payload);
    }

    const { ok, message } = result;
    if (ok) {
      showToast({ 
        severity: "success", 
        summary: isEdit ? "Actualizado" : "Registrado", 
        detail: message, 
        life: 2000 
      });
      navigate(isEdit ? "/user/list" : "/");
    } else {
      showToast({ severity: "error", summary: "Error", detail: message, life: 3000 });
      setFieldError("correo", message || (isEdit ? "Error al actualizar" : "Error en el registro"));
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
    backgroundImage: "url('https://images.unsplash.com/photo-1503376780353-7e6692767b70?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
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
    <div className="user-register-auth-hero">
      <div style={leftSideStyle} className="user-register-auth-hero-left">
        <div style={overlayStyle}></div>
        <div style={leftContentStyle}>
          <h1>Gestion de autos</h1>
          <h2>{isEdit ? "Editar usuario" : "Crear una cuenta"}</h2>
          <p>{isEdit ? "Modifica los datos del usuario" : "Completa el formulario para registrarte"}</p>
        </div>
      </div>
      <div className="user-register-auth-hero-right">
        <Card className="user-register-auth-card user-register-no-hover" pt={{
          root: { style: { padding: "1rem", maxHeight: "calc(100vh - 2rem)", overflowY: "auto" } },
          body: { style: { padding: "0.5rem" } }
        }}>
          <h2 style={{ marginTop: 0, marginBottom: "0.5rem", fontSize: "1.5rem" }}>{isEdit ? "Editar Usuario" : "Registro"}</h2>
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            validateOnChange={false}
            validateOnBlur={true}
          >
            {({ isSubmitting, errors, touched, setFieldValue, values }) => (
              <Form className="p-fluid" style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                <div className="p-field">
                  <label htmlFor="nombre" style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>Nombre *</label>
                  <Field name="nombre">
                    {({ field }) => (
                      <InputText 
                        id="nombre" 
                        {...field} 
                        placeholder="Juan" 
                        className={touched.nombre && errors.nombre ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem", fontSize: "0.9rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error" style={{ fontSize: "0.75rem" }}><ErrorMessage name="nombre" /></small>
                </div>

                <div className="p-field">
                  <label htmlFor="correo" style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>Correo *</label>
                  <Field name="correo">
                    {({ field }) => (
                      <InputText 
                        id="correo" 
                        {...field} 
                        type="email"
                        placeholder="correo@dominio.com" 
                        className={touched.correo && errors.correo ? "p-invalid" : ""}
                        pt={{ root: { style: { padding: "0.5rem", fontSize: "0.9rem" } } }}
                      />
                    )}
                  </Field>
                  <small className="p-error" style={{ fontSize: "0.75rem" }}><ErrorMessage name="correo" /></small>
                </div>

                {isAdmin && (
                  <div className="p-field">
                    <label htmlFor="rol" style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>Rol</label>
                    <Dropdown
                      id="rol"
                      value={values.rol}
                      onChange={(e) => setFieldValue("rol", e.value)}
                      options={roleOptions}
                      placeholder="-- Elegir rol --"
                      className={touched.rol && errors.rol ? "p-invalid" : ""}
                      pt={{ root: { style: { padding: "0.5rem", fontSize: "0.9rem" } } }}
                    />
                    <small className="p-error" style={{ fontSize: "0.75rem" }}><ErrorMessage name="rol" /></small>
                  </div>
                )}

                {isEdit ? (
                  <div className="p-field">
                    <label htmlFor="password" style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>Nueva Contraseña (opcional)</label>
                    <Field name="password">
                      {({ field }) => (
                        <Password 
                          id="password" 
                          {...field} 
                          feedback={false} 
                          toggleMask 
                          placeholder="Dejar vacío para mantener la actual" 
                          inputClassName={touched.password && errors.password ? "p-invalid" : ""}
                          pt={{ input: { style: { padding: "0.5rem", fontSize: "0.8rem" } } }}
                        />
                      )}
                    </Field>
                    <small className="p-error" style={{ fontSize: "0.75rem" }}><ErrorMessage name="password" /></small>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.3rem" }}>
                    <div className="p-field">
                      <label htmlFor="password" style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>Contraseña</label>
                      <Field name="password">
                        {({ field }) => (
                          <Password 
                            id="password" 
                            {...field} 
                            feedback={false} 
                            toggleMask 
                            placeholder="••••••" 
                            inputClassName={touched.password && errors.password ? "p-invalid" : ""}
                            pt={{ input: { style: { padding: "0.5rem", fontSize: "0.9rem" } } }}
                          />
                        )}
                      </Field>
                      <small className="p-error" style={{ fontSize: "0.75rem" }}><ErrorMessage name="password" /></small>
                    </div>

                    <div className="p-field">
                      <label htmlFor="confirmPassword" style={{ fontSize: "0.9rem", marginBottom: "0.2rem" }}>Confirmar</label>
                      <Field name="confirmPassword">
                        {({ field }) => (
                          <Password 
                            id="confirmPassword" 
                            {...field} 
                            feedback={false} 
                            toggleMask 
                            placeholder="••••••" 
                            inputClassName={touched.confirmPassword && errors.confirmPassword ? "p-invalid" : ""}
                            pt={{ input: { style: { padding: "0.5rem", fontSize: "0.9rem" } } }}
                          />
                        )}
                      </Field>
                      <small className="p-error" style={{ fontSize: "0.75rem" }}><ErrorMessage name="confirmPassword" /></small>
                    </div>
                  </div>
                )}

                <Button 
                  type="submit" 
                  label={isEdit ? "Actualizar" : "Registrarme"} 
                  className="p-button-primary" 
                  loading={isSubmitting} 
                  icon={isEdit ? "pi pi-check" : "pi pi-user-plus"}
                  pt={{ root: { style: { marginTop: "0.3rem", padding: "0.5rem", fontSize: "0.9rem" } } }}
                />

                <div style={{ marginTop: "0.5rem", display: "flex", justifyContent: "center" }}>
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
