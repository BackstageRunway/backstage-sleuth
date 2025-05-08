// Domain entities and value objects
export class TimeRange {
  constructor(
    public readonly start: string,
    public readonly end: string,
  ) {
    if (!TimeRange.isValidDate(start) || !TimeRange.isValidDate(end)) {
      throw new Error('Invalid date format. Expected ISO 8601 format.');
    }
  }

  static isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }
}

export class ProjectId {
  constructor(
    public readonly orgSlug: string,
    public readonly teamSlug: string,
  ) {}

  static fromString(id: string): ProjectId {
    const [orgSlug, teamSlug] = id.split('/');
    if (!orgSlug || !teamSlug) {
      throw new Error('Invalid project ID format. Expected format: orgSlug/teamSlug');
    }
    return new ProjectId(orgSlug, teamSlug);
  }

  toString(): string {
    return `${this.orgSlug}/${this.teamSlug}`;
  }
}

export class DoraMetrics {
  constructor(
    public readonly deployFrequency: number,
    public readonly leadTime: number,
    public readonly failureRate: number,
    public readonly mttr: number,
    public readonly project: ProjectId,
    public readonly timeRange: TimeRange,
  ) {
    if (deployFrequency < 0) throw new Error('Deployment frequency cannot be negative');
    if (leadTime < 0) throw new Error('Lead time cannot be negative');
    if (failureRate < 0 || failureRate > 100) throw new Error('Change failure rate must be between 0 and 100');
    if (mttr < 0) throw new Error('Time to restore cannot be negative');
  }
}

export class DoraMetricsResult {
  constructor(public readonly metrics: DoraMetrics) {}
}

export class DoraMetricsError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'DoraMetricsError';
  }
} 