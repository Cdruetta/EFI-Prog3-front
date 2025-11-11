import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import { useToast } from "../../contexts/ToastContext";
import "../../../styles/pages/auth/LoginForm.css";

export default function LoginForm() {
  const { signIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const validationSchema = Yup.object({
    correo: Yup.string().email("Correo inválido").required("Correo requerido"),
    password: Yup.string().min(6, "Mínimo 6 caracteres").required("Contraseña requerida"),
  });

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const { correo, password } = values;
    
    // Validación adicional antes de enviar
    if (!correo || !password) {
      setFieldError("correo", !correo ? "Correo requerido" : "");
      setFieldError("password", !password ? "Contraseña requerida" : "");
      setSubmitting(false);
      return;
    }
    
    try {
      const { ok, message } = await signIn({ correo, password });
      if (ok) {
        showToast({ severity: "success", summary: "Éxito", detail: message, life: 2000 });
        navigate("/");
      } else {
        setFieldError("password", message || "Usuario o contraseña incorrectos");
        showToast({ severity: "error", summary: "Error", detail: message, life: 3000 });
      }
    } catch (error) {
      setFieldError("password", "Error al iniciar sesión. Intenta nuevamente.");
      showToast({ 
        severity: "error", 
        summary: "Error", 
        detail: error?.message || "Error al iniciar sesión", 
        life: 3000 
      });
    } finally {
      setSubmitting(false);
    }
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
    backgroundImage: "url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
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
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    width: "100%",
    padding: "2rem 0"
  };

  return (
    <div className="login-auth-hero">
      <div style={leftSideStyle} className="login-auth-hero-left">
        <div style={overlayStyle}></div>
        <div style={leftContentStyle}>
          <div>
            <h1>Gestión de autos</h1>
            <h2>Bienvenido de nuevo</h2>
            <p>Ingresá tus credenciales</p>
          </div>
          <div style={{ marginTop: "auto" }}>
            <Button
              label="Volver"
              icon="pi pi-arrow-left"
              className="p-button-text p-button-sm"
              onClick={() => navigate(-1)}
              style={{ fontSize: "0.9rem", color: "white" }}
            />
          </div>
        </div>
      </div>
      <div className="login-auth-hero-right">
        <Card className="login-auth-card login-no-hover">
          <h2 style={{ marginTop: 0 }}>Iniciar sesión</h2>
          <Formik
            initialValues={{ correo: "", password: "" }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting, errors, touched }) => (
              <Form className="p-fluid" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="p-field">
                  <label htmlFor="correo">Correo</label>
                  <Field name="correo">
                    {({ field }) => (
                      <InputText
                        id="correo"
                        {...field}
                        placeholder="correo@dominio.com"
                        className={`login-input-text ${touched.correo && errors.correo ? "p-invalid" : ""}`}
                      />
                    )}
                  </Field>
                  <small className="p-error">
                    <ErrorMessage name="correo" />
                  </small>
                </div>

                <div className="p-field">
                  <label htmlFor="password">Contraseña</label>
                  <Field name="password">
                    {({ field }) => (
                      <Password
                        id="password"
                        {...field}
                        feedback={false}
                        toggleMask
                        placeholder="••••••"
                        inputClassName={`login-password ${touched.password && errors.password ? "p-invalid" : ""}`}
                      />
                    )}
                  </Field>
                  <small className="p-error">
                    <ErrorMessage name="password" />
                  </small>
                </div>

                <Button
                  type="submit"
                  label="Entrar"
                  className="p-button-primary"
                  loading={isSubmitting}
                  icon="pi pi-sign-in"
                />

                <div style={{ textAlign: "center" }}>
                  <Button
                    type="button"
                    label="Sobre nosotros"
                    className="p-button-text p-button-sm"
                    onClick={() => navigate("/about")}
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
