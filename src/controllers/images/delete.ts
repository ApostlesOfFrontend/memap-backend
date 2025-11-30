import { eq } from "drizzle-orm";
import { db } from "../../db";
import { image } from "../../db/schemas/images";
import { HTTPException } from "hono/http-exception";
import { AuthContext } from "../../types/auth-context";

export const markImgForDeletion = async (c: AuthContext): Promise<Response> => {
  const user = c.get("user");
  const imageUuid = c.req.param("uuid");

  const [imgData] = await db
    .select()
    .from(image)
    .where(eq(image.uuid, imageUuid));

  if (!imgData) throw new HTTPException(404, { message: "Image not found" });
  if (user.id !== imgData.userId) throw new HTTPException(403);

  try {
    await db
      .update(image)
      .set({ isVisible: false })
      .where(eq(image.uuid, imageUuid));
  } catch (e) {
    console.error(e);
    return c.json({ message: "Could not mark for deletion" }, 500);
  }
  return c.json({ message: "Marked for deletion" }, 201);
};
