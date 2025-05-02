import { Injectable, Logger } from '@nestjs/common';
import { IngestionResponseDto } from '../dto/ingestion-response.dto';

@Injectable()
export class FieldMapper {
  private readonly logger = new Logger(FieldMapper.name);

  /**
   * Maps fields from a source JSON object to IngestionResponseDto based on a field mapping configuration.
   * @param sourceItem - The raw JSON object from the external source.
   * @param fieldMapping - The mapping configuration (e.g., { "id": "sourceId", "address.city": "city" }).
   * @returns A transformed IngestionResponseDto object.
   */
  mapFields(sourceItem: any, fieldMapping: Record<string, string>): IngestionResponseDto {
    const result: IngestionResponseDto = { sourceId: '' };

    for (const [sourcePath, targetField] of Object.entries(fieldMapping)) {
      try {
        const value = this.getNestedValue(sourceItem, sourcePath);
        if (value !== undefined) {
          // Map the value to the target field in IngestionResponseDto
          switch (targetField) {
            case 'id':
              result.sourceId = String(value);
              break;
            case 'name':
              result.name = String(value);
              break;
            case 'city':
              result.city = String(value);
              break;
            case 'country':
              result.country = String(value);
              break;
            case 'isAvailable':
              result.isAvailable = Boolean(value);
               break;
            case 'availablility':
              result.isAvailable = Boolean(value);
              break;
            case 'pricePerNight':
              result.pricePerNight = Number(value);
               break;
            case 'priceForNight':
              result.pricePerNight = Number(value);
              break;
            case 'priceSegment':
              result.priceSegment = String(value) as any;
              break;
            default:
              this.logger.warn(`Unknown target field: ${targetField}`);
          }
        }
      } catch (error) {
        this.logger.error(`Error mapping field ${sourcePath}: ${error.message}`);
      }
    }

    if (!result.sourceId) {
      throw new Error('Missing required sourceId in mapped item');
    }

    return result;
  }

  /**
   * Retrieves a value from a nested object using a dot-notation path (e.g., "address.city").
   * @param obj - The source object.
   * @param path - The dot-notation path to the field.
   * @returns The value at the specified path, or undefined if not found.
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}
