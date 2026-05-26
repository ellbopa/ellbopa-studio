import { redirect } from "next/navigation";
import {
  Activity,
  BarChart3,
  Bell,
  CalendarDays,
  ChevronDown,
  Cloud,
  CreditCard,
  Disc3,
  FileAudio,
  FolderOpen,
  Gauge,
  Gift,
  Grid3X3,
  HardDrive,
  LayoutDashboard,
  MessageSquare,
  Music2,
  Search,
  Settings,
  Palette,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Upload,
  Users,
  Wallet,
  WandSparkles
} from "lucide-react";
import { WorkStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDop } from "@/lib/format";
import { getSiteConfig, listToTextarea } from "@/lib/site-config";
import { isAdminUser } from "@/lib/admin";
import { getActivity } from "@/lib/activity";
import { getNotifications } from "@/lib/notifications";
import { ProductUploadForm } from "@/components/product-upload-form";
import { PLATFORM_FEE_PERCENT } from "@/lib/wallet";
import { getPayPalStatusLabel } from "@/lib/paypal";

export const metadata = { title: "Studio OS | Admin" };

const statuses = Object.values(WorkStatus);

const navItems = [
  ["Dashboard", "#dashboard", LayoutDashboard],
  ["Marketplace", "#tracks", ShoppingBag],
  ["Tracks", "#tracks", Music2],
  ["Sound Kits", "#tracks", Disc3],
  ["Servicios", "#services", Star],
  ["Orders", "#orders", CreditCard],
  ["Usuarios", "/admin/users", Users],
  ["Customers", "#customers", Users],
  ["Analytics", "#analytics", BarChart3],
  ["Notifications", "#notifications", Bell],
  ["Messages", "#messages", MessageSquare],
  ["File Storage", "#storage", FolderOpen],
  ["Discounts", "#settings", Gift],
  ["Reviews", "#analytics", Star],
  ["Collaborations", "#messages", WandSparkles],
  ["Bookings", "#bookings", CalendarDays],
  ["Payouts", "#payouts", Wallet],
  ["Apariencia", "/admin/appearance", Palette],
  ["Settings", "#settings", Settings]
] as const;

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/cliente/login");
  if (!isAdminUser(session.user)) redirect("/");

  let orders: Array<any> = [];
  let bookings: Array<any> = [];
  let products: Array<any> = [];
  let payments: Array<any> = [];
  let users: Array<any> = [];
  let payoutRequests: Array<any> = [];
  let wallets: Array<any> = [];
  let totalUsers = 0;
  let totalProducts = 0;
  let totalOrders = 0;
  let totalPayments = 0;
  let totalPageViews = 0;
  let usersToday = 0;
  const siteConfig = await getSiteConfig();
  const activity = await getActivity();
  const notifications = await getNotifications();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  [orders, bookings, products, payments, users, payoutRequests, wallets, totalUsers, totalProducts, totalOrders, totalPayments, totalPageViews, usersToday] = await Promise.all([
    safeAdminQuery("orders", () => prisma.order.findMany({ include: { user: true, product: true }, orderBy: { createdAt: "desc" }, take: 250 }), []),
    safeAdminQuery("bookings", () => prisma.booking.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 250 }), []),
    safeAdminQuery("products", () => prisma.product.findMany({ orderBy: { createdAt: "desc" }, include: { owner: true, _count: { select: { orders: true, favorites: true, views: true } } }, take: 250 }), []),
    safeAdminQuery("payments", () => prisma.payment.findMany({ include: { user: true, order: { include: { product: true } } }, orderBy: { createdAt: "desc" }, take: 250 }), []),
    safeAdminQuery("users", () => prisma.user.findMany({ orderBy: { createdAt: "desc" }, include: { _count: { select: { orders: true, products: true, payments: true, pageViews: true } } }, take: 100 }), []),
    safeAdminQuery("payouts", () => prisma.payoutRequest.findMany({ include: { user: true }, orderBy: { createdAt: "desc" }, take: 50 }), []),
    safeAdminQuery("wallets", () => prisma.wallet.findMany({ include: { user: true }, orderBy: { updatedAt: "desc" }, take: 50 }), []),
    safeAdminQuery("totalUsers", () => prisma.user.count(), 0),
    safeAdminQuery("totalProducts", () => prisma.product.count({ where: { active: true } }), 0),
    safeAdminQuery("totalOrders", () => prisma.order.count(), 0),
    safeAdminQuery("totalPayments", () => prisma.payment.count(), 0),
    safeAdminQuery("totalPageViews", () => prisma.pageView.count(), 0),
    safeAdminQuery("usersToday", () => prisma.user.count({ where: { createdAt: { gte: todayStart } } }), 0)
  ]);

  const paidPayments = payments.filter((payment) => payment.status === "PAID");
  const revenue = paidPayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0) || orders.reduce((sum, order) => sum + Number(order.paidAmount || 0), 0);
  const soldProducts = orders.filter((order) => order.productId && Number(order.paidAmount || 0) > 0).length;
  const pendingBookings = bookings.filter((booking) => booking.status === "PENDING").length;
  const topBuyers = getTopBuyers(orders, payments);
  const topItems = getTopItems(orders);
  const pageViews = getPageViews(activity.recent);
  const recentLeads = [...orders.slice(0, 5), ...bookings.slice(0, 5)].slice(0, 8);
  const beatProducts = products.filter((product) => product.type === "BEAT");
  const digitalProducts = products.filter((product) => product.type === "BEAT" || product.type === "PRESET");
  const storageItems = getStorageItems(products);
  const conversion = orders.length ? Math.round((paidPayments.length / orders.length) * 100) : 0;
  const uploadConfigured = Boolean(process.env.UPLOADTHING_TOKEN || (process.env.UPLOADTHING_SECRET && process.env.UPLOADTHING_APP_ID));
  const paypalMode = getPayPalStatusLabel();
  const stripeMode = getStripeMode();
  const databaseMode = getDatabaseMode();
  const platformFees = orders.reduce((sum, order) => sum + Number(order.platformFeeAmount || 0), 0);
  const creatorBalances = wallets.reduce((sum, wallet) => sum + Number(wallet.availableBalance || 0) + Number(wallet.pendingBalance || 0), 0);
  const salesByDay = groupMoneyByDay(paidPayments, "amount", 12);
  const registrationsByDay = groupCountByDay(users, 12);
  const revenueByMonth = groupMoneyByMonth(paidPayments, "amount", 6);

  return (
    <main className="min-h-screen bg-[#030303] text-white">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_10%,rgba(220,20,30,0.24),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(255,180,70,0.12),transparent_24%),linear-gradient(180deg,#070707,#030303_48%,#0a0202)]" />
      <div className="mx-auto grid max-w-[1880px] lg:grid-cols-[282px_minmax(0,1fr)]">
        <aside className="hidden border-r border-white/10 bg-black/55 backdrop-blur-2xl lg:sticky lg:top-[108px] lg:block lg:h-[calc(100vh-108px)] lg:overflow-y-auto">
          <div className="p-5">
            <div className="flex items-center gap-3 rounded-2xl border border-red-500/20 bg-white/[0.04] p-4">
              <div className="grid size-11 place-items-center rounded-xl bg-red-600 shadow-[0_0_35px_rgba(255,0,24,0.42)]">
                <Gauge className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-red-200/70">Studio OS</p>
                <h1 className="font-display text-lg font-black">Ellbopa Music</h1>
              </div>
            </div>

            <nav className="mt-6 space-y-1">
              {navItems.map(([label, href, Icon], index) => (
                <a
                  key={`${label}-${index}`}
                  href={href}
                  className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/62 transition hover:bg-red-500/10 hover:text-white ${index === 0 ? "border border-red-500/25 bg-red-500/15 text-white shadow-[0_0_28px_rgba(255,0,34,0.16)]" : ""}`}
                >
                  <Icon className="size-4 text-red-200/75 transition group-hover:text-red-300" />
                  <span>{label}</span>
                </a>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-white/45">Disponible</p>
                <Wallet className="size-4 text-studio-gold" />
              </div>
              <p className="mt-2 font-display text-2xl font-black text-studio-gold">{formatDop(revenue)}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-red-700 via-red-500 to-amber-300 shadow-[0_0_20px_rgba(255,30,30,0.5)]" />
              </div>
              <p className="mt-3 text-xs text-white/48">{soldProducts} ventas digitales / {activity.activeCount} usuarios activos</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <div className="sticky top-[108px] z-30 border-b border-white/10 bg-[#070707]/86 px-4 py-3 backdrop-blur-2xl sm:px-6 xl:px-8">
            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-[240px] flex-1 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 shadow-[0_20px_80px_rgba(0,0,0,0.28)]">
                <div className="flex items-center gap-3">
                  <Search className="size-5 text-white/45" />
                  <input placeholder="Buscar ordenes, beats, clientes, reservas..." className="w-full bg-transparent text-sm outline-none placeholder:text-white/35" />
                  <span className="hidden rounded-lg bg-white/10 px-2 py-1 text-xs text-white/50 sm:block">AI</span>
                </div>
              </div>
              <a href="#create-track" className="rounded-xl bg-red-600 px-4 py-3 text-sm font-black shadow-[0_0_35px_rgba(255,0,32,0.38)] transition hover:scale-[1.02]">Create</a>
              <a href="#upload" className="rounded-xl border border-white/12 bg-white/[0.07] px-4 py-3 text-sm font-bold transition hover:border-red-400/45 hover:bg-red-500/10">Upload</a>
              <button className="grid size-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06]"><Bell className="size-4" /></button>
              <button className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm font-bold">
                <span className="grid size-7 place-items-center rounded-full bg-red-600">{session.user.name?.[0] ?? "A"}</span>
                <ChevronDown className="size-4 text-white/50" />
              </button>
            </div>
          </div>

          <div className="space-y-8 px-4 py-6 sm:px-6 xl:px-8">
            <section id="dashboard" className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl sm:p-7">
              <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-red-200/70">Music Operating System</p>
                  <h2 className="mt-3 max-w-3xl font-display text-4xl font-black uppercase leading-[0.92] sm:text-6xl">Control room de ventas, studio y clientes.</h2>
                  <p className="mt-4 max-w-2xl text-white/58">Administra beats, presets, reservas, pagos, descargas y actividad en vivo desde un solo panel premium.</p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a href="#tracks" className="rounded-xl bg-white px-5 py-3 text-sm font-black text-black">Gestionar tracks</a>
                    <a href="#orders" className="rounded-xl border border-red-400/35 bg-red-500/10 px-5 py-3 text-sm font-black text-red-100">Ver ordenes</a>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Metric icon={Wallet} label="Ingresos totales" value={formatDop(revenue)} detail={`${totalPayments} pagos registrados`} />
                  <Metric icon={ShoppingBag} label="Ventas / ordenes" value={totalOrders} detail={`${conversion}% conversion`} />
                  <Metric icon={Music2} label="Productos" value={totalProducts} detail={`${beatProducts.length} instrumentales activos`} />
                  <Metric icon={CalendarDays} label="Reservas" value={bookings.length} detail={`${pendingBookings} pendientes`} />
                  <Metric icon={Users} label="Usuarios registrados" value={totalUsers} detail={`${usersToday} hoy / ${activity.activeCount} activos`} />
                  <Metric icon={Activity} label="Visitas / plays" value={totalPageViews} detail="Page views reales en Neon" />
                  <Metric icon={CreditCard} label="Stripe" value={stripeMode} detail="Estado de credenciales" />
                  <Metric icon={Wallet} label="PayPal" value={paypalMode} detail="Metodo adicional" />
                  <Metric icon={Cloud} label="Database" value={databaseMode} detail="Conexion usada por produccion" />
                </div>
              </div>
            </section>

            <section id="analytics" className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
              <div className="panel p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-2xl font-black">Analytics</h2>
                    <p className="mt-1 text-sm text-white/45">Ventas, conversiones, visitas y momentum del marketplace.</p>
                  </div>
                  <button className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold">Export CSV</button>
                </div>
                <div className="mt-6 grid gap-5 lg:grid-cols-3">
                  <MiniChart title="Ventas por dia" data={salesByDay} formatter={formatDop} />
                  <MiniChart title="Registros por dia" data={registrationsByDay} />
                  <MiniChart title="Ingresos por mes" data={revenueByMonth} formatter={formatDop} />
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  <Metric icon={Activity} label="Conversion rate" value={`${conversion}%`} detail={`${paidPayments.length} pagos / ${orders.length} ordenes`} />
                  <Metric icon={Users} label="Nuevos hoy" value={usersToday} detail="Registros reales" />
                  <Metric icon={Activity} label="Activos ahora" value={activity.activeCount} detail="Ultimos 5 minutos" />
                </div>
              </div>
              <div className="grid gap-4">
                <InsightCard title="Top buyers" empty="Todavia no hay compras registradas.">
                  {topBuyers.map((buyer) => <InsightRow key={buyer.name} title={buyer.name} meta={`${buyer.count} compra(s)`} value={formatDop(buyer.total)} />)}
                </InsightCard>
                <InsightCard title="Top products" empty="Todavia no hay productos vendidos.">
                  {topItems.map((item) => <InsightRow key={item.title} title={item.title} meta={`${item.count} orden(es)`} value={formatDop(item.total)} />)}
                </InsightCard>
              </div>
            </section>

            <section id="tracks" className="panel p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-3xl font-black">Tracks</h2>
                  <p className="mt-1 text-sm text-white/45">Vista tipo BeatStars Studio para instrumentales, presets y sound kits.</p>
                </div>
                <div className="flex gap-2">
                  <button className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-bold"><SlidersHorizontal className="mr-2 inline size-4" />Filtros</button>
                  <button className="grid size-10 place-items-center rounded-xl bg-red-600"><Grid3X3 className="size-4" /></button>
                </div>
              </div>
              <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {digitalProducts.length === 0 ? <Empty text="Sube tu primer beat o preset desde Upload Files." /> : null}
                {digitalProducts.slice(0, 12).map((product, index) => <TrackCard key={`${product.id}-${index}`} product={product} />)}
              </div>
            </section>

            <section id="upload" className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
              <div className="panel p-5 sm:p-6">
                <h2 className="font-display text-2xl font-black">Upload Files</h2>
                <p className="mt-2 text-sm text-white/50">Arrastra o selecciona MP3, WAV, STEMS, ZIP y portada. El sistema guarda archivos y publica el producto.</p>
                <div className="mt-6 grid min-h-[330px] place-items-center rounded-3xl border border-dashed border-red-300/25 bg-black/35 p-8 text-center">
                  <div>
                    <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-red-600/18 text-red-100 shadow-[0_0_40px_rgba(255,0,30,0.25)]">
                      <Upload className="size-7" />
                    </div>
                    <p className="mt-5 text-lg font-black">Drop files here</p>
                    <p className="mt-2 text-sm text-white/45">browse files / Dropbox / link / stems</p>
                    <div className="mt-5 flex justify-center gap-3 text-xs text-white/50">
                      <span className="rounded-lg bg-white/10 px-3 py-2">MP3</span>
                      <span className="rounded-lg bg-white/10 px-3 py-2">WAV</span>
                      <span className="rounded-lg bg-white/10 px-3 py-2">RAR/ZIP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div id="create-track" className="panel p-5 sm:p-6">
                <h2 className="font-display text-2xl font-black">Create Track</h2>
                <div className="mt-5">
                  <ProductUploadForm uploadConfigured={uploadConfigured} returnTo="admin" />
                </div>
              </div>
            </section>

            <section id="orders" className="panel p-5 sm:p-6">
              <SectionTitle title="Orders" text="Ordenes digitales, mezcla/master y entregas privadas." />
              <div className="mt-5 space-y-3">
                {orders.length === 0 ? <Empty text="Sin ordenes todavia." /> : null}
                {orders.map((order) => (
                  <AdminRow key={order.id} entity="order" id={order.id} status={order.status} title={order.product?.title ?? order.serviceType ?? "Orden"} meta={`${order.user?.name ?? order.userId ?? "Cliente"} / ${formatDop(order.totalAmount)} / pagado ${formatDop(order.paidAmount)}`} showFinalUrl />
                ))}
              </div>
            </section>

            <section id="bookings" className="panel p-5 sm:p-6">
              <SectionTitle title="Bookings" text="Reservas de estudio, depositos y calendario operativo." />
              <div className="mt-5 space-y-3">
                {bookings.length === 0 ? <Empty text="Sin reservas todavia." /> : null}
                {bookings.map((booking) => (
                  <AdminRow key={booking.id} entity="booking" id={booking.id} status={booking.status} title={booking.serviceType} meta={`${booking.user?.name ?? booking.userId ?? "Cliente"} / ${formatAdminDate(booking.date)} ${booking.time} / deposito ${formatDop(booking.depositPaid)}/${formatDop(booking.depositRequired)}`} />
                ))}
              </div>
            </section>

            <section id="storage" className="panel p-5 sm:p-6">
              <SectionTitle title="File Storage" text="Covers, previews, zips, presets y archivos finales conectados a productos." />
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {storageItems.length === 0 ? <Empty text="Todavia no hay archivos subidos." /> : null}
                {storageItems.map((item) => <StorageRow key={`${item.product}-${item.url}`} {...item} />)}
              </div>
            </section>

            <section id="customers" className="grid gap-6 xl:grid-cols-2">
              <div className="panel p-5 sm:p-6">
                <SectionTitle title="Customers reales" text="Usuarios registrados en Neon production." badge={`${totalUsers} registrados`} />
                <div className="mt-5 space-y-3">
                  {users.length === 0 ? <Empty text="Sin usuarios registrados todavia." /> : null}
                  {users.map((user) => (
                    <div key={user.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                      <p className="font-bold">{user.name || user.email}</p>
                      <p className="mt-1 text-sm text-white/50">{user.email} / {user.role} / {formatAdminDate(user.createdAt)}</p>
                      <p className="mt-1 text-xs text-white/35">{user._count?.orders || 0} ordenes / {user._count?.products || 0} productos / {user._count?.pageViews || 0} visitas</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="panel p-5 sm:p-6">
                <SectionTitle title="Live activity" text="Paginas mas visitadas y movimientos recientes." />
                <div className="mt-5 space-y-3">
                  {pageViews.map((item) => <InsightRow key={item.path} title={item.path} meta="page views" value={String(item.count)} />)}
                  {recentLeads.map((item) => <InsightRow key={item.id} title={item.product?.title ?? item.serviceType ?? "Movimiento"} meta={item.status ?? "PENDING"} value={item.totalAmount ? formatDop(item.totalAmount) : formatDop(item.depositRequired ?? 0)} />)}
                </div>
              </div>
            </section>

            <section id="messages" className="grid gap-6 xl:grid-cols-2">
              <PlaceholderPanel title="Messages" icon={MessageSquare} text="Inbox premium preparado para chat en vivo, archivos, audio previews y notificaciones." />
              <section id="payouts" className="panel p-6">
                <SectionTitle title="Payouts" text={`Marketplace gratis: ${PLATFORM_FEE_PERCENT}% para Ellbopa y 80% para creadores.`} badge={`${payoutRequests.filter((item) => item.status === "PENDING").length} pendientes`} />
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <Metric icon={Wallet} label="Ganancia plataforma" value={formatDop(platformFees)} detail="Comisiones acumuladas" />
                  <Metric icon={CreditCard} label="Balance creadores" value={formatDop(creatorBalances)} detail="Disponible + pendiente" />
                  <Metric icon={Users} label="Wallets" value={wallets.length} detail="Creadores con balance" />
                </div>
                <div className="mt-5 space-y-3">
                  {payoutRequests.length === 0 ? <Empty text="Sin solicitudes de payout todavia." /> : null}
                  {payoutRequests.map((payout) => (
                    <form key={payout.id} action="/api/admin/payouts" method="POST" className="grid gap-3 rounded-2xl border border-white/10 bg-black/35 p-4 lg:grid-cols-[1fr_160px_1fr_auto]">
                      <input type="hidden" name="id" value={payout.id} />
                      <div>
                        <p className="font-bold">{payout.user?.name || payout.user?.email || payout.userId}</p>
                        <p className="mt-1 text-sm text-white/50">{payout.method} / {payout.status} / {formatAdminDate(payout.createdAt)}</p>
                        {payout.note ? <p className="mt-1 text-xs text-white/40">{payout.note}</p> : null}
                      </div>
                      <strong className="text-studio-gold">{formatDop(payout.amount)}</strong>
                      <input name="adminNote" placeholder="Nota admin" className="control" />
                      <div className="flex flex-wrap gap-2">
                        <button name="action" value="APPROVED" className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black">Aprobar</button>
                        <button name="action" value="REJECTED" className="rounded-lg border border-studio-gold/30 bg-studio-gold/10 px-3 py-2 text-xs font-black text-studio-gold">Rechazar</button>
                        <button name="action" value="PAID" className="rounded-lg bg-red-600 px-3 py-2 text-xs font-black">Pagado</button>
                      </div>
                    </form>
                  ))}
                </div>
              </section>
            </section>

            <section id="notifications" className="panel p-5 sm:p-6">
              <SectionTitle title="Notificaciones" text="Envia avisos desde admin. La campanita solo muestra badge cuando hay una notificacion activa." badge={`${notifications.filter((item) => item.active).length} activas`} />
              <form action="/api/admin/notifications" method="POST" className="mt-5 grid gap-4 md:grid-cols-[1fr_220px]">
                <Input name="title" label="Titulo" placeholder="Nuevo drop disponible" required />
                <label className="field">
                  Audiencia
                  <select name="audience" defaultValue="ALL" className="control">
                    <option value="ALL">Todos</option>
                    <option value="ARTIST">Artistas</option>
                    <option value="PRODUCER">Productores</option>
                    <option value="ENGINEER">Ingenieros</option>
                    <option value="STUDIO">Estudios</option>
                  </select>
                </label>
                <label className="field md:col-span-2">
                  Mensaje
                  <textarea name="message" rows={4} placeholder="Escribe lo que quieres que vea el cliente en la campanita." className="control" required />
                </label>
                <button className="rounded-xl bg-red-600 px-5 py-3 font-black shadow-[0_0_35px_rgba(255,0,32,0.34)] md:col-span-2">Enviar notificacion</button>
              </form>
              <div className="mt-5 grid gap-3 lg:grid-cols-2">
                {notifications.length === 0 ? <Empty text="No hay notificaciones enviadas. La campanita publica queda limpia." /> : null}
                {notifications.slice(0, 6).map((notification) => (
                  <div key={notification.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black">{notification.title}</p>
                        <p className="mt-1 text-sm text-white/52">{notification.message}</p>
                      </div>
                      <span className="shrink-0 rounded-full border border-red-400/25 bg-red-500/10 px-3 py-1 text-xs font-black text-studio-gold">{notification.audience}</span>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-white/35">{formatAdminDate(notification.createdAt)} / {notification.active ? "Activa" : "Inactiva"}</p>
                      <form action="/api/admin/notifications" method="POST">
                        <input type="hidden" name="id" value={notification.id} />
                        <input type="hidden" name="action" value={notification.active ? "deactivate" : "activate"} />
                        <button className="rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-xs font-black text-white/72 transition hover:border-red-400/35 hover:text-white">
                          {notification.active ? "Apagar badge" : "Activar badge"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section id="settings" className="panel p-5 sm:p-6">
              <SectionTitle title="Studio Settings" text="Branding, contacto, hero, redes, banco, colores y textos publicos." />
              <form action="/api/admin/site-settings" method="POST" className="mt-5 grid gap-4 md:grid-cols-2">
                <Input name="brandName" label="Nombre de marca" defaultValue={siteConfig.brandName} required />
                <Input name="location" label="Ubicacion" defaultValue={siteConfig.location} required />
                <label className="field md:col-span-2">Titulo hero<textarea name="heroTitle" required rows={2} defaultValue={siteConfig.heroTitle} className="control" /></label>
                <label className="field md:col-span-2">Subtitulo hero<textarea name="heroSubtitle" required rows={4} defaultValue={siteConfig.heroSubtitle} className="control" /></label>
                <Input name="heroBadge" label="Etiqueta imagen hero" defaultValue={siteConfig.heroBadge} />
                <Input name="whatsapp" label="WhatsApp sin +" defaultValue={siteConfig.whatsapp} required />
                <Input name="ctaPrimary" label="Boton principal" defaultValue={siteConfig.ctaPrimary} />
                <Input name="ctaSecondary" label="Boton beats" defaultValue={siteConfig.ctaSecondary} />
                <Input name="ctaUpload" label="Boton mezcla online" defaultValue={siteConfig.ctaUpload} />
                <Input name="instagram" label="Instagram" defaultValue={siteConfig.instagram} />
                <Input name="bankAccount" label="Cuenta bancaria" defaultValue={siteConfig.bankAccount} />
                <Input name="bankOwner" label="Nombre cuenta bancaria" defaultValue={siteConfig.bankOwner} />
                <Input name="primaryColor" label="Color rojo principal" type="color" defaultValue={siteConfig.primaryColor} />
                <Input name="goldColor" label="Color dorado" type="color" defaultValue={siteConfig.goldColor} />
                <label className="field md:col-span-2">Texto footer<textarea name="footerText" rows={3} defaultValue={siteConfig.footerText} className="control" /></label>
                <label className="field">Logos/generos, uno por linea<textarea name="artistLogos" rows={6} defaultValue={listToTextarea(siteConfig.artistLogos)} className="control" /></label>
                <label className="field">Testimonios, uno por linea<textarea name="testimonials" rows={6} defaultValue={listToTextarea(siteConfig.testimonials)} className="control" /></label>
                <button className="rounded-xl bg-red-600 px-5 py-3 font-black shadow-[0_0_35px_rgba(255,0,32,0.34)] md:col-span-2">Guardar settings</button>
              </form>
            </section>

            <section className="panel p-5 sm:p-6">
              <SectionTitle title="Pagos" text="Historial de pagos Stripe, PayPal y transferencias." />
              <div className="mt-5 grid gap-3">
                {payments.length === 0 ? <Empty text="Sin pagos todavia." /> : null}
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-white/10 bg-black/35 p-4">
                    <p className="font-bold">{payment.user?.name ?? payment.userId ?? "Cliente"}</p>
                    <p className="text-sm text-white/55">{formatDop(payment.amount)} / {payment.status} / {payment.method ?? inferPaymentMethod(payment.stripeSessionId)} / {payment.stripeSessionId}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ icon: Icon, label, value, detail }: { icon: any; label: string; value: number | string; detail: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-black/38 p-5 shadow-[0_24px_70px_rgba(0,0,0,0.24)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-white/52">{label}</p>
        <Icon className="size-5 text-red-200/70" />
      </div>
      <p className="mt-3 font-display text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-studio-gold/80">{detail}</p>
    </div>
  );
}

function MiniChart({ title, data, formatter }: { title: string; data: Array<{ label: string; value: number }>; formatter?: (value: number) => string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-black text-white">{title}</p>
        <span className="text-xs font-bold text-studio-gold">{formatter ? formatter(data.reduce((sum, item) => sum + item.value, 0)) : data.reduce((sum, item) => sum + item.value, 0)}</span>
      </div>
      <div className="mt-4 flex h-40 items-end gap-1.5">
        {data.map((item) => (
          <div key={item.label} className="group flex flex-1 items-end" title={`${item.label}: ${formatter ? formatter(item.value) : item.value}`}>
            <div className="w-full rounded-t-lg bg-gradient-to-t from-red-900 via-red-500 to-amber-300 shadow-[0_0_20px_rgba(255,0,32,0.2)] transition group-hover:brightness-125" style={{ height: `${Math.max(4, (item.value / max) * 100)}%` }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-white/32">
        <span>{data[0]?.label}</span>
        <span>{data[data.length - 1]?.label}</span>
      </div>
    </div>
  );
}

function TrackCard({ product }: { product: any }) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_22px_70px_rgba(0,0,0,0.26)] transition hover:-translate-y-1 hover:border-red-400/35 hover:shadow-[0_24px_90px_rgba(255,0,34,0.14)]">
      <div className="relative aspect-square bg-white/[0.04]">
        {product.imageUrl ? <img src={product.imageUrl} alt="" className="size-full object-cover" /> : <div className="grid size-full place-items-center"><FileAudio className="size-12 text-white/20" /></div>}
        <span className="absolute left-3 top-3 rounded-full bg-emerald-400 px-3 py-1 text-[11px] font-black text-black">PUBLISHED</span>
        <button className="absolute bottom-3 right-3 grid size-11 place-items-center rounded-full bg-red-600 opacity-0 shadow-[0_0_32px_rgba(255,0,30,0.4)] transition group-hover:opacity-100">▶</button>
      </div>
      <div className="p-4">
        <p className="truncate text-lg font-black">{product.title}</p>
        <p className="mt-1 text-sm text-white/48">{product.genre || "Urbano"} / {product.bpm || "--"} BPM / {product.musicalKey || "Key"}</p>
        <div className="mt-4 flex items-center gap-2">
          <span className="rounded-lg bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">MP3</span>
          <span className="rounded-lg bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">WAV</span>
          <span className="rounded-lg bg-white/10 px-3 py-1 text-xs font-bold text-white/55">ZIP</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="font-black text-studio-gold">{formatDop(product.price || 0)}</span>
          <span className="text-xs text-white/42">{formatAdminDate(product.createdAt || new Date())}</span>
        </div>
      </div>
    </article>
  );
}

function Input({ label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="field">
      {label}
      <input {...props} className="control" />
    </label>
  );
}

function SectionTitle({ title, text, badge }: { title: string; text: string; badge?: string }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-display text-2xl font-black">{title}</h2>
        <p className="mt-1 text-sm text-white/45">{text}</p>
      </div>
      {badge ? <span className="rounded-full border border-red-400/25 bg-red-500/10 px-4 py-2 text-sm font-black text-studio-gold">{badge}</span> : null}
    </div>
  );
}

function PlaceholderPanel({ title, text, icon: Icon }: { title: string; text: string; icon: any }) {
  return (
    <div className="panel p-6">
      <div className="grid size-12 place-items-center rounded-2xl bg-red-600/16 text-red-100">
        <Icon className="size-5" />
      </div>
      <h2 className="mt-5 font-display text-2xl font-black">{title}</h2>
      <p className="mt-2 text-sm text-white/50">{text}</p>
      <div className="mt-6 rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/42">Modulo preparado para conectar datos reales en la siguiente fase.</div>
    </div>
  );
}

function StorageRow({ type, product, url }: { type: string; product: string; url: string }) {
  return (
    <a href={url} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 transition hover:border-red-400/35 hover:bg-red-500/8">
      <div className="grid size-11 place-items-center rounded-xl bg-white/10">
        {type === "Cover" ? <Cloud className="size-5" /> : type === "Preview" ? <FileAudio className="size-5" /> : <HardDrive className="size-5" />}
      </div>
      <div className="min-w-0">
        <p className="truncate font-bold">{product}</p>
        <p className="truncate text-sm text-white/45">{type} / {url}</p>
      </div>
    </a>
  );
}

function formatAdminDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(`${date}`) : date;
  return Number.isNaN(value.getTime()) ? String(date) : value.toLocaleDateString("es-DO");
}

function getStorageItems(products: Array<any>) {
  return products.flatMap((product) => [
    product.imageUrl ? { type: "Cover", product: product.title, url: product.imageUrl } : null,
    product.audioUrl ? { type: "Preview", product: product.title, url: product.audioUrl } : null,
    product.fileUrl ? { type: "Digital", product: product.title, url: product.fileUrl } : null
  ]).filter(Boolean) as Array<{ type: string; product: string; url: string }>;
}

function getTopBuyers(orders: Array<any>, payments: Array<any>) {
  const buyers = new Map<string, { name: string; total: number; count: number }>();
  const addBuyer = (name: string, amount: number) => {
    if (!amount || amount <= 0) return;
    const current = buyers.get(name) ?? { name, total: 0, count: 0 };
    buyers.set(name, { ...current, total: current.total + amount, count: current.count + 1 });
  };
  payments.forEach((payment) => addBuyer(payment.user?.name || payment.user?.email || payment.userId || "Cliente", Number(payment.amount || 0)));
  orders.forEach((order) => addBuyer(order.user?.name || order.user?.email || order.userId || "Cliente", Number(order.paidAmount || 0)));
  return Array.from(buyers.values()).sort((a, b) => b.total - a.total).slice(0, 5);
}

function getTopItems(orders: Array<any>) {
  const items = new Map<string, { title: string; total: number; count: number }>();
  orders.forEach((order) => {
    const title = order.product?.title || order.serviceType || "Orden personalizada";
    const amount = Number(order.paidAmount || order.totalAmount || 0);
    const current = items.get(title) ?? { title, total: 0, count: 0 };
    items.set(title, { ...current, total: current.total + amount, count: current.count + 1 });
  });
  return Array.from(items.values()).sort((a, b) => b.total - a.total).slice(0, 5);
}

function getPageViews(activity: Array<{ path: string }>) {
  const pages = new Map<string, { path: string; count: number }>();
  activity.forEach((item) => {
    const path = item.path || "/";
    const current = pages.get(path) ?? { path, count: 0 };
    pages.set(path, { ...current, count: current.count + 1 });
  });
  return Array.from(pages.values()).sort((a, b) => b.count - a.count).slice(0, 6);
}

function groupCountByDay(items: Array<{ createdAt: Date | string }>, days: number) {
  const labels = buildDayBuckets(days);
  const map = new Map(labels.map((label) => [label, 0]));
  items.forEach((item) => {
    const label = dayLabel(item.createdAt);
    if (map.has(label)) map.set(label, (map.get(label) || 0) + 1);
  });
  return labels.map((label) => ({ label, value: map.get(label) || 0 }));
}

function groupMoneyByDay(items: Array<Record<string, any>>, field: string, days: number) {
  const labels = buildDayBuckets(days);
  const map = new Map(labels.map((label) => [label, 0]));
  items.forEach((item) => {
    const label = dayLabel(item.createdAt);
    if (map.has(label)) map.set(label, (map.get(label) || 0) + Number(item[field] || 0));
  });
  return labels.map((label) => ({ label, value: map.get(label) || 0 }));
}

function groupMoneyByMonth(items: Array<Record<string, any>>, field: string, months: number) {
  const labels = buildMonthBuckets(months);
  const map = new Map(labels.map((label) => [label, 0]));
  items.forEach((item) => {
    const label = monthLabel(item.createdAt);
    if (map.has(label)) map.set(label, (map.get(label) || 0) + Number(item[field] || 0));
  });
  return labels.map((label) => ({ label, value: map.get(label) || 0 }));
}

function buildDayBuckets(days: number) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (days - index - 1));
    return dayLabel(date);
  });
}

function buildMonthBuckets(months: number) {
  return Array.from({ length: months }, (_, index) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - index - 1));
    return monthLabel(date);
  });
}

function dayLabel(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("es-DO", { month: "2-digit", day: "2-digit" });
}

function monthLabel(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("es-DO", { month: "short" });
}

function getStripeMode() {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (key.startsWith("sk_live_")) return "LIVE";
  if (key.startsWith("sk_test_")) return "TEST";
  return "OFF";
}

function getDatabaseMode() {
  const url = process.env.DATABASE_URL || "";
  if (/neon\.tech/i.test(url)) return "NEON";
  if (/localhost|127\.0\.0\.1/i.test(url)) return "LOCAL";
  return url ? "REMOTE" : "OFF";
}

function inferPaymentMethod(sessionId?: string | null) {
  if (sessionId?.startsWith("paypal-")) return "PAYPAL";
  if (sessionId?.startsWith("transfer-")) return "TRANSFER";
  if (sessionId?.startsWith("cs_")) return "STRIPE";
  return "UNKNOWN";
}

async function safeAdminQuery<T>(label: string, query: () => Promise<T>, fallback: T) {
  try {
    return await query();
  } catch (error) {
    console.error(`[admin] ${label} query failed`, error);
    return fallback;
  }
}

function Empty({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-black/35 p-4 text-sm text-white/55">{text}</div>;
}

function InsightCard({ title, empty, children }: { title: string; empty: string; children: React.ReactNode }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-5 backdrop-blur-xl">
      <h2 className="font-display text-xl font-black">{title}</h2>
      <div className="mt-4 space-y-3">{items.length > 0 ? items : <Empty text={empty} />}</div>
    </section>
  );
}

function InsightRow({ title, meta, value }: { title: string; meta: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/35 p-4">
      <div className="min-w-0">
        <p className="truncate font-bold">{title}</p>
        <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/42">{meta}</p>
      </div>
      <span className="shrink-0 font-bold text-studio-gold">{value}</span>
    </div>
  );
}

function AdminRow({ entity, id, title, meta, status, showFinalUrl = false }: { entity: "order" | "booking"; id: string; title: string; meta: string; status: string; showFinalUrl?: boolean }) {
  return (
    <form action="/api/admin/status" method="POST" className="grid gap-4 rounded-2xl border border-white/10 bg-black/35 p-4 lg:grid-cols-[1fr_180px_1fr_auto]">
      <input type="hidden" name="entity" value={entity} />
      <input type="hidden" name="id" value={id} />
      <div>
        <p className="font-bold">{title}</p>
        <p className="mt-1 text-sm text-white/52">{meta}</p>
      </div>
      <select name="status" defaultValue={status} className="control">
        {statuses.map((item) => <option key={item}>{item}</option>)}
      </select>
      {showFinalUrl ? <input name="finalFilesUrl" placeholder="URL archivos finales" className="control" /> : <span />}
      <button className="rounded-xl bg-red-600 px-4 py-2 text-sm font-black shadow-[0_0_24px_rgba(255,0,32,0.26)]">Guardar</button>
    </form>
  );
}
