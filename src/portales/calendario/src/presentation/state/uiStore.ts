import { useState, useEffect } from 'react';
import { DepartmentCode } from '../../domain/shared/types';
import { CalendarItemKind } from '../../domain/calendar/valueObjects/CalendarItemKind';
import { DEFAULT_INSTITUTION_TIMEZONE } from '../utils/dateTimeFormatter';
import { UserRole } from '../../domain/shared/ActionPermission';

export type ActiveScreen = 'calendar' | 'radar' | 'seasons' | 'schedules' | 'protocols' | 'tasks' | 'venues';

export interface ConfirmModalOptions {
  title: string;
  message?: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  variant?: 'danger' | 'default';
  onConfirm: () => void | Promise<void>;
}

export interface UIState {
  theme: 'dark' | 'light';
  activeScreen: ActiveScreen;
  currentRole: UserRole;
  selectedCalendarItemId: string | null;
  drawerTab: string;
  selectedDepartmentFilter: DepartmentCode | 'ALL';
  selectedKindFilter: CalendarItemKind | 'ALL';
  searchQuery: string;
  showClassesOverlay: boolean;
  isWeeklySnapshotOpen: boolean;
  isHermesPanelOpen: boolean;
  isSettingsModalOpen: boolean;
  isExportModalOpen: boolean;
  isMobileNavOpen: boolean;
  previewProtocolCode: string | null;
  previewTargetDate: string | null;
  preferredTimeZone: string;
  secondaryTimeZone: string | null;
  use24HourFormat: boolean;

  // New Modals State
  isCreateItemModalOpen: boolean;
  createItemPrefillDate?: string;
  isCreateTaskModalOpen: boolean;
  createTaskPrefillItemId?: string;
  isScheduleClassModalOpen: boolean;
  selectedVenueId: string | null;
  confirmModalOptions: ConfirmModalOptions | null;
}

const getStoredTimeZone = (): string => {
  try {
    return localStorage.getItem('soi_preferred_timezone') || DEFAULT_INSTITUTION_TIMEZONE;
  } catch {
    return DEFAULT_INSTITUTION_TIMEZONE;
  }
};

const getStored24Hour = (): boolean => {
  try {
    const val = localStorage.getItem('soi_24hour_format');
    return val !== null ? val === 'true' : true;
  } catch {
    return true;
  }
};

const getStoredSecondaryZone = (): string | null => {
  try {
    return localStorage.getItem('soi_secondary_timezone') || null;
  } catch {
    return null;
  }
};

const getStoredRole = (): UserRole => {
  try {
    return (localStorage.getItem('soi_current_role') as UserRole) || 'DIR';
  } catch {
    return 'DIR';
  }
};

// Simple reactive state hook for presentation orchestration
let globalState: UIState = {
  theme: 'dark',
  activeScreen: 'radar', // Default to Temporal Radar
  currentRole: getStoredRole(),
  selectedCalendarItemId: null,
  drawerTab: 'General',
  selectedDepartmentFilter: 'ALL',
  selectedKindFilter: 'ALL',
  searchQuery: '',
  showClassesOverlay: true,
  isWeeklySnapshotOpen: false,
  isHermesPanelOpen: false,
  isSettingsModalOpen: false,
  isExportModalOpen: false,
  isMobileNavOpen: false,
  previewProtocolCode: null,
  previewTargetDate: null,
  preferredTimeZone: getStoredTimeZone(),
  secondaryTimeZone: getStoredSecondaryZone(),
  use24HourFormat: getStored24Hour(),

  isCreateItemModalOpen: false,
  createItemPrefillDate: undefined,
  isCreateTaskModalOpen: false,
  createTaskPrefillItemId: undefined,
  isScheduleClassModalOpen: false,
  selectedVenueId: null,
  confirmModalOptions: null,
};

const listeners = new Set<(state: UIState) => void>();

export function setUIState(updates: Partial<UIState>) {
  globalState = { ...globalState, ...updates };
  if (updates.theme) {
    if (globalState.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  if (updates.currentRole !== undefined) {
    try {
      localStorage.setItem('soi_current_role', updates.currentRole);
    } catch {
      // Ignore
    }
  }
  if (updates.preferredTimeZone !== undefined) {
    try {
      localStorage.setItem('soi_preferred_timezone', updates.preferredTimeZone);
    } catch {
      // Ignore
    }
  }
  if (updates.secondaryTimeZone !== undefined) {
    try {
      if (updates.secondaryTimeZone) {
        localStorage.setItem('soi_secondary_timezone', updates.secondaryTimeZone);
      } else {
        localStorage.removeItem('soi_secondary_timezone');
      }
    } catch {
      // Ignore
    }
  }
  if (updates.use24HourFormat !== undefined) {
    try {
      localStorage.setItem('soi_24hour_format', String(updates.use24HourFormat));
    } catch {
      // Ignore
    }
  }
  listeners.forEach(l => l(globalState));
}

export function useUIStore() {
  const [state, setState] = useState<UIState>(globalState);

  useEffect(() => {
    const listener = (newState: UIState) => setState(newState);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    ...state,
    setTheme: (theme: 'dark' | 'light') => setUIState({ theme }),
    toggleTheme: () => setUIState({ theme: state.theme === 'dark' ? 'light' : 'dark' }),
    setActiveScreen: (activeScreen: ActiveScreen) => setUIState({ activeScreen }),
    setCurrentRole: (currentRole: UserRole) => setUIState({ currentRole }),
    openItemDrawer: (selectedCalendarItemId: string, drawerTab: string = 'Overview') =>
      setUIState({ selectedCalendarItemId, drawerTab }),
    closeItemDrawer: () => setUIState({ selectedCalendarItemId: null }),
    setDrawerTab: (drawerTab: string) => setUIState({ drawerTab }),
    setDepartmentFilter: (selectedDepartmentFilter: DepartmentCode | 'ALL') =>
      setUIState({ selectedDepartmentFilter }),
    setKindFilter: (selectedKindFilter: CalendarItemKind | 'ALL') => setUIState({ selectedKindFilter }),
    setSearchQuery: (searchQuery: string) => setUIState({ searchQuery }),
    toggleClassesOverlay: () => setUIState({ showClassesOverlay: !state.showClassesOverlay }),
    openWeeklySnapshot: () => setUIState({ isWeeklySnapshotOpen: true }),
    closeWeeklySnapshot: () => setUIState({ isWeeklySnapshotOpen: false }),
    toggleHermesPanel: () => setUIState({ isHermesPanelOpen: !state.isHermesPanelOpen }),
    openSettingsModal: () => setUIState({ isSettingsModalOpen: true }),
    closeSettingsModal: () => setUIState({ isSettingsModalOpen: false }),
    openExportModal: () => setUIState({ isExportModalOpen: true }),
    closeExportModal: () => setUIState({ isExportModalOpen: false }),
    toggleMobileNav: () => setUIState({ isMobileNavOpen: !state.isMobileNavOpen }),
    closeMobileNav: () => setUIState({ isMobileNavOpen: false }),
    setPreferredTimeZone: (preferredTimeZone: string) => setUIState({ preferredTimeZone }),
    setSecondaryTimeZone: (secondaryTimeZone: string | null) => setUIState({ secondaryTimeZone }),
    setUse24HourFormat: (use24HourFormat: boolean) => setUIState({ use24HourFormat }),
    openProtocolPreview: (code: string, targetDate: string = new Date().toISOString()) =>
      setUIState({ previewProtocolCode: code, previewTargetDate: targetDate }),
    closeProtocolPreview: () => setUIState({ previewProtocolCode: null, previewTargetDate: null }),

    // Modular Dialog Triggers
    openCreateItemModal: (prefilledDate?: string) =>
      setUIState({ isCreateItemModalOpen: true, createItemPrefillDate: prefilledDate }),
    closeCreateItemModal: () =>
      setUIState({ isCreateItemModalOpen: false, createItemPrefillDate: undefined }),
    openCreateTaskModal: (prefilledItemId?: string) =>
      setUIState({ isCreateTaskModalOpen: true, createTaskPrefillItemId: prefilledItemId }),
    closeCreateTaskModal: () =>
      setUIState({ isCreateTaskModalOpen: false, createTaskPrefillItemId: undefined }),
    openScheduleClassModal: () => setUIState({ isScheduleClassModalOpen: true }),
    closeScheduleClassModal: () => setUIState({ isScheduleClassModalOpen: false }),
    openVenueDetailModal: (venueId: string) => setUIState({ selectedVenueId: venueId }),
    closeVenueDetailModal: () => setUIState({ selectedVenueId: null }),
    openConfirmModal: (options: ConfirmModalOptions) =>
      setUIState({ confirmModalOptions: options }),
    closeConfirmModal: () => setUIState({ confirmModalOptions: null }),
  };
}
