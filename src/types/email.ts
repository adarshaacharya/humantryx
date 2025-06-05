export type EmailParameterType = {
  type: "string" | "number" | "boolean";
  required: boolean;
};

export type EmailTemplate = {
  subject: string;
  text: string;
  html: string;
  parameters: {
    [key: string]: EmailParameterType;
  };
};
