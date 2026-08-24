# Bot Discord · Server Builder

Réplica mejorada del bot original para crear y administrar estructuras de servidores Discord con confirmaciones, paneles interactivos y progreso privado.

## Instalación

1. Clona o descarga el proyecto.
2. Copia `.env.example` a `.env` y completa tus credenciales.
3. Ejecuta:

```bash
npm install
```

## Configuración

Configura las variables en `.env`:

- `DISCORD_TOKEN`: token de tu bot.
- `CLIENT_ID`: ID del bot.
- `LOG_CHANNEL_ID`: ID del canal donde se enviarán los logs de administración.

Los comandos se registran globalmente y funcionan en todos los servidores donde invites el bot. `GUILD_ID` ya no es necesario.

## Comandos disponibles

- `/crear`: crear estructura a partir de texto.
- `/crear preview`: previsualizar estructura sin crear.
- `/eliminar`: eliminar estructura completa.
- `/eliminar-categoria`: eliminar solo categorías.
- `/eliminar-canales`: eliminar solo canales.
- `/eliminar-roles`: eliminar solo roles.
- `/limpiar cantidad`: eliminar mensajes del canal.
- `/mensaje`: crear un anuncio con título, descripción, imagen y pie de página.
- `/help`: abrir una guía navegable por secciones.
- `/panel`: abrir un panel de control con accesos a ayuda e información.
- `/permisos help`: ver todos los comandos y permisos disponibles.
- `/permisos asignar rol`: asignar permisos y color a un rol.

## Formato de `/crear`

Cada línea representa un elemento:

```text
- Categoría
+ Canal de texto
> Canal de voz
# Canal de anuncios
! Canal de foro
^ Canal de escenario
% Canal multimedia
@ Rol #00FF00
```

La opción `preview` permite revisar el resultado antes de crear nada.

## Progreso y seguridad

- Las operaciones de borrado se confirman con botones.
- El progreso se muestra en una respuesta efímera, por lo que no desaparece aunque se elimine el canal de origen.
- El bot procesa cada elemento de forma secuencial y continúa después de errores individuales.
- Se respetan `@everyone`, roles gestionados y la jerarquía del bot.
- Las decisiones operativas y pendientes están en `notas/`.

## Uso

1. Ejecuta `npm run deploy-commands` para registrar los comandos globales en Discord.
2. Invita el bot a cada servidor usando los scopes `bot` y `applications.commands`, con los permisos necesarios para administrar canales, roles y mensajes.
3. Ejecuta `npm start` para iniciar el bot.

## Notas

- Se usa `discord.js` v14 con Slash Commands, Buttons, Select Menus, Modals, Embeds y `.env`.
- La carpeta original `server-builder` no se modifica.
