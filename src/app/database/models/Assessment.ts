import { Model, Query } from '@nozbe/watermelondb';
import { date, field, json, readonly, relation, text } from '@nozbe/watermelondb/decorators';
import { Pet } from './Pet';

// Sanitizer function for images array
const sanitizeImages = (rawImages: any): string[] => {
  // Ensure we return an array of strings even if we get invalid input
  if (Array.isArray(rawImages)) {
    return rawImages.filter(item => typeof item === 'string');
  }
  // Return empty array for invalid inputs
  return [];
};

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
  @json('images', sanitizeImages) images!: string[];
  @relation('pets', 'pet_id') pet!: Query<Pet>;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}