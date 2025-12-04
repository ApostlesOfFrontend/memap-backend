import { ZodObject, ZodRawShape } from "zod";

export const validateBody = <T extends ZodRawShape>(
  schema: ZodObject<T>,
  body: unknown
) => {
  const result = schema.parse(body);
  return result;
};
