import {
  INTENSITIES,
  INTENSITY_LABELS,
  SESSION_TYPE_LABELS,
  SESSION_TYPES,
} from '@stryder/constants';

import { DateField, Input, Label, Select } from '@/components/ui';

/**
 * The fields shared by "add a session" and "edit a session" — everything
 * except the surrounding form, action and submit button, which differ
 * between the two.
 */
export function SessionFields({
  minDate,
  maxDate,
  date,
  onDateChange,
  defaultSessionType = 'run',
  defaultTitle = '',
  defaultIntensity = '',
  defaultDurationMin,
  defaultDistanceM,
}: {
  minDate: string;
  maxDate: string;
  date: string;
  onDateChange: (value: string) => void;
  defaultSessionType?: string;
  defaultTitle?: string;
  defaultIntensity?: string;
  defaultDurationMin?: number | null;
  defaultDistanceM?: number | null;
}) {
  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="scheduled_date" required>
          Date
        </Label>
        <DateField
          id="scheduled_date"
          name="scheduled_date"
          min={minDate}
          max={maxDate}
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="session_type" required>
          Type
        </Label>
        <Select id="session_type" name="session_type" defaultValue={defaultSessionType} required>
          {SESSION_TYPES.map((type) => (
            <option key={type} value={type}>
              {SESSION_TYPE_LABELS[type]}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          placeholder="Optional — e.g. 6x800m"
          maxLength={120}
          defaultValue={defaultTitle}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="intensity">Intensity</Label>
        <Select id="intensity" name="intensity" defaultValue={defaultIntensity}>
          <option value="">Not set</option>
          {INTENSITIES.map((intensity) => (
            <option key={intensity} value={intensity}>
              {INTENSITY_LABELS[intensity]}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="planned_duration_min">Duration (min)</Label>
          <Input
            id="planned_duration_min"
            name="planned_duration_min"
            type="number"
            min={0}
            defaultValue={defaultDurationMin ?? ''}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="planned_distance_m">Distance (m)</Label>
          <Input
            id="planned_distance_m"
            name="planned_distance_m"
            type="number"
            min={0}
            defaultValue={defaultDistanceM ?? ''}
          />
        </div>
      </div>
    </>
  );
}
