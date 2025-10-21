import type {
  Lead,
  LeadActivity,
  Pipeline,
  Stage,
  User
} from '@prisma/client';

export type SafeUser = Omit<User, 'passwordHash'>;

export type PipelineWithStages = Pipeline & {
  stages: Stage[];
};

export type LeadWithRelations = Lead & {
  stage: Stage | null;
  pipeline: Pick<Pipeline, 'id' | 'name'>;
};

export type LeadActivityWithActor = LeadActivity & {
  actor: Pick<SafeUser, 'id' | 'name' | 'email'>;
};
