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
          const brandsData = res?.data?.data ?? res?.data ?? [];
          const brandsArray = Array.isArray(brandsData) ? brandsData : [];
          setBrands(brandsArray);
          
          // Si no hay marcas, mostrar un mensaje
          if (brandsArray.length === 0) {
            showToast({
              severity: "warn",
              summary: "Advertencia",
              detail: "No se encontraron marcas disponibles. Por favor, registre una marca primero.",
              life: 5000
            });
          }
        } else {
          setBrands([]);
          showToast({
            severity: "error",
            summary: "Error",
            detail: "No se pudieron cargar las marcas",
            life: 5000
          });
        }
      } catch (err) {
        setBrands([]);
        const errorMsg = err?.data?.message || err?.message || "Error al cargar las marcas";
        showToast({
          severity: "error",
          summary: "Error",
          detail: errorMsg,
          life: 5000
        });
      } finally {
        setLoadingBrands(false);
      }
    };
    loadBrands();
  }, [showToast]);

  const loadVehicleData = useCallback(async () => {
    if (!isEdit || !id) return;
    
    let vehicleData = vehicleDataFromState;
    
    if (!vehicleData) {
      const { ok, data } = await getCar(Number(id));
      if (!ok || !data) return;
      vehicleData = data;
    }
    
    // El backend puede usar brandId, marcaId o marca_id
    let marcaId = vehicleData.brandId || vehicleData.marcaId || vehicleData.marca_id || vehicleData.brand_id;
    if (!marcaId && vehicleData.marca && typeof vehicleData.marca === 'object') {
      marcaId = vehicleData.marca.id || vehicleData.marca.marcaId || vehicleData.marca.brandId;
    }
    if (!marcaId && vehicleData.Brand && typeof vehicleData.Brand === 'object') {
      marcaId = vehicleData.Brand.id || vehicleData.Brand.marcaId || vehicleData.Brand.brandId;
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
    // Validar que la marca esté seleccionada
    if (!values.marca || values.marca === null) {
      setFieldError("marca", "Debe seleccionar una marca");
      setSubmitting(false);
      showToast({ 
        severity: "error", 
        summary: "Error de validación", 
        detail: "Debe seleccionar una marca", 
        life: 5000 
      });
      return;
    }

    // Convertir el ID de marca a número si es necesario
    const marcaId = Number(values.marca);
    if (isNaN(marcaId)) {
      setFieldError("marca", "El ID de marca no es válido");
      setSubmitting(false);
      showToast({ 
        severity: "error", 
        summary: "Error de validación", 
        detail: "El ID de marca no es válido", 
        life: 5000 
      });
      return;
    }

    // Verificar que la marca existe en la lista de marcas disponibles
    const marcaExiste = brands.some(brand => {
      const brandId = brand.id || brand.marcaId || brand.marca_id;
      return Number(brandId) === marcaId;
    });

    if (!marcaExiste) {
      setFieldError("marca", "La marca seleccionada no es válida");
      setSubmitting(false);
      showToast({ 
        severity: "error", 
        summary: "Error de validación", 
        detail: "La marca seleccionada no existe en el sistema. Por favor, seleccione una marca válida.", 
        life: 5000 
      });
      return;
    }

    // Verificar que la marca existe en el backend antes de crear el vehículo
    try {
      console.log("Verificando marca en backend con ID:", marcaId);
      const brandCheck = await brandsService.get(marcaId);
      console.log("Respuesta del backend al verificar marca:", brandCheck);
      
      if (brandCheck.status !== 200 || !brandCheck.data?.data) {
        setFieldError("marca", "La marca no existe en el sistema");
        setSubmitting(false);
        showToast({ 
          severity: "error", 
          summary: "Error de validación", 
          detail: `La marca con ID ${marcaId} no existe en el backend. Por favor, seleccione una marca válida.`, 
          life: 5000 
        });
        return;
      }
      
      const marcaBackend = brandCheck.data?.data || brandCheck.data;
      console.log("Marca encontrada en backend:", marcaBackend);
      
      // Verificar si la marca está activa
      if (marcaBackend.is_active === false) {
        setFieldError("marca", "La marca seleccionada no está activa");
        setSubmitting(false);
        showToast({ 
          severity: "error", 
          summary: "Error de validación", 
          detail: "La marca seleccionada no está activa. Por favor, seleccione una marca activa.", 
          life: 5000 
        });
        return;
      }
    } catch (err) {
      console.error("Error al verificar marca en backend:", err);
      setFieldError("marca", "Error al verificar la marca");
      setSubmitting(false);
      showToast({ 
        severity: "error", 
        summary: "Error", 
        detail: `Error al verificar la marca: ${err?.data?.message || err?.message || "Error desconocido"}`, 
        life: 5000 
      });
      return;
    }

    // Obtener información de la marca seleccionada para debug
    const marcaSeleccionada = brands.find(brand => {
      const brandId = brand.id || brand.marcaId || brand.marca_id;
      return Number(brandId) === marcaId;
    });

    // Intentar diferentes formatos según lo que el backend pueda esperar
    // Primero intentamos con brandId (camelCase, nombre del modelo en inglés)
    const payload = {
      brandId: marcaId,
      modelo: values.modelo.trim(),
      ...(values.anio && { anio: values.anio }),
      ...(values.precio_diario !== null && { precio_dia: values.precio_diario }),
      disponible: values.disponible !== undefined ? values.disponible : true,
      is_active: values.is_active !== undefined ? values.is_active : true
    };

    // Log para debug (puedes removerlo después)
    console.log("=== DEBUG CREAR VEHÍCULO ===");
    console.log("Payload enviado:", JSON.stringify(payload, null, 2));
    console.log("Marca ID:", marcaId, typeof marcaId);
    console.log("Marca seleccionada:", marcaSeleccionada);
    console.log("Marcas disponibles:", brands);
    console.log("===========================");

    let result;
    if (isEdit) {
      result = await updateCar(Number(id), payload);
    } else {
      result = await createCar(payload);
    }

    let { ok, message } = result;
    console.log("Resultado primer intento (brandId):", { ok, message, fullResult: result });
    
    // Si falla con brandId, intentar con marcaId
    if (!ok && message?.toLowerCase().includes("marca")) {
      console.log("Intento fallido con brandId, intentando con marcaId");
      const payloadAlt = {
        marcaId: marcaId,
        modelo: values.modelo.trim(),
        ...(values.anio && { anio: values.anio }),
        ...(values.precio_diario !== null && { precio_dia: values.precio_diario }),
        disponible: values.disponible !== undefined ? values.disponible : true,
        is_active: values.is_active !== undefined ? values.is_active : true
      };
      
      console.log("Payload alternativo (marcaId):", JSON.stringify(payloadAlt, null, 2));
      
      if (isEdit) {
        result = await updateCar(Number(id), payloadAlt);
      } else {
        result = await createCar(payloadAlt);
      }
      console.log("Resultado segundo intento (marcaId):", { ok: result.ok, message: result.message, fullResult: result });
      ok = result.ok;
      message = result.message;
      
      // Si aún falla, intentar con marca_id
      if (!ok && message?.toLowerCase().includes("marca")) {
        console.log("Intento fallido con marcaId, intentando con marca_id");
        const payloadAlt2 = {
          marca_id: marcaId,
          modelo: values.modelo.trim(),
          ...(values.anio && { anio: values.anio }),
          ...(values.precio_diario !== null && { precio_dia: values.precio_diario }),
          disponible: values.disponible !== undefined ? values.disponible : true,
          is_active: values.is_active !== undefined ? values.is_active : true
        };
        
        console.log("Payload alternativo (marca_id):", JSON.stringify(payloadAlt2, null, 2));
        
        if (isEdit) {
          result = await updateCar(Number(id), payloadAlt2);
        } else {
          result = await createCar(payloadAlt2);
        }
        console.log("Resultado tercer intento (marca_id):", { ok: result.ok, message: result.message, fullResult: result });
        ok = result.ok;
        message = result.message;
      }
    }
    
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
                          value: Number(brand.id) // Asegurar que el valor sea un número
                        }));
                        
                        return (
                          <Dropdown
                            id="marca"
                            value={field.value !== null && field.value !== undefined ? Number(field.value) : null}
                            options={brandOptions}
                            onChange={(e) => {
                              const value = e.value !== null && e.value !== undefined ? Number(e.value) : null;
                              form.setFieldValue("marca", value);
                            }}
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

