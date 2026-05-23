import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { message } = (await request.json()) as { message?: string };
  const text = (message ?? "").toLowerCase();

  let reply = "Por lo que me dices, te recomiendo escribirnos por WhatsApp para cuadrar el servicio exacto. Si ya tienes el tema, puedes crear una orden en Mezcla Online.";

  if (text.includes("mezcla") || text.includes("master") || text.includes("wav") || text.includes("cancion")) {
    reply = "Te conviene Mezcla/Master Online. Sube WAV/MP3/ZIP, BPM, tono y referencia. El sistema crea la orden y puedes pagar deposito o completo.";
  } else if (text.includes("beat") || text.includes("instrumental") || text.includes("pista")) {
    reply = "Te recomiendo revisar Beats Store y filtrar por genero, BPM y mood. Para algo exclusivo, pide instrumental personalizado.";
  } else if (text.includes("grabar") || text.includes("sesion") || text.includes("reserva")) {
    reply = "Lo ideal es reservar sesion. La reserva queda pendiente hasta pagar el 50% obligatorio; despues se confirma automaticamente.";
  } else if (text.includes("preset") || text.includes("chain") || text.includes("template")) {
    reply = "Para grabar rapido con sonido moderno, compra un preset vocal o chain. Despues del pago queda listo para descarga.";
  }

  return NextResponse.json({ reply });
}
