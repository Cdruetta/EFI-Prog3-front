import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useToast } from "../../contexts/ToastContext";
import { brandsService } from "../../services/brands";

export default function BrandRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { id } = useParams();
  
  const brandDataFromState = location.state?.brandData;
  const isEdit = Boolean(id);

  const [initialValues, setInitialValues] = useState({
    nombre: ""
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      nombre: Yup.string()
        .required("Nombre de marca requerido")
        .min(2, "El nombre debe tener al menos 2 caracteres")
        .max(50, "El nombre no puede exceder 50 caracteres")
        .trim()
    });
  }, []);

  const loadBrandData = useCallback(async () => {
    if (!isEdit || !id) return;
    
    let brandData = brandDataFromState;
    
    if (!brandData) {
      try {
        const res = await brandsService.get(Number(id));
        if (res.status === 200) {
          brandData = res?.data?.data ?? res?.data;
        }
      } catch (err) {
        showToast({
          severity: "error",
          summary: "Error",
          detail: "No se pudo cargar la marca",
          life: 5000
        });
        navigate("/brands/list");
        return;
      }
    }
    
    if (brandData) {
      setInitialValues({
        nombre: brandData.nombre || brandData.name || brandData.marca || ""
      });
    }
  }, [id, isEdit, brandDataFromState, showToast, navigate]);

  useEffect(() => {
    loadBrandData();
  }, [loadBrandData]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const payload = {
      nombre: values.nombre.trim()
    };

    try {
      let result;
      if (isEdit) {
        const res = await brandsService.update(Number(id), payload);
        result = {
          ok: res.status === 200,
          message: res?.data?.message || "Marca actualizada correctamente",
          data: res?.data?.data
        };
      } else {
        const res = await brandsService.create(payload);
        result = {
          ok: res.status === 201 || res.status === 200,
          message: res?.data?.message || "Marca creada exitosamente",
          data: res?.data?.data
        };
      }

      if (result.ok) {
        showToast({ 
          severity: "success", 
          summary: isEdit ? "Actualizado" : "Registrado", 
          detail: result.message, 
          life: 2000 
        });
        navigate("/brands/list");
      } else {
        showToast({ 
          severity: "error", 
          summary: "Error", 
          detail: result.message || (isEdit ? "Error al actualizar marca" : "Error al crear marca"), 
          life: 5000 
        });
        setFieldError("nombre", result.message || "Error en el registro");
      }
    } catch (err) {
      const errorMsg = err?.data?.message || err?.message || (isEdit ? "Error al actualizar marca" : "Error al crear marca");
      showToast({ 
        severity: "error", 
        summary: "Error", 
        detail: errorMsg, 
        life: 5000 
      });
      setFieldError("nombre", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4" style={{ maxWidth: "800px" }}>
      <Card>
        <div className="mb-4">
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            className="p-button-text mb-3"
            onClick={() => navigate("/brands/list")}
          />
          <h1 className="m-0">{isEdit ? "Editar Marca" : "Registrar Marca"}</h1>
          <p className="text-600 mt-2">
            {isEdit ? "Modifique el nombre de la marca" : "Complete el formulario para registrar una nueva marca"}
          </p>
        </div>

        <Formik
          initialValues={initialValues}
          enableReinitialize
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          validateOnChange={false}
          validateOnBlur={true}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form className="p-fluid">
              <div className="grid">
                <div className="col-12">
                  <div className="p-field">
                    <label htmlFor="nombre">Nombre de la Marca *</label>
                    <Field name="nombre">
                      {({ field }) => (
                        <InputText 
                          id="nombre" 
                          {...field} 
                          placeholder="Ej: Toyota, Ford, Chevrolet" 
                          className={touched.nombre && errors.nombre ? "p-invalid" : ""}
                          maxLength={50}
                        />
                      )}
                    </Field>
                    <small className="p-error"><ErrorMessage name="nombre" /></small>
                    <small className="p-text-secondary">
                      Ingrese el nombre de la marca de vehículo
                    </small>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  type="submit" 
                  label={isEdit ? "Actualizar" : "Registrar"} 
                  className="p-button-primary" 
                  loading={isSubmitting} 
                  icon={isEdit ? "pi pi-check" : "pi pi-plus"}
                />
                <Button 
                  type="button" 
                  label="Cancelar" 
                  icon="pi pi-times" 
                  className="p-button-secondary" 
                  onClick={() => navigate("/brands/list")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
}

