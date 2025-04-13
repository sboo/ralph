import { Model } from '@nozbe/watermelondb';
import { field, date, relation, text, readonly, json } from '@nozbe/watermelondb/decorators';
import { associations } from '@nozbe/watermelondb/Model';

export class Assessment extends Model {
  static table = 'assessments';
  static associations = {
    pets: { type: 'belongs_to' as const, key: 'pet_id' },
  };

  @text('date') date!: string;
  @field('score') score!: number;
  @field('hurt') hurt!: number;
  @field('hunger') hunger!: number;
  @field('hydration') hydration!: number;
  @field('hygiene') hygiene!: number;
  @field('happiness') happiness!: number;
  @field('mobility') mobility!: number;
  @field('custom_value') customValue?: number;
  @text('notes') notes?: string;
  @json('images', json => json ? JSON.parse(json) : []) images!: string[];
  @relation('pets', 'pet_id') pet!: any;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}