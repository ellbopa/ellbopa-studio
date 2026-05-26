import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CheckCircle2, CreditCard, Download, Landmark, LockKeyhole, Mic2, Radio, ShoppingBag, Star, Video, X } from "lucide-react";
import { ProductType } from "@prisma/client";
import { auth } from "@/lib/auth";
import { formatDop } from "@/lib/format";
import { getProducts } from "@/lib/products";
import { getSiteConfig } from "@/lib/site-config";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { findLicenseOption, getLicenseOptions } from "@/lib/licensing";

export const metadata = { title: "Checkout" };

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ productId?: string; license?: string; error?: string }> }) {
  const [{ productId, license, error }, session, config] = await Promise.all([searchParams, auth(), getSiteConfig()]);
  if (!productId) redirect("/beats");

  const product = (await getProducts()).find((item) => item.id === productId);
  if (!product) redirect("/beats");
  if (product.type !== ProductType.BEAT && product.type !== ProductType.PRESET) redirect("/carrito");

  const isPreset = product.type === ProductType.PRESET;
  const isInstrumental = product.type === ProductType.BEAT;
  const licenseOptions = isInstrumental ? getLicenseOptions(product) : [];
  const selectedLicense = isInstrumental ? findLicenseOption(product, license) : null;
  const total = selectedLicense?.price ?? product.price;
  const productImage = product.imageUrl || (isPreset ? "/images/preset-cover.svg" : "/images/beat-cover.svg");

  if (isInstrumental && selectedLicense) {
    return (
      <main className="relative min-h-[calc(100vh-92px)] overflow-hidden px-4 py-10 sm:px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(229,9,20,.28),transparent_24rem),radial-gradient(circle_at_30%_80%,rgba(217,164,65,.12),transparent_24rem)]" />
        <div className="absolute inset-0 bg-black/72" />
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-black via-black/60 to-transparent" />

        <section className="relative mx-auto max-w-6xl rounded-xl border border-white/10 bg-[#171717]/95 p-5 shadow-[0_34px_120px_rgba(0,0,0,.72)] backdrop-blur-2xl sm:p-8">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-studio-gold">Instrumental License</p>
              <h1 className="mt-2 font-display text-3xl font-black sm:text-4xl">Choose License</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/52">{product.title} / {product.bpm || 120} BPM / {product.genre || "Urban"}</p>
            </div>
            <Link href="/beats" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition hover:border-studio-red/40 hover:text-white">
              <X size={22} />
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {licenseOptions.map((option) => {
              const active = option.key === selectedLicense.key;
              return (
                <Link
                  key={option.key}
                  href={`/checkout?productId=${encodeURIComponent(product.id)}&license=${option.key}`}
                  className={`relative min-h-[160px] rounded-lg border p-5 transition hover:-translate-y-0.5 ${active ? "border-blue-500 bg-blue-950/55 shadow-[0_0_34px_rgba(59,130,246,.18)]" : "border-white/8 bg-white/[0.065] hover:border-white/20"}`}
                >
                  {option.featured ? <Star className="absolute right-5 top-5 fill-studio-gold text-studio-gold" size={19} /> : null}
                  <h2 className="max-w-[14rem] font-display text-xl font-black leading-snug">{option.title}</h2>
                  <p className="mt-4 font-display text-2xl font-black text-white">{formatDop(option.price)}</p>
                  <p className="mt-2 text-sm font-bold uppercase tracking-[0.16em] text-white/42">{option.files}</p>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 border-t border-white/10 pt-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="font-display text-3xl font-black">Usage Terms</h2>
              <span className="text-white/65">⌃</span>
            </div>
            <h3 className="mt-6 text-lg font-black uppercase text-white">{selectedLicense.title} ({formatDop(selectedLicense.price)})</h3>
            <div className="mt-6 grid gap-x-8 gap-y-5 md:grid-cols-2 xl:grid-cols-3">
              {selectedLicense.terms.map((term, index) => {
                const icons = [Mic2, Download, Radio, Video, CheckCircle2, Star];
                const Icon = icons[index % icons.length];
                return (
                  <div key={term} className="flex items-center gap-4 text-sm font-semibold text-white/58">
                    <Icon className="shrink-0 text-white/48" size={23} />
                    <span>{term}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8 grid gap-5 border-t border-white/10 pt-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-sm text-white/42">Total:</p>
              <p className="font-display text-3xl font-black text-white">{formatDop(total)}</p>
              <p className="mt-2 text-xs text-white/38">Los archivos se liberan despues del pago confirmado.</p>
            </div>

            {!session?.user?.id ? (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href={`/login?next=checkout&productId=${encodeURIComponent(product.id)}&license=${selectedLicense.key}`} className="rounded-md bg-white/[0.08] px-7 py-4 text-center font-black text-white transition hover:bg-white/[0.14]">
                  Add to Cart
                </Link>
                <Link href={`/login?next=checkout&productId=${encodeURIComponent(product.id)}&license=${selectedLicense.key}`} className="rounded-md bg-blue-600 px-7 py-4 text-center font-black text-white shadow-[0_0_28px_rgba(37,99,235,.28)] transition hover:bg-blue-500">
                  Continuar
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="min-w-[150px]">
                  <AddToCartButton
                    item={{
                      id: `${product.id}:${selectedLicense.key}`,
                      title: product.title,
                      type: String(product.type),
                      price: total,
                      license: selectedLicense.key,
                      licenseLabel: selectedLicense.title,
                      imageUrl: productImage,
                      genre: product.genre
                    }}
                  />
                </div>
                <form action="/api/checkout" method="POST" className="contents">
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="mode" value="full" />
                  <input type="hidden" name="license" value={selectedLicense.key} />
                  <button name="paymentMethod" value="paypal" className="rounded-md border border-blue-400/45 bg-blue-500/10 px-7 py-4 font-black text-blue-100 transition hover:bg-blue-600 hover:text-white">
                    Pagar con PayPal
                  </button>
                </form>
              </div>
            )}
          </div>

          {session?.user?.id ? (
            <form action="/api/checkout" method="POST" className="mt-4">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="mode" value="full" />
              <input type="hidden" name="license" value={selectedLicense.key} />
              <button name="paymentMethod" value="transfer" className="text-sm font-bold text-studio-gold underline-offset-4 hover:underline">
                Pagar por transferencia con {config.bankAccount}
              </button>
            </form>
          ) : null}
        </section>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="mb-8">
        <p className="text-sm uppercase tracking-[0.22em] text-studio-gold">Checkout seguro</p>
        <h1 className="mt-3 font-display text-4xl font-black sm:text-6xl">{isInstrumental ? "Elige licencia del instrumental" : "Elige como quieres pagar"}</h1>
        <p className="mt-3 max-w-2xl text-white/58">
          {!isInstrumental
            ? "Compra tu preset por PayPal o deja la orden pendiente por transferencia. Los archivos se liberan cuando el pago este confirmado."
            : "Selecciona la licencia del instrumental, revisa los terminos y completa tu compra como en una tienda profesional."}
        </p>
        {error === "missing-file" ? (
          <div className="mt-5 rounded-lg border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm font-bold text-studio-gold">
            Este producto todavia no tiene archivo final configurado. El admin debe subir el ZIP/WAV/MP3 antes de venderlo.
          </div>
        ) : null}
        {error === "paypal-not-configured" ? (
          <div className="mt-5 rounded-lg border border-blue-400/25 bg-blue-500/10 p-4 text-sm font-bold text-blue-100">
            PayPal todavia no esta configurado. Agrega PAYPAL_CLIENT_ID y PAYPAL_CLIENT_SECRET para activar este metodo.
          </div>
        ) : null}
        {error === "payment-method-disabled" ? (
          <div className="mt-5 rounded-lg border border-studio-gold/25 bg-studio-gold/10 p-4 text-sm font-bold text-studio-gold">
            Ese metodo de pago esta desactivado. Usa PayPal o transferencia.
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="premium-card rounded-lg p-5">
          <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-studio-smoke">
            <Image
              src={productImage}
              alt={product.title}
              fill
              sizes="(min-width: 1024px) 420px, 100vw"
              className="object-contain p-5"
              priority
            />
          </div>
          <div className="mt-5">
            <p className="text-xs uppercase tracking-[0.18em] text-studio-gold">{product.type}</p>
            <h2 className="mt-2 font-display text-3xl font-black">{product.title}</h2>
            <p className="mt-3 text-white/58">{product.description}</p>
            <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/58">
              {product.genre ? <span className="rounded-full border border-white/10 px-3 py-1">{product.genre}</span> : null}
              {product.bpm ? <span className="rounded-full border border-white/10 px-3 py-1">{product.bpm} BPM</span> : null}
              {product.musicalKey ? <span className="rounded-full border border-white/10 px-3 py-1">{product.musicalKey}</span> : null}
            </div>
          </div>
        </section>

        <section className="premium-card h-fit rounded-lg p-6">
          <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <h2 className="font-display text-2xl font-bold">Resumen</h2>
              <p className="mt-1 text-sm text-white/50">Producto digital Ellbopa Music</p>
            </div>
            <strong className="font-display text-3xl text-studio-gold">{formatDop(total)}</strong>
          </div>

          {isInstrumental ? (
            <>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {licenseOptions.map((option) => {
                  const active = option.key === selectedLicense?.key;
                  return (
                    <Link
                      key={option.key}
                      href={`/checkout?productId=${encodeURIComponent(product.id)}&license=${option.key}`}
                      className={`relative rounded-lg border p-4 transition hover:-translate-y-0.5 ${active ? "border-blue-500 bg-blue-950/55 shadow-[0_0_30px_rgba(59,130,246,.2)]" : "border-white/10 bg-white/[0.055] hover:border-studio-red/35"}`}
                    >
                      {option.featured ? <Star className="absolute right-4 top-4 fill-studio-gold text-studio-gold" size={18} /> : null}
                      <h3 className="pr-6 font-display text-lg font-black">{option.title}</h3>
                      <p className="mt-3 font-display text-2xl font-black text-studio-gold">{formatDop(option.price)}</p>
                      <p className="mt-1 text-sm uppercase tracking-[0.14em] text-white/45">{option.files}</p>
                    </Link>
                  );
                })}
              </div>

              <div className="mt-6 rounded-lg border border-white/10 bg-black/35 p-5">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="font-display text-2xl font-black">Usage Terms</h3>
                  <span className="text-sm font-bold text-studio-gold">{selectedLicense?.title}</span>
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {(selectedLicense?.terms ?? []).map((term, index) => {
                    const icons = [Mic2, Download, Radio, Video, CheckCircle2, Star];
                    const Icon = icons[index % icons.length];
                    return (
                      <div key={term} className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.035] p-3 text-sm text-white/64">
                        <Icon className="text-studio-gold" size={18} />
                        {term}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : null}

          {!session?.user?.id ? (
            <div className="mt-6 rounded-lg border border-studio-red/25 bg-studio-red/10 p-5">
              <LockKeyhole className="text-studio-gold" size={30} />
              <h3 className="mt-4 font-display text-2xl font-black">Inicia sesion para comprar</h3>
              <p className="mt-2 text-sm leading-6 text-white/58">
                Para proteger tu compra y guardar tus descargas, primero entra con tu cuenta.
              </p>
              <div className="mt-5 grid gap-3">
                <Link href={`/login?next=checkout&productId=${encodeURIComponent(product.id)}${selectedLicense ? `&license=${selectedLicense.key}` : ""}`} className="flex w-full items-center gap-4 rounded-lg border border-studio-red/35 bg-studio-red px-5 py-4 text-left font-bold glow-button">
                  <CreditCard size={20} /> Pagar con PayPal
                </Link>
                <Link href={`/login?next=checkout&productId=${encodeURIComponent(product.id)}${selectedLicense ? `&license=${selectedLicense.key}` : ""}`} className="flex w-full items-center gap-4 rounded-lg border border-studio-gold/35 bg-studio-gold/10 px-5 py-4 text-left font-bold text-studio-gold">
                  <Landmark size={20} /> Pagar por transferencia
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <AddToCartButton
                  item={{
                    id: selectedLicense ? `${product.id}:${selectedLicense.key}` : product.id,
                    title: product.title,
                    type: String(product.type),
                    price: total,
                    license: selectedLicense?.key,
                    licenseLabel: selectedLicense?.title,
                    imageUrl: productImage,
                    genre: product.genre
                  }}
                />
              </div>
              <form action="/api/checkout" method="POST">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="mode" value="full" />
                {selectedLicense ? <input type="hidden" name="license" value={selectedLicense.key} /> : null}
                <button name="paymentMethod" value="paypal" className="group flex w-full items-center gap-4 rounded-lg border border-blue-400/45 bg-blue-500/10 px-5 py-5 text-left text-blue-100 transition hover:-translate-y-0.5 hover:bg-blue-600 hover:text-white">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-black/25"><CreditCard size={22} /></span>
                  <span>
                    <span className="block font-display text-xl font-black">Pagar con PayPal</span>
                    <span className="mt-1 block text-sm opacity-75">Checkout PayPal seguro para clientes internacionales.</span>
                  </span>
                </button>
              </form>

              <form action="/api/checkout" method="POST">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="mode" value="full" />
                {selectedLicense ? <input type="hidden" name="license" value={selectedLicense.key} /> : null}
                <button name="paymentMethod" value="transfer" className="group flex w-full items-center gap-4 rounded-lg border border-studio-gold/35 bg-studio-gold/10 px-5 py-5 text-left text-studio-gold transition hover:-translate-y-0.5 hover:bg-studio-gold hover:text-black">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-black/25"><Landmark size={22} /></span>
                  <span>
                    <span className="block font-display text-xl font-black">Pagar por transferencia</span>
                    <span className="mt-1 block text-sm opacity-75">{config.bankAccount} / {config.bankOwner}</span>
                  </span>
                </button>
              </form>
            </div>
          )}

          <div className="mt-6 rounded-md border border-white/10 bg-black/35 p-4 text-sm leading-6 text-white/52">
            <ShoppingBag className="mb-2 text-studio-gold" size={18} />
            La transferencia queda pendiente hasta que envies comprobante por WhatsApp y el admin confirme el pago.
          </div>
        </section>
      </div>
    </main>
  );
}
