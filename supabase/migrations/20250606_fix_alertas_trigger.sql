
-- Verificamos si ya existe el trigger y lo eliminamos para recrearlo correctamente
DROP TRIGGER IF EXISTS verificar_umbrales_trigger ON lectura;

-- Recreamos la función verificar_umbrales para asegurarnos que funcione correctamente
CREATE OR REPLACE FUNCTION public.verificar_umbrales()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  umbral_record RECORD;
  tina_record RECORD;
BEGIN
  -- Obtener la tina asociada al sensor
  SELECT t.* INTO tina_record
  FROM public.tinas t
  WHERE t.sensor_id = NEW.sensor_id;
  
  IF NOT FOUND THEN
    RAISE LOG 'No se encontró tina para el sensor_id: %', NEW.sensor_id;
    RETURN NEW;
  END IF;
  
  -- Obtener umbrales para esta tina
  SELECT * INTO umbral_record
  FROM public.umbrales_tina
  WHERE tina_id = tina_record.id;
  
  IF NOT FOUND THEN
    RAISE LOG 'No se encontraron umbrales para la tina_id: %', tina_record.id;
    RETURN NEW;
  END IF;
  
  RAISE LOG 'Verificando umbrales para tina: %, sensor: %, lecturas: pH=%, temp=%, hum=%', 
    tina_record.nombre, NEW.sensor_id, NEW.pH, NEW.temperatura, NEW.humedad;
  
  -- Verificar pH
  IF NEW.pH IS NOT NULL THEN
    IF umbral_record.ph_max IS NOT NULL AND NEW.pH > umbral_record.ph_max THEN
      RAISE LOG 'Alerta: pH alto - % > %', NEW.pH, umbral_record.ph_max;
      
      INSERT INTO public.alertas (tina_id, tipo_alerta, valor_actual, valor_umbral, mensaje, lectura_id)
      VALUES (
        tina_record.id,
        'ph_alto',
        NEW.pH,
        umbral_record.ph_max,
        'El pH de la tina ' || tina_record.nombre || ' ha superado el umbral máximo: ' || NEW.pH || ' > ' || umbral_record.ph_max,
        NEW.id
      );
    END IF;
    
    IF umbral_record.ph_min IS NOT NULL AND NEW.pH < umbral_record.ph_min THEN
      RAISE LOG 'Alerta: pH bajo - % < %', NEW.pH, umbral_record.ph_min;
      
      INSERT INTO public.alertas (tina_id, tipo_alerta, valor_actual, valor_umbral, mensaje, lectura_id)
      VALUES (
        tina_record.id,
        'ph_bajo',
        NEW.pH,
        umbral_record.ph_min,
        'El pH de la tina ' || tina_record.nombre || ' está por debajo del umbral mínimo: ' || NEW.pH || ' < ' || umbral_record.ph_min,
        NEW.id
      );
    END IF;
  END IF;
  
  -- Verificar temperatura
  IF NEW.temperatura IS NOT NULL THEN
    IF umbral_record.temperatura_max IS NOT NULL AND NEW.temperatura > umbral_record.temperatura_max THEN
      RAISE LOG 'Alerta: temperatura alta - % > %', NEW.temperatura, umbral_record.temperatura_max;
      
      INSERT INTO public.alertas (tina_id, tipo_alerta, valor_actual, valor_umbral, mensaje, lectura_id)
      VALUES (
        tina_record.id,
        'temperatura_alta',
        NEW.temperatura,
        umbral_record.temperatura_max,
        'La temperatura de la tina ' || tina_record.nombre || ' ha superado el umbral máximo: ' || NEW.temperatura || '°C > ' || umbral_record.temperatura_max || '°C',
        NEW.id
      );
    END IF;
    
    IF umbral_record.temperatura_min IS NOT NULL AND NEW.temperatura < umbral_record.temperatura_min THEN
      RAISE LOG 'Alerta: temperatura baja - % < %', NEW.temperatura, umbral_record.temperatura_min;
      
      INSERT INTO public.alertas (tina_id, tipo_alerta, valor_actual, valor_umbral, mensaje, lectura_id)
      VALUES (
        tina_record.id,
        'temperatura_baja',
        NEW.temperatura,
        umbral_record.temperatura_min,
        'La temperatura de la tina ' || tina_record.nombre || ' está por debajo del umbral mínimo: ' || NEW.temperatura || '°C < ' || umbral_record.temperatura_min || '°C',
        NEW.id
      );
    END IF;
  END IF;
  
  -- Verificar humedad
  IF NEW.humedad IS NOT NULL THEN
    IF umbral_record.humedad_max IS NOT NULL AND NEW.humedad > umbral_record.humedad_max THEN
      RAISE LOG 'Alerta: humedad alta - % > %', NEW.humedad, umbral_record.humedad_max;
      
      INSERT INTO public.alertas (tina_id, tipo_alerta, valor_actual, valor_umbral, mensaje, lectura_id)
      VALUES (
        tina_record.id,
        'humedad_alta',
        NEW.humedad,
        umbral_record.humedad_max,
        'La humedad de la tina ' || tina_record.nombre || ' ha superado el umbral máximo: ' || NEW.humedad || '% > ' || umbral_record.humedad_max || '%',
        NEW.id
      );
    END IF;
    
    IF umbral_record.humedad_min IS NOT NULL AND NEW.humedad < umbral_record.humedad_min THEN
      RAISE LOG 'Alerta: humedad baja - % < %', NEW.humedad, umbral_record.humedad_min;
      
      INSERT INTO public.alertas (tina_id, tipo_alerta, valor_actual, valor_umbral, mensaje, lectura_id)
      VALUES (
        tina_record.id,
        'humedad_baja',
        NEW.humedad,
        umbral_record.humedad_min,
        'La humedad de la tina ' || tina_record.nombre || ' está por debajo del umbral mínimo: ' || NEW.humedad || '% < ' || umbral_record.humedad_min || '%',
        NEW.id
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Crear el trigger para verificar umbrales después de cada INSERT en la tabla lectura
CREATE TRIGGER verificar_umbrales_trigger
AFTER INSERT ON public.lectura
FOR EACH ROW
EXECUTE FUNCTION public.verificar_umbrales();

-- Asegurarnos que las tablas estén habilitadas para realtime
ALTER TABLE public.alertas REPLICA IDENTITY FULL;
ALTER TABLE public.tinas REPLICA IDENTITY FULL;
ALTER TABLE public.umbrales_tina REPLICA IDENTITY FULL;
ALTER TABLE public.lectura REPLICA IDENTITY FULL;

-- Asegurarnos que las tablas estén en la publicación realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.alertas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tinas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.umbrales_tina;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lectura;
