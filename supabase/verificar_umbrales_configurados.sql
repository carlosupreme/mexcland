
-- Script para verificar los umbrales configurados
-- Ejecutar en la consola SQL de Supabase

-- Ver todas las tinas con sus umbrales
SELECT 
  t.id as tina_id,
  t.nombre as tina_nombre,
  t.sensor_id,
  s.device_id as sensor_device_id,
  u.ph_min,
  u.ph_max,
  u.temperatura_min,
  u.temperatura_max,
  u.humedad_min,
  u.humedad_max
FROM 
  tinas t
LEFT JOIN 
  umbrales_tina u ON t.id = u.tina_id
LEFT JOIN
  sensores s ON t.sensor_id = s.id;

-- Ver últimas 5 lecturas con sus tinas asociadas
SELECT 
  l.*,
  t.id as tina_id,
  t.nombre as tina_nombre
FROM 
  lectura l
LEFT JOIN
  tinas t ON l.sensor_id = t.sensor_id
ORDER BY l.created_at DESC
LIMIT 5;

-- Ver si hay umbrales que no se han configurado correctamente
SELECT
  t.id as tina_id,
  t.nombre as tina_nombre,
  CASE WHEN u.id IS NULL THEN 'Sin umbrales configurados'
       ELSE 'Umbrales configurados' END as estado_umbrales,
  CASE WHEN t.sensor_id IS NULL THEN 'Sin sensor asociado'
       ELSE 'Con sensor asociado: ' || t.sensor_id::text END as estado_sensor
FROM
  tinas t
LEFT JOIN
  umbrales_tina u ON t.id = u.tina_id;
