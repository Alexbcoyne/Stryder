import { SESSION_TYPE_LABELS } from '@stryder/constants';
import { formatDistanceMeters, formatDurationMinutes } from '@stryder/utils';
import type { Session } from '@stryder/types';

import { Badge, Button } from '@/components/ui';

import { markSessionAction, removeSessionAction } from './actions';
import { EditSessionPanel } from './edit-session-panel';
import { LogSessionPanel } from './log-session-panel';

const STATUS_TONE = {
  planned: 'neutral',
  completed: 'success',
  missed: 'error',
  skipped: 'neutral',
  moved: 'warning',
} as const;

const STATUS_LABEL: Record<Session['status'], string> = {
  planned: 'Planned',
  completed: 'Completed',
  missed: 'Missed',
  skipped: 'Skipped',
  moved: 'Moved',
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  });
}

export function SessionRow({
  session,
  blockStartDate,
  blockEndDate,
}: {
  session: Session;
  blockStartDate: string;
  blockEndDate: string;
}) {
  const duration = formatDurationMinutes(session.planned_duration_min);
  const distance = formatDistanceMeters(session.planned_distance_m);
  const measures = [duration, distance].filter(Boolean).join(' · ');

  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-default py-3 last:border-b-0">
      <span className="w-24 shrink-0 font-mono text-xs text-muted tabular-nums" data-metric>
        {formatDate(session.scheduled_date)}
      </span>

      <Badge tone="accent" className="shrink-0">
        {SESSION_TYPE_LABELS[session.session_type]}
      </Badge>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm text-primary">
          {session.title ?? SESSION_TYPE_LABELS[session.session_type]}
        </span>
        {measures ? (
          <span className="font-mono text-xs text-muted tabular-nums" data-metric>
            {measures}
          </span>
        ) : null}
      </div>

      <Badge tone={STATUS_TONE[session.status]} className="shrink-0">
        {STATUS_LABEL[session.status]}
      </Badge>

      <div className="flex shrink-0 items-center gap-2">
        <EditSessionPanel session={session} minDate={blockStartDate} maxDate={blockEndDate} />
        {session.status === 'planned' ? (
          <>
            <LogSessionPanel
              sessionId={session.id}
              blockId={session.block_id}
              label={session.title ?? SESSION_TYPE_LABELS[session.session_type]}
            />
            <form action={markSessionAction}>
              <input type="hidden" name="session_id" value={session.id} />
              <input type="hidden" name="block_id" value={session.block_id} />
              <input type="hidden" name="status" value="skipped" />
              <Button type="submit" size="sm" variant="ghost">
                Skip
              </Button>
            </form>
          </>
        ) : null}
        <form action={removeSessionAction}>
          <input type="hidden" name="session_id" value={session.id} />
          <input type="hidden" name="block_id" value={session.block_id} />
          <Button type="submit" size="sm" variant="danger">
            Delete
          </Button>
        </form>
      </div>
    </div>
  );
}
