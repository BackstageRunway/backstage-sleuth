export interface Config {
  dora?: {
    sleuth?: {
      /**
       * Sleuth organization identifier (slug)
       * @visibility frontend
       */
      organizationId?: string;

      /**
       * Sleuth API base URL
       * @visibility frontend
       */
      apiUrl?: string;

      /**
       * Sleuth API key
       * @visibility secret
       */
      apiKey?: string;

      /**
       * Default environment for metrics (e.g. production, staging)
       * @visibility frontend
       */
      environment?: string;


      /**
       * Default project slug fallback when entity lacks annotation
       * @visibility frontend
       */
      defaultProjectSlug?: string;

      /**
       * Default time range (e.g. last7days, last28days)
       * @visibility frontend
       */
      defaultTimeRange?: string;
    };
  };
}


