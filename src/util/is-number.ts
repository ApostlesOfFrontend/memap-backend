export const isNumber = (num: unknown) => {
  if (num === null) return false;
  return (
    (typeof num === "number" && num - num === 0) ||
    (typeof num === "string" && Number.isFinite(+num) && num.trim() !== "")
  );
};
