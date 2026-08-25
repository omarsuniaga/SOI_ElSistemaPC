// Infrastructure Repositories
import { MockCalendarRepository } from './infrastructure/repositories/mock/MockCalendarRepository';
import { MockTriggerRepository } from './infrastructure/repositories/mock/MockTriggerRepository';
import { MockProtocolRunRepository } from './infrastructure/repositories/mock/MockProtocolRunRepository';
import { MockTaskRepository } from './infrastructure/repositories/mock/MockTaskRepository';
import { MockVenueRepository } from './infrastructure/repositories/mock/MockVenueRepository';
import { MockScheduleRepository } from './infrastructure/repositories/mock/MockScheduleRepository';
import { SupabaseCalendarRepository } from './infrastructure/repositories/supabase/SupabaseCalendarRepository';
import { SupabaseTaskRepository } from './infrastructure/repositories/supabase/SupabaseTaskRepository';
import { SupabaseProtocolRunRepository } from './infrastructure/repositories/supabase/SupabaseProtocolRunRepository';
import { supabase } from './infrastructure/supabase/supabaseClient';

// Application Use Cases
import { GetCalendarItems } from './application/calendar/useCases/GetCalendarItems';
import { GetCalendarItemDetails } from './application/calendar/useCases/GetCalendarItemDetails';
import { GetUpcomingTriggers } from './application/calendar/useCases/GetUpcomingTriggers';
import { GetTemporalRadar } from './application/calendar/useCases/GetTemporalRadar';
import { GetSeasons } from './application/calendar/useCases/GetSeasons';
import { SaveCalendarItem } from './application/calendar/useCases/SaveCalendarItem';
import { DeleteCalendarItem } from './application/calendar/useCases/DeleteCalendarItem';
import { ToggleTriggerStatus } from './application/calendar/useCases/ToggleTriggerStatus';

import { GetProtocolRuns } from './application/orchestration/useCases/GetProtocolRuns';
import { GetProtocolRunDetails } from './application/orchestration/useCases/GetProtocolRunDetails';
import { ExecuteTrigger } from './application/orchestration/useCases/ExecuteTrigger';
import { GetHermesRecommendations } from './application/orchestration/useCases/GetHermesRecommendations';
import { GenerateProtocolPreview } from './application/orchestration/useCases/GenerateProtocolPreview';
import { GenerateWeeklySnapshot } from './application/orchestration/useCases/GenerateWeeklySnapshot';
import { StartProtocolRun } from './application/orchestration/useCases/StartProtocolRun';
import { CancelProtocolRun } from './application/orchestration/useCases/CancelProtocolRun';

import { GetTasks } from './application/tasks/useCases/GetTasks';
import { UpdateTaskStatus } from './application/tasks/useCases/UpdateTaskStatus';
import { CreateTask } from './application/tasks/useCases/CreateTask';
import { EscalateTask } from './application/tasks/useCases/EscalateTask';

import { GetVenues } from './application/venues/useCases/GetVenues';
import { ReserveVenue } from './application/venues/useCases/ReserveVenue';
import { GetClassSchedules } from './application/schedule/useCases/GetClassSchedules';
import { SaveClassSchedule } from './application/schedule/useCases/SaveClassSchedule';
import { PublishSchedule } from './application/schedule/useCases/PublishSchedule';
import { ActionPermissionService } from './application/shared/ActionPermissionService';

export interface AppContainer {
  // Use Cases
  getCalendarItems: GetCalendarItems;
  getCalendarItemDetails: GetCalendarItemDetails;
  getUpcomingTriggers: GetUpcomingTriggers;
  getTemporalRadar: GetTemporalRadar;
  getSeasons: GetSeasons;
  saveCalendarItem: SaveCalendarItem;
  deleteCalendarItem: DeleteCalendarItem;
  toggleTriggerStatus: ToggleTriggerStatus;

  getProtocolRuns: GetProtocolRuns;
  getProtocolRunDetails: GetProtocolRunDetails;
  executeTrigger: ExecuteTrigger;
  getHermesRecommendations: GetHermesRecommendations;
  generateProtocolPreview: GenerateProtocolPreview;
  generateWeeklySnapshot: GenerateWeeklySnapshot;
  startProtocolRun: StartProtocolRun;
  cancelProtocolRun: CancelProtocolRun;

  getTasks: GetTasks;
  updateTaskStatus: UpdateTaskStatus;
  createTask: CreateTask;
  escalateTask: EscalateTask;

  getVenues: GetVenues;
  reserveVenue: ReserveVenue;
  getClassSchedules: GetClassSchedules;
  saveClassSchedule: SaveClassSchedule;
  publishSchedule: PublishSchedule;

  permissionService: ActionPermissionService;
}

export function createAppContainer(): AppContainer {
  // 1. Instantiate Adapters (Infrastructure)
  // Switch between Mock and Supabase repositories based on VITE_USE_SUPABASE flag
  const useSupabase = import.meta.env.VITE_USE_SUPABASE === 'true';
  const calendarRepo = useSupabase && supabase
    ? new SupabaseCalendarRepository(supabase)
    : new MockCalendarRepository();

  // Other repositories remain as mocks (calendar, tasks and protocol runs are connected to Supabase)
  const triggerRepo = new MockTriggerRepository();
  const protocolRunRepo = useSupabase && supabase
    ? new SupabaseProtocolRunRepository(supabase)
    : new MockProtocolRunRepository();
  const taskRepo = useSupabase && supabase
    ? new SupabaseTaskRepository(supabase)
    : new MockTaskRepository();
  const venueRepo = new MockVenueRepository();
  const scheduleRepo = new MockScheduleRepository();

  // 2. Wire Use Cases (Application)
  return {
    getCalendarItems: new GetCalendarItems(calendarRepo),
    getCalendarItemDetails: new GetCalendarItemDetails(calendarRepo, triggerRepo, taskRepo, protocolRunRepo),
    getUpcomingTriggers: new GetUpcomingTriggers(triggerRepo),
    getTemporalRadar: new GetTemporalRadar(calendarRepo, triggerRepo, taskRepo, protocolRunRepo),
    getSeasons: new GetSeasons(calendarRepo),
    saveCalendarItem: new SaveCalendarItem(calendarRepo),
    deleteCalendarItem: new DeleteCalendarItem(calendarRepo),
    toggleTriggerStatus: new ToggleTriggerStatus(triggerRepo),

    getProtocolRuns: new GetProtocolRuns(protocolRunRepo),
    getProtocolRunDetails: new GetProtocolRunDetails(protocolRunRepo, taskRepo),
    executeTrigger: new ExecuteTrigger(triggerRepo, protocolRunRepo),
    getHermesRecommendations: new GetHermesRecommendations(protocolRunRepo),
    generateProtocolPreview: new GenerateProtocolPreview(),
    generateWeeklySnapshot: new GenerateWeeklySnapshot(calendarRepo, taskRepo, scheduleRepo),
    startProtocolRun: new StartProtocolRun(protocolRunRepo),
    cancelProtocolRun: new CancelProtocolRun(protocolRunRepo),

    getTasks: new GetTasks(taskRepo),
    updateTaskStatus: new UpdateTaskStatus(taskRepo),
    createTask: new CreateTask(taskRepo),
    escalateTask: new EscalateTask(taskRepo),

    getVenues: new GetVenues(venueRepo),
    reserveVenue: new ReserveVenue(venueRepo, calendarRepo),
    getClassSchedules: new GetClassSchedules(scheduleRepo, calendarRepo),
    saveClassSchedule: new SaveClassSchedule(scheduleRepo),
    publishSchedule: new PublishSchedule(scheduleRepo),

    permissionService: new ActionPermissionService(),
  };
}

// Global Singleton Container Instance
export const container = createAppContainer();
