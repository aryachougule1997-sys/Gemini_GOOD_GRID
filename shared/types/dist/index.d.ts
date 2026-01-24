export interface User {
    id: string;
    username: string;
    email: string;
    passwordHash?: string;
    characterData: CharacterData;
    locationData: LocationData;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserStats {
    userId: string;
    trustScore: number;
    rwisScore: number;
    xpPoints: number;
    currentLevel: number;
    unlockedZones: string[];
    categoryStats: CategoryStats;
}
export interface CharacterData {
    baseSprite: SpriteType;
    colorPalette: ColorScheme;
    accessories: AccessoryItem[];
    unlockedItems: UnlockableItem[];
}
export interface LocationData {
    coordinates: Coordinates;
    currentZone: string;
    discoveredDungeons: string[];
}
export interface Coordinates {
    x: number;
    y: number;
}
export type WorkCategory = 'FREELANCE' | 'COMMUNITY' | 'CORPORATE';
export interface CategoryStats {
    freelance: CategoryMetrics;
    community: CategoryMetrics;
    corporate: CategoryMetrics;
}
export interface CategoryMetrics {
    tasksCompleted: number;
    totalXP: number;
    averageRating: number;
    specializations: string[];
}
export interface Task {
    id: string;
    title: string;
    description: string;
    category: WorkCategory;
    dungeonId: string | null;
    creatorId: string;
    organizationId?: string | null;
    requirements: TaskRequirements;
    rewards: TaskRewards;
    status: TaskStatus;
    deadline?: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface TaskApplication {
    id: string;
    taskId: string;
    userId: string;
    applicationMessage?: string;
    status: ApplicationStatus;
    appliedAt: Date;
}
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export interface TaskRequirements {
    skills: string[];
    trustScoreMin: number;
    timeCommitment: number;
    location?: string;
    level?: number;
    specificBadges?: string[];
}
export interface TaskRewards {
    xp: number;
    trustScoreBonus: number;
    rwisPoints: number;
    badges?: string[];
    payment?: number;
}
export type TaskStatus = 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED' | 'CANCELLED';
export interface Zone {
    id: string;
    name: string;
    terrainType: TerrainType;
    unlockRequirements: UnlockCriteria;
    dungeons?: Dungeon[];
    difficulty: DifficultyLevel;
    coordinates: BoundingBox;
    createdAt: Date;
}
export interface Dungeon {
    id: string;
    type: WorkCategory;
    name: string;
    zoneId: string;
    coordinates: Point;
    spriteAsset?: string;
    entryRequirements: Requirements;
    specialFeatures: string[];
    availableTasks?: Task[];
    createdAt: Date;
}
export interface Point {
    x: number;
    y: number;
}
export type TerrainType = 'URBAN' | 'FOREST' | 'MOUNTAIN' | 'WATER' | 'DESERT';
export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
export interface UnlockCriteria {
    trustScore?: number;
    level?: number;
    completedTasks?: number;
    specificBadges?: string[];
}
export interface BoundingBox {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}
export interface Requirements {
    trustScore?: number;
    level?: number;
    badges?: string[];
}
export interface Badge {
    id: string;
    name: string;
    description: string;
    category: BadgeCategory;
    rarity: BadgeRarity;
    iconUrl?: string;
    unlockCriteria: BadgeUnlockCriteria;
    createdAt: Date;
}
export interface BadgeUnlockCriteria {
    tasksCompleted?: number;
    trustScore?: number;
    categoryTasks?: {
        freelance?: number;
        community?: number;
        corporate?: number;
    };
    skillTasks?: Record<string, number>;
    mentorships?: number;
    zonesFullyExplored?: number;
    allZonesUnlocked?: boolean;
    categoryExpertise?: {
        freelance?: boolean;
        community?: boolean;
        corporate?: boolean;
    };
}
export type BadgeCategory = 'SKILL' | 'ACHIEVEMENT' | 'CATEGORY' | 'SPECIAL';
export type BadgeRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
export interface Organization {
    id: string;
    name: string;
    description?: string;
    verified: boolean;
    contactEmail: string;
    website?: string;
    createdAt: Date;
}
export interface WorkHistoryItem {
    id: string;
    userId: string;
    taskId: string;
    category: WorkCategory;
    completionDate?: Date;
    qualityScore?: number;
    clientFeedback?: string;
    xpEarned: number;
    trustScoreChange: number;
    rwisEarned: number;
    createdAt: Date;
}
export interface UserAchievement {
    id: string;
    userId: string;
    badgeId: string;
    earnedAt: Date;
    taskId?: string | null;
    badge?: Badge;
}
export type SpriteType = 'DEFAULT' | 'CASUAL' | 'PROFESSIONAL' | 'CREATIVE';
export interface ColorScheme {
    primary: string;
    secondary: string;
    accent: string;
}
export interface AccessoryItem {
    id: string;
    name: string;
    type: AccessoryType;
    unlockCondition: string;
}
export interface UnlockableItem {
    id: string;
    name: string;
    category: string;
    unlocked: boolean;
}
export type AccessoryType = 'HAT' | 'GLASSES' | 'CLOTHING' | 'TOOL' | 'BADGE_DISPLAY';
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasNext: boolean;
    hasPrev: boolean;
}
export interface TaskSubmission {
    id: string;
    taskId: string;
    userId: string;
    submissionText?: string;
    fileAttachments: FileAttachment[];
    submittedAt: Date;
    status: SubmissionStatus;
    aiVerificationResult: AIVerificationResult;
    manualReviewRequired: boolean;
    reviewerId?: string | null;
    reviewedAt?: Date | null;
    feedback?: string;
    revisionCount: number;
}
export interface FileAttachment {
    id: string;
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
    uploadedAt: Date;
}
export type SubmissionStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
export interface AIVerificationResult {
    score: number;
    passed: boolean;
    reasoning: string;
    flaggedIssues: string[];
    suggestedImprovements: string[];
    requiresManualReview: boolean;
    verifiedAt: Date;
}
export interface VerificationQueueItem {
    id: string;
    submissionId: string;
    priority: number;
    assignedReviewerId?: string | null;
    createdAt: Date;
    assignedAt?: Date | null;
    completedAt?: Date | null;
    notes?: string;
    submission?: TaskSubmission;
}
export interface TaskFeedback {
    id: string;
    submissionId: string;
    fromUserId: string;
    toUserId: string;
    rating: number;
    feedbackText?: string;
    feedbackType: FeedbackType;
    createdAt: Date;
    fromUser?: User;
}
export type FeedbackType = 'COMPLETION' | 'QUALITY' | 'COMMUNICATION' | 'TIMELINESS' | 'OVERALL';
export interface RewardDistribution {
    id: string;
    submissionId: string;
    userId: string;
    xpAwarded: number;
    trustScoreChange: number;
    rwisAwarded: number;
    badgesAwarded: string[];
    paymentAmount?: number;
    paymentStatus: PaymentStatus;
    distributedAt: Date;
}
export type PaymentStatus = 'PENDING' | 'PROCESSED' | 'FAILED' | 'CANCELLED';
export interface WebSocketMessage {
    type: MessageType;
    payload: any;
    timestamp: Date;
}
export type MessageType = 'TASK_UPDATE' | 'BADGE_EARNED' | 'LEVEL_UP' | 'ZONE_UNLOCKED' | 'NOTIFICATION' | 'REAL_TIME_UPDATE' | 'SUBMISSION_STATUS_UPDATE' | 'FEEDBACK_RECEIVED' | 'REWARD_DISTRIBUTED';
declare const _default: {};
export default _default;
//# sourceMappingURL=index.d.ts.map