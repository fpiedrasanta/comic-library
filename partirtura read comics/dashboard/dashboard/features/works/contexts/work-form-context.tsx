import { createContext, useContext } from 'react'
import type { UseFormReturn, FieldValues } from 'react-hook-form'
import type { WorkFormContextState, WorkDetailDto, WorkImageItemDto, PersonByRoleForm, ComicAnalysisResult } from '@/types/works'

interface WorkFormContextValue {
  mode: 'create' | 'edit'
  context: WorkFormContextState | null
  workData: WorkDetailDto | null
  form: UseFormReturn<FieldValues>
  workTypeId: number | undefined
  setWorkTypeId: (id: number | undefined) => void
  workTypeName: string | null
  setWorkTypeName: (name: string | null) => void
  languageId: number | undefined
  setLanguageId: (id: number | undefined) => void
  languageName: string | null
  setLanguageName: (name: string | null) => void
  isActive: boolean
  setIsActive: (active: boolean) => void
  isActiveModified: boolean
  setIsActiveModified: (modified: boolean) => void
  personByRoles: PersonByRoleForm[]
  setPersonByRoles: (roles: PersonByRoleForm[]) => void
  pendingPersonId: number | undefined
  setPendingPersonId: (id: number | undefined) => void
  pendingRoleId: number | undefined
  setPendingRoleId: (id: number | undefined) => void
  pendingPersonName: string | null
  setPendingPersonName: (name: string | null) => void
  pendingRoleName: string | null
  setPendingRoleName: (name: string | null) => void
  personNamesMap: Record<number, string>
  roleNamesMap: Record<number, string>
  setPersonNamesMap: (map: Record<number, string>) => void
  setRoleNamesMap: (map: Record<number, string>) => void
  tagInput: string[]
  setTagInput: (tags: string[]) => void
  previousNumberId: number | undefined
  setPreviousNumberId: (id: number | undefined) => void
  nextNumberId: number | undefined
  setNextNumberId: (id: number | undefined) => void
  cbrFile: File | null
  setCbrFile: (file: File | null) => void
  cbrError: string | null
  setCbrError: (error: string | null) => void
  isUploadingCbr: boolean
  setIsUploadingCbr: (uploading: boolean) => void
  images: WorkImageItemDto[]
  setImages: (images: WorkImageItemDto[]) => void
  selectedImageIds: number[]
  setSelectedImageIds: (ids: number[]) => void
  isSettingCover: number | null
  setIsSettingCover: (id: number | null) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
  isDeletingContent: boolean
  setIsDeletingContent: (deleting: boolean) => void
  isRetrying: boolean
  setIsRetrying: (retrying: boolean) => void
  aiSuggestedNumberValue: string | null
  setAiSuggestedNumberValue: (value: string | null) => void
  aiSuggestedTitle: string | null
  setAiSuggestedTitle: (title: string | null) => void
  aiSuggestedDescription: string | null
  setAiSuggestedDescription: (description: string | null) => void
  recommendedPublicationDate: string | null
  setRecommendedPublicationDate: (date: string | null) => void
  recommendedGeneralTags: string[]
  setRecommendedGeneralTags: (tags: string[]) => void
  recommendedCharacters: string[]
  setRecommendedCharacters: (chars: string[]) => void
  recommendedWriters: string[]
  setRecommendedWriters: (writers: string[]) => void
  recommendedArtists: string[]
  setRecommendedArtists: (artists: string[]) => void
  recommendedInkers: string[]
  setRecommendedInkers: (inkers: string[]) => void
  lastAiResult: ComicAnalysisResult | null
  isConfirmOpen: boolean
  setIsConfirmOpen: (open: boolean) => void
  isSaving: boolean
  setIsSaving: (saving: boolean) => void
  serverError: string | null
  setServerError: (error: string | null) => void
  successMessage: string
  setSuccessMessage: (message: string) => void
  isCreatePersonModalOpen: boolean
  setIsCreatePersonModalOpen: (open: boolean) => void
  isCreateRoleModalOpen: boolean
  setIsCreateRoleModalOpen: (open: boolean) => void
  newPersonName: string
  setNewPersonName: (name: string) => void
  newRoleName: string
  setNewRoleName: (name: string) => void
  isCreatingPerson: boolean
  setIsCreatingPerson: (creating: boolean) => void
  isCreatingRole: boolean
  setIsCreatingRole: (creating: boolean) => void
  handlers: {
    handleCbrChange: (e: React.ChangeEvent<HTMLInputElement>) => void
    handleSetCover: (imageId: number) => void
    toggleImageForAi: (imageId: number) => void
    handleAnalyzeWithAi: () => void
    handleRetryContent: () => void
    handleDeleteContent: () => void
    handleAddPersonRole: () => void
    handleRemovePersonRole: (index: number) => void
    acceptRecommendedPerson: (data: { personName: string; roleName: string }) => void
    dismissRecommendedPerson: (group: string, name: string) => void
    acceptRecommendedTag: (tag: string) => void
    dismissRecommendedTag: (tag: string) => void
    acceptRecommendedCharacter: (character: string) => void
    dismissRecommendedCharacter: (character: string) => void
    handleApplyTitle: (title: string | null) => void
    handleApplyNumberValue: (value: string | null) => void
    handleApplyDescription: (description: string | null) => void
    handleApplySummary: (summary: string | null) => void
    handleApplyPublicationDate: (date: string | null) => void
    handleOpenCreatePersonModal: () => void
    handleOpenCreateRoleModal: () => void
    handleCreatePerson: () => Promise<void>
    handleCreateRole: () => Promise<void>
    handleConfirmSave: () => Promise<void>
    handleCancel: () => void
  }
  getPersonName: (personId: number) => string
  getRoleName: (roleId: number) => string
}

export const WorkFormContext = createContext<WorkFormContextValue | null>(null)

export function useWorkForm(): WorkFormContextValue {
  const ctx = useContext(WorkFormContext)
  if (!ctx) {
    throw new Error('useWorkForm must be used within WorkFormProvider')
  }
  return ctx
}

export const WorkFormProvider = WorkFormContext.Provider
