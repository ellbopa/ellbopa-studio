import { unstable_noStore as noStore } from "next/cache";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { canUseDatabase } from "@/lib/db-availability";

export type CommunityPostItem = {
  id: string;
  userId: string;
  authorName: string;
  authorRole: string;
  text: string;
  imageUrl?: string | null;
  likes: number;
  comments: Array<{ id: string; authorName: string; text: string; createdAt: string }>;
  createdAt: string;
};

const communityPath = path.join(process.cwd(), "data", "community.json");

const demoPosts: CommunityPostItem[] = [
  {
    id: "demo-post-1",
    userId: "ellbopa",
    authorName: "Ellbopa Music",
    authorRole: "ADMIN",
    text: "Nuevo drop de instrumentales premium esta semana. Si buscas Trap, R&B o Dembow con sonido caro, revisa el marketplace.",
    likes: 28,
    comments: [{ id: "demo-comment-1", authorName: "Cliente Demo", text: "Necesito uno para un tema de R&B oscuro.", createdAt: new Date().toISOString() }],
    createdAt: new Date().toISOString()
  },
  {
    id: "demo-post-2",
    userId: "studio-team",
    authorName: "Studio Team",
    authorRole: "ENGINEER",
    text: "Tip rapido: sube tus stems en ZIP, BPM y referencia del artista para que la mezcla salga mas precisa desde el primer pase.",
    likes: 17,
    comments: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  }
];

async function readLocalPosts() {
  noStore();
  try {
    const raw = await fs.readFile(communityPath, "utf8");
    return JSON.parse(raw) as CommunityPostItem[];
  } catch {
    return demoPosts;
  }
}

export async function getCommunityPosts() {
  if (!(await canUseDatabase())) return readLocalPosts();

  try {
    const posts = await prisma.communityPost.findMany({
      include: { user: true, comments: { include: { user: true }, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      take: 50
    });
    return posts.map((post) => ({
      id: post.id,
      userId: post.userId,
      authorName: post.user.name ?? post.user.email ?? "Usuario Ellbopa",
      authorRole: post.user.role,
      text: post.text,
      imageUrl: post.imageUrl,
      likes: post.likes,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        authorName: comment.user.name ?? comment.user.email ?? "Usuario",
        text: comment.text,
        createdAt: comment.createdAt.toISOString()
      })),
      createdAt: post.createdAt.toISOString()
    })) satisfies CommunityPostItem[];
  } catch {
    return readLocalPosts();
  }
}

export async function createCommunityPost(input: { userId: string; authorName?: string | null; authorRole?: string | null; text: string }) {
  if (!(await canUseDatabase())) {
    const current = await readLocalPosts();
    const post: CommunityPostItem = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: input.userId,
      authorName: input.authorName || "Usuario Ellbopa",
      authorRole: input.authorRole || "ARTIST",
      text: input.text,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    await fs.mkdir(path.dirname(communityPath), { recursive: true });
    await fs.writeFile(communityPath, JSON.stringify([post, ...current], null, 2), "utf8");
    return post;
  }

  try {
    return await prisma.communityPost.create({ data: { userId: input.userId, text: input.text } });
  } catch {
    const current = await readLocalPosts();
    const post: CommunityPostItem = {
      id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      userId: input.userId,
      authorName: input.authorName || "Usuario Ellbopa",
      authorRole: input.authorRole || "ARTIST",
      text: input.text,
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString()
    };
    await fs.mkdir(path.dirname(communityPath), { recursive: true });
    await fs.writeFile(communityPath, JSON.stringify([post, ...current], null, 2), "utf8");
    return post;
  }
}
