export interface Config {
  dora?: {
    sleuth?: {
      /**
       * Frontend-readable defaults (duplicated here to ensure availability in UI)
       * @visibility frontend
       */
      environment?: string;

       /** @visibility frontend */
      defaultProjectSlug?: string;

      /** @visibility frontend */
      defaultTimeRange?: string;

      /** @visibility frontend */
      apiUrl?: string;
    };
  };
}


