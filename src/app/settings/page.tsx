import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SettingsProfileForm } from "@/components/settings-profile-form";

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/settings");
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { producerProfile: true, engineerProfile: true, artistProfile: true, studioProfile: true }
  });
  if (!user) redirect("/login");

  const producer = user.producerProfile;
  const engineer = user.engineerProfile;
  const artist = user.artistProfile;
  const studio = user.studioProfile;
  const initial = {
    name: user.name,
    username: user.username,
    email: user.email,
    image: user.image || producer?.profileImage || engineer?.profileImage || artist?.profileImage,
    bannerImage: user.bannerImage || producer?.bannerImage || engineer?.bannerImage || studio?.photos,
    artistName: producer?.artistName || engineer?.displayName || artist?.artistName || studio?.studioName,
    bio: producer?.bio || engineer?.bio || artist?.bio || studio?.bio,
    location: producer?.location || engineer?.location || artist?.location || studio?.location,
    country: user.country,
    instagram: producer?.instagram || artist?.instagram,
    tiktok: producer?.tiktok,
    youtube: producer?.youtube || artist?.youtube,
    spotify: producer?.spotify || artist?.spotify,
    beatstars: user.beatstars,
    website: producer?.website || user.website,
    genres: producer?.genres || artist?.genres || engineer?.specialties || studio?.services,
    specialty: user.specialty || engineer?.specialties,
    startingPrice: producer?.startingPrice || engineer?.startingPrice || studio?.hourlyRate,
    availability: user.availability,
    contactLinks: user.contactLinks,
    emailVisible: user.emailVisible,
    payoutPaypal: user.payoutPaypal,
    notificationPrefs: user.notificationPrefs
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-7 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.24em] text-studio-gold">Settings</p>
          <h1 className="mt-2 font-display text-5xl font-black uppercase">Perfil y configuracion</h1>
          <p className="mt-3 max-w-2xl text-white/55">Controla tu marca, redes, payouts y presencia publica dentro de Ellbopa Studio.</p>
        </div>
        <Link href={`/u/${encodeURIComponent(user.username || user.id)}`} className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-black text-white/70">Ver perfil publico</Link>
      </div>
      <SettingsProfileForm initial={initial} />
    </main>
  );
}
