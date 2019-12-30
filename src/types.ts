export interface ConvertOptions {
    source: string;
    target?: string;
    original?: string;
    sourceLanguage?: string;
    targetLanguage?: string;
}

export interface ParseOptions {
    content: string;
}

export interface ArbPlaceholders {
    [placeholder: string]: {
        [property: string]: string;
    }
}

export interface ArbMeta {
    description: string;
    type: string;
    placeholders: ArbPlaceholders;
}

export interface ApplicationResourceBundle {
    [key: string]: string | ArbMeta;
}
