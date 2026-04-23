import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type GlobalState = {
  filters: { city: string; minPrice: string; maxPrice: string; beds: string; propertyType: string[]; amenities: string[]; sortBy: string };
  viewMode: "grid" | "map";
  selectedPropertyId: number | null;
};

const initialState: GlobalState = {
  filters: { city: "", minPrice: "", maxPrice: "", beds: "", propertyType: [], amenities: [], sortBy: "newest" },
  viewMode: "grid",
  selectedPropertyId: null,
};

const slice = createSlice({
  name: "global",
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<GlobalState["filters"]>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setViewMode: (state, action: PayloadAction<"grid" | "map">) => {
      state.viewMode = action.payload;
    },
    setSelectedPropertyId: (state, action: PayloadAction<number | null>) => {
      state.selectedPropertyId = action.payload;
    },
  },
});

export const { setFilters, setViewMode, setSelectedPropertyId } = slice.actions;
export default slice.reducer;
