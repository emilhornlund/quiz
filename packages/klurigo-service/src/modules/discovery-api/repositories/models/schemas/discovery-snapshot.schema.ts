import { DiscoverySectionKey } from '@klurigo/common'
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Model } from 'mongoose'

import { DISCOVERY_SNAPSHOT_SINGLETON_ID } from '../../../constants'

/**
 * A single scored entry within a discovery section.
 *
 * - `quizId` is the UUID string `_id` of the corresponding Quiz document.
 * - `score` is the numeric value used to rank the entry when the snapshot was created.
 *    It is stored for observability so developers can inspect why a quiz ranked where it did.
 *
 * Entries are stored in descending score order (highest score first). No
 * re-sorting is performed at read time — hydration simply follows the stored
 * array order.
 *
 * Capacity invariants (enforced at write time by the compute service):
 * - FEATURED rail: at most {@link DISCOVERY_RAIL_CAP_FEATURED} entries.
 * - All other rails: at most {@link DISCOVERY_RAIL_CAP_STANDARD} entries.
 */
@Schema({ _id: false })
export class DiscoverySnapshotEntry {
  /** The UUID string `_id` of the Quiz document this entry refers to. */
  @Prop({ type: String, ref: 'Quiz', required: true, index: true })
  quizId: string

  /** Ranking score computed at snapshot time; used for observability only. */
  @Prop({ type: Number, required: true })
  score: number
}

export const DiscoverySnapshotEntrySchema = SchemaFactory.createForClass(
  DiscoverySnapshotEntry,
)

/**
 * A single discovery rail section stored inside the snapshot.
 */
@Schema({ _id: false })
export class DiscoverySnapshotSection {
  /** The rail identifier corresponding to a {@link DiscoverySectionKey}. */
  @Prop({ type: String, enum: DiscoverySectionKey, required: true })
  key: DiscoverySectionKey

  /**
   * Ordered entries for this rail, descending by score.
   *
   * See {@link DiscoverySnapshotEntry} for field semantics and capacity limits.
   */
  @Prop({ type: [DiscoverySnapshotEntrySchema], required: true, default: [] })
  entries: DiscoverySnapshotEntry[]
}

export const DiscoverySnapshotSectionSchema = SchemaFactory.createForClass(
  DiscoverySnapshotSection,
)

/**
 * Singleton snapshot document for the discovery page.
 *
 * Only one document exists in the `discovery_snapshots` collection, identified
 * by the fixed sentinel id {@link DISCOVERY_SNAPSHOT_SINGLETON_ID}. It is
 * replaced atomically by {@link DiscoverySnapshotRepository.upsertLatest} each
 * time the compute pipeline runs.
 */
@Schema({ _id: true, collection: 'discovery_snapshots' })
export class DiscoverySnapshot {
  /**
   * Singleton sentinel id. Always equal to {@link DISCOVERY_SNAPSHOT_SINGLETON_ID}.
   *
   * Using a well-known fixed UUID `_id` (instead of generating a new UUID each
   * run) ensures that upserts reliably target the same document every run, and
   * makes the uniqueness guarantee free (covered by the default `_id` index).
   */
  @Prop({
    type: String,
    required: true,
    default: DISCOVERY_SNAPSHOT_SINGLETON_ID,
  })
  _id: string

  /**
   * UTC timestamp of when this snapshot was computed.
   */
  @Prop({ type: Date, required: true })
  generatedAt: Date

  /**
   * All discovery rail sections included in this snapshot.
   *
   * Each section contains an ordered list of scored entries. See
   * {@link DiscoverySnapshotSection} and {@link DiscoverySnapshotEntry}.
   */
  @Prop({
    type: [DiscoverySnapshotSectionSchema],
    required: true,
    default: [],
  })
  sections: DiscoverySnapshotSection[]
}

/**
 * Mongoose model type for the DiscoverySnapshot schema.
 */
export type DiscoverySnapshotModel = Model<DiscoverySnapshot>

/**
 * Hydrated Mongoose document type for DiscoverySnapshot.
 */
export type DiscoverySnapshotDocument = HydratedDocument<DiscoverySnapshot>

/**
 * Schema factory for the DiscoverySnapshot class.
 */
export const DiscoverySnapshotSchema =
  SchemaFactory.createForClass(DiscoverySnapshot)
