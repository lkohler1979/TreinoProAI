export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export class WorkoutPlanNotActiveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkoutPlanNotActiveError";
  }
}

export class SessionAlreadyStartedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SessionAlreadyStartedError";
  }
}

export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

export class SubscriptionRequiredError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubscriptionRequiredError";
  }
}

export class StudentLimitReachedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StudentLimitReachedError";
  }
}
