import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { CarsContext } from "../../contexts/CarsContext";
import { AuthContext } from "../../contexts/AuthContext";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Card } from "primereact/card";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { useToast } from "../../contexts/ToastContext";
import { brandsService } from "../../services/brands";

export default function VehicleRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { id } = useParams();
  const { user } = useContext(AuthContext);

  const { createCar, updateCar, getCar, fetchCars } = useContext(CarsContext);
  
  const vehicleDataFromState = location.state?.vehicleData;
  const isEdit = Boolean(id);

  const [brands, setBrands] = useState([]);
  const [loadingBrands, setLoadingBrands] = useState(false);

  const [initialValues, setInitialValues] = useState({
    marca: null, // Cambiado a null para el dropdown
    modelo: "",
    anio: null,
    precio_diario: null,
    disponible: true,
    is_active: true
  });

  const validationSchema = useMemo(() => {
    return Yup.object({
      marca: Yup.number().required("Marca requerida").nullable(),
      modelo: Yup.string().required("Modelo requerido"),
      anio: Yup.number()
        .nullable()
        .min(1900, "El año debe ser mayor a 1900")
        .max(new Date().getFullYear() + 1, "El año no puede ser mayor al año actual"),
      precio_diario: Yup.number()
        .nullable()
        .min(0, "El precio diario debe ser mayor o igual a 0"),
      disponible: Yup.boolean(),
      is_active: Yup.boolean()
    });
  }, []);

  // Cargar marcas disponibles
  useEffect(() => {
    const loadBrands = async () => {
      setLoadingBrands(true);
      try {
        const res = await brandsService.list();
        if (res.status === 200) {
          const brandsData = res?.data?.data ?? [];
          setBrands(Array.isArray(brandsData) ? brandsData : []);
        }
      } catch (err) {
        setBrands([]);
      } finally {
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, []);

  const loadVehicleData = useCallback(async () => {
    if (!isEdit || !id) return;
    
    let vehicleData = vehicleDataFromState;
    
    if (!vehicleData) {
      const { ok, data } = await getCar(Number(id));
      if (!ok || !data) return;
      vehicleData = data;
    }
    
    // El backend usa marcaId (camelCase) y precio_dia
    let marcaId = vehicleData.marcaId || vehicleData.marca_id;
    if (!marcaId && vehicleData.marca && typeof vehicleData.marca === 'object') {
      marcaId = vehicleData.marca.id || vehicleData.marca.marcaId;
    }
    
    setInitialValues({
      marca: marcaId || null,
      modelo: vehicleData.modelo || "",
      anio: vehicleData.anio || null,
      precio_diario: vehicleData.precio_dia || vehicleData.precio_diario || null,
      disponible: vehicleData.disponible !== undefined ? vehicleData.disponible : true,
      is_active: vehicleData.is_active !== undefined ? vehicleData.is_active : true
    });
  }, [id, isEdit, getCar, vehicleDataFromState]);

  useEffect(() => {
    loadVehicleData();
  }, [loadVehicleData]);

  const handleSubmit = async (values, { setSubmitting, setFieldError }) => {
    const payload = {
      marcaId: values.marca, // Enviar el ID de la marca (camelCase como espera Sequelize)
      modelo: values.modelo.trim(),
      ...(values.anio && { anio: values.anio }),
      ...(values.precio_diario !== null && { precio_dia: values.precio_diario }), // precio_dia según el modelo
      disponible: values.disponible !== undefined ? values.disponible : true,
      is_active: values.is_active !== undefined ? values.is_active : true
    };

    let result;
    if (isEdit) {
      result = await updateCar(Number(id), payload);
    } else {
      result = await createCar(payload);
    }

    const { ok, message } = result;
    if (ok) {
      showToast({ 
        severity: "success", 
        summary: isEdit ? "Actualizado" : "Registrado", 
        detail: message, 
        life: 2000 
      });
      await fetchCars(); // Recargar la lista
      navigate("/vehicles");
    } else {
      showToast({ severity: "error", summary: "Error", detail: message, life: 5000 });
      // Mostrar el error en el campo correspondiente si es posible
      if (message?.toLowerCase().includes("marca")) {
        setFieldError("marca", message);
      } else if (message?.toLowerCase().includes("modelo")) {
        setFieldError("modelo", message);
      } else {
        setFieldError("modelo", message || (isEdit ? "Error al actualizar" : "Error en el registro"));
      }
    }
    setSubmitting(false);
  };

  return (
    <div className="container mx-auto p-4" style={{ maxWidth: "800px" }}>
      <Card>
        <div className="mb-4">
          <Button
            label="Volver"
            icon="pi pi-arrow-left"
            className="p-button-text mb-3"
            onClick={() => navigate("/vehicles")}
          />
          <h1 className="m-0">{isEdit ? "Editar Vehículo" : "Registrar Vehículo"}</h1>
          <p className="text-600 mt-2">
            {isEdit ? "Modifique los datos del vehículo" : "Complete el formulario para registrar un nuevo vehículo"}
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
          {({ isSubmitting, errors, touched, setFieldValue, values }) => (
            <Form className="p-fluid">
              <div className="grid">
                <div className="col-12 md:col-6">
                  <div className="p-field">
                    <label htmlFor="marca">Marca *</label>
                    <Field name="marca">
                      {({ field, form }) => {
                        const brandOptions = brands.map(brand => ({
                          label: brand.nombre || brand.name || brand.marca || `Marca ${brand.id}`,
                          value: brand.id
                        }));
                        
                        return (
                          <Dropdown
                            id="marca"
                            value={field.value}
                            options={brandOptions}
                            onChange={(e) => form.setFieldValue("marca", e.value)}
                            placeholder={loadingBrands ? "Cargando marcas..." : "Seleccione una marca"}
                            className={touched.marca && errors.marca ? "p-invalid" : ""}
                            disabled={loadingBrands}
                            filter
                            showClear
                          />
                        );
                      }}
                    </Field>
                    <small className="p-error"><ErrorMessage name="marca" /></small>
                  </div>

                  <div className="p-field">
                    <label htmlFor="modelo">Modelo *</label>
                    <Field name="modelo">
                      {({ field }) => (
                        <InputText 
                          id="modelo" 
                          {...field} 
                          placeholder="Ej: Corolla" 
                          className={touched.modelo && errors.modelo ? "p-invalid" : ""}
                        />
                      )}
                    </Field>
                    <small className="p-error"><ErrorMessage name="modelo" /></small>
                  </div>

                  <div className="p-field">
                    <label htmlFor="anio">Año</label>
                    <Field name="anio">
                      {({ field, form }) => (
                        <InputNumber 
                          id="anio" 
                          value={field.value}
                          onValueChange={(e) => form.setFieldValue("anio", e.value)}
                          placeholder="Ej: 2020"
                          min={1900}
                          max={new Date().getFullYear() + 1}
                          useGrouping={false}
                          className={touched.anio && errors.anio ? "p-invalid" : ""}
                        />
                      )}
                    </Field>
                    <small className="p-error"><ErrorMessage name="anio" /></small>
                  </div>
                </div>

                <div className="col-12 md:col-6">
                  <div className="p-field">
                    <label htmlFor="precio_diario">Precio Diario</label>
                    <Field name="precio_diario">
                      {({ field, form }) => (
                        <InputNumber 
                          id="precio_diario" 
                          value={field.value}
                          onValueChange={(e) => form.setFieldValue("precio_diario", e.value)}
                          placeholder="Ej: 5000"
                          min={0}
                          useGrouping={true}
                          className={touched.precio_diario && errors.precio_diario ? "p-invalid" : ""}
                        />
                      )}
                    </Field>
                    <small className="p-error"><ErrorMessage name="precio_diario" /></small>
                  </div>

                  <div className="p-field">
                    <label htmlFor="disponible" style={{ marginBottom: "0.5rem" }}>Disponible</label>
                    <Field name="disponible">
                      {({ field }) => (
                        <InputSwitch 
                          id="disponible" 
                          checked={field.value}
                          onChange={(e) => setFieldValue("disponible", e.value)}
                        />
                      )}
                    </Field>
                  </div>

                  <div className="p-field">
                    <label htmlFor="is_active" style={{ marginBottom: "0.5rem" }}>Vehículo activo</label>
                    <Field name="is_active">
                      {({ field }) => (
                        <InputSwitch 
                          id="is_active" 
                          checked={field.value}
                          onChange={(e) => setFieldValue("is_active", e.value)}
                        />
                      )}
                    </Field>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button 
                  type="submit" 
                  label={isEdit ? "Actualizar" : "Registrar"} 
                  className="p-button-primary" 
                  loading={isSubmitting} 
                  icon={isEdit ? "pi pi-check" : "pi pi-car"}
                />
                <Button 
                  type="button" 
                  label="Cancelar" 
                  icon="pi pi-times" 
                  className="p-button-secondary" 
                  onClick={() => navigate("/vehicles")}
                />
              </div>
            </Form>
          )}
        </Formik>
      </Card>
    </div>
  );
}

