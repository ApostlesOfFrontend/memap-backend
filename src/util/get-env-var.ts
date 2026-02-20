export const getEnvVar = (name: string) => {
  const variable = process.env[name];

  if (!variable) throw new Error(`ENV VARIABLE - ${name} - NOT SET `);

  return variable;
};
