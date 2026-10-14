import { create } from 'zustand'

export interface ReaderStore {
  isMenuOpen: boolean
  setMenuOpen: (open: boolean) => void
}

export const useReaderStore = create<ReaderStore>((set) => ({
  isMenuOpen: false,
  setMenuOpen: (isMenuOpen) => set({ isMenuOpen }),
}))
