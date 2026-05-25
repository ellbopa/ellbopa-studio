# Ellbopa Music

Plataforma musical premium tipo marketplace para beats, presets, sound kits, servicios de estudio, comunidad, clientes y admin.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Auth.js / NextAuth
- Stripe Checkout + webhooks
- Zod para validacion
- Nodemailer/SMTP para emails
- UploadThing para archivos pesados de productores

## Funciones principales

- Roles: `ARTIST`, `PRODUCER`, `ENGINEER`, `STUDIO`, `ADMIN`.
- Marketplace gratis para usuarios: registrarse, subir y publicar no tiene costo obligatorio.
- Comision interna por venta: Ellbopa Studio retiene 20% y el creador recibe 80%.
- Wallet interno para productores/ingenieros con historial, balance disponible y solicitudes de payout manual.
- Onboarding por rol con perfil inicial, ubicacion, generos, redes y precio base.
- Marketplace con busqueda, filtros por tipo, precio, genero, key y sorting.
- Paginas de detalle en `/producto/[id]` con preview, waveform visual, licencias y compra.
- Licencias para beats: Basic, Premium y Unlimited.
- Favoritos protegidos por login.
- Sound Kits en `/sound-kits`.
- Comunidad con feed, posts y comentarios demo/fallback.
- Perfiles publicos en `/u/[username]`.
- Dashboard de artista, productor, ingeniero y estudio.
- Admin panel con ventas, ordenes, reservas, usuarios activos, productos, pagos, settings y notificaciones.
- Checkout con Stripe, PayPal o transferencia.
- Webhook de Stripe para marcar pagos, desbloquear descargas y enviar email.
- Descargas privadas en `/descargas/[orderId]`.
- Upload real de cover, preview MP3/WAV y archivos finales MP3/WAV/ZIP con UploadThing.
- SEO: sitemap dinamico, robots, Open Graph en productos/perfiles.
- Fallback local en `data/*.json` cuando PostgreSQL local no esta activo.

## Variables de entorno

Crea `.env` con:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ellbopa_studio"
AUTH_SECRET="genera-con-npx-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
AUTH_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
FACEBOOK_CLIENT_ID=""
FACEBOOK_CLIENT_SECRET=""
APPLE_CLIENT_ID=""
APPLE_CLIENT_SECRET=""

STRIPE_SECRET_KEY=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""
STRIPE_WEBHOOK_SECRET=""

PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
PAYPAL_ENV="sandbox"
PAYPAL_DOP_USD_RATE="60"

SMTP_HOST=""
SMTP_PORT="587"
SMTP_USER=""
SMTP_PASS=""
EMAIL_FROM="Ellbopa Music <no-reply@ellbopa.com>"

UPLOADTHING_TOKEN=""
```

## Google OAuth

Callback local:

```txt
http://localhost:3000/api/auth/callback/google
```

Callback produccion:

```txt
https://TU-DOMINIO.com/api/auth/callback/google
```

## Stripe

Webhook:

```txt
https://TU-DOMINIO.com/api/stripe/webhook
```

Evento principal:

```txt
checkout.session.completed
```

Prueba local con Stripe CLI:

```bash
stripe login
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copia el `whsec_...` que imprime Stripe CLI en `.env`:

```bash
STRIPE_WEBHOOK_SECRET="whsec_..."
```

Luego prueba con una tarjeta de test, por ejemplo:

```txt
4242 4242 4242 4242
```

Cuando Stripe envie `checkout.session.completed`, el webhook marca el pago como `PAID`, actualiza la orden, desbloquea `/descargas/[orderId]` y envia el email de compra completada si SMTP esta configurado.

Si estas probando local y olvidas correr Stripe CLI, `/compras?success=1&session_id=...` hace una sincronizacion segura: consulta la sesion con `STRIPE_SECRET_KEY`, confirma que `payment_status` sea `paid`, valida que `metadata.userId` coincida con el usuario logueado y actualiza `Order`/`Payment` sin exponer el `fileUrl`.

### Cambiar Stripe a modo real/live

No hay claves Stripe hardcodeadas en el codigo. Para produccion configura estas variables en Vercel con claves reales:

```bash
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_APP_URL="https://ellbopa-studio.vercel.app"
NEXT_PUBLIC_SITE_URL="https://ellbopa-studio.vercel.app"
```

En Stripe Dashboard crea un endpoint live apuntando a:

```txt
https://ellbopa-studio.vercel.app/api/stripe/webhook
```

Eventos recomendados:

```txt
checkout.session.completed
payment_intent.succeeded
charge.refunded
```

El admin muestra si `STRIPE_SECRET_KEY` parece `TEST`, `LIVE` o `NO CONFIG` sin revelar la clave.

## PayPal

PayPal Checkout esta integrado como metodo adicional. Usa el mismo modelo `Order`/`Payment`, desbloquea las descargas protegidas, procesa comision 20% y suma wallet 80%.

Variables:

```bash
PAYPAL_CLIENT_ID=""
PAYPAL_CLIENT_SECRET=""
PAYPAL_ENV="sandbox" # sandbox o live
PAYPAL_DOP_USD_RATE="60"
```

Nota: muchas cuentas PayPal no procesan DOP directamente. El checkout PayPal convierte RD$ a USD usando `PAYPAL_DOP_USD_RATE`. Ajusta la tasa antes de abrir ventas reales.

## UploadThing

Para subir beats, presets y sound kits reales sin guardar archivos pesados en el servidor:

1. Crea una app en UploadThing.
2. Copia el token en `.env`:

```bash
UPLOADTHING_TOKEN="tu-token"
```

3. Reinicia `npm run dev`.

La ruta protegida es `/api/uploadthing`. Solo usuarios `PRODUCER`, `ENGINEER` o `ADMIN` pueden subir archivos. Los formatos permitidos son JPG, PNG, MP3, WAV y ZIP. El archivo final se guarda en el producto, pero la descarga se sirve desde `/api/download/[orderId]` despues de validar que la compra este pagada.

## Wallet, comisiones y payouts

El modelo de negocio es gratis para creadores:

- Registro gratis.
- Subida de beats, presets y sound kits gratis.
- Publicacion gratis.
- Sin membresia obligatoria para vender.
- La plataforma cobra solo cuando ocurre una venta.

Cada orden pagada procesa una comision idempotente:

```txt
Venta total: 100%
Comision Ellbopa Studio: 20%
Ganancia creador: 80%
```

Cuando una orden queda `PAID`, el sistema:

1. Calcula `platformFeeAmount` y `creatorEarnings`.
2. Guarda esos valores en `Order`.
3. Crea una `WalletTransaction` tipo `SALE_EARNING`.
4. Suma el balance disponible al `Wallet` del productor/ingeniero.
5. Evita duplicados usando `orderId` unico en la transaccion.

Los creadores pueden pedir payout desde su dashboard. El admin lo gestiona en el panel `Payouts` con estados `PENDING`, `APPROVED`, `REJECTED` y `PAID`. Todavia no ejecuta transferencia bancaria real; deja la contabilidad interna lista para pagar manualmente.

## Comandos

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
npm run lint
npm run build
npm run dev
```

## Setup beta limpio con Neon vacio

Para una beta real no corras `npm run prisma:seed`. Ese comando es solo para datos demo.

1. Verifica variables y migraciones:

```bash
npx prisma generate
npx prisma migrate deploy
```

2. Inicia la app:

```bash
npm run dev
```

3. Registra tu primera cuenta desde `/registro` o con Google.

4. Promueve esa cuenta a admin usando el email exacto registrado:

```bash
npm run make:admin -- tu-email@dominio.com
```

Este comando es seguro para produccion beta: no crea usuarios, no crea productos y no inserta datos demo. Si el email no existe, falla y te pide registrar la cuenta primero.

5. Cierra sesion y vuelve a iniciar sesion para refrescar el rol.

6. Entra al checklist interno:

```txt
http://localhost:3000/admin/testing
```

7. Crea o sube el primer producto real desde:

```txt
http://localhost:3000/dashboard/producer/upload
```

El producto debe tener cover, preview y archivo final para que la descarga protegida pueda funcionar.

8. Prueba la compra con Stripe test. En local, corre Stripe CLI en otra terminal:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Usa tarjeta test:

```txt
4242 4242 4242 4242
```

9. Confirma el flujo en:

```txt
http://localhost:3000/compras
http://localhost:3000/admin/testing
```

## PostgreSQL local con Docker Compose

El `.env` local apunta a:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ellbopa_studio?schema=public"
```

Eso espera un PostgreSQL corriendo en `localhost:5432`. Si no tienes PostgreSQL instalado, levanta el contenedor:

```bash
docker compose up -d postgres
docker compose ps
npx prisma migrate dev
npm run prisma:seed
```

Si `docker` no existe en tu terminal, instala Docker Desktop o PostgreSQL nativo y vuelve a correr los comandos.

Si PostgreSQL local no esta activo, la app sigue funcionando con fallback local para productos, usuarios demo, comunidad, ordenes y pagos.

## Limpieza de beta

Antes de lanzar una beta publica puedes revisar conteos y preparar limpieza sin borrar nada:

```bash
npm run clean:beta
```

Para ejecutar la limpieza real se exige confirmacion explicita:

```bash
npm run clean:beta -- --confirm
```

El script crea backup en `backups/`, conserva `ellbopamusic@gmail.com` como admin y borra productos, ordenes, pagos, wallets, payouts, posts, favoritos, follows, reviews, reservas y vistas de prueba. No borra usuarios normales salvo que ejecutes:

```bash
npm run clean:beta -- --confirm --include-non-admin-users
```

No ejecutes la limpieza real sin confirmar que ya no necesitas esos datos.

## Produccion

- Configura PostgreSQL real y ejecuta `npx prisma migrate dev` o migraciones equivalentes.
- Configura Stripe live keys, `STRIPE_WEBHOOK_SECRET` y webhook live.
- Configura PayPal live si quieres aceptar PayPal en produccion.
- Configura SMTP real para OTP, recuperacion, recibos y compras.
- Configura `UPLOADTHING_TOKEN` para subir archivos grandes fuera del servidor.
- Actualiza `NEXTAUTH_URL`, `AUTH_URL` y `NEXT_PUBLIC_SITE_URL` al dominio final.
