import z from "zod";

export const createTripSchema = z.object({
  title: z.string().min(2),
  dates: z.object({
    from: z.string().nonempty(),
    to: z.string().nonempty(),
  }),
  description: z.string().min(2),
  route: z
    .array(
      z.object({
        name: z.string().optional().nullable(),
        location: z.tuple([z.number(), z.number()]), // IMPORTANT: z.tuple([longitude, latitude])
      })
    )
    .nonempty(),
});
