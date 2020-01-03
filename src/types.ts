export interface IConvertOptions {
  source: string;
  target?: string;
  original?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export interface IParseOptions {
  content: string;
}

export interface IArbPlaceholders {
  [placeholder: string]: {
    [property: string]: string;
  };
}

export interface IArbMeta {
  description: string;
  type: string;
  placeholders: IArbPlaceholders;
}

export interface IApplicationResourceBundle {
  [key: string]: string | IArbMeta;
}
