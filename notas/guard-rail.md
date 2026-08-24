# Guard rail operativo

## Antes de ejecutar

1. Usar `GUILD_ID` para registrar comandos en un servidor de pruebas.
2. Revisar `/crear preview` antes de crear una estructura grande.
3. Leer el resumen de `/eliminar` y confirmar solo el alcance deseado.
4. Comprobar que el rol del bot esta por encima de los roles gestionables.

## Durante la operacion

- Crear y borrar es secuencial para que cada fallo quede aislado.
- El progreso se publica en una respuesta efimera y se actualiza con limite de frecuencia.
- Los errores individuales se acumulan en el resumen sin detener todos los elementos restantes.
- No se intenta borrar `@everyone`, roles gestionados ni roles por encima del bot.

## Antes de publicar cambios

- Ejecutar `node --check` sobre todos los archivos de `src`.
- Ejecutar la prueba local del parser.
- No poner tokens reales en el repositorio.
- No cambiar el contrato de retorno de los handlers sin actualizar los comandos consumidores.
